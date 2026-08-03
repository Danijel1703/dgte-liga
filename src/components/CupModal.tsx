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

export interface CupModalProps {
  open: boolean;
  onClose: () => void;
  /** Omit to create a new cup. */
  cup?: TCup | null;
  onSave: (name: string, playedOn: string | null) => Promise<void>;
}

/**
 * Create/edit a cup. One modal serves both cases, unlike the
 * CreateGroupModal / EditGroupModal pair which are near-identical duplicates.
 */
export default function CupModal({ open, onClose, cup, onSave }: CupModalProps) {
  const [name, setName] = useState("");
  const [playedOn, setPlayedOn] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(cup?.name ?? "");
    setPlayedOn(cup?.played_on ?? "");
  }, [cup, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(name.trim(), playedOn || null);
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Odustani
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
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
