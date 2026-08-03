import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils";
import type { TLeaderboardEntry } from "../utils/playerStats";
import type { TUser } from "../types";

export interface LeaderboardCardProps {
  title: string;
  /** One line explaining exactly what is counted. */
  hint: string;
  icon: LucideIcon;
  entries: TLeaderboardEntry[];
  playerOf: (userId: string) => TUser | undefined;
  /** Renders the headline number for an entry. */
  formatValue: (entry: TLeaderboardEntry) => string;
  /** Optional smaller text under the value, e.g. the denominator. */
  formatDetail?: (entry: TLeaderboardEntry) => string | null;
  onSelectPlayer?: (userId: string) => void;
}

const RANK_STYLES = [
  "bg-yellow-100 text-yellow-700",
  "bg-slate-100 text-slate-600",
  "bg-amber-100 text-amber-700",
];

export function LeaderboardCard({
  title,
  hint,
  icon: Icon,
  entries,
  playerOf,
  formatValue,
  formatDetail,
  onSelectPlayer,
}: LeaderboardCardProps) {
  return (
    <Card className="shadow-sm overflow-hidden py-0">
      <CardContent className="p-4">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight">{title}</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              {hint}
            </p>
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">
            Nema dovoljno podataka
          </p>
        ) : (
          <div className="space-y-0.5">
            {entries.map((entry, index) => {
              const player = playerOf(entry.userId);
              if (!player) return null;
              const detail = formatDetail?.(entry) ?? null;
              return (
                <button
                  key={entry.userId}
                  onClick={() => onSelectPlayer?.(entry.userId)}
                  disabled={!onSelectPlayer}
                  className={cn(
                    "w-full flex items-center gap-2 py-1.5 px-1.5 rounded-lg text-left transition-colors",
                    onSelectPlayer && "hover:bg-muted/60 cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                      RANK_STYLES[index] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>
                  <PlayerAvatar
                    firstName={player.first_name}
                    lastName={player.last_name}
                    size="xs"
                  />
                  <span className="flex-1 text-xs font-medium truncate">
                    {player.first_name} {player.last_name}
                  </span>
                  <span className="text-xs font-bold tabular-nums flex-shrink-0">
                    {formatValue(entry)}
                  </span>
                  {detail && (
                    <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0 w-10 text-right">
                      {detail}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
