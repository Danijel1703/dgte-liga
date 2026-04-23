import { Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { reverse, sortBy, sum } from "lodash-es";
import { useEffect, useState } from "react";
import { useLoader } from "../providers/Loader";
import { useUsers } from "../providers/UsersProvider";
import type { TMatch, TSet } from "../types";
import { supabase } from "../utils/supabase";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { EmptyState } from "@/components/ui/EmptyState";

type TRankItem = {
  numberOfWins: number;
  totalPoints: number;
  firstName: string;
  lastName: string;
  avatar: string;
  gamesWon: number;
  gamesLost: number;
  matchesPlayed: number;
  isDeleted: boolean;
};

function PodiumCard({ rank, position }: { rank: TRankItem; position: 1 | 2 | 3 }) {
  const configs = {
    1: {
      bg: "from-yellow-500/20 to-amber-500/10",
      border: "border-yellow-400/40",
      medal: "🥇",
      height: "pt-10 pb-6",
      labelBg: "bg-yellow-500/20 text-yellow-700 border-yellow-300",
    },
    2: {
      bg: "from-slate-400/15 to-slate-300/10",
      border: "border-slate-300/50",
      medal: "🥈",
      height: "pt-8 pb-5",
      labelBg: "bg-slate-200/60 text-slate-600 border-slate-300",
    },
    3: {
      bg: "from-amber-700/15 to-amber-600/10",
      border: "border-amber-600/40",
      medal: "🥉",
      height: "pt-8 pb-5",
      labelBg: "bg-amber-100 text-amber-700 border-amber-300",
    },
  };
  const c = configs[position];

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border bg-gradient-to-b ${c.bg} ${c.border} ${c.height} px-4 text-center shadow-sm`}
    >
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-3xl">
        {c.medal}
      </div>
      <PlayerAvatar firstName={rank.firstName} lastName={rank.lastName} size="lg" className="mb-2 shadow-md" />
      <p className="font-bold text-sm leading-tight">
        {rank.firstName} {rank.lastName}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{rank.numberOfWins} pobjede</p>
      <Badge className={`mt-2 text-xs border ${c.labelBg} hover:${c.labelBg}`}>
        {rank.totalPoints} bod.
      </Badge>
    </div>
  );
}

function SkeletonRankRow() {
  return (
    <TableRow>
      <TableCell><div className="w-7 h-7 rounded-full bg-muted animate-pulse" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
          <div className="h-4 bg-muted rounded animate-pulse w-28" />
        </div>
      </TableCell>
      <TableCell><div className="h-4 bg-muted rounded animate-pulse w-8 mx-auto" /></TableCell>
      <TableCell><div className="h-4 bg-muted rounded animate-pulse w-12 mx-auto" /></TableCell>
      <TableCell><div className="h-5 bg-muted rounded animate-pulse w-10 mx-auto" /></TableCell>
      <TableCell><div className="h-4 bg-muted rounded animate-pulse w-6 mx-auto" /></TableCell>
    </TableRow>
  );
}

export const Rankings = () => {
  const { users, refresh } = useUsers();
  const [rankings, setRankings] = useState<TRankItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { setLoading } = useLoader();

  const initialize = async () => {
    setLoading(true);
    setDataLoading(true);
    const { data: matchesData } = await supabase
      .from("match")
      .select("*, group (*, group_member (*))");
    const allMatches = (matchesData || []) as TMatch[];
    const items: TRankItem[] = [];

    for (const user of users) {
      const userMatches = allMatches.filter(
        (m) => m.player_one_id === user.user_id || m.player_two_id === user.user_id
      );

      let gamesWon = 0;
      let gamesLost = 0;
      userMatches.forEach((match) => {
        const isPlayerOne = match.player_one_id === user.user_id;
        const nonTieBreakSets = match.sets.filter((s: TSet) => s.set_number !== 3);
        if (isPlayerOne) {
          gamesWon += sum(nonTieBreakSets.map((t) => t.player_one_games));
          gamesLost += sum(nonTieBreakSets.map((t) => t.player_two_games));
        } else {
          gamesWon += sum(nonTieBreakSets.map((t) => t.player_two_games));
          gamesLost += sum(nonTieBreakSets.map((t) => t.player_one_games));
        }
      });

      const numberOfWins = userMatches.filter((m) => m.winner_id === user.user_id).length;
      items.push({
        numberOfWins,
        gamesWon,
        gamesLost,
        totalPoints: numberOfWins * 3,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        matchesPlayed: userMatches.filter((m) => !!m.winner_id).length,
        isDeleted: user.is_deleted,
      });
    }

    setRankings(items.filter((i) => i.matchesPlayed > 0 && !i.isDeleted));
    setLoading(false);
    setDataLoading(false);
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { initialize(); }, [users]);

  const sorted = reverse(
    sortBy(
      sortBy(rankings, (r) => r.gamesWon - r.gamesLost),
      "totalPoints"
    )
  );

  const top3 = sorted.slice(0, Math.min(3, sorted.length));

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Rang lista</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Poredak igrača po bodovima i gem razlici</p>
      </div>

      {/* Podium — top 1-3 */}
      {top3.length >= 1 && !dataLoading && (
        <div className="mb-10">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-6">
            Pobjedničko postolje
          </p>
          <div className={`grid gap-4 max-w-md mx-auto mt-8 ${top3.length === 1 ? "grid-cols-1 max-w-xs" : top3.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {top3.length >= 2 && <PodiumCard rank={top3[1]} position={2} />}
            <div className={top3.length >= 2 ? "-mt-4" : ""}>
              <PodiumCard rank={top3[0]} position={1} />
            </div>
            {top3.length >= 3 && <PodiumCard rank={top3[2]} position={3} />}
          </div>
        </div>
      )}

      {/* Full rankings table */}
      {dataLoading ? (
        <Card className="shadow-sm overflow-hidden py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14">Rang</TableHead>
                  <TableHead>Igrač</TableHead>
                  <TableHead className="text-center">Pobjede</TableHead>
                  <TableHead className="text-center">Gem +/-</TableHead>
                  <TableHead className="text-center">Razlika</TableHead>
                  <TableHead className="text-center font-bold">Bodovi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => <SkeletonRankRow key={i} />)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : sorted.length > 0 ? (
        <Card className="shadow-sm overflow-hidden py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 font-semibold">Rang</TableHead>
                  <TableHead className="font-semibold">Igrač</TableHead>
                  <TableHead className="text-center font-semibold">Pobjede</TableHead>
                  <TableHead className="text-center font-semibold">Gem +/-</TableHead>
                  <TableHead className="text-center font-semibold">Razlika</TableHead>
                  <TableHead className="text-center font-bold">Bodovi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((rank, index) => {
                  const diff = rank.gamesWon - rank.gamesLost;
                  return (
                    <TableRow key={index} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                          ${index === 0 ? "bg-yellow-100 text-yellow-700" :
                            index === 1 ? "bg-slate-100 text-slate-600" :
                            index === 2 ? "bg-amber-100 text-amber-700" :
                            "bg-muted text-muted-foreground"}`}>
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PlayerAvatar firstName={rank.firstName} lastName={rank.lastName} />
                          <span className="font-medium text-sm">{rank.firstName} {rank.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{rank.numberOfWins}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {rank.gamesWon} / {rank.gamesLost}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`text-xs font-mono border-0 ${diff > 0 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : diff < 0 ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-muted text-muted-foreground hover:bg-muted"}`}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-sm">{rank.totalPoints}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Trophy}
          title="Nema podataka za rang listu"
          description="Rang lista će se popuniti nakon što se odigraju prvi mečevi u sezoni."
        />
      )}
    </div>
  );
};
