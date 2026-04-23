import { Trophy, Calendar, Shield, Swords } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { TMatch, TUser } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────
export type JoinedMatchDetail = TMatch & {
  player_one: TUser;
  player_two: TUser;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
];
function avatarColor(first: string, last: string) {
  return AVATAR_COLORS[
    (first.charCodeAt(0) + last.charCodeAt(0)) % AVATAR_COLORS.length
  ];
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

// ── Sub-components ────────────────────────────────────────────────────────────
function PlayerCard({
  player,
  isWinner,
  side,
}: {
  player: TUser;
  isWinner: boolean;
  side: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 flex-1 min-w-0",
        side === "right" && "items-end text-right"
      )}
    >
      <div className="relative">
        <div
          className={cn(
            `w-16 h-16 rounded-full ${avatarColor(player.first_name, player.last_name)} flex items-center justify-center text-white text-xl font-bold shadow-md`,
            isWinner && "ring-2 ring-amber-400 ring-offset-2 ring-offset-background"
          )}
        >
          {player.first_name[0]}
          {player.last_name[0]}
        </div>
        {isWinner && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
            <Trophy className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>
      <div className={cn("min-w-0", side === "right" && "flex flex-col items-end")}>
        <p className="font-semibold text-sm leading-tight truncate">
          {player.first_name} {player.last_name}
        </p>
        {isWinner && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-500">
            Pobjednik
          </span>
        )}
      </div>
    </div>
  );
}

function SetScoreRow({
  set,
  index,
  winnerId,
  playerOneId,
  playerTwoId,
}: {
  set: { set_number: number; player_one_games: number; player_two_games: number };
  index: number;
  winnerId: string | null;
  playerOneId: string;
  playerTwoId: string;
}) {
  const isTiebreak = index + 1 === 3;
  const label = isTiebreak ? "Tie-break" : `${index + 1}. set`;
  const p1Won = set.player_one_games > set.player_two_games;
  const p2Won = set.player_two_games > set.player_one_games;

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs text-muted-foreground w-16 text-right">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-center">
        <span
          className={cn(
            "w-8 text-center text-lg font-bold tabular-nums",
            p1Won ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {set.player_one_games}
        </span>
        <span className="text-muted-foreground text-xs font-medium">–</span>
        <span
          className={cn(
            "w-8 text-center text-lg font-bold tabular-nums",
            p2Won ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {set.player_two_games}
        </span>
      </div>
      <div className="w-16 flex justify-start">
        {p1Won && winnerId === playerOneId && (
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
        )}
        {p2Won && winnerId === playerTwoId && (
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
        )}
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function MatchDetailModal({
  open,
  match,
  onClose,
}: {
  open: boolean;
  match: JoinedMatchDetail | null;
  onClose: () => void;
}) {
  if (!match) return null;

  const p1 = match.player_one;
  const p2 = match.player_two;
  const isSurrendered = match.status === "surrendered";

  // Derive set-level stats
  const setsWithScores = match.sets.filter(
    (s) => s.player_one_games > 0 || s.player_two_games > 0
  );
  const p1Sets = setsWithScores.filter(
    (s) => s.player_one_games > s.player_two_games
  ).length;
  const p2Sets = setsWithScores.filter(
    (s) => s.player_two_games > s.player_one_games
  ).length;

  const hasResult = setsWithScores.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Swords className="w-4 h-4 text-muted-foreground" />
            Detalji meča
          </DialogTitle>
        </DialogHeader>

        {/* ── Players vs ── */}
        <div className="flex items-center gap-3 py-2">
          <PlayerCard
            player={p1}
            isWinner={match.winner_id === p1.user_id}
            side="left"
          />

          {/* Score summary */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            {hasResult ? (
              <>
                <span className="text-3xl font-black tabular-nums tracking-tight">
                  {p1Sets}
                  <span className="text-muted-foreground mx-1">–</span>
                  {p2Sets}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  setovi
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-muted-foreground">vs</span>
            )}
          </div>

          <PlayerCard
            player={p2}
            isWinner={match.winner_id === p2.user_id}
            side="right"
          />
        </div>

        <Separator />

        {/* ── Set breakdown ── */}
        {hasResult && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Rezultati po setovima
            </p>
            <div className="divide-y divide-border rounded-md border border-border overflow-hidden bg-muted/20 px-2">
              {match.sets.map((set, i) => {
                const isEmpty =
                  set.player_one_games === 0 && set.player_two_games === 0;
                if (isEmpty) return null;
                return (
                  <SetScoreRow
                    key={i}
                    set={set}
                    index={i}
                    winnerId={match.winner_id}
                    playerOneId={match.player_one_id}
                    playerTwoId={match.player_two_id}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── Meta info ── */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(match.created_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-semibold border-0 px-2 py-0.5",
                isSurrendered
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              )}
            >
              {isSurrendered ? "Predaja" : "Završen"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
