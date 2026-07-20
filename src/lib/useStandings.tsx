import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth';
import { useTodayLog } from './useTodayLog';
import { getSupabase } from './supabase';
import {
  loadCompetitionLogs,
  loadCompetitionMembers,
  type ActiveCompetition,
  type CompetitionMember,
} from './dailyLogs';
import { applyLogChange, computeStandings, type LogChangePayload, type PlayerStanding } from './standings';
import { DEFAULT_SCORING_RULES } from './scoring';
import { dayNumber } from './dayNav';
import type { GoalStates } from '../types';

/**
 * The live leaderboard for the viewer's active competition.
 *
 * Reads the already-loaded competition + local "today" from the shared
 * `useTodayLog` context (so the competition is fetched ONCE for the whole app),
 * then loads every member's logs and scores them through the pure engine
 * (`computeStandings`). A single realtime subscription on the competition's
 * `daily_logs` folds each tap-by-tap change into state via `applyLogChange`, so
 * the board reranks live without polling or a full refetch — the exit-gate
 * "two devices see each other's taps live." RLS governs what the subscription
 * delivers, so a client only ever receives rows it may read.
 */
const E2E = import.meta.env.VITE_E2E === 'true';

export interface StandingsState {
  /** Initial load in flight (competition + members + logs). */
  loading: boolean;
  /** A fatal load error (distinct from "no active competition"). */
  error: boolean;
  /** No active competition for this viewer. */
  noCompetition: boolean;
  /** The active competition (for the header), or null. */
  competition: ActiveCompetition | null;
  /** Ranked players, best first. */
  standings: PlayerStanding[];
  /** Whole days remaining in the competition (0 on the final day). */
  daysLeft: number;
  /** Whether today is the competition's final day. */
  isFinalDay: boolean;
}

export function useStandings(): StandingsState {
  const { user } = useAuth();
  const viewerId = user?.id ?? null;
  const { competition, today, loading: dayLoading, noCompetition } = useTodayLog();
  const compId = competition?.id ?? null;

  const [members, setMembers] = useState<CompetitionMember[]>([]);
  const [logsByUser, setLogsByUser] = useState<Record<string, Record<string, GoalStates>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- Initial load (members + everyone's logs) ----------------------------
  useEffect(() => {
    // Wait for the shared day fetch to resolve the competition first.
    if (dayLoading) {
      setLoading(true);
      return;
    }
    if (!compId || !competition) {
      setMembers([]);
      setLogsByUser({});
      setLoading(false);
      setError(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const [mem, logs] = await Promise.all([
          loadCompetitionMembers(competition.groupId),
          loadCompetitionLogs(compId),
        ]);
        if (cancelled) return;
        setMembers(mem);
        setLogsByUser(logs);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load standings', err);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [compId, competition, dayLoading]);

  // --- Realtime: fold each daily_logs change into state --------------------
  useEffect(() => {
    if (E2E || !compId) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel(`standings:${compId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_logs', filter: `competition_id=eq.${compId}` },
        (payload) => {
          setLogsByUser((prev) => applyLogChange(prev, payload as unknown as LogChangePayload));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [compId]);

  // --- Derived: the ranked board -------------------------------------------
  const standings = useMemo(() => {
    if (!competition) return [];
    return computeStandings({
      members,
      logsByUser,
      startDate: competition.startDate,
      today,
      rules: competition.scoringRules ?? DEFAULT_SCORING_RULES,
      viewerId,
    });
  }, [competition, members, logsByUser, today, viewerId]);

  // Days remaining: total duration minus the current 1-based day number, floored
  // at 0. Before the competition starts, the whole duration remains.
  const { daysLeft, isFinalDay } = useMemo(() => {
    if (!competition) return { daysLeft: 0, isFinalDay: false };
    if (today < competition.startDate) {
      return { daysLeft: competition.durationDays, isFinalDay: false };
    }
    const dayNum = dayNumber(competition.startDate, today);
    const left = Math.max(0, competition.durationDays - dayNum);
    return { daysLeft: left, isFinalDay: left === 0 };
  }, [competition, today]);

  return {
    loading: loading || dayLoading,
    error,
    noCompetition,
    competition,
    standings,
    daysLeft,
    isFinalDay,
  };
}
