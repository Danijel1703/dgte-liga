import { History, Trophy, ChevronDown, Check, X, Search, User } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "../providers/UsersProvider";
import { useAuth } from "../providers/AuthProvider";
import type { TMatch, TSet, TUser } from "../types";
import { supabase } from "../utils/supabase";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { orderBy } from "lodash-es";
import { MatchDetailModal, type JoinedMatchDetail } from "@/components/MatchDetailModal";
import dayjs from "dayjs";

const MONTHS = [
  { value: "1", label: "Siječanj" },
  { value: "2", label: "Veljača" },
  { value: "3", label: "Ožujak" },
  { value: "4", label: "Travanj" },
  { value: "5", label: "Svibanj" },
  { value: "6", label: "Lipanj" },
  { value: "7", label: "Srpanj" },
  { value: "8", label: "Kolovoz" },
  { value: "9", label: "Rujan" },
  { value: "10", label: "Listopad" },
  { value: "11", label: "Studeni" },
  { value: "12", label: "Prosinac" },
];

const YEARS = ["2024", "2025", "2026"];

type JoinedMatch = JoinedMatchDetail & {
  group?: { name: string; color: string } | null;
};

function playedSets(sets: TSet[]) {
  return sets.filter((s) => s.player_one_games > 0 || s.player_two_games > 0);
}

function setResult(match: TMatch) {
  const sets = playedSets(match.sets);
  if (sets.length === 0) return null;
  let p1 = 0;
  let p2 = 0;
  for (const s of sets) {
    if (s.player_one_games > s.player_two_games) p1++;
    else if (s.player_two_games > s.player_one_games) p2++;
  }
  return { p1, p2 };
}

function gamesLine(match: TMatch) {
  const sets = playedSets(match.sets);
  if (sets.length === 0) return null;
  return sets
    .map((s) => `${s.player_one_games}–${s.player_two_games}`)
    .join(", ");
}

function monthKey(iso?: string) {
  if (!iso) return "unknown";
  return dayjs(iso).format("YYYY-MM");
}

function compareMatches(a: JoinedMatch, b: JoinedMatch) {
  const monthDiff = monthKey(b.created_at).localeCompare(monthKey(a.created_at));
  if (monthDiff !== 0) return monthDiff;
  const groupDiff = (a.group?.name ?? "").localeCompare(b.group?.name ?? "", "hr", {
    numeric: true,
  });
  if (groupDiff !== 0) return groupDiff;
  const roundDiff = (a.round ?? 0) - (b.round ?? 0);
  if (roundDiff !== 0) return roundDiff;
  return (a.player_one?.last_name ?? "").localeCompare(b.player_one?.last_name ?? "", "hr");
}

function monthHeading(key: string) {
  if (key === "unknown") return "Nepoznat datum";
  const [year, month] = key.split("-");
  const label = MONTHS.find((m) => m.value === String(Number(month)))?.label ?? month;
  return `${label} ${year}`;
}

const SHORT_MONTHS = [
  "sij", "velj", "ožu", "tra", "svi", "lip",
  "srp", "kol", "ruj", "lis", "stu", "pro",
];

function formatDay(iso?: string) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return `${d.date()}. ${SHORT_MONTHS[d.month()]}`;
}

