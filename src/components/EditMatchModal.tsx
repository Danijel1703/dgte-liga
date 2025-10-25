import { Close as CloseIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { TMatch, TUser, TGroup, TStatus } from "../types";

export type JoinedMatch = TMatch & {
  player_one: TUser;
  player_two: TUser;
  group: TGroup;
};

export function EditMatchModal({
  open,
  match,
  onClose,
  onSave,
}: {
  open: boolean;
  match: JoinedMatch | null;
  onClose: () => void;
  onSave: (
    updated: JoinedMatch,
    winnerId: string | null,
    status: TStatus,
    isSurrender: boolean
  ) => Promise<void>;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [localMatch, setLocalMatch] = useState<JoinedMatch | null>(match);
  const [isSurrender, setIsSurrender] = useState(false);
  const [manualWinner, setManualWinner] = useState<string | null>(null);

  useEffect(() => {
    setLocalMatch(match);
    if (match?.is_surrender) {
      setIsSurrender(true);
      setManualWinner(match.winner_id);
    } else {
      setIsSurrender(false);
      setManualWinner(null);
    }
  }, [match]);

  const playerOne = localMatch?.player_one;
  const playerTwo = localMatch?.player_two;
  const playerOneGroup = localMatch?.group;
  const playerTwoGroup = localMatch?.group;

  const handleSetScoreChange = (
    setIndex: number,
    player: "one" | "two",
    value: number
  ) => {
    if (!localMatch) return;
    const updated: JoinedMatch = {
      ...localMatch,
      sets: [...localMatch.sets],
    } as JoinedMatch;
    if (player === "one") {
      updated.sets[setIndex] = {
        ...updated.sets[setIndex],
        player_one_games: Math.max(0, value),
      };
    } else {
      updated.sets[setIndex] = {
        ...updated.sets[setIndex],
        player_two_games: Math.max(0, value),
      };
    }
    setLocalMatch(updated);
  };

  const determineWinner = (m: TMatch): string | null => {
    let p1 = 0;
    let p2 = 0;
    m.sets.forEach((s) => {
      if (s.player_one_games > s.player_two_games) p1++;
      else if (s.player_two_games > s.player_one_games) p2++;
    });
    if (p1 > p2) return m.player_one_id;
    if (p2 > p1) return m.player_two_id;
    return null;
  };

  const handleSave = async () => {
    if (!localMatch) return;
    const calculatedWinner = determineWinner(localMatch);
    const status: TStatus = isSurrender
      ? "surrendered"
      : calculatedWinner
      ? "played"
      : "waiting";
    const winnerId = isSurrender ? manualWinner : calculatedWinner;
    await onSave(localMatch, winnerId, status, isSurrender);
  };

  // Event handlers for form inputs
  const handlePlayerOneScoreChange = (setIndex: number, value: number) => {
    handleSetScoreChange(setIndex, "one", value);
  };

  const handlePlayerTwoScoreChange = (setIndex: number, value: number) => {
    handleSetScoreChange(setIndex, "two", value);
  };

  const handlePlayerOneGamesChange = (setIndex: number, value: number) => {
    handleSetScoreChange(setIndex, "one", value);
  };

  const handlePlayerTwoGamesChange = (setIndex: number, value: number) => {
    handleSetScoreChange(setIndex, "two", value);
  };

  const handleSurrenderChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsSurrender(event.target.value === "yes");
  };

  const handleManualWinnerChange = (event: any) => {
    setManualWinner((event.target.value as string) || null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      sx={{
        "& .MuiDialog-paper": {
          margin: { xs: 0, sm: 2 },
          maxHeight: { xs: "100vh", sm: "90vh" },
          borderRadius: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            Unesite rezultate meča
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          gap={2}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Avatar
              sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
            >
              {playerOne?.avatar}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                {playerOne?.first_name} {playerOne?.last_name}
              </Typography>
              <Chip
                label={playerOneGroup?.name}
                size="small"
                sx={{ background: playerOneGroup?.color, color: "white" }}
              />
            </Box>
          </Box>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }}
          >
            PROTIV
          </Typography>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            gap={2}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Box textAlign={{ xs: "left", sm: "right" }}>
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                {playerTwo?.first_name} {playerTwo?.last_name}
              </Typography>
              <Chip
                label={playerTwoGroup?.name}
                size="small"
                sx={{ background: playerTwoGroup?.color, color: "white" }}
              />
            </Box>
            <Avatar
              sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
            >
              {playerTwo?.avatar}
            </Avatar>
          </Box>
        </Box>

        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Rezultati setova
        </Typography>

        {localMatch
          ? localMatch.sets.map((set, index) => {
              const isTieBreak = index + 1 === 3;
              return (
                <Box key={index} mb={3} sx={{ width: "100%" }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
                  >
                    {isTieBreak ? "Tie break" : index + 1 + ". set"}
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid width="40%">
                      {isTieBreak ? (
                        <TextField
                          fullWidth
                          type="number"
                          label={`${playerOne?.first_name} - bodovi`}
                          value={set.player_one_games || null}
                          onChange={(e) =>
                            handlePlayerOneScoreChange(
                              index,
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          inputProps={{ min: 0, max: 20 }}
                        />
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel>{`${playerOne?.first_name} - gemovi`}</InputLabel>
                          <Select
                            label={`${playerOne?.first_name} - gemovi`}
                            value={set.player_one_games || 0}
                            onChange={(e) =>
                              handlePlayerOneGamesChange(
                                index,
                                Number(e.target.value) || 0
                              )
                            }
                          >
                            {[...Array(8).keys()].map((gameCount) => (
                              <MenuItem key={gameCount} value={gameCount}>
                                {gameCount}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                    <Grid textAlign="center">
                      <Typography variant="h6">-</Typography>
                    </Grid>
                    <Grid width="40%">
                      {isTieBreak ? (
                        <TextField
                          fullWidth
                          type="number"
                          label={`${playerTwo?.first_name} - bodovi`}
                          value={set.player_two_games || null}
                          onChange={(e) =>
                            handlePlayerTwoScoreChange(
                              index,
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                          inputProps={{ min: 0, max: 20 }}
                        />
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel>{`${playerTwo?.first_name} - gemovi`}</InputLabel>
                          <Select
                            label={`${playerTwo?.first_name} - gemovi`}
                            value={set.player_two_games || 0}
                            onChange={(e) =>
                              handlePlayerTwoGamesChange(
                                index,
                                Number(e.target.value) || 0
                              )
                            }
                          >
                            {[...Array(8).keys()].map((gameCount) => (
                              <MenuItem key={gameCount} value={gameCount}>
                                {gameCount}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                  </Box>
                </Box>
              );
            })
          : null}

        <Box mt={2}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            Predaja meča
          </Typography>
          <RadioGroup
            row
            value={isSurrender ? "yes" : "no"}
            onChange={handleSurrenderChange}
          >
            <FormControlLabel value="no" control={<Radio />} label="Ne" />
            <FormControlLabel value="yes" control={<Radio />} label="Da" />
          </RadioGroup>
          {isSurrender && localMatch && (
            <FormControl sx={{ mt: 1 }} fullWidth>
              <InputLabel>Pobjednik</InputLabel>
              <Select
                label="Pobjednik"
                value={manualWinner || ""}
                onChange={handleManualWinnerChange}
              >
                <MenuItem value={localMatch.player_one_id}>
                  {playerOne?.first_name} {playerOne?.last_name}
                </MenuItem>
                <MenuItem value={localMatch.player_two_id}>
                  {playerTwo?.first_name} {playerTwo?.last_name}
                </MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 2, sm: 2 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
          sx={{ order: { xs: 2, sm: 1 } }}
        >
          Odustani
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          fullWidth={isMobile}
          sx={{ order: { xs: 1, sm: 2 } }}
        >
          Spremi rezultate
        </Button>
      </DialogActions>
    </Dialog>
  );
}
