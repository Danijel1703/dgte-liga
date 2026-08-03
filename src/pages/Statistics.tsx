import {
  Activity,
  Award,
  BarChart2,
  Crown,
  Flame,
  Handshake,
  Hash,
  Medal,
  Percent,
  Repeat,
  ShieldOff,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { LeaderboardCard } from "../components/LeaderboardCard";
import { useAllUsers } from "../hooks/useAllUsers";
import { useLoader } from "../providers/Loader";
import type { TMatch } from "../types";
import {
  buildLeaderboard,
  computeAllPlayerStats,
  computeLeagueRecords,
  computeRivalries,
  type TLeaderboardEntry,
  type TLeaderboardKey,
} from "../utils/playerStats";
import { supabase } from "../utils/supabase";

/**
 * Minimum samples for the rate-based boards. Without these, a player who won
 * their only tie-break would outrank someone who won eight of eleven.
 */
const MIN_MATCHES_FOR_RATE = 10;
const MIN_TIEBREAKS_FOR_RATE = 5;

type TBoardConfig = {
  key: TLeaderboardKey;
  title: string;
  hint: string;
  icon: typeof Trophy;
  minSample?: number;
  formatValue: (e: TLeaderboardEntry) => string;
  formatDetail?: (e: TLeaderboardEntry) => string | null;
};

const asCount = (e: TLeaderboardEntry) => String(e.value);
const asPercent = (e: TLeaderboardEntry) => `${Math.round(e.value * 100)}%`;
const outOfDetail = (e: TLeaderboardEntry) =>
  e.outOf !== undefined ? `/ ${e.outOf}` : null;

const BOARDS: TBoardConfig[] = [
  {
    key: "wins",
    title: "Najviše pobjeda",
    hint: "Sve odigrane pobjede, uključujući predaje",
    icon: Trophy,
    formatValue: asCount,
  },
  {
    key: "winRate",
    title: "Najbolji postotak",
    hint: `Pobjede / mečevi, minimalno ${MIN_MATCHES_FOR_RATE} mečeva`,
    icon: Percent,
    minSample: MIN_MATCHES_FOR_RATE,
    formatValue: asPercent,
    formatDetail: outOfDetail,
  },
  {
    key: "tieBreakWinRate",
    title: "Tie-break kraljevi",
    hint: `Uspješnost u tie-breaku, minimalno ${MIN_TIEBREAKS_FOR_RATE}`,
    icon: Zap,
    minSample: MIN_TIEBREAKS_FOR_RATE,
    formatValue: asPercent,
    formatDetail: outOfDetail,
  },
  {
    key: "tieBreaksWon",
    title: "Najviše tie-breakova",
    hint: "Osvojeni tie-breakovi (treći set)",
    icon: Target,
    formatValue: asCount,
    formatDetail: outOfDetail,
  },
  {
    key: "firstSetsWon",
    title: "Prvi set",
    hint: "Osvojeni prvi setovi",
    icon: Medal,
    formatValue: asCount,
    formatDetail: outOfDetail,
  },
  {
    key: "comebackWins",
    title: "Povratnici",
    hint: "Izgubili prvi set, dobili meč",
    icon: Repeat,
    formatValue: asCount,
  },
  {
    key: "straightSetWins",
    title: "Bez tie-breaka",
    hint: "Pobjede u dva seta, bez trećeg",
    icon: Award,
    formatValue: asCount,
  },
  {
    key: "bagelsGiven",
    title: "Bageli",
    hint: "Setovi osvojeni sa 6-0",
    icon: Crown,
    formatValue: asCount,
  },
  {
    key: "longestWinStreak",
    title: "Najdulji niz",
    hint: "Najviše pobjeda u nizu",
    icon: Flame,
    formatValue: asCount,
  },
  {
    key: "gameDifference",
    title: "Gem razlika",
    hint: "Osvojeni minus izgubljeni gemovi (bez tie-breaka)",
    icon: TrendingUp,
    formatValue: (e) => (e.value > 0 ? `+${e.value}` : String(e.value)),
  },
  {
    key: "matchesPlayed",
    title: "Najviše odigranih",
    hint: "Ukupno odigranih mečeva",
    icon: Activity,
    formatValue: asCount,
  },
  {
    key: "surrendersGiven",
    title: "Najviše predaja",
    hint: "Mečevi predani protivniku",
    icon: ShieldOff,
    formatValue: asCount,
  },
];

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card px-3 py-2.5">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">
        {label}
      </p>
      <p className="text-lg font-bold leading-tight mt-1 tabular-nums">{value}</p>
      {hint && (
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function Statistics() {
  // Boards rank current players only, but rivalries reach back through league
  // history, so opponent names must come from the full roster — otherwise a
  // rivalry involving a departed player renders as nothing at all.
  const { users, byId: playerById, loading: usersLoading } = useAllUsers();
  const [matches, setMatches] = useState<TMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const dataLoading = matchesLoading || usersLoading;
  const { setLoading } = useLoader();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMatchesLoading(true);
      const { data, error } = await supabase
        .from("match")
        .select("*")
        .eq("is_deleted", false);
      if (error) toast.error("Greška pri učitavanju statistike.");
      setMatches((data ?? []) as TMatch[]);
      setLoading(false);
      setMatchesLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playerOf = (userId: string) => playerById.get(userId);

  const stats = useMemo(
    () => computeAllPlayerStats(users, matches),
    [users, matches]
  );
  const records = useMemo(() => computeLeagueRecords(matches), [matches]);
  const rivalries = useMemo(
    () => computeRivalries(matches).filter((r) => r.meetings >= 3).slice(0, 8),
    [matches]
  );

  const pct = (n: number) => `${Math.round(n * 100)}%`;

  if (dataLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="h-7 bg-muted rounded animate-pulse w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (stats.size === 0) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <EmptyState
          icon={BarChart2}
          title="Nema statistike"
          description="Statistika će se pojaviti nakon prvih odigranih mečeva."
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Statistika</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Rekordi lige kroz {records.monthsCovered} mjeseci · {stats.size} aktivnih
          igrača
        </p>
      </div>

      {/* League-wide summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <StatTile
          label="Odigrano"
          value={String(records.decidedMatches)}
          hint={`${records.waitingMatches} još čeka`}
        />
        <StatTile
          label="S rezultatom"
          value={String(records.scoredMatches)}
          hint="upisan rezultat"
        />
        <StatTile
          label="Predaje"
          value={pct(records.surrenderRate)}
          hint={`${records.surrenderedMatches} mečeva`}
        />
        <StatTile
          label="Tie-break"
          value={pct(records.tieBreakRate)}
          hint={`${records.tieBreakMatches} mečeva`}
        />
        <StatTile
          label="Povratci"
          value={String(records.comebackMatches)}
          hint="izgubljen prvi set"
        />
        <StatTile
          label="Gemova"
          value={String(records.totalGames)}
          hint={`${records.bagelSets} bagela`}
        />
      </div>

      <p className="text-[11px] text-muted-foreground mb-8">
        Ljestvice prikazuju samo aktivne igrače. Mečevi protiv igrača koji su
        napustili ligu se broje u njihovim protivnicima, pa zbroj ljestvice ne
        odgovara ukupnom broju mečeva lige.
      </p>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOARDS.map((board) => (
          <LeaderboardCard
            key={board.key + board.title}
            title={board.title}
            hint={board.hint}
            icon={board.icon}
            entries={buildLeaderboard(stats, board.key, {
              limit: 5,
              minSample: board.minSample,
            })}
            playerOf={playerOf}
            formatValue={board.formatValue}
            formatDetail={board.formatDetail}
            onSelectPlayer={(userId) => navigate(`/igrac/${userId}`)}
          />
        ))}
      </div>

      {/* Rivalries */}
      {rivalries.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Najčešći dvoboji
            </h2>
          </div>
          <Card className="shadow-sm overflow-hidden py-0">
            <CardContent className="p-2">
              {rivalries.map((r) => {
                const one = playerOf(r.playerOneId);
                const two = playerOf(r.playerTwoId);
                if (!one || !two) return null;
                const leader =
                  r.playerOneWins === r.playerTwoWins
                    ? null
                    : r.playerOneWins > r.playerTwoWins
                      ? r.playerOneId
                      : r.playerTwoId;
                return (
                  <div
                    key={`${r.playerOneId}-${r.playerTwoId}`}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <button
                      onClick={() => navigate(`/igrac/${r.playerOneId}`)}
                      className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right"
                    >
                      <span
                        className={`text-xs truncate ${leader === r.playerOneId ? "font-bold" : "font-medium"}`}
                      >
                        {one.first_name} {one.last_name}
                      </span>
                      <PlayerAvatar
                        firstName={one.first_name}
                        lastName={one.last_name}
                        size="xs"
                      />
                    </button>
                    <span className="text-xs font-mono font-bold tabular-nums px-2 flex-shrink-0">
                      {r.playerOneWins} : {r.playerTwoWins}
                    </span>
                    <button
                      onClick={() => navigate(`/igrac/${r.playerTwoId}`)}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <PlayerAvatar
                        firstName={two.first_name}
                        lastName={two.last_name}
                        size="xs"
                      />
                      <span
                        className={`text-xs truncate ${leader === r.playerTwoId ? "font-bold" : "font-medium"}`}
                      >
                        {two.first_name} {two.last_name}
                      </span>
                    </button>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 w-14 text-right hidden sm:block">
                      <Hash className="w-2.5 h-2.5 inline mr-0.5" />
                      {r.meetings} <Handshake className="w-2.5 h-2.5 inline" />
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