function PlayerMultiSelect({
  players,
  selected,
  onChange,
}: {
  players: TUser[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = orderBy(players, ["last_name", "first_name"]);
    if (!q) return sorted;
    return sorted.filter((p) =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q)
    );
  }, [players, query]);

  const label =
    selected.length === 0
      ? "Svi igrači"
      : selected.length === 1
        ? (() => {
            const p = players.find((p) => p.user_id === selected[0]);
            return p ? `${p.first_name} ${p.last_name}` : "1 igrač";
          })()
        : `${selected.length} igrača`;

  return (
    <div ref={ref} className="relative">
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 h-8 px-3 rounded-lg border border-input bg-background text-sm transition-colors hover:bg-accent cursor-pointer select-none min-w-40",
          open && "border-ring ring-2 ring-ring/20"
        )}
      >
        <span className={selected.length === 0 ? "text-muted-foreground" : "text-foreground font-medium"}>
          {label}
        </span>
        {selected.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform ml-auto", open && "rotate-180")} />
      </span>

      {open && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-lg border border-border bg-popover shadow-md z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Traži igrača…"
                className="pl-8 h-8"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {visible.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Nema rezultata</p>
            )}
            {visible.map((p) => {
              const isSelected = selected.includes(p.user_id);
              return (
                <button
                  key={p.user_id}
                  onClick={() => toggle(p.user_id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/40 bg-transparent"
                    )}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <PlayerAvatar firstName={p.first_name} lastName={p.last_name} size="xs" />
                  <span className="truncate">
                    {p.first_name} {p.last_name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerSide({
  player,
  isWinner,
  align,
}: {
  player: TUser;
  isWinner: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 min-w-0 flex-1",
        align === "right" && "flex-row-reverse text-right"
      )}
    >
      <PlayerAvatar firstName={player.first_name} lastName={player.last_name} size="sm" />
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm leading-tight truncate",
            isWinner ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
          )}
        >
          {player.first_name} {player.last_name}
        </p>
        {isWinner && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
            <Trophy className="w-3 h-3" />
            Pobjeda
          </span>
        )}
      </div>
    </div>
  );
}

export default function MatchHistory() {
  const [matches, setMatches] = useState<JoinedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("svi");
  const [selectedYear, setSelectedYear] = useState("sve");
  const [statusFilter, setStatusFilter] = useState<"svi" | "odigrani" | "predaje">("svi");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<JoinedMatch | null>(null);
  const { users } = useUsers();
  const { user } = useAuth();

  const activePlayers = useMemo(
    () => users.filter((u) => !u.is_deleted && !u.is_viewer),
    [users]
  );
  const currentUser = users.find((u) => u.user_id === user?.id);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("match")
        .select("*, player_one:player_one_id (*), player_two:player_two_id (*), group:group_id (name, color)")
        .eq("is_deleted", false)
        .in("status", ["played", "surrendered"]);
      if (data) setMatches((data as JoinedMatch[]).slice().sort(compareMatches));
      setLoading(false);
    };
    load();
  }, []);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (selectedPlayers.length > 0) {
        if (
          !selectedPlayers.includes(m.player_one_id) &&
          !selectedPlayers.includes(m.player_two_id)
        ) {
          return false;
        }
      }
      if (showOnlyMine && currentUser) {
        if (
          m.player_one_id !== currentUser.user_id &&
          m.player_two_id !== currentUser.user_id
        ) {
          return false;
        }
      }
      if (statusFilter === "odigrani" && m.status !== "played") return false;
      if (statusFilter === "predaje" && m.status !== "surrendered") return false;

      if (selectedMonth !== "svi" || selectedYear !== "sve") {
        if (!m.created_at) return false;
        const d = dayjs(m.created_at);
        if (selectedMonth !== "svi" && d.month() + 1 !== Number(selectedMonth)) return false;
        if (selectedYear !== "sve" && d.year() !== Number(selectedYear)) return false;
      }

      return true;
    }).sort(compareMatches);
  }, [matches, selectedPlayers, showOnlyMine, currentUser, statusFilter, selectedMonth, selectedYear]);

  const grouped = useMemo(() => {
    const map = new Map<string, JoinedMatch[]>();
    for (const match of filteredMatches) {
      const key = monthKey(match.created_at);
      const list = map.get(key) ?? [];
      list.push(match);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredMatches]);

  const hasActiveFilters =
    selectedPlayers.length > 0 ||
    showOnlyMine ||
    statusFilter !== "svi" ||
    selectedMonth !== "svi" ||
    selectedYear !== "sve";

  const clearFilters = () => {
    setSelectedPlayers([]);
    setShowOnlyMine(false);
    setStatusFilter("svi");
    setSelectedMonth("svi");
    setSelectedYear("sve");
  };

  const monthLabel =
    selectedMonth === "svi"
      ? "Svi mjeseci"
      : MONTHS.find((m) => m.value === selectedMonth)?.label ?? "Svi mjeseci";
  const yearLabel = selectedYear === "sve" ? "Sve godine" : selectedYear;
  const statusLabel =
    statusFilter === "odigrani" ? "Odigrani" : statusFilter === "predaje" ? "Predaje" : "Svi statusi";

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Povijest mečeva</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {loading
            ? "Učitavanje…"
            : `${filteredMatches.length} ${filteredMatches.length === 1 ? "meč" : "mečeva"}`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v ?? "svi")}>
          <SelectTrigger className="w-36 bg-background">
            <SelectValue>{monthLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="svi">Svi mjeseci</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v ?? "sve")}>
          <SelectTrigger className="w-28 bg-background">
            <SelectValue>{yearLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sve">Sve godine</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter((v as typeof statusFilter) ?? "svi")}
        >
          <SelectTrigger className="w-32 bg-background">
            <SelectValue>{statusLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="svi">Svi statusi</SelectItem>
            <SelectItem value="odigrani">Odigrani</SelectItem>
            <SelectItem value="predaje">Predaje</SelectItem>
          </SelectContent>
        </Select>

        <PlayerMultiSelect
          players={activePlayers}
          selected={selectedPlayers}
          onChange={setSelectedPlayers}
        />

        {currentUser && !currentUser.is_viewer && (
          <Button
            variant={showOnlyMine ? "default" : "outline"}
            onClick={() => setShowOnlyMine((s) => !s)}
            className="gap-2 h-8"
          >
            <User className="w-4 h-4" />
            {showOnlyMine ? "Moji mečevi" : "Svi mečevi"}
          </Button>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-8 text-muted-foreground">
            Poništi filtere
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="shadow-sm overflow-hidden py-0">
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-28" />
                <div className="flex-1" />
                <div className="h-6 bg-muted rounded animate-pulse w-10" />
                <div className="flex-1" />
                <div className="h-4 bg-muted rounded animate-pulse w-28" />
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : filteredMatches.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nema mečeva"
          description={
            hasActiveFilters
              ? "Nema mečeva za odabrane filtere."
              : "Još nema odigranih mečeva."
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([key, monthMatches]) => (
            <section key={key}>
              <div className="flex items-baseline justify-between mb-2 px-0.5">
                <h2 className="text-sm font-semibold tracking-tight">{monthHeading(key)}</h2>
                <span className="text-xs text-muted-foreground">
                  {monthMatches.length} {monthMatches.length === 1 ? "meč" : "mečeva"}
                </span>
              </div>
              <Card className="shadow-sm overflow-hidden py-0">
                <CardContent className="p-0">
                  {monthMatches.map((match) => {
                    const p1 = match.player_one;
                    const p2 = match.player_two;
                    if (!p1 || !p2) return null;

                    const score = setResult(match);
                    const games = gamesLine(match);
                    const isSurrendered = match.status === "surrendered";
                    const p1Won = match.winner_id === p1.user_id;
                    const p2Won = match.winner_id === p2.user_id;
                    const isMyMatch =
                      match.player_one_id === currentUser?.user_id ||
                      match.player_two_id === currentUser?.user_id;

                    return (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => setSelectedMatch(match)}
                        className={cn(
                          "w-full text-left px-4 py-3.5 border-b border-border last:border-0 transition-colors hover:bg-muted/40",
                          isMyMatch && "bg-primary/[0.03]"
                        )}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="hidden sm:block w-14 flex-shrink-0 text-xs text-muted-foreground tabular-nums">
                            {formatDay(match.created_at)}
                          </span>

                          <PlayerSide player={p1} isWinner={p1Won} align="left" />

                          <div className="flex flex-col items-center flex-shrink-0 px-1 min-w-14">
                            {score ? (
                              <span className="text-lg font-black tabular-nums tracking-tight leading-none">
                                {score.p1}
                                <span className="text-muted-foreground mx-0.5 font-semibold">–</span>
                                {score.p2}
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-muted-foreground">vs</span>
                            )}
                            {games && (
                              <span className="text-[10px] text-muted-foreground tabular-nums mt-0.5 hidden sm:block">
                                {games}
                              </span>
                            )}
                          </div>

                          <PlayerSide player={p2} isWinner={p2Won} align="right" />
                        </div>

                        <div className="flex items-center gap-2 mt-2 sm:mt-1.5 sm:pl-14">
                          <span className="sm:hidden text-[11px] text-muted-foreground">
                            {formatDay(match.created_at)}
                          </span>
                          {games && (
                            <span className="sm:hidden text-[11px] text-muted-foreground tabular-nums">
                              {games}
                            </span>
                          )}
                          {match.group?.name && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: match.group.color || "oklch(0.5 0 0)" }}
                            >
                              {match.group.name}
                            </span>
                          )}
                          {isSurrendered && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-semibold border-0 bg-amber-100 text-amber-700"
                            >
                              Predaja
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}

      <MatchDetailModal
        open={selectedMatch !== null}
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}
