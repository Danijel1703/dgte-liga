import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useAnnouncements } from "../hooks/useAnnouncements";

interface AddAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddAnnouncementModal({
  open,
  onClose,
  onSuccess,
}: AddAnnouncementModalProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addAnnouncement } = useAnnouncements();

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Tekst obavjesti je obavezan");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await addAnnouncement(text.trim());
      setText("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri dodavanju obavjesti");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj Obavjest</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="announcement-text">Tekst obavjesti</Label>
            <Textarea
              id="announcement-text"
              rows={4}
              placeholder="Unesite tekst obavjesti..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Otkaži
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className=""
          >
            {loading ? "Dodavanje..." : "Dodaj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
