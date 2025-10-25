import { EmojiEvents as Trophy } from "@mui/icons-material";
import { Box, Container, Paper, Typography } from "@mui/material";

export default function Home() {
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

      {/* Footer */}
      <Paper sx={{ mt: 4 }} elevation={0}>
        <Container maxWidth="md">
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
    </Box>
  );
}
