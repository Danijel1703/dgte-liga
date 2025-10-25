import { Box, Container } from "@mui/material";
import HeroSection from "../components/home/HeroSection";
import Footer from "../components/home/Footer";
import AnnouncementSection from "../components/home/AnnouncementSection";

export default function Home() {
  return (
    <Box
      sx={{ minHeight: "100vh", bgcolor: "background.default", width: "100%" }}
    >
      <HeroSection />
      <Container maxWidth="md">
        <AnnouncementSection />
      </Container>
      <Footer />
    </Box>
  );
}
