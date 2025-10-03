import {
  Schedule as Clock,
  LocationOn as MapPin,
  EmojiEvents as Trophy,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Container,
  Paper,
  Typography,
} from "@mui/material";

export default function Rules() {
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
            Pravila lige
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Sve što trebate znati o funkcioniranju DGTE lige
          </Typography>
        </Container>
      </Box>

      {/* Rules Section */}
      <Box sx={{ py: 8, px: 2, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h6" color="text.secondary">
              Različita pravila za vanjsko i unutarnje igranje
            </Typography>
          </Box>
          <div className="flex w-full justify-center items-center flex-wrap gap-10">
            <Card sx={{ height: "100%", boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MapPin sx={{ color: "primary.main", mr: 1 }} />
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: "bold" }}
                  >
                    Vanjski tereni
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Clock
                    sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                  />
                  <Typography variant="body2">
                    Rezervacija termina je 2 sata
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Format igre:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Igra se 2 seta do 6 (tie brake do 7)
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ height: "100%", boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MapPin sx={{ color: "secondary.main", mr: 1 }} />
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: "bold" }}
                  >
                    Balon (unutarnji)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Clock
                    sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                  />
                  <Typography variant="body2">
                    Rezervacija traje 1,5 sat
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Format igre:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Igra se 2 seta (kreće se od 2:2), tie brake do 7
                </Typography>
              </CardContent>
            </Card>
          </div>
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
