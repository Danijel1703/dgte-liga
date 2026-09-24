/** Players per group in the filmed draw. 12 entrants become 3 groups. */
export const CUP_DRAW_GROUP_SIZE = 4;

export const CUP_DRAW_COLORS = [
  "hsl(210, 65%, 45%)",
  "hsl(152, 55%, 38%)",
  "hsl(28, 80%, 48%)",
  "hsl(270, 50%, 48%)",
];

/**
 * Fisher–Yates. `nextIndex(max)` returns an integer in `[0, max)`.
 * The button passes a crypto-backed index so the draw happens in the browser
 * at the moment it is clicked.
 */
export function shuffleWith<T>(items: T[], nextIndex: (max: number) => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = nextIndex(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Unbiased index in `[0, max)` from Web Crypto. */
export function randomIndex(max: number): number {
  if (max <= 1) return 0;
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
}

export function dealWith<T>(
  items: T[],
  groupSize: number,
  nextIndex: (max: number) => number
): T[][] {
  if (groupSize < 2) throw new Error("Skupina mora imati barem dva igrača.");
  const shuffled = shuffleWith(items, nextIndex);
  const groups: T[][] = [];
  for (let i = 0; i < shuffled.length; i += groupSize) {
    groups.push(shuffled.slice(i, i + groupSize));
  }
  return groups;
}

export function dealIntoGroups<T>(items: T[], groupSize = CUP_DRAW_GROUP_SIZE): T[][] {
  return dealWith(items, groupSize, randomIndex);
}
