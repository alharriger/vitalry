/** How a goal is logged. `check` = single tap done/undone; `counter` = tap to
 *  a target (rainbow colors, water cups). Mirrors `goals.log_type` in the DB. */
export type GoalLogType = 'check' | 'counter';

/** One of the Daily 9. In v1 this is a static seed; in v2 goals become DB rows. */
export interface Goal {
  /** Stable identifier, e.g. "water". Matches `goals.key` in the schema. */
  key: string;
  /** Display name, e.g. "Fresh air". */
  name: string;
  /** Plain-language target, e.g. "20 min outside". */
  target: string;
  /** Phosphor icon class, e.g. "ph-bold ph-drop". */
  icon: string;
  /** Category color — a `--goal-*` design token, e.g. "var(--goal-water)". */
  color: string;
  logType: GoalLogType;
  /** For counter goals, the value that completes the goal (8 cups, 5 colors). */
  counterMax?: number;
}

/** A player's per-goal state for a single day, keyed by goal `key`.
 *  Booleans for check goals, numbers for counter goals. Mirrors the shape of
 *  `daily_logs.goal_states` jsonb. */
export type GoalStates = Record<string, boolean | number>;

/** Bottom-tab route keys. */
export type TabKey = 'today' | 'standings' | 'progress' | 'group';
