import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
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

const MONTHS = [
  { value: "1", label: "Siječanj" }, { value: "2", label: "Veljača" },
  { value: "3", label: "Ožujak" }, { value: "4", label: "Travanj" },
  { value: "5", label: "Svibanj" }, { value: "6", label: "Lipanj" },
  { value: "7", label: "Srpanj" }, { value: "8", label: "Kolovoz" },
  { value: "9", label: "Rujan" }, { value: "10", label: "Listopad" },
  { value: "11", label: "Studeni" }, { value: "12", label: "Prosinac" },
];

const AVATAR_COLORS = [
  "bg-blue-600", "bg-violet-600",
  "bg-emerald-600", "bg-amber-600",
  "bg-rose-600",
];

function avatarColor(first: string, last: string) {
  return AVATAR_COLORS[(first.charCodeAt(0) + last.charCodeAt(0)) % AVATAR_COLORS.length];
}

type JoinedMatch = TMatch & {
  player_one: TUser;
  player_two: TUser;
  group: TGroup;
};

export default function Matches() {
  const [selectedMatch, setSelectedMatch] = useState<JoinedMatch | null>(null);
  const [matches, setMatches] = useState<JoinedMatch[]>([]);
  const { users: players } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const player = players.find((p) => p.user_id === user?.id);
  const isAdmin = !!player?.is_admin;
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(String(now.month() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.year()));
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteSingleDialogOpen, setDeleteSingleDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<JoinedMatch | null>(null);
  const { setLoading } = useLoader();

  const selectedDayjs: Dayjs = dayjs(`${selectedYear}-${selectedMonth.padStart(2, "0")}-01`);

  useEffect(() => {
    if (player?.is_viewer) setShowOnlyMine(false);
  }, [user?.id, players]);

  const initialize = async () => {
    setLoading(true);
    const { data: matchesData } = await supabase
      .from("match")
      .select(`*, player_one:player_one_id (*), player_two:player_two_id (*), group:group_id (*)`)
      .eq("is_deleted", false);

    if (matchesData) {
      const items = orderBy(matchesData, "group.name") as JoinedMatch[];
      let filtered = showOnlyMine
        ? items.filter((t) => [t.player_one_id, t.player_two_id].includes(user?.id as string))
        : items;

      const startOfMonth = selectedDayjs.startOf("month");
      const endOfMonth = selectedDayjs.endOf("month");
      filtered = filtered.filter((match) => {
        if (!match.created_at) return false;
        const d = dayjs(match.created_at);
        return d.isAfter(startOfMonth.subtract(1, "ms")) && d.isBefore(endOfMonth.add(1, "ms"));
      });
      setMatches(filtered);
    } else {
      setMatches([]);
    }
    setLoading(false);
  };

  useEffect(() => { initialize(); }, [showOnlyMine, selectedMonth, selectedYear]);

  const calculateSetResult = (match: TMatch) => {
    const hasResults = match.sets.some((s) => s.player_one_games > 0 || s.player_two_games > 0);
    if (!hasResults) return "-";
    let p1 = 0, p2 = 0;
    match.sets.forEach((s) => {
      if (s.player_one_games > s.player_two_games) p1++;
      else if (s.player_two_games > s.player_one_games) p2++;
    });
    return `${p1} - ${p2}`;
  };

  const determineWinner = (match: TMatch): string => {
    let p1 = 0, p2 = 0;
    match.sets.forEach((s) => {
      if (s.player_one_games > s.player_two_games) p1++;
      else if (s.player_two_games > s.player_one_games) p2++;
    });
    if (p1 > p2) return match.player_one_id;
    if (p2 > p1) return match.player_two_id;
    return "";
  };

  const getMatchWinnerDisplay = (match: JoinedMatch) => {
    // Prefer the explicitly stored winner_id (set for surrendered + completed matches)
    const winnerId = match.winner_id || determineWinner(match);
    if (!winnerId) return "-";
    const w = players.find((p) => p.user_id === winnerId);
    return w ? `${w.first_name} ${w.last_name}` : "-";
  };

  const isCurrentMonth = selectedDayjs.isSame(dayjs(), "month");

  const handleDeleteAllMatches = async () => {
    const startOfMonth = selectedDayjs.startOf("month");
    const endOfMonth = selectedDayjs.endOf("month");
    const { data: toDelete } = await supabase.from("match").select("id")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString());
    if (toDelete && toDelete.length > 0) {
      await supabase.from("match").update({ is_deleted: true }).in("id", toDelete.map((m) => m.id));
      toast.success(`Obrisano ${toDelete.length} mečeva.`);
    }
    setDeleteAllDialogOpen(false);
    await initialize();
  };

  const handleDeleteSingleMatch = async () => {
    if (!matchToDelete?.id) return;
    await supabase.from("match").update({ is_deleted: true }).eq("id", matchToDelete.id);
    await initialize();
    toast.success("Meč je obrisan.");
    setDeleteSingleDialogOpen(false);
    setMatchToDelete(null);
  };

  const years = ["2024", "2025", "2026"];

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Raspored</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Mečevi i rezultati</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v ?? selectedMonth)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v ?? selectedYear)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setShowOnlyMine((s) => !s)}>
          {showOnlyMine ? "Prikaži sve mečeve" : "Prikaži samo moje mečeve"}
        </Button>

        {isAdmin && (
          <Button
            variant="outline"
            disabled={!isCurrentMonth}
            className="gap-2 ml-auto"
            onClick={async () => {
              const m = await generateSchedule();
              if (m.length) {
                await supabase.from("match").insert(m);
                await initialize();
                toast.success("Raspored generiran.");
              }
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Generiraj raspored
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Igrač 1</TableHead>
              <TableHead>Igrač 2</TableHead>
              <TableHead className="text-center">Rezultat</TableHead>
              <TableHead className="text-center">Pobjednik</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match, index) => {
              const p1 = match.player_one;
              const p2 = match.player_two;
              const g = match.group;
              const isCompleted = match.status === "played" || match.status === "surrendered";

              return (
                <TableRow key={match.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p1 && (
                        <>
                          <div className={`w-7 h-7 rounded-full ${avatarColor(p1.first_name, p1.last_name)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                            {p1.first_name[0]}{p1.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">{p1.first_name} {p1.last_name}</p>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: g?.color }}>
                              {g?.name}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p2 && (
                        <>
                          <div className={`w-7 h-7 rounded-full ${avatarColor(p2.first_name, p2.last_name)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                            {p2.first_name[0]}{p2.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">{p2.first_name} {p2.last_name}</p>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: g?.color }}>
                              {g?.name}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-sm">{calculateSetResult(match)}</TableCell>
                  <TableCell className="text-center text-sm">{getMatchWinnerDisplay(match)}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        match.status === "surrendered" ? "bg-amber-100 text-amber-700" :
                        isCompleted ? "bg-emerald-100 text-emerald-700" :
                        "bg-muted text-muted-foreground"
                      }
                    >
                      {match.status === "surrendered" ? "Predaja" : isCompleted ? "Završen" : "Čeka"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setSelectedMatch({ ...match }); setModalOpen(true); }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Uredi"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { setMatchToDelete(match); setDeleteSingleDialogOpen(true); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Obriši"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {matches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nema mečeva za odabrani period
          </div>
        )}
      </div>

      <EditMatchModal
        open={modalOpen}
        match={selectedMatch}
        onClose={() => { setModalOpen(false); setSelectedMatch(null); }}
        onSave={async (updated, winnerId, status, isSurrender) => {
          if (!updated?.id) return;
          await supabase.from("match").update({ sets: updated.sets, winner_id: winnerId, status, is_surrender: isSurrender }).eq("id", updated.id);
          await initialize();
          toast.success("Rezultati meča su spremljeni.");
          setModalOpen(false);
          setSelectedMatch(null);
        }}
      />

      {/* Delete All Dialog */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje svih mečeva</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Jeste li sigurni da želite obrisati sve mečeve iz {selectedDayjs.format("MM/YYYY")}? Ova akcija se ne može poništiti.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAllDialogOpen(false)}>Odustani</Button>
            <Button variant="destructive" onClick={handleDeleteAllMatches}>Obriši sve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Dialog */}
      <Dialog open={deleteSingleDialogOpen} onOpenChange={setDeleteSingleDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje meča</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Jeste li sigurni da želite obrisati meč između{" "}
            {matchToDelete?.player_one?.first_name} {matchToDelete?.player_one?.last_name} i{" "}
            {matchToDelete?.player_two?.first_name} {matchToDelete?.player_two?.last_name}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSingleDialogOpen(false)}>Odustani</Button>
            <Button variant="destructive" onClick={handleDeleteSingleMatch}>Obriši</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
