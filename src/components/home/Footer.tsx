import { EmojiEvents as Trophy } from "@mui/icons-material";
import { Box, Container, Paper, Typography } from "@mui/material";

export default function Footer() {
  return (
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
            <Typography variant="h5" component="h4" sx={{ fontWeight: "bold" }}>
              DGTE - Liga
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Tenis liga za sve razine igrača
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
}
