import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TMatch, TUser, TGroup, TStatus } from "../types";


export type JoinedMatch = TMatch & {
  player_one: TUser;
  player_two: TUser;
  group: TGroup;
};

const AVATAR_COLORS = [
  "bg-blue-600", "bg-violet-600",
  "bg-emerald-600", "bg-amber-600",
  "bg-rose-600",
];
function avatarColor(first: string, last: string) {
  return AVATAR_COLORS[(first.charCodeAt(0) + last.charCodeAt(0)) % AVATAR_COLORS.length];
}

function PlayerChip({ player, groupName, groupColor }: { player: TUser; groupName?: string; groupColor?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-10 h-10 rounded-full ${avatarColor(player.first_name, player.last_name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {player.first_name[0]}{player.last_name[0]}
      </div>
      <div>
        <p className="font-semibold text-sm">{player.first_name} {player.last_name}</p>
        {groupName && (
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: groupColor || "#6366f1" }}
          >
            {groupName}
          </span>
        )}
      </div>
    </div>
  );
}

export function EditMatchModal({
  open,
  match,
  onClose,
  onSave,
}: {
  open: boolean;
  match: JoinedMatch | null;
  onClose: () => void;
  onSave: (updated: JoinedMatch, winnerId: string | null, status: TStatus, isSurrender: boolean) => Promise<void>;
}) {
  const [localMatch, setLocalMatch] = useState<JoinedMatch | null>(match);
  const [isSurrender, setIsSurrender] = useState(false);
  const [manualWinner, setManualWinner] = useState<string | null>(null);

  useEffect(() => {
    setLocalMatch(match);
    if (match?.is_surrender) {
      setIsSurrender(true);
      setManualWinner(match.winner_id);
    } else {
      setIsSurrender(false);
      setManualWinner(null);
    }
  }, [match]);

  const playerOne = localMatch?.player_one;
  const playerTwo = localMatch?.player_two;
  const group = localMatch?.group;

  const handleSetScoreChange = (setIndex: number, player: "one" | "two", value: number) => {
    if (!localMatch) return;
    const updated: JoinedMatch = { ...localMatch, sets: [...localMatch.sets] };
    if (player === "one") {
      updated.sets[setIndex] = { ...updated.sets[setIndex], player_one_games: Math.max(0, value) };
    } else {
      updated.sets[setIndex] = { ...updated.sets[setIndex], player_two_games: Math.max(0, value) };
    }
    setLocalMatch(updated);
  };

  const determineWinner = (m: TMatch): string | null => {
    let p1 = 0, p2 = 0;
    m.sets.forEach((s) => {
      if (s.player_one_games > s.player_two_games) p1++;
      else if (s.player_two_games > s.player_one_games) p2++;
    });
    if (p1 > p2) return m.player_one_id;
    if (p2 > p1) return m.player_two_id;
    return null;
  };

  const handleSave = async () => {
    if (!localMatch) return;
    const calculatedWinner = determineWinner(localMatch);
    const status: TStatus = isSurrender ? "surrendered" : calculatedWinner ? "played" : "waiting";
    const winnerId = isSurrender ? manualWinner : calculatedWinner;
    await onSave(localMatch, winnerId, status, isSurrender);
  };

  const gameOptions = [...Array(8).keys()]; // 0-7

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unesite rezultate meča</DialogTitle>
        </DialogHeader>

        {/* Players header */}
        {playerOne && playerTwo && (
          <div className="flex items-center justify-between gap-2 py-2">
            <PlayerChip player={playerOne} groupName={group?.name} groupColor={group?.color} />
            <span className="text-xs font-bold text-muted-foreground px-2">PROTIV</span>
            <PlayerChip player={playerTwo} groupName={group?.name} groupColor={group?.color} />
          </div>
        )}

        <Separator />

        {/* Set scores */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Rezultati setova</h3>
          {localMatch?.sets.map((set, index) => {
            const isTieBreak = index + 1 === 3;
            return (
              <div key={index} className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  {isTieBreak ? "Tie break" : `${index + 1}. set`}
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    {isTieBreak ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{playerOne?.first_name}</p>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          value={set.player_one_games || ""}
                          onChange={(e) => handleSetScoreChange(index, "one", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{playerOne?.first_name}</p>
                        <Select
                          value={String(set.player_one_games || 0)}
                          onValueChange={(v) => handleSetScoreChange(index, "one", Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {gameOptions.map((n) => (
                              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-muted-foreground pt-5">—</span>
                  <div className="flex-1">
                    {isTieBreak ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{playerTwo?.first_name}</p>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          value={set.player_two_games || ""}
                          onChange={(e) => handleSetScoreChange(index, "two", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{playerTwo?.first_name}</p>
                        <Select
                          value={String(set.player_two_games || 0)}
                          onValueChange={(v) => handleSetScoreChange(index, "two", Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {gameOptions.map((n) => (
                              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Surrender */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Predaja meča</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!isSurrender ? "default" : "outline"}
              size="sm"
              onClick={() => setIsSurrender(false)}
            >
              Ne
            </Button>
            <Button
              type="button"
              variant={isSurrender ? "default" : "outline"}
              size="sm"
              onClick={() => setIsSurrender(true)}
            >
              Da
            </Button>
          </div>
          {isSurrender && localMatch && (
            <div className="space-y-2">
              <Label>Pobjednik</Label>
              <Select
                value={manualWinner || ""}
                onValueChange={(v) => setManualWinner(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi pobjednika..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={localMatch.player_one_id}>
                    {playerOne?.first_name} {playerOne?.last_name}
                  </SelectItem>
                  <SelectItem value={localMatch.player_two_id}>
                    {playerTwo?.first_name} {playerTwo?.last_name}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="w-4 h-4" />
            Odustani
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Spremi rezultate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
