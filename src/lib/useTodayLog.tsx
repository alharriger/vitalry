import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth';
import {
  findActiveCompetition,
  loadUserLogs,
  loadViewerProfile,
  upsertDayLog,
  type ActiveCompetition,
} from './dailyLogs';
import {
  DEFAULT_SCORING_RULES,
  localDateToday,
  scoreCompetition,
  scoreDay,
  type DayScoreResult,
} from './scoring';
import type { GoalStates } from '../types';

/**
 * Today's live state — one shared fetch behind the Today screen and the tab
 * bar's pending dot. Owns the viewer's active competition, their logged history,
 * today's editable check-in, the real engine-computed day score, and a coalesced
 * autosave that writes `daily_logs` on every tap.
 *
 * Phase 2.2 scope: TODAY ONLY. There is no date navigation yet (that's 2.3+),
 * so the only editable day is the player's local today.
 */

/** How the current day's save is going, for the SaveIndicator. */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface TodayLog {
  /** Still loading the initial fetch. */
  loading: boolean;
  /** A fatal load error (bad config / network). Distinct from "no competition". */
  loadError: boolean;
  /** No active competition for this viewer — render the empty state. */
  noCompetition: boolean;
  /** The viewer's display name (for the greeting). */
  name: string;
  /** The active competition, or null while loading / when there is none. */
  competition: ActiveCompetition | null;
  /** Today's local date `'YYYY-MM-DD'` in the viewer's timezone. */
  today: string;
  /** Today's goal states (the editable check-in). */
  todayState: GoalStates;
  /** Toggle/set one goal for today; optimistic + autosaves. */
  setGoal: (key: string, value: boolean | number) => void;
  /** Autosave status for today's write. */
  saveStatus: SaveStatus;
  /** Engine result for today (base + perfect + streak), incl. doneCount/dayClass. */
  todayResult: DayScoreResult;
  /** Current run of consecutive perfect days ending today (for the flame). */
  currentStreak: number;
  /** Convenience: today isn't active yet (drives the tab-bar dot). */
  checkinPending: boolean;
}

const TodayLogContext = createContext<TodayLog | null>(null);

/** A zeroed day result — the fallback before load and outside the comp window. */
function emptyDayResult(localDate: string): DayScoreResult {
  const base = scoreDay(undefined);
  return { localDate, ...base, streakBonus: 0, total: base.base + base.perfectBonus };
}

/** How long to wait before retrying a failed save (ms). */
const SAVE_RETRY_MS = 2500;

