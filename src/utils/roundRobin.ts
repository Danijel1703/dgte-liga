/**
 * Round-robin scheduling using the "circle method".
 *
 * For N participants (padded to even with a BYE sentinel if odd):
 *   - Fix participant[0] in place.
 *   - Rotate participants[1..N-1] one position each round.
 *   - Each round, pair top-half vs reversed bottom-half.
 *
 * Returns an array of rounds, where each round is an array of [indexA, indexB] pairs.
 * A pair containing the BYE index (-1) is a bye and should be skipped.
 *
 * Lives in its own module (rather than in generateSchedule.ts) so it can be
 * imported without pulling in the Supabase client, which builds itself at
 * module load from Vite env vars and so cannot be loaded outside the browser.
 */
export function buildRoundRobinRounds(playerCount: number): [number, number][][] {
  const participants: number[] = [];
  for (let i = 0; i < playerCount; i++) participants.push(i);

  // If odd, add a BYE placeholder
  if (participants.length % 2 !== 0) participants.push(-1);

  const n = participants.length;
  const totalRounds = n - 1;
  const rounds: [number, number][][] = [];

  // Working copy (we'll rotate indices 1..n-1)
  const list = [...participants];

  for (let round = 0; round < totalRounds; round++) {
    const pairs: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      pairs.push([home, away]);
    }
    rounds.push(pairs);

    // Rotate: keep list[0] fixed, rotate list[1..n-1] by one position to the right
    const last = list[n - 1];
    for (let i = n - 1; i > 1; i--) {
      list[i] = list[i - 1];
    }
    list[1] = last;
  }

  return rounds;
}
