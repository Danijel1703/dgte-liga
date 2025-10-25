import { EmojiEvents as Trophy } from "@mui/icons-material";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";
import { useMemo, useState } from "react";
import { useUsers } from "../providers/UsersProvider";
import { useAnnouncements } from "../hooks/useAnnouncements";
import AddAnnouncementModal from "../components/AddAnnouncementModal";
import AnnouncementList from "../components/AnnouncementList";

export default function Home() {
  const { user } = useAuth();
  const { users } = useUsers();
  const [addAnnouncementOpen, setAddAnnouncementOpen] = useState(false);
  const { announcements, loading, deleteAnnouncement, refresh } =
    useAnnouncements();

  const isAdmin = useMemo(
    () => users.find((u) => u.user_id === user?.id)?.is_admin,
    [user, users]
  );

  return (
    <Box
      sx={{ minHeight: "100vh", bgcolor: "background.default", width: "100%" }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          py: 5,
          px: 2,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: "bold", mb: 3, color: "text.primary" }}
          >
            DGTE - LIGA
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          {isAdmin && (
            <Button
              variant="contained"
              onClick={() => setAddAnnouncementOpen(true)}
              sx={{ mb: 2 }}
            >
              Dodaj Obavjest
            </Button>
          )}
        </Box>

        <AnnouncementList
          announcements={announcements}
          loading={loading}
          deleteAnnouncement={deleteAnnouncement}
          isAdmin={isAdmin}
        />
      </Container>
      {/* Footer */}
      <Paper sx={{ mt: 4 }} elevation={0}>
        <Container>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Trophy sx={{ color: "primary.main", mr: 1 }} />
              <Typography
                variant="h5"
                component="h4"
                sx={{ fontWeight: "bold" }}
              >
                DGTE - Liga
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Tenis liga za sve razine igrača
            </Typography>
          </Box>
        </Container>
      </Paper>

      <AddAnnouncementModal
        open={addAnnouncementOpen}
        onClose={() => setAddAnnouncementOpen(false)}
        onSuccess={refresh}
      />
    </Box>
  );
}
