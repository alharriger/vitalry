/* Shared sample data for the Fit Friends & Fam UI kit (plain global script). */
window.VITAL_DATA = {
  competition: {
    name: 'Harriger Summer Streak',
    daysTotal: 14,
    daysLeft: 4,
    day: 10,
    prize: 'Loser hosts Thanksgiving',
    group: 'Harriger Family',
  },

  // The fixed Daily 9 (v1)
  goals: [
    { key: 'rainbow', name: 'Eat the rainbow', target: '5 produce colors',        icon: 'ph-bold ph-rainbow',            color: 'var(--goal-rainbow)', type: 'dots' },
    { key: 'protein', name: 'Protein',         target: 'Hit your protein goal',    icon: 'ph-bold ph-egg',                color: 'var(--goal-protein)', type: 'check' },
    { key: 'fiber',   name: 'Fiber',           target: 'Hit your fiber goal',      icon: 'ph-bold ph-grains',             color: 'var(--goal-fiber)',   type: 'check' },
    { key: 'move',    name: 'Move',            target: '30 min moving — any kind', icon: 'ph-bold ph-person-simple-walk', color: 'var(--goal-move)',    type: 'check' },
    { key: 'sweat',   name: 'Sweat or strength', target: '20+ min workout',        icon: 'ph-bold ph-barbell',            color: 'var(--goal-sweat)',   type: 'check' },
    { key: 'air',     name: 'Fresh air',       target: '20 min outside',           icon: 'ph-bold ph-sun',                color: 'var(--goal-air)',     type: 'check' },
    { key: 'water',   name: 'Water',           target: '8 cups',                   icon: 'ph-bold ph-drop',               color: 'var(--goal-water)',   type: 'glasses' },
    { key: 'sleep',   name: 'Sleep',           target: '7+ hours',                 icon: 'ph-bold ph-moon',               color: 'var(--goal-sleep)',   type: 'check' },
    { key: 'mind',    name: 'Mind',            target: 'Read, meditate, or journal', icon: 'ph-bold ph-brain',            color: 'var(--goal-mind)',    type: 'check' },
  ],

  // Leaderboard (ranking is by goal completion only — never raw stats)
  players: [
    { id: 'amber', name: 'Amber',     points: 182, doneToday: 8, streak: 11, perfectDays: 6, color: 'var(--avatar-clay)' },
    { id: 'jo',    name: 'Sister Jo', points: 168, doneToday: 9, streak: 11, perfectDays: 4, color: 'var(--avatar-plum)' },
    { id: 'mom',   name: 'Mom',       points: 151, doneToday: 6, streak: 4,  perfectDays: 2, color: 'var(--avatar-mulberry)' },
    { id: 'dad',   name: 'Dad',       points: 140, doneToday: 6, streak: 3,  perfectDays: 1, color: 'var(--avatar-denim)', you: true },
    { id: 'ty',    name: 'Cousin Ty', points: 96,  doneToday: 4, streak: 0,  perfectDays: 0, color: 'var(--avatar-ochre)' },
  ],

  // "Dad" (the current user) initial check-in state for Today
  todayState: {
    rainbow: 3,
    protein: true,
    fiber: false,
    move: true,
    sweat: false,
    air: true,
    water: 5,
    sleep: true,
    mind: false,
  },

  // 14-day heatmap for the current user (p=perfect, a=active, m=missed, f=future)
  heatmap: ['a','p','a','a','m','p','a','a','p','a','f','f','f','f'],

  // Per-goal completion rates for My Progress
  rates: [
    { key: 'air',     label: 'Fresh air',   pct: 92, color: 'var(--goal-air)',     icon: 'ph-bold ph-sun' },
    { key: 'water',   label: 'Water',       pct: 80, color: 'var(--goal-water)',   icon: 'ph-bold ph-drop' },
    { key: 'sleep',   label: 'Sleep',       pct: 78, color: 'var(--goal-sleep)',   icon: 'ph-bold ph-moon' },
    { key: 'move',    label: 'Move',        pct: 90, color: 'var(--goal-move)',    icon: 'ph-bold ph-person-simple-walk' },
    { key: 'rainbow', label: 'Rainbow',     pct: 64, color: 'var(--goal-rainbow)', icon: 'ph-bold ph-rainbow' },
    { key: 'mind',    label: 'Mind',        pct: 55, color: 'var(--goal-mind)',    icon: 'ph-bold ph-brain' },
  ],
};
