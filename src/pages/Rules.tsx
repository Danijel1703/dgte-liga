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
  List,
  ListItem,
  ListItemText,
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
          {/* League Info */}
          <Box sx={{ py: 8, px: 2, bgcolor: "grey.50" }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Kako funkcionira liga
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Sve što trebate znati o ligi
                </Typography>
              </Box>

              <Card sx={{ maxWidth: "800px", mx: "auto", boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <List>
                    <ListItem>
                      <ListItemText primary="Skupine sadrže 4 igrača, na kraju mjeseca najbolje plasirani u skupini prelazi u jaču skupinu, a najlošije plasirani u slabiju skupinu" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Svatko igra 3 meča u mjesecu." />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Uplata lige ide na početku mjeseca, odnosno kod rezervacije prvog meča će biti provjera, ukoliko nekome ne odgovara, može se sve dogovoriti sa voditeljem lige" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Tijekom godine se planira 2 Kupa i 1 Masters" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Poredak u ligi će imati utjecaja na pored na Kupu, a bodovi iz lige i sa Kupova će formirati popis od 12 najboljih igrača koji će imati pravo nastupiti na finalnom Mastersu" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Container>
          </Box>

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
