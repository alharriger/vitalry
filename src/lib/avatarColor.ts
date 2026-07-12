/** Refined avatar palette — deliberately distinct from the saturated goal hues
 *  so a person's color never collides with a goal's. */
const PALETTE = [
  'var(--avatar-clay)', 'var(--avatar-pine)', 'var(--avatar-plum)',
  'var(--avatar-ochre)', 'var(--avatar-denim)', 'var(--avatar-mulberry)',
  'var(--avatar-olive)', 'var(--avatar-lagoon)',
];

/** Deterministic color from a name so a player keeps the same color everywhere. */
export function colorForName(name = ''): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
