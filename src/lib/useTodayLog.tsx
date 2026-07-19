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
  updateProfileTimezone,
  upsertDayLog,
  type ActiveCompetition,
} from './dailyLogs';
import {
  DEFAULT_SCORING_RULES,
  localDateToday,
  previousLocalDate,
  nextLocalDate,
  scoreCompetition,
  scoreDay,
  type DayClass,
  type DayScoreResult,
} from './scoring';
import { dayNumber, isEditableDay, stepBounds } from './dayNav';
import type { GoalStates } from '../types';

/**
 * The live day state behind Today — one shared fetch feeding the Today screen
 * and the tab bar's pending dot. Owns the viewer's active competition, their
 * logged history, the currently-viewed day, a coalesced per-day autosave, and
 * the real engine-computed scores.
 *
 * Phase 2.3 scope: the day-browser reaches TODAY + YESTERDAY. Both are editable
 * (the grace window); stepping is capped there (prev floors at yesterday, next
 * ceils at today). 2.4 uncaps prev to `start_date` and adds read-only rendering;
 * 2.5 adds the month-sheet picker (the center date button becomes tappable).
 *
 * Day boundary is the player's LOCAL clock, kept honest: the timezone is synced
 * from their device on load and "today" is re-derived when the app regains
 * focus, so crossing local midnight with the app open rolls the day over.
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
  /** The viewer's local hour (0–23), for a timezone-correct greeting. */
  localHour: number;
  /** The active competition, or null while loading / when there is none. */
  competition: ActiveCompetition | null;
  /** Today's local date `'YYYY-MM-DD'` in the viewer's timezone. */
  today: string;
  /** The day currently shown in the browser (defaults to today). */
  viewedDate: string;
  /** The viewed day's goal states (editable when the day is in grace). */
  viewedState: GoalStates;
  /** Toggle/set one goal on the viewed day; optimistic + autosaves. No-op on a
   *  read-only day. */
  setGoal: (key: string, value: boolean | number) => void;
  /** Autosave status across the editable days. */
  saveStatus: SaveStatus;
  /** Engine result for the viewed day (base + perfect + streak). */
  viewedResult: DayScoreResult;
  /** Whether the viewed day is editable (today or yesterday, in grace). */
  isEditable: boolean;
  /** Whether the viewed day is today. */
  isToday: boolean;
  /** 1-based day number of the viewed day within the competition. */
  dayNumber: number;
  /** Total days in the competition. */
  totalDays: number;
  /** Can the viewer step to an earlier day (not at the floor)? */
  canStepPrev: boolean;
  /** Can the viewer step to a later day (not at today)? */
  canStepNext: boolean;
  /** Step the viewed day back by one (within the reachable window). */
  stepPrev: () => void;
  /** Step the viewed day forward by one (never past today). */
  stepNext: () => void;
  /** Jump back to today. */
  goToToday: () => void;
  /** Jump to any day within the reachable window (the month-sheet picker). No-op
   *  outside `[start_date, today]`. */
  selectDate: (date: string) => void;
  /** The competition's final day `'YYYY-MM-DD'` (start + durationDays − 1). */
  finalDate: string;
  /** Per-day classification for `start_date..today` (drives the picker heatmap). */
  classByDate: Record<string, DayClass>;
  /** Whether an arbitrary day is editable (today or yesterday) — for the picker's ring. */
  isDayEditable: (date: string) => boolean;
  /** Whether the month-sheet picker is open. */
  pickerOpen: boolean;
  /** Open the month-sheet picker. */
  openPicker: () => void;
  /** Close the month-sheet picker. */
  closePicker: () => void;
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

