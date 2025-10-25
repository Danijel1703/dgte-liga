import {
  EuroSymbol as Euro,
  AccountBalance as Bank,
  Schedule as Clock,
  EmojiEvents as Trophy,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Container,
  Paper,
  Typography,
  Divider,
  Alert,
} from "@mui/material";

export default function Payment() {
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
            Uplate i članarina
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Informacije o plaćanju članarine za DGTE ligu
          </Typography>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 8, px: 2 }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Cijena Lige
            </Typography>
          </Box>

          <Card sx={{ maxWidth: "400px", mx: "auto", boxShadow: 4 }}>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
                Mjesečna članarina
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Cijena za ligu kroz cijelu godinu
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Euro sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
                <Typography
                  variant="h2"
                  component="span"
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  35
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Payment Information */}
      <Box sx={{ py: 8, px: 2, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Informacije o uplati
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Kako i kada platiti članarinu
            </Typography>
          </Box>

          <Card sx={{ maxWidth: "600px", mx: "auto", boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Clock sx={{ color: "primary.main", mr: 1 }} />
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ fontWeight: "bold" }}
                >
                  Rok za uplatu
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 4 }}>
                Uplate za ligu izvršite do 10.-og u mjesecu za tekući mjesec na
                broj računa od Udruge:
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Bank sx={{ color: "primary.main", mr: 1 }} />
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ fontWeight: "bold" }}
                >
                  Broj računa
                </Typography>
              </Box>

              <Card
                sx={{
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  mb: 3,
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography
                    variant="h4"
                    component="div"
                    fontSize=""
                    sx={{
                      fontWeight: "bold",
                      fontFamily: "monospace",
                      fontSize: { xs: "1rem", sm: "2rem", md: "2.5rem" },
                    }}
                  >
                    HR3923400091111199032
                  </Typography>
                </CardContent>
              </Card>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  component="h4"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Opis uplate:
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                  članarina dgte liga za mjesec ........
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>NAPOMENA:</strong> U cijeni članarine su vam i termini
                  koje igrate u ligi, ne morate ništa plaćati kada odigrate meč.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
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
