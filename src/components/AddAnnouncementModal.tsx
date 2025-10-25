import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import { useState } from "react";
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
      setError(
        err instanceof Error ? err.message : "Greška pri dodavanju obavjesti"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText("");
    setError(null);
    onClose();
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dodaj Obavjest</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Tekst obavjesti"
            value={text}
            onChange={handleTextChange}
            placeholder="Unesite tekst obavjesti..."
            variant="outlined"
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Otkaži
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !text.trim()}
        >
          {loading ? "Dodavanje..." : "Dodaj"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