/** The device's IANA timezone, or null if it can't be resolved. */
function resolveDeviceTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/** The viewer's current hour (0–23) in a given timezone. */
function localHourIn(timeZone: string | undefined, now: Date = new Date()): number {
  try {
    const s = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone,
    }).format(now);
    const h = parseInt(s, 10);
    return Number.isFinite(h) ? h % 24 : now.getHours();
  } catch {
    return now.getHours();
  }
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
  const [viewedDate, setViewedDate] = useState(() => localDateToday());
  // Logged goal states keyed by date — the source of truth for scoring, updated
  // optimistically as the viewer edits an in-grace day.
  const [logsByDate, setLogsByDate] = useState<Record<string, GoalStates>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [pickerOpen, setPickerOpen] = useState(false);

  // --- Closure-stable mirrors + autosave machinery. ------------------------
  const tzRef = useRef<string | undefined>(undefined); // effective timezone
  const todayRef = useRef(today); // latest today (for setGoal's editable guard)
  const viewedRef = useRef(viewedDate); // latest viewed day (edit target)
  const logsRef = useRef<Record<string, GoalStates>>({}); // mirror of logsByDate
  const savedJsonRef = useRef<Map<string, string>>(new Map()); // last-saved JSON per date
  const editedDatesRef = useRef<Set<string>>(new Set()); // dates touched this session
  const savingRef = useRef(false); // a save loop is in flight
  const ctxRef = useRef<{ compId: string } | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    todayRef.current = today;
  }, [today]);
  useEffect(() => {
    viewedRef.current = viewedDate;
  }, [viewedDate]);

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
        // The day boundary MUST use the committed profiles.timezone, because the
        // server grace-window trigger reads the same column — if the client used
        // a different (device) zone, the two could disagree on "today" at the
        // midnight edge and reject a legitimate write. So converge the stored
        // zone toward the device for the NEXT session (best-effort), but keep
        // THIS session's boundary on the committed value.
        const deviceTz = resolveDeviceTimezone();
        if (deviceTz && deviceTz !== profile.timezone) {
          updateProfileTimezone(userId, deviceTz).catch((err) =>
            console.warn('Timezone sync failed (non-fatal)', err),
          );
        }
        const effectiveTz = profile.timezone;
        const localToday = localDateToday(effectiveTz);
        const comp = await findActiveCompetition();
        const logs = comp ? await loadUserLogs(comp.id, userId) : {};
        if (cancelled) return;

        setName(profile.name);
        tzRef.current = effectiveTz;
        setToday(localToday);
        setViewedDate(localToday);
        setCompetition(comp);
        setLogsByDate(logs);

        // Prime the save machinery so an unchanged day never auto-writes.
        logsRef.current = logs;
        savedJsonRef.current = new Map(
          Object.entries(logs).map(([d, s]) => [d, JSON.stringify(s)]),
        );
        editedDatesRef.current = new Set();
        ctxRef.current = comp ? { compId: comp.id } : null;
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

  // Re-derive "today" from the player's local clock when the app regains focus,
  // so crossing local midnight with the app open rolls the day over.
  useEffect(() => {
    function refresh() {
      const t = localDateToday(tzRef.current);
      setToday((prev) => (prev === t ? prev : t));
    }
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  // Keep the viewed day inside the reachable window as "today" moves (rollover)
  // or the competition loads.
  useEffect(() => {
    if (!competition) return;
    const b = stepBounds(competition.startDate, today);
    setViewedDate((v) => {
      if (v > b.max) return b.max;
      if (v < b.min) return b.max; // fell out of grace → snap to today
      return v;
    });
  }, [today, competition]);

  // Clear any pending retry on unmount.
  useEffect(
    () => () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    },
    [],
  );

  // --- Coalesced per-day save loop -----------------------------------------
  // One upsert in flight at a time, across every edited day. If any day's state
  // changes mid-write, the loop notices (latest !== saved) and re-sends — so
  // rapid stepper taps collapse into the minimum number of writes and never
  // race, whether they land on today or yesterday.
  const runSaveLoop = useCallback(async (userIdArg: string) => {
    const ctx = ctxRef.current;
    if (!ctx || savingRef.current) return;
    savingRef.current = true;
    try {
      const dirtyDates = () =>
        [...editedDatesRef.current].filter(
          (d) =>
            JSON.stringify(logsRef.current[d] ?? {}) !== (savedJsonRef.current.get(d) ?? '{}'),
        );

      let pending = dirtyDates();
      while (pending.length) {
        for (const date of pending) {
          const snapshot = logsRef.current[date] ?? {};
          const snapshotJson = JSON.stringify(snapshot);
          if (snapshotJson === (savedJsonRef.current.get(date) ?? '{}')) continue;
          setSaveStatus('saving');
          try {
            await upsertDayLog({
              competitionId: ctx.compId,
              userId: userIdArg,
              localDate: date,
              goalStates: snapshot,
            });
            savedJsonRef.current.set(date, snapshotJson);
          } catch (err) {
            console.error('daily_logs save failed', err);
            savingRef.current = false;
            setSaveStatus('error');
            if (retryRef.current) clearTimeout(retryRef.current);
            retryRef.current = setTimeout(() => runSaveLoop(userIdArg), SAVE_RETRY_MS);
            return;
          }
        }
        pending = dirtyDates();
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
      const date = viewedRef.current;
      // Grace guard — never let a read-only day be edited (the DB trigger is the
      // backstop, but don't even attempt a write that would bounce).
      if (!isEditableDay(todayRef.current, date)) return;
      const current = logsRef.current[date] ?? {};
      const next = { ...current, [key]: value };
      logsRef.current = { ...logsRef.current, [date]: next };
      editedDatesRef.current.add(date);
      setLogsByDate(logsRef.current);
      void runSaveLoop(userId);
    },
    [userId, runSaveLoop],
  );

  // --- Derived scoring (real engine, live) ---------------------------------
  const { todayResult, viewedResult, currentStreak, classByDate } = useMemo(() => {
    if (!competition) {
      const empty = emptyDayResult(today);
      return {
        todayResult: empty,
        viewedResult: emptyDayResult(viewedDate),
        currentStreak: 0,
        classByDate: {} as Record<string, DayClass>,
      };
    }
    const rules = competition.scoringRules ?? DEFAULT_SCORING_RULES;
    // Clamp the window's right edge so a not-yet-started comp doesn't produce an
    // empty range (localDateRange returns [] when asOf < startDate).
    const asOf = today >= competition.startDate ? today : competition.startDate;
    const standing = scoreCompetition({
      startDate: competition.startDate,
      asOf,
      logsByDate,
      rules,
    });
    const byDate = new Map(standing.days.map((d) => [d.localDate, d]));
    const tResult = byDate.get(today) ?? emptyDayResult(today);
    const vResult = byDate.get(viewedDate) ?? emptyDayResult(viewedDate);

    // Per-day classification for the month-sheet heatmap (every day start..asOf).
    const classes: Record<string, DayClass> = {};
    for (const d of standing.days) classes[d.localDate] = d.dayClass;

    // Current streak = trailing run of perfect days ending at today. An
    // in-progress today that isn't perfect *yet* must not zero out a live
    // streak — the day isn't lost until it ends — so when today is still
    // incomplete we count the run ending at yesterday; a perfect today extends it.
    let streak = 0;
    let i = standing.days.length - 1;
    if (i >= 0 && standing.days[i].localDate === today && !standing.days[i].isPerfect) {
      i -= 1;
    }
    for (; i >= 0; i -= 1) {
      if (standing.days[i].isPerfect) streak += 1;
      else break;
    }
    return { todayResult: tResult, viewedResult: vResult, currentStreak: streak, classByDate: classes };
  }, [competition, logsByDate, today, viewedDate]);

  // --- Navigation ----------------------------------------------------------
  const bounds = useMemo(
    () => (competition ? stepBounds(competition.startDate, today) : { min: today, max: today }),
    [competition, today],
  );
  const canStepPrev = viewedDate > bounds.min;
  const canStepNext = viewedDate < bounds.max;

  const stepPrev = useCallback(() => {
    setViewedDate((v) => {
      const prev = previousLocalDate(v);
      return prev >= bounds.min ? prev : v;
    });
  }, [bounds.min]);

  const stepNext = useCallback(() => {
    setViewedDate((v) => {
      const next = nextLocalDate(v);
      return next <= bounds.max ? next : v;
    });
  }, [bounds.max]);

  const goToToday = useCallback(() => setViewedDate(today), [today]);

  // Jump to any reachable day (the month-sheet picker). Clamp defensively — the
  // sheet never offers a future/out-of-range day, but never trust the caller.
  const selectDate = useCallback(
    (date: string) => {
      if (date < bounds.min || date > bounds.max) return;
      setViewedDate(date);
    },
    [bounds.min, bounds.max],
  );

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const isToday = viewedDate === today;
  const isEditable = isEditableDay(today, viewedDate);
  // Grace check for any day, for the picker's editable ring (closes over `today`).
  const isDayEditable = useCallback((date: string) => isEditableDay(today, date), [today]);
  const totalDays = competition?.durationDays ?? 0;
  const viewedDayNumber = competition ? dayNumber(competition.startDate, viewedDate) : 0;
  // Final day = start + durationDays − 1, walked with the calendar-safe helper.
  const finalDate = useMemo(() => {
    if (!competition || competition.durationDays < 1) return today;
    let d = competition.startDate;
    for (let i = 1; i < competition.durationDays; i += 1) d = nextLocalDate(d);
    return d;
  }, [competition, today]);
  const localHour = localHourIn(tzRef.current);

  const value = useMemo<TodayLog>(
    () => ({
      loading,
      loadError,
      noCompetition: !loading && !loadError && competition === null,
      name,
      localHour,
      competition,
      today,
      viewedDate,
      viewedState: logsByDate[viewedDate] ?? {},
      setGoal,
      saveStatus,
      viewedResult,
      isEditable,
      isToday,
      dayNumber: viewedDayNumber,
      totalDays,
      canStepPrev,
      canStepNext,
      stepPrev,
      stepNext,
      goToToday,
      selectDate,
      finalDate,
      classByDate,
      isDayEditable,
      pickerOpen,
      openPicker,
      closePicker,
      currentStreak,
      checkinPending: !todayResult.isActive,
    }),
    [
      loading,
      loadError,
      competition,
      name,
      localHour,
      today,
      viewedDate,
      logsByDate,
      setGoal,
      saveStatus,
      viewedResult,
      isEditable,
      isToday,
      viewedDayNumber,
      totalDays,
      canStepPrev,
      canStepNext,
      stepPrev,
      stepNext,
      goToToday,
      selectDate,
      finalDate,
      classByDate,
      isDayEditable,
      pickerOpen,
      openPicker,
      closePicker,
      currentStreak,
      todayResult.isActive,
    ],
  );

  return <TodayLogContext.Provider value={value}>{children}</TodayLogContext.Provider>;
}

export function useTodayLog(): TodayLog {
  const ctx = useContext(TodayLogContext);
  if (!ctx) throw new Error('useTodayLog must be used within a TodayLogProvider');
  return ctx;
}
