/**
 * Assign week/round numbers so every player in a group has the same
 * "this week" pairing.
 *
 * League groups are 4 players / 6 matches. A week is two matches that
 * use all four players once (a 1-factor). Older fixtures were saved
 * without `round`, so picking each player's Nth match made people see
 * different opponents for the same week.
 */
export function assignMatchRounds<
  T extends {
    id?: string;
    player_one_id: string;
    player_two_id: string;
    round?: number | null;
  },
>(matches: T[]): Map<string, number> {
  const result = new Map<string, number>();
  const withIds = matches.filter((m): m is T & { id: string } => Boolean(m.id));

  for (const match of withIds) {
    if (match.round != null) result.set(match.id, match.round);
  }

  const unused = withIds
    .filter((m) => m.round == null)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));

  let round = 1;
  const usedRounds = [...result.values()];
  if (usedRounds.length > 0) round = Math.max(...usedRounds) + 1;

  while (unused.length > 0) {
    const first = unused.shift()!;
    const playing = new Set([first.player_one_id, first.player_two_id]);
    const complementIndex = unused.findIndex(
      (m) => !playing.has(m.player_one_id) && !playing.has(m.player_two_id)
    );

    result.set(first.id, round);
    if (complementIndex >= 0) {
      const complement = unused.splice(complementIndex, 1)[0];
      result.set(complement.id, round);
    }
    round++;
  }

  return result;
}
