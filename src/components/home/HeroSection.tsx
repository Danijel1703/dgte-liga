import { Box, Container, Typography } from "@mui/material";

export default function HeroSection() {
  return (
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
  );
}
