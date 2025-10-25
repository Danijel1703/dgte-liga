import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Schedule,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "../providers/AuthProvider";
import { useLoader } from "../providers/Loader";
import { useUsers } from "../providers/UsersProvider";
import type { TGroup, TMatch, TUser } from "../types";
import { supabase } from "../utils/supabase";
import { generateSchedule } from "../utils/generateSchedule";
import { EditMatchModal } from "../components/EditMatchModal";
import { orderBy } from "lodash-es";

type JoinedMatch = TMatch & {
  player_one: TUser;
  player_two: TUser;
  group: TGroup;
};

export default function Matches() {
  const [selectedMatch, setSelectedMatch] = useState<JoinedMatch | null>(null);
  const [matches, setMatches] = useState<JoinedMatch[]>([]);
  const { users: players } = useUsers();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [modalOpen, setModalOpen] = useState(false);
  // Modal styling no longer needs theme hook here
  const { user } = useAuth();
  const player = players.find((p) => p.user_id === user?.id);
  const isAdmin = !!player?.is_admin;
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteSingleDialogOpen, setDeleteSingleDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<JoinedMatch | null>(null);
  const { setLoading } = useLoader();

  useEffect(() => {
    if (player && player.is_viewer) {
      setShowOnlyMine(false);
    }
  }, [user?.id, players]);

  const initialize = async () => {
    setLoading(true);
    // Load matches with joined users and group
    const { data: matchesData } = await supabase
      .from("match")
      .select(
        `
        *,
        player_one:player_one_id (*),
        player_two:player_two_id (*),
        group:group_id (*)
      `
      )
      .eq("is_deleted", false);

    if (matchesData) {
      const items = orderBy(matchesData, "group.name") as JoinedMatch[];
      let filteredMatches = showOnlyMine
        ? items.filter((t) =>
            [t.player_one_id, t.player_two_id].includes(user?.id as string)
          )
        : items;

      // Filter by selected month if a month is selected
      if (selectedMonth) {
        const startOfMonth = selectedMonth.startOf("month");
        const endOfMonth = selectedMonth.endOf("month");

        filteredMatches = filteredMatches.filter((match) => {
          // Filter by match creation date or any date field in the match
          const matchDate = match.created_at
            ? dayjs(match.created_at?.toDate?.() || match.created_at)
            : dayjs();
          return (
            matchDate.isAfter(startOfMonth) && matchDate.isBefore(endOfMonth)
          );
        });
      }

      setMatches(filteredMatches);
    } else {
      setMatches([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    initialize();
  }, [showOnlyMine, selectedMonth]);

  const getPlayer = (id: string) => players.find((p) => p.user_id === id);

  const handleMatchSelect = (match: JoinedMatch) => {
    setSelectedMatch({ ...match });
    setModalOpen(true);
  };

  const calculateSetResult = (match: TMatch) => {
    const hasResults = match.sets.some(
      (set) => set.player_one_games > 0 || set.player_two_games > 0
    );
    if (!hasResults) return "-";

    let playerOneSets = 0;
    let playerTwoSets = 0;

    match.sets.forEach((set) => {
      if (set.player_one_games > set.player_two_games) {
        playerOneSets++;
      } else if (set.player_two_games > set.player_one_games) {
        playerTwoSets++;
      }
    });

    return `${playerOneSets} - ${playerTwoSets}`;
  };

  const determineWinner = (match: TMatch): string => {
    let playerOneSets = 0;
    let playerTwoSets = 0;

    match.sets.forEach((set) => {
      if (set.player_one_games > set.player_two_games) {
        playerOneSets++;
      } else if (set.player_two_games > set.player_one_games) {
        playerTwoSets++;
      }
    });

    if (playerOneSets > playerTwoSets) {
      return match.player_one_id;
    } else if (playerTwoSets > playerOneSets) {
      return match.player_two_id;
    } else {
      return "";
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedMatch(null);
  };

  const getMatchWinnerDisplay = (match: JoinedMatch) => {
    const winnerId = determineWinner(match);
    if (!winnerId) return "-";

    const winner = getPlayer(winnerId);
    return winner ? `${winner.first_name} ${winner.last_name}` : "-";
  };

  // Check if selected month is the current month (only enable for current month)
  const isCurrentMonth = selectedMonth
    ? selectedMonth.isSame(dayjs(), "month")
    : false;

  // Delete all matches in current month
  const handleDeleteAllMatches = async () => {
    if (!selectedMonth) return;

    const startOfMonth = selectedMonth.startOf("month");
    const endOfMonth = selectedMonth.endOf("month");

    // Get all matches in the selected month
    const { data: matchesToDelete } = await supabase
      .from("match")
      .select("id")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString());

    if (matchesToDelete && matchesToDelete.length > 0) {
      const matchIds = matchesToDelete.map((match) => match.id);
      await supabase
        .from("match")
        .update({ is_deleted: true })
        .in("id", matchIds);

      setSnackbar({
        open: true,
        message: `Obrisano ${matchIds.length} mečeva iz ${selectedMonth.format(
          "MM/YYYY"
        )}.`,
        severity: "success",
      });
    }

    setDeleteAllDialogOpen(false);
    await initialize();
  };

  // Delete single match
  const handleDeleteSingleMatch = async () => {
    if (!matchToDelete?.id) return;

    await supabase
      .from("match")
      .update({ is_deleted: true })
      .eq("id", matchToDelete.id);

    await initialize();
    setSnackbar({
      open: true,
      message: "Meč je obrisan.",
      severity: "success",
    });

    setDeleteSingleDialogOpen(false);
    setMatchToDelete(null);
  };

  // Open delete single match dialog
  const handleDeleteMatchClick = (match: JoinedMatch) => {
    setMatchToDelete(match);
    setDeleteSingleDialogOpen(true);
  };

  // Derived details now handled inside EditMatchModal

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <div className="flex items-center gap-3 mb-6">
        <Schedule
          sx={{
            color: "primary.main",
          }}
        />
        <Typography variant="h4" className="font-semibold text-gray-800">
          Raspored
        </Typography>
      </div>
      <Box sx={{ mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={selectedMonth}
            onChange={(newValue) => setSelectedMonth(newValue)}
            label="Odaberi mjesec"
            views={["month", "year"]}
            format="MM/YYYY"
          />
        </LocalizationProvider>
      </Box>
      <Button
        sx={{
          mb: 2,
        }}
        variant="contained"
        onClick={() => setShowOnlyMine((oldState) => !oldState)}
      >
        {showOnlyMine ? "Prikaži sve mečeve" : "Prikaži samo moje mečeve"}
      </Button>
      {isAdmin && (
        <>
          <Button
            sx={{ mb: 2, ml: 2 }}
            variant="outlined"
            startIcon={<SaveIcon />}
            disabled={!isCurrentMonth}
            onClick={async () => {
              const matches = await generateSchedule();
              if (matches.length) {
                await supabase.from("match").insert(matches);
                await initialize();
                setSnackbar({
                  open: true,
                  message: "Raspored generiran.",
                  severity: "success",
                });
              }
            }}
          >
            Generiraj raspored
          </Button>
        </>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Meč #</strong>
              </TableCell>
              <TableCell>
                <strong>Igrač 1</strong>
              </TableCell>
              <TableCell>
                <strong>Igrač 2</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Rezultat</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Pobjednik</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Status</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Akcije</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match, index) => {
              const p1 = match.player_one;
              const p2 = match.player_two;
              const p1Group = match.group;
              const p2Group = match.group;
              const isCompleted =
                match.status === "played" || match.status === "surrendered";

              return (
                <TableRow
                  key={match.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                      cursor: "pointer",
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: p1Group?.color + ".main",
                          width: 32,
                          height: 32,
                          fontSize: "0.875rem",
                        }}
                      >
                        {p1?.avatar}
                      </Avatar>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          width: "60%",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {p1?.first_name} {p1?.last_name}
                        </Typography>
                        <Chip
                          label={p1Group?.name}
                          variant="filled"
                          sx={{
                            backgroundColor: p1Group?.color,
                            color: "white",
                          }}
                          className="font-medium"
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: p2Group?.color + ".main",
                          width: 32,
                          height: 32,
                          fontSize: "0.875rem",
                        }}
                      >
                        {p2?.avatar}
                      </Avatar>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          width: "60%",
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {p2?.first_name} {p2?.last_name}
                        </Typography>
                        <Chip
                          label={p2Group?.name}
                          variant="filled"
                          sx={{
                            backgroundColor: p2Group?.color,
                            color: "white",
                          }}
                          className="font-medium"
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6">
                      {calculateSetResult(match)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {getMatchWinnerDisplay(match)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {match.status === "surrendered" ? (
                      <Chip label="Predaja" size="small" color="warning" />
                    ) : isCompleted ? (
                      <Chip label="Završen" size="small" color="success" />
                    ) : (
                      <Chip label="Čeka" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleMatchSelect(match)}
                      >
                        Uredi
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteMatchClick(match)}
                        >
                          Obriši
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <EditMatchModal
        open={modalOpen}
        match={selectedMatch}
        onClose={handleModalClose}
        onSave={async (updated, winnerId, status, isSurrender) => {
          if (!updated?.id) return;
          await supabase
            .from("match")
            .update({
              sets: updated.sets,
              winner_id: winnerId,
              status,
              is_surrender: isSurrender,
            })
            .eq("id", updated.id);
          await initialize();
          setSnackbar({
            open: true,
            message: "Rezultati meča su spremljeni.",
            severity: "success",
          });
          setModalOpen(false);
          setSelectedMatch(null);
        }}
      />

      {snackbar.open && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}

      {/* Delete All Matches Confirmation Dialog */}
      <Dialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        aria-labelledby="delete-all-dialog-title"
      >
        <DialogTitle id="delete-all-dialog-title">
          Potvrdi brisanje svih mečeva
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Jeste li sigurni da želite obrisati sve mečeve iz{" "}
            {selectedMonth?.format("MM/YYYY")}? Ova akcija se ne može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllDialogOpen(false)}>
            Odustani
          </Button>
          <Button
            onClick={handleDeleteAllMatches}
            color="error"
            variant="contained"
          >
            Obriši sve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Single Match Confirmation Dialog */}
      <Dialog
        open={deleteSingleDialogOpen}
        onClose={() => setDeleteSingleDialogOpen(false)}
        aria-labelledby="delete-single-dialog-title"
      >
        <DialogTitle id="delete-single-dialog-title">
          Potvrdi brisanje meča
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Jeste li sigurni da želite obrisati ovaj meč između{" "}
            {matchToDelete?.player_one?.first_name}{" "}
            {matchToDelete?.player_one?.last_name} i{" "}
            {matchToDelete?.player_two?.first_name}{" "}
            {matchToDelete?.player_two?.last_name}? Ova akcija se ne može
            poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSingleDialogOpen(false)}>
            Odustani
          </Button>
          <Button
            onClick={handleDeleteSingleMatch}
            color="error"
            variant="contained"
          >
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
