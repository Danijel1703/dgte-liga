import { Delete, Person, Phone, Search } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Checkbox,
} from "@mui/material";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { useUsers } from "../providers/UsersProvider";
import { useAuth } from "../providers/AuthProvider";
import { supabase } from "../utils/supabase";

export default function Players() {
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { users: players, refresh } = useUsers();
  const { user: authUser } = useAuth();
  const me = players.find((p) => p.user_id === authUser?.id);

  const filteredPlayers = players.filter(
    (player) =>
      `${player.first_name} ${player.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.phone.includes(searchTerm)
  );

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Jeste li sigurni da želite obrisati igrača ${playerName}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("user")
        .update({ is_deleted: true })
        .eq("user_id", playerId);

      if (error) {
        throw error;
      }

      setSuccess(`Igrač ${playerName} je uspješno obrisan!`);
      refresh(); // Refresh the users list
    } catch (error: unknown) {
      console.error("Error deleting player:", error);
      setError((error as Error).message || "Greška pri brisanju igrača");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaid = async (
    userId: string,
    currentPaidStatus: boolean
  ) => {
    try {
      if (!me?.is_admin) return;

      const { error } = await supabase
        .from("user")
        .update({ paid: !currentPaidStatus })
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      refresh();
    } catch (error: unknown) {
      console.error("Error updating paid status:", error);
      setError(
        (error as Error).message || "Greška pri ažuriranju statusa plaćanja"
      );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <div className="flex items-center gap-3 mb-6">
          <Person
            sx={{
              color: "primary.main",
            }}
          />
          <Typography variant="h4" className="font-semibold text-gray-800">
            Igrači
          </Typography>
        </div>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Lista registriranih igrača
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pretražite igrače po imenu, email-u ili telefonu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, maxWidth: 400 }}
        />
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Igrač
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Ime
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Prezime
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Telefon
              </TableCell>
              <TableCell
                sx={{ color: "white", fontWeight: 600, textAlign: "center" }}
              >
                Plaćeno
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Akcije
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortBy(filteredPlayers, "lastName")
              .filter((t) => !t.is_viewer)
              .map((player) => {
                return (
                  <TableRow
                    key={player.user_id}
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                      "&:nth-of-type(odd)": {
                        backgroundColor: "action.selected",
                      },
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 40,
                            height: 40,
                          }}
                          className="text-sm!"
                        >
                          {player.first_name[0]}
                          {player.last_name[0]}
                        </Avatar>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {player.first_name}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {player.last_name}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <a
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            textDecoration: "underline",
                            color: "blue",
                          }}
                          href={`tel:${player.phone}`}
                        >
                          <Phone fontSize="small" color="action" />
                          {player.phone}
                        </a>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={!!player.paid}
                        disabled={!me?.is_admin || loading}
                        onChange={() =>
                          handleTogglePaid(player.user_id, !!player.paid)
                        }
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {me?.is_admin && player.user_id !== authUser?.id && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeletePlayer(
                                player.user_id,
                                `${player.first_name} ${player.last_name}`
                              )
                            }
                            disabled={loading}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredPlayers.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nema pronađenih igrača
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pokušajte sa drugačijim pojmom pretrage
          </Typography>
        </Box>
      )}
    </Container>
  );
}
