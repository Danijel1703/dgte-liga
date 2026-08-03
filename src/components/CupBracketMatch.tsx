import { Pencil, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils";
import type { TCupMatch, TUser } from "../types";

export interface CupBracketMatchProps {
  match: TCupMatch | null;
  /** Resolves a user id to a player; undefined for a slot still to be filled. */
  playerOf: (userId: string | null) => TUser | undefined;
  /** Gold treatment for the final. */
  isFinal?: boolean;
  onEdit?: (match: TCupMatch) => void;
}

/**
 * One knockout match as a two-row card. Scores may be absent (null) — a
 * knockout match can legitimately record only its winner — so an empty score
 * renders as a dash rather than a zero.
 */
export function CupBracketMatch({
  match,
  playerOf,
  isFinal = false,
  onEdit,
}: CupBracketMatchProps) {
  if (!match) {
    return (
      <div className="border-2 border-dashed rounded-xl py-6 text-center text-muted-foreground text-sm">
        Još nije određeno
      </div>
    );
  }

  const sides = [
    {
      userId: match.player_one_id,
      games: match.player_one_games,
      player: playerOf(match.player_one_id),
    },
    {
      userId: match.player_two_id,
      games: match.player_two_games,
      player: playerOf(match.player_two_id),
    },
  ];

  const isTieBreak =
    match.player_one_games !== null &&
    match.player_one_games === match.player_two_games &&
    !!match.winner_id;

  return (
    <Card
      className={cn(
        "overflow-hidden py-0 relative",
        isFinal &&
          "border-yellow-400/40 bg-gradient-to-b from-yellow-500/10 to-amber-500/5"
      )}
    >
      <CardContent className="p-3 space-y-1">
        {onEdit && (
          <button
            onClick={() => onEdit(match)}
            className="absolute top-2 right-2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Uredi rezultat"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {sides.map((side, index) => {
          const isWinner = !!match.winner_id && match.winner_id === side.userId;
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2.5 py-1.5 px-2 rounded-lg",
                isWinner && "bg-amber-50 font-bold"
              )}
            >
              {side.player ? (
                <PlayerAvatar
                  firstName={side.player.first_name}
                  lastName={side.player.last_name}
                  size="xs"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0" />
              )}
              <span
                className={cn(
                  "flex-1 text-sm truncate",
                  !side.player && "text-muted-foreground italic"
                )}
              >
                {side.player
                  ? `${side.player.first_name} ${side.player.last_name}`
                  : "Čeka pobjednika"}
              </span>
              {isWinner && (
                <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              )}
              <span className="text-sm font-mono tabular-nums w-5 text-right text-muted-foreground">
                {side.games ?? "–"}
              </span>
            </div>
          );
        })}
        {isTieBreak && (
          <div className="px-2 pb-0.5">
            <Badge className="text-[10px] bg-amber-100 text-amber-700 border-0 hover:bg-amber-100">
              TB
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
