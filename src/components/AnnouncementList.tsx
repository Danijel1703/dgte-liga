import {
  Box,
  Paper,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import type { TAnnouncement } from "../types.d";
import { format } from "date-fns";
import { hr } from "date-fns/locale";

interface AnnouncementListProps {
  announcements: TAnnouncement[];
  loading: boolean;
  error: string | null;
  deleteAnnouncement: (id: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function AnnouncementList({
  announcements,
  loading,
  error,
  deleteAnnouncement,
  isAdmin = false,
}: AnnouncementListProps) {
  const handleDelete = async (id: string) => {
    if (window.confirm("Jeste li sigurni da želite obrisati ovu obavjest?")) {
      try {
        await deleteAnnouncement(id);
      } catch {
        alert("Greška pri brisanju obavjesti");
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: hr });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Greška pri učitavanju obavjesti: {error}
      </Alert>
    );
  }

  if (announcements.length === 0) {
    return (
      <Paper sx={{ p: 3, m: 2, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Nema obavjesti za prikaz
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Obavjesti
      </Typography>
      {announcements.map((announcement: TAnnouncement, index: number) => (
        <Paper
          key={announcement.id}
          elevation={2}
          sx={{
            p: 3,
            mb: 2,
            position: "relative",
            backgroundColor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1, pr: isAdmin ? 4 : 0 }}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.6,
                }}
              >
                {announcement.text}
              </Typography>
              {announcement.created_at && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  {formatDate(announcement.created_at)}
                </Typography>
              )}
            </Box>
            {isAdmin && (
              <IconButton
                onClick={() => handleDelete(announcement.id!)}
                color="error"
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          {index < announcements.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Paper>
      ))}
    </Box>
  );
}
