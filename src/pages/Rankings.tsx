import { Leaderboard } from "@mui/icons-material";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { orderBy, reverse, sortBy, sum } from "lodash-es";
import { useEffect, useState } from "react";
import { useLoader } from "../providers/Loader";
import { useUsers } from "../providers/UsersProvider";
import type { TMatch, TSet } from "../types";
import { supabase } from "../utils/supabase";

type TRankItem = {
  numberOfWins: number;
  totalPoints: number;
  firstName: string;
  lastName: string;
  avatar: string;
  gamesWon: number;
  gamesLost: number;
};
export const Rankings = () => {
  const { users, refresh } = useUsers();
  const [rankings, setRankings] = useState<TRankItem[]>([]);
  const { setLoading } = useLoader();

  const initialize = async () => {
    setLoading(true);
    const items: TRankItem[] = [];

    // Fetch all matches once from Supabase
    const { data: matchesData } = await supabase.from("match").select("*");
    const allMatches = (matchesData || []) as TMatch[];

    for (const user of users) {
      const userMatches = allMatches.filter(
        (m) =>
          m.player_one_id === user.user_id || m.player_two_id === user.user_id
      );

      let gamesWon = 0;
      let gamesLost = 0;

      userMatches.forEach((match) => {
        const isPlayerOne = match.player_one_id === user.user_id;
        const nonTieBreakSets = match.sets.filter(
          (s: TSet) => s.set_number !== 3
        );
        if (isPlayerOne) {
          gamesWon += sum(nonTieBreakSets.map((t) => t.player_one_games));
          gamesLost += sum(nonTieBreakSets.map((t) => t.player_two_games));
        } else {
          gamesWon += sum(nonTieBreakSets.map((t) => t.player_two_games));
          gamesLost += sum(nonTieBreakSets.map((t) => t.player_one_games));
        }
      });

      const numberOfWins = userMatches.filter(
        (m) => m.winner_id === user.user_id
      ).length;
      const item: TRankItem = {
        numberOfWins,
        gamesWon,
        gamesLost,
        totalPoints: numberOfWins * 3,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
      };
      items.push(item);
    }

    setRankings(orderBy(items, "totalPoints", "desc"));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    initialize();
  }, [users]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <div className="flex items-center gap-3 mb-6">
        <Leaderboard
          sx={{
            color: "primary.main",
          }}
        />
        <Typography variant="h4" className="font-semibold text-gray-800">
          Rang lista
        </Typography>
      </div>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Rang #</strong>
              </TableCell>
              <TableCell>
                <strong>Igrač</strong>
              </TableCell>
              <TableCell>
                <strong>Broj pobjeda</strong>
              </TableCell>
              <TableCell>
                <strong>Dobiveni gemovi</strong>
              </TableCell>
              <TableCell>
                <strong>Izgubljeni gemovi</strong>
              </TableCell>
              <TableCell>
                <strong>Gem razlika</strong>
              </TableCell>
              <TableCell>
                <strong>Ukupan broj bodova</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reverse(
              sortBy(
                sortBy(rankings, (rank) => rank.gamesWon - rank.gamesLost),
                "totalPoints"
              )
            ).map((rank, index) => {
              return (
                <TableRow
                  key={index}
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
                    <Typography variant="body2" fontWeight="medium">
                      {rank?.firstName} {rank?.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{rank.numberOfWins}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{rank.gamesWon}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{rank.gamesLost}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {rank.gamesWon - rank.gamesLost}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontSize="0.875rem">
                      {rank.totalPoints}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};
