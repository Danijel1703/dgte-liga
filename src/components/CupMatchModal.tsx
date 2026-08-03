import { Save, X, Eraser } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { TCupMatch, TStatus, TUser } from "../types";
import { maxGamesForStage } from "../utils/cupDisplay";

/** Sentinel for the "no score recorded" option — the score column stays NULL. */
const NO_SCORE = "none";

export type TCupMatchPatch = {
  player_one_id: string | null;
  player_two_id: string | null;
  player_one_games: number | null;
  player_two_games: number | null;
  winner_id: string | null;
  status: TStatus;
  is_surrender: boolean;
};

export interface CupMatchModalProps {
  open: boolean;
  match: TCupMatch | null;
  /** Shown under the title, e.g. "Skupina 1" or "Polufinale". */
  stageLabel: string;
  /** Everyone in the cup — used for the knockout pairing override. */
  participants: TUser[];
  onClose: () => void;
  onSave: (match: TCupMatch, patch: TCupMatchPatch) => Promise<void>;
}

/**
 * Result entry for cup matches: the winner is the authoritative input and the
 * score is optional.
 *
 * This is deliberately a separate component from EditMatchModal rather than a
 * mode of it. That modal *derives* the winner from the score and returns null
 * on a tie, so it structurally cannot express "Luka won the final, no score
 * recorded" or "4-4, decided by tie-break" — both of which are real states on
 * the first cup's scoresheet.
 */
