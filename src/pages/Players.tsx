import { Phone, Search, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { sortBy } from "lodash-es";
import { useState } from "react";
import { useUsers } from "../providers/UsersProvider";
import { useAuth } from "../providers/AuthProvider";
import { supabase } from "../utils/supabase";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";

export default function Players() {
  const [searchTerm, setSearchTerm] = useState("");
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
    if (!confirm(`Jeste li sigurni da želite obrisati igrača ${playerName}?`)) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from("user")
        .update({ is_deleted: true })
        .eq("user_id", playerId);
      if (error) throw error;
      toast.success(`Igrač ${playerName} je uspješno obrisan!`);
      refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Greška pri brisanju igrača");
    } finally {
      setLoading(false);
    }
  };


  const activePlayers = sortBy(filteredPlayers, "last_name").filter(
    (t) => !t.is_viewer && !t.is_deleted
  );

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Igrači</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{activePlayers.length} registriranih igrača</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Pretraži igrače..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm overflow-hidden py-0">
        <CardContent className="p-0">
          {activePlayers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nema pronađenih igrača"
              description="Pokušajte drugačiji pojam pretrage ili dodajte novog igrača."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-12" />
                  <TableHead className="font-semibold">Ime</TableHead>
                  <TableHead className="font-semibold">Prezime</TableHead>
                  <TableHead className="font-semibold">Telefon</TableHead>

                  {me?.is_admin && <TableHead className="w-16" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePlayers.map((player) => (
                  <TableRow
                    key={player.user_id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <PlayerAvatar
                        firstName={player.first_name}
                        lastName={player.last_name}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{player.first_name}</TableCell>
                    <TableCell className="font-medium">{player.last_name}</TableCell>
                    <TableCell>
                      <a
                        href={`tel:${player.phone}`}
                        className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {player.phone}
                      </a>
                    </TableCell>

                    {me?.is_admin && (
                      <TableCell>
                        {player.user_id !== authUser?.id && (
                          <button
                            onClick={() =>
                              handleDeletePlayer(
                                player.user_id,
                                `${player.first_name} ${player.last_name}`
                              )
                            }
                            disabled={loading}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                            title="Obriši igrača"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
