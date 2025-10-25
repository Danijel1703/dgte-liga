import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import AddAnnouncementModal from "../AddAnnouncementModal";
import AnnouncementList from "../AnnouncementList";

export default function AnnouncementSection() {
  const [addAnnouncementOpen, setAddAnnouncementOpen] = useState(false);
  const { announcements, loading, deleteAnnouncement, refresh } =
    useAnnouncements();
  const { isAdmin } = useAuth();

  return (
    <>
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

      <AddAnnouncementModal
        open={addAnnouncementOpen}
        onClose={() => setAddAnnouncementOpen(false)}
        onSuccess={refresh}
      />
    </>
  );
}
