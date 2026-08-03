import {
  ArrowLeft,
  Flame,
  Handshake,
  ShieldOff,
  Swords,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useAllUsers } from "../hooks/useAllUsers";
import { useLoader } from "../providers/Loader";
import type { TCupGroup, TCupMatch, TMatch } from "../types";
import { calculateCupPoints } from "../utils/cupPoints";
import { CUP_PLACEMENT_MEDALS } from "../utils/cupDisplay";
import {
  computeHeadToHead,
  computePlayerStats,
  findNemesisAndFavourite,
  MIN_MEETINGS_FOR_RIVALRY,
} from "../utils/playerStats";
import { supabase } from "../utils/supabase";
import { cn } from "@/lib/utils";

function StatCell({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="rounded-xl border bg-card px-3 py-2.5">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">
        {label}
      </p>
      <p
        className={cn(
          "text-lg font-bold leading-tight mt-1 tabular-nums",
          tone === "good" && "text-emerald-600",
          tone === "bad" && "text-red-500"
        )}
      >
        {value}
      </p>
      {detail && (
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          {detail}
        </p>
      )}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Trophy;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
        {children}
      </h2>
    </div>
  );
}

export default function PlayerProfile() {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // A profile is a historical view, so it needs departed players too — both to
  // open their own page and to name them as past opponents.
  const { byId: playerById, loading: usersLoading } = useAllUsers();
  const { setLoading } = useLoader();

  const [matches, setMatches] = useState<TMatch[]>([]);
  const [cupGroups, setCupGroups] = useState<TCupGroup[]>([]);
  const [cupMatches, setCupMatches] = useState<TCupMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const dataLoading = matchesLoading || usersLoading;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMatchesLoading(true);
      const [mRes, gRes, cmRes] = await Promise.all([
        supabase.from("match").select("*").eq("is_deleted", false),
        supabase
          .from("cup_group")
          .select("*, members:cup_group_member (*), cup!inner (is_deleted)")
          .eq("is_deleted", false)
          .eq("members.is_deleted", false)
          .eq("cup.is_deleted", false),
        supabase.from("cup_match").select("*").eq("is_deleted", false),
      ]);
      if (mRes.error) toast.error("Greška pri učitavanju mečeva.");
      setMatches((mRes.data ?? []) as TMatch[]);
      setCupGroups(
        ((gRes.data ?? []) as TCupGroup[]).map((g) => ({
          ...g,
          members: g.members ?? [],
        }))
      );
      setCupMatches((cmRes.data ?? []) as TCupMatch[]);
      setLoading(false);
      setMatchesLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const player = userId ? playerById.get(userId) : undefined;

  const stats = useMemo(
    () => (userId ? computePlayerStats(userId, matches, { formLength: 10 }) : null),
    [userId, matches]
  );
  const h2h = useMemo(
    () => (userId ? computeHeadToHead(userId, matches) : []),
    [userId, matches]
  );
  const { favourite, nemesis } = useMemo(
    () => findNemesisAndFavourite(h2h),
    [h2h]
  );

  /** Cup points are computed per cup and then aggregated for this player. */
  const cupSummary = useMemo(() => {
    if (!userId) return { participations: 0, points: 0, bestPlacement: null as number | null };
    const groupsByCup = new Map<string, TCupGroup[]>();
    for (const g of cupGroups) {
      const list = groupsByCup.get(g.cup_id) ?? [];
      list.push(g);
      groupsByCup.set(g.cup_id, list);
    }
    let participations = 0;
    let points = 0;
    let bestPlacement: number | null = null;
    for (const [cupId, groups] of groupsByCup) {
      const rows = calculateCupPoints(
        groups,
        cupMatches.filter((m) => m.cup_id === cupId)
      );
      const row = rows.get(userId);
      if (!row) continue;
      participations++;
      points += row.total;
      if (row.placement && (bestPlacement === null || row.placement < bestPlacement)) {
        bestPlacement = row.placement;
      }
    }
    return { participations, points, bestPlacement };
  }, [userId, cupGroups, cupMatches]);

  if (dataLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="h-16 bg-muted rounded-xl animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!player || !stats) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <EmptyState
          icon={UserIcon}
          title="Igrač nije pronađen"
          description="Provjerite link ili se vratite na popis igrača."
          action={
            <Button variant="outline" onClick={() => navigate("/players")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Popis igrača
            </Button>
          }
        />
      </div>
    );
  }

  const nameOf = (id: string) => {
    const p = playerById.get(id);
    return p ? `${p.first_name} ${p.last_name}` : "Nepoznat igrač";
  };

  const firstSetTotal = stats.firstSetsWon + stats.firstSetsLost;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate("/players")}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Igrači
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <PlayerAvatar
          firstName={player.first_name}
          lastName={player.last_name}
          size="lg"
          className="shadow-md"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {player.first_name} {player.last_name}
            </h1>
            {player.is_deleted && (
              <Badge className="text-xs bg-muted text-muted-foreground border-0">
                Napustio ligu
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.wins} pobjeda · {stats.losses} poraza ·{" "}
            {Math.round(stats.winRate * 100)}% · {stats.points} bodova
          </p>
        </div>
      </div>

      {stats.matchesPlayed === 0 ? (
        <EmptyState
          icon={UserIcon}
          title="Nema odigranih mečeva"
          description="Statistika će se pojaviti nakon prvog odigranog meča."
        />
      ) : (
        <>
          {/* Form */}
          {stats.form.length > 0 && (
            <div className="mb-6">
              <SectionTitle icon={Flame}>Forma</SectionTitle>
              <div className="flex items-center gap-1.5 flex-wrap">
                {stats.form.map((r, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                      r === "W"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    )}
                  >
                    {r}
                  </span>
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                  najnoviji lijevo ·{" "}
                  {stats.currentStreak > 0
                    ? `${stats.currentStreak} u nizu`
                    : stats.currentStreak < 0
                      ? `${Math.abs(stats.currentStreak)} poraza u nizu`
                      : "—"}
                </span>
              </div>
            </div>
          )}

          {/* Stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCell
              label="Mečevi"
              value={String(stats.matchesPlayed)}
              detail={`${stats.scoredMatches} s rezultatom`}
            />
            <StatCell
              label="Gem razlika"
              value={
                stats.gameDifference > 0
                  ? `+${stats.gameDifference}`
                  : String(stats.gameDifference)
              }
              detail={`${stats.gamesWon} : ${stats.gamesLost}`}
              tone={stats.gameDifference > 0 ? "good" : stats.gameDifference < 0 ? "bad" : undefined}
            />
            <StatCell
              label="Setovi"
              value={`${stats.setsWon} : ${stats.setsLost}`}
              detail="bez tie-breaka"
            />
            <StatCell
              label="Prvi set"
              value={
                firstSetTotal > 0
                  ? `${Math.round((stats.firstSetsWon / firstSetTotal) * 100)}%`
                  : "—"
              }
              detail={`${stats.firstSetsWon} : ${stats.firstSetsLost}`}
            />
            <StatCell
              label="Tie-break"
              value={
                stats.tieBreaksPlayed > 0
                  ? `${Math.round(stats.tieBreakWinRate * 100)}%`
                  : "—"
              }
              detail={
                stats.tieBreaksPlayed > 0
                  ? `${stats.tieBreaksWon} od ${stats.tieBreaksPlayed}`
                  : "nije igrao"
              }
            />
            <StatCell
              label="Povratci"
              value={String(stats.comebackWins)}
              detail={`${stats.collapses} propuštenih`}
            />
            <StatCell
              label="Bez tie-breaka"
              value={String(stats.straightSetWins)}
              detail="pobjede u 2 seta"
            />
            <StatCell
              label="Najdulji niz"
              value={String(stats.longestWinStreak)}
              detail={`najgori ${stats.longestLossStreak}`}
            />
            <StatCell
              label="Bageli"
              value={String(stats.bagelsGiven)}
              detail={`${stats.bagelsTaken} primljenih`}
            />
            <StatCell
              label="Predaje"
              value={String(stats.surrendersGiven)}
              detail={`${stats.surrendersReceived} dobivenih`}
            />
            <StatCell
              label="Najveća pobjeda"
              value={
                stats.biggestWinMargin > 0 ? `+${stats.biggestWinMargin}` : "—"
              }
              detail="gemova razlike"
            />
            <StatCell
              label="Mjeseci"
              value={String(stats.monthsActive)}
              detail="aktivan u ligi"
            />
          </div>

          {/* Cup block */}
          {cupSummary.participations > 0 && (
            <div className="mb-8">
              <SectionTitle icon={Trophy}>Kup</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCell
                  label="Nastupi"
                  value={String(cupSummary.participations)}
                  detail="odigranih kupova"
                />
                <StatCell
                  label="Kup bodovi"
                  value={String(cupSummary.points)}
                  detail="ukupno"
                />
                <StatCell
                  label="Najbolji plasman"
                  value={
                    cupSummary.bestPlacement
                      ? (CUP_PLACEMENT_MEDALS[cupSummary.bestPlacement] ??
                        `${cupSummary.bestPlacement}.`)
                      : "—"
                  }
                  detail={cupSummary.bestPlacement ? `${cupSummary.bestPlacement}. mjesto` : "bez plasmana"}
                />
              </div>
            </div>
          )}

          {/* Nemesis / favourite */}
          {(favourite || nemesis) && (
            <div className="mb-8">
              <SectionTitle icon={Swords}>Ključni protivnici</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favourite && (
                  <Card className="shadow-sm overflow-hidden py-0 border-emerald-200/60">
                    <CardContent className="p-3 flex items-center gap-3">
                      <PlayerAvatar
                        firstName={playerById.get(favourite.opponentId)?.first_name ?? "?"}
                        lastName={playerById.get(favourite.opponentId)?.last_name ?? "?"}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                          Najdraži protivnik
                        </p>
                        <p className="text-sm font-semibold truncate">
                          {nameOf(favourite.opponentId)}
                        </p>
                      </div>
                      <span className="text-sm font-mono font-bold tabular-nums">
                        {favourite.wins} : {favourite.losses}
                      </span>
                    </CardContent>
                  </Card>
                )}
                {nemesis && (
                  <Card className="shadow-sm overflow-hidden py-0 border-red-200/60">
                    <CardContent className="p-3 flex items-center gap-3">
                      <PlayerAvatar
                        firstName={playerById.get(nemesis.opponentId)?.first_name ?? "?"}
                        lastName={playerById.get(nemesis.opponentId)?.last_name ?? "?"}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                          Najteži protivnik
                        </p>
                        <p className="text-sm font-semibold truncate">
                          {nameOf(nemesis.opponentId)}
                        </p>
                      </div>
                      <span className="text-sm font-mono font-bold tabular-nums">
                        {nemesis.wins} : {nemesis.losses}
                      </span>
                    </CardContent>
                  </Card>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Uzima u obzir samo protivnike s najmanje{" "}
                {MIN_MEETINGS_FOR_RIVALRY} odigrana međusobna meča.
              </p>
            </div>
          )}

          {/* Head-to-head */}
          {h2h.length > 0 && (
            <div>
              <SectionTitle icon={Handshake}>Međusobni dvoboji</SectionTitle>
              <Card className="shadow-sm overflow-hidden py-0">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="font-semibold">Protivnik</TableHead>
                          <TableHead className="text-center font-semibold">
                            Mečevi
                          </TableHead>
                          <TableHead className="text-center font-bold">
                            P : I
                          </TableHead>
                          <TableHead className="text-center font-semibold hidden sm:table-cell">
                            Gemovi
                          </TableHead>
                          <TableHead className="text-center font-semibold hidden sm:table-cell">
                            Razlika
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {h2h.map((row) => {
                          const opponent = playerById.get(row.opponentId);
                          const diff = row.gamesWon - row.gamesLost;
                          return (
                            <TableRow
                              key={row.opponentId}
                              onClick={() => navigate(`/igrac/${row.opponentId}`)}
                              className="hover:bg-muted/20 transition-colors cursor-pointer"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <PlayerAvatar
                                    firstName={opponent?.first_name ?? "?"}
                                    lastName={opponent?.last_name ?? "?"}
                                    size="xs"
                                  />
                                  <span className="text-sm font-medium whitespace-nowrap">
                                    {nameOf(row.opponentId)}
                                  </span>
                                  {opponent?.is_deleted && (
                                    <ShieldOff className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground">
                                {row.meetings}
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={cn(
                                    "text-sm font-mono font-bold tabular-nums",
                                    row.wins > row.losses && "text-emerald-600",
                                    row.wins < row.losses && "text-red-500"
                                  )}
                                >
                                  {row.wins} : {row.losses}
                                </span>
                              </TableCell>
                              <TableCell className="text-center text-sm text-muted-foreground hidden sm:table-cell">
                                {row.gamesWon} : {row.gamesLost}
                              </TableCell>
                              <TableCell className="text-center hidden sm:table-cell">
                                <Badge
                                  className={cn(
                                    "text-xs font-mono border-0",
                                    diff > 0
                                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                      : diff < 0
                                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                                        : "bg-muted text-muted-foreground hover:bg-muted"
                                  )}
                                >
                                  {diff > 0 ? `+${diff}` : diff}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