export function TodayLogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState('there');
  const [competition, setCompetition] = useState<ActiveCompetition | null>(null);
  const [today, setToday] = useState(() => localDateToday());
  // Historical logs keyed by date (includes today's persisted row on load).
  const [logsByDate, setLogsByDate] = useState<Record<string, GoalStates>>({});
  // Today's live, editable state (the source of truth for edits + scoring).
  const [todayState, setTodayState] = useState<GoalStates>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // --- Autosave machinery (refs so the loop is closure-stable). ------------
  const latestRef = useRef<GoalStates>({}); // newest desired today-state
  const savedJsonRef = useRef<string>('{}'); // JSON of last state known-saved
  const savingRef = useRef(false); // a save loop is in flight
  const ctxRef = useRef<{ compId: string; localDate: string } | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Initial load --------------------------------------------------------
  useEffect(() => {
    if (!userId) {
      // No session (shouldn't happen behind AuthGate) — don't hang on loading.
      setLoading(false);
      return;
    }
    let cancelled = false;

    setLoading(true);
    setLoadError(false);

    (async () => {
      try {
        const profile = await loadViewerProfile(userId);
        const localToday = localDateToday(profile.timezone);
        const comp = await findActiveCompetition();
        const logs = comp ? await loadUserLogs(comp.id, userId) : {};
        if (cancelled) return;

        const loadedToday = logs[localToday] ?? {};
        setName(profile.name);
        setToday(localToday);
        setCompetition(comp);
        setLogsByDate(logs);
        setTodayState(loadedToday);

        // Prime the save machinery so an unchanged today never auto-writes.
        latestRef.current = loadedToday;
        savedJsonRef.current = JSON.stringify(loadedToday);
        ctxRef.current = comp ? { compId: comp.id, localDate: localToday } : null;
        setSaveStatus('idle');
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load today', err);
        setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Clear any pending retry on unmount.
  useEffect(() => () => {
    if (retryRef.current) clearTimeout(retryRef.current);
  }, []);

  // --- Coalesced save loop -------------------------------------------------
  // One upsert in flight at a time. If today's state changes mid-write, the
  // loop notices (latest !== saved) and re-sends — so rapid stepper taps
  // collapse into the minimum number of writes and never race.
  const runSaveLoop = useCallback(async (userIdArg: string) => {
    const ctx = ctxRef.current;
    if (!ctx || savingRef.current) return;
    savingRef.current = true;
    try {
      while (JSON.stringify(latestRef.current) !== savedJsonRef.current) {
        const snapshot = latestRef.current;
        const snapshotJson = JSON.stringify(snapshot);
        setSaveStatus('saving');
        try {
          await upsertDayLog({
            competitionId: ctx.compId,
            userId: userIdArg,
            localDate: ctx.localDate,
            goalStates: snapshot,
          });
          savedJsonRef.current = snapshotJson;
        } catch (err) {
          console.error('daily_logs save failed', err);
          savingRef.current = false;
          setSaveStatus('error');
          if (retryRef.current) clearTimeout(retryRef.current);
          retryRef.current = setTimeout(() => runSaveLoop(userIdArg), SAVE_RETRY_MS);
          return;
        }
      }
      // Nothing left to send.
      setSaveStatus('saved');
    } finally {
      savingRef.current = false;
    }
  }, []);

  const setGoal = useCallback(
    (key: string, value: boolean | number) => {
      if (!userId || !ctxRef.current) return;
      const next = { ...latestRef.current, [key]: value };
      latestRef.current = next;
      setTodayState(next);
      // No need to also write logsByDate[today]: the scoring memo always
      // overrides today with todayState, which is the source of truth for edits.
      void runSaveLoop(userId);
    },
    [userId, runSaveLoop],
  );

  // --- Derived scoring (real engine, live) ---------------------------------
  const { todayResult, currentStreak } = useMemo(() => {
    if (!competition) {
      return { todayResult: emptyDayResult(today), currentStreak: 0 };
    }
    const rules = competition.scoringRules ?? DEFAULT_SCORING_RULES;
    const merged = { ...logsByDate, [today]: todayState };
    // Clamp the window's right edge so a not-yet-started comp doesn't produce
    // an empty range (localDateRange returns [] when asOf < startDate).
    const asOf = today >= competition.startDate ? today : competition.startDate;
    const standing = scoreCompetition({
      startDate: competition.startDate,
      asOf,
      logsByDate: merged,
      rules,
    });
    const result = standing.days.find((d) => d.localDate === today) ?? emptyDayResult(today);

    // Current streak = trailing run of perfect days. An in-progress today that
    // isn't perfect *yet* must not zero out a live streak — the day isn't lost
    // until it ends — so when today is still incomplete we count the run ending
    // at yesterday; a perfect today extends it.
    let streak = 0;
    let i = standing.days.length - 1;
    if (i >= 0 && standing.days[i].localDate === today && !standing.days[i].isPerfect) {
      i -= 1;
    }
    for (; i >= 0; i -= 1) {
      if (standing.days[i].isPerfect) streak += 1;
      else break;
    }
    return { todayResult: result, currentStreak: streak };
  }, [competition, logsByDate, todayState, today]);

  const value = useMemo<TodayLog>(
    () => ({
      loading,
      loadError,
      noCompetition: !loading && !loadError && competition === null,
      name,
      competition,
      today,
      todayState,
      setGoal,
      saveStatus,
      todayResult,
      currentStreak,
      checkinPending: !todayResult.isActive,
    }),
    [
      loading,
      loadError,
      competition,
      name,
      today,
      todayState,
      setGoal,
      saveStatus,
      todayResult,
      currentStreak,
    ],
  );

  return <TodayLogContext.Provider value={value}>{children}</TodayLogContext.Provider>;
}

export function useTodayLog(): TodayLog {
  const ctx = useContext(TodayLogContext);
  if (!ctx) throw new Error('useTodayLog must be used within a TodayLogProvider');
  return ctx;
}
