import { Delete, Phone } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { TUser } from "../../types.d";

interface PlayerTableProps {
  players: TUser[];
  onDeletePlayer: (playerId: string, playerName: string) => void;
  loading: boolean;
}

export default function PlayerTable({
  players,
  onDeletePlayer,
  loading,
}: PlayerTableProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography>Učitavanje...</Typography>
      </Paper>
    );
  }

  if (players.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Nema igrača za prikaz
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Igrač</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Telefon</TableCell>
            <TableCell align="center">Akcije</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.user_id} hover>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={player.avatar}
                    alt={`${player.first_name} ${player.last_name}`}
                    sx={{ width: 40, height: 40 }}
                  />
                  <div>
                    <Typography variant="subtitle2" className="font-medium">
                      {player.first_name} {player.last_name}
                    </Typography>
                    {player.is_admin && (
                      <Typography variant="caption" color="primary">
                        Administrator
                      </Typography>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{player.email}</Typography>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="body2">{player.phone}</Typography>
                </div>
              </TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={() =>
                    onDeletePlayer(
                      player.user_id,
                      `${player.first_name} ${player.last_name}`
                    )
                  }
                  color="error"
                  size="small"
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
