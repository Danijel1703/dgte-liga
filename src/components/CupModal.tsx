import { Save } from "lucide-react";
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
import type { TCup } from "../types";
import {
  CUP_SET_GAMES_MAX,
  CUP_SET_GAMES_MIN,
  NEW_CUP_SET_GAMES,
  resolveCupGroupGames,
  resolveCupKnockoutGames,
} from "../utils/cupDisplay";

export type TCupFormValues = {
  name: string;
  playedOn: string | null;
  groupGames: number;
  knockoutGames: number;
};

export interface CupModalProps {
  open: boolean;
  onClose: () => void;
  /** Omit to create a new cup. */
  cup?: TCup | null;
  onSave: (values: TCupFormValues) => Promise<void>;
}

function parseSetGames(raw: string): number | null {
  if (!/^\d+$/.test(raw.trim())) return null;
  const n = Number(raw);
  if (n < CUP_SET_GAMES_MIN || n > CUP_SET_GAMES_MAX) return null;
  return n;
}

/**
 * Create/edit a cup. One modal serves both cases, unlike the
 * CreateGroupModal / EditGroupModal pair which are near-identical duplicates.
 */
export default function CupModal({ open, onClose, cup, onSave }: CupModalProps) {
  const [name, setName] = useState("");
  const [playedOn, setPlayedOn] = useState("");
  const [groupGames, setGroupGames] = useState(String(NEW_CUP_SET_GAMES));
  const [knockoutGames, setKnockoutGames] = useState(String(NEW_CUP_SET_GAMES));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(cup?.name ?? "");
    setPlayedOn(cup?.played_on ?? "");
    setGroupGames(
      String(cup ? resolveCupGroupGames(cup.group_games) : NEW_CUP_SET_GAMES)
    );
    setKnockoutGames(
      String(cup ? resolveCupKnockoutGames(cup.knockout_games) : NEW_CUP_SET_GAMES)
    );
  }, [cup, open]);

  const groupGamesValue = parseSetGames(groupGames);
  const knockoutGamesValue = parseSetGames(knockoutGames);

  const handleSave = async () => {
    if (!name.trim() || groupGamesValue === null || knockoutGamesValue === null) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        playedOn: playedOn || null,
        groupGames: groupGamesValue,
        knockoutGames: knockoutGamesValue,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{cup ? "Uredi kup" : "Kreiraj kup"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="cup-name">Ime kupa</Label>
            <Input
              id="cup-name"
              autoFocus
              placeholder="npr. Kup 1 — 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cup-date">Datum</Label>
            <Input
              id="cup-date"
              type="date"
              value={playedOn}
              onChange={(e) => setPlayedOn(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Nije obavezno — može se dodati kasnije.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cup-group-games">Gemovi u skupini</Label>
              <Input
                id="cup-group-games"
                type="number"
                inputMode="numeric"
                min={CUP_SET_GAMES_MIN}
                max={CUP_SET_GAMES_MAX}
                value={groupGames}
                onChange={(e) => setGroupGames(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cup-knockout-games">Gemovi u playoffu</Label>
              <Input
                id="cup-knockout-games"
                type="number"
                inputMode="numeric"
                min={CUP_SET_GAMES_MIN}
                max={CUP_SET_GAMES_MAX}
                value={knockoutGames}
                onChange={(e) => setKnockoutGames(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Jedan set do zadanog broja gemova. Izjednačen rezultat (npr. 6:6)
            odlučuje tie-break — pobjednika odabereš uz rezultat.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Odustani
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !name.trim() ||
              groupGamesValue === null ||
              knockoutGamesValue === null ||
              saving
            }
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Spremi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