export default function CupMatchModal({
  open,
  match,
  stageLabel,
  participants,
  onClose,
  onSave,
}: CupMatchModalProps) {
  const [playerOneId, setPlayerOneId] = useState<string | null>(null);
  const [playerTwoId, setPlayerTwoId] = useState<string | null>(null);
  const [gamesOne, setGamesOne] = useState<number | null>(null);
  const [gamesTwo, setGamesTwo] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [isSurrender, setIsSurrender] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPlayerOneId(match?.player_one_id ?? null);
    setPlayerTwoId(match?.player_two_id ?? null);
    setGamesOne(match?.player_one_games ?? null);
    setGamesTwo(match?.player_two_games ?? null);
    setWinnerId(match?.winner_id ?? null);
    setIsSurrender(match?.is_surrender ?? false);
  }, [match, open]);

  const findUser = (userId: string | null) =>
    userId ? participants.find((u) => u.user_id === userId) : undefined;

  const playerOne = findUser(playerOneId);
  const playerTwo = findUser(playerTwoId);

  const isKnockout = match ? match.stage !== "group" : false;
  const gameOptions = match ? [...Array(maxGamesForStage(match.stage) + 1).keys()] : [];
  const isTied = gamesOne !== null && gamesTwo !== null && gamesOne === gamesTwo;

  // Changing a knockout pairing can orphan the recorded winner
  useEffect(() => {
    if (winnerId && winnerId !== playerOneId && winnerId !== playerTwoId) {
      setWinnerId(null);
    }
  }, [playerOneId, playerTwoId, winnerId]);

  const handleSave = async () => {
    if (!match) return;
    setSaving(true);
    try {
      await onSave(match, {
        player_one_id: playerOneId,
        player_two_id: playerTwoId,
        player_one_games: gamesOne,
        player_two_games: gamesTwo,
        winner_id: winnerId,
        // A winner with no score is legal — that is the point of this modal.
        status: winnerId ? (isSurrender ? "surrendered" : "played") : "waiting",
        is_surrender: isSurrender,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClearResult = () => {
    setGamesOne(null);
    setGamesTwo(null);
    setWinnerId(null);
    setIsSurrender(false);
  };

  const scoreSelect = (
    side: "one" | "two",
    value: number | null,
    setValue: (n: number | null) => void,
    player?: TUser
  ) => (
    <div className="flex-1 space-y-1">
      <p className="text-xs text-muted-foreground truncate">
        {player?.first_name ?? (side === "one" ? "Igrač 1" : "Igrač 2")}
      </p>
      <Select
        value={value === null ? NO_SCORE : String(value)}
        onValueChange={(v) => setValue(v === NO_SCORE || v == null ? null : Number(v))}
      >
        <SelectTrigger className="w-full">
          {/* Base UI renders the raw value unless given a formatter */}
          <SelectValue>
            {(v) => (v === NO_SCORE || v == null ? "Bez rezultata" : String(v))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_SCORE}>Bez rezultata</SelectItem>
          {gameOptions.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const winnerButton = (userId: string | null, player?: TUser) => {
    if (!userId || !player) return null;
    return (
      <Button
        type="button"
        variant={winnerId === userId ? "default" : "outline"}
        className="w-full justify-start gap-2"
        onClick={() => setWinnerId(userId)}
      >
        <PlayerAvatar
          firstName={player.first_name}
          lastName={player.last_name}
          size="xs"
        />
        {player.first_name} {player.last_name}
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Unesi rezultat
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">
              {stageLabel}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Players header */}
        {playerOne && playerTwo && (
          <div className="flex items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <PlayerAvatar
                firstName={playerOne.first_name}
                lastName={playerOne.last_name}
                size="md"
              />
              <p className="font-semibold text-sm truncate">
                {playerOne.first_name} {playerOne.last_name}
              </p>
            </div>
            <span className="text-xs font-bold text-muted-foreground px-2 flex-shrink-0">
              PROTIV
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <PlayerAvatar
                firstName={playerTwo.first_name}
                lastName={playerTwo.last_name}
                size="md"
              />
              <p className="font-semibold text-sm truncate">
                {playerTwo.first_name} {playerTwo.last_name}
              </p>
            </div>
          </div>
        )}

        {/* Knockout pairing override */}
        {isKnockout && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Sudionici</h3>
              <div className="flex items-center gap-3">
                {(["one", "two"] as const).map((side) => {
                  const value = side === "one" ? playerOneId : playerTwoId;
                  const setValue = side === "one" ? setPlayerOneId : setPlayerTwoId;
                  const other = side === "one" ? playerTwoId : playerOneId;
                  return (
                    <div key={side} className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {side === "one" ? "Igrač 1" : "Igrač 2"}
                      </Label>
                      <Select
                        value={value ?? ""}
                        onValueChange={(v) => setValue((v as string) || null)}
                      >
                        <SelectTrigger className="w-full">
                          {/* Base UI renders the raw value (a uuid) unless given a formatter */}
                          <SelectValue placeholder="Odaberi...">
                            {(v) => {
                              const u = findUser(v as string | null);
                              return u ? `${u.first_name} ${u.last_name}` : "Odaberi...";
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {participants
                            .filter((u) => u.user_id !== other)
                            .map((u) => (
                              <SelectItem key={u.user_id} value={u.user_id}>
                                {u.first_name} {u.last_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Score — optional */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Rezultat</h3>
            <p className="text-xs text-muted-foreground">
              Nije obavezno — dovoljno je odabrati pobjednika.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {scoreSelect("one", gamesOne, setGamesOne, playerOne)}
            <span className="text-lg font-bold text-muted-foreground pt-5">—</span>
            {scoreSelect("two", gamesTwo, setGamesTwo, playerTwo)}
          </div>
          {isTied && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-2.5 py-2">
              Rezultat je izjednačen — pobjednika odlučuje tie-break. Odaberi
              pobjednika ispod.
            </p>
          )}
        </div>

        <Separator />

        {/* Winner — required */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Pobjednik</h3>
            {winnerId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearResult}
                className="gap-1.5 text-muted-foreground h-7"
              >
                <Eraser className="w-3.5 h-3.5" />
                Očisti
              </Button>
            )}
          </div>
          {playerOne && playerTwo ? (
            <div className="space-y-2">
              {winnerButton(playerOneId, playerOne)}
              {winnerButton(playerTwoId, playerTwo)}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Odaberi oba sudionika prije unosa pobjednika.
            </p>
          )}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="w-4 h-4" />
            Odustani
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            Spremi rezultat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
