import { History, Trophy, ChevronDown, Check, X } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
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
import { useUsers } from "../providers/UsersProvider";
import { useAuth } from "../providers/AuthProvider";
import type { TMatch, TUser } from "../types";
import { supabase } from "../utils/supabase";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { orderBy } from "lodash-es";
import { MatchDetailModal, type JoinedMatchDetail } from "@/components/MatchDetailModal";

const AVATAR_COLORS = [
  "bg-blue-600", "bg-violet-600",
  "bg-emerald-600", "bg-amber-600", "bg-rose-600",
];
function avatarColor(first: string, last: string) {
  return AVATAR_COLORS[(first.charCodeAt(0) + last.charCodeAt(0)) % AVATAR_COLORS.length];
}

type JoinedMatch = JoinedMatchDetail;

// ── Multi-select player dropdown ──────────────────────────────────────────────
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
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
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
          "flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent cursor-pointer select-none",
          open && "border-ring ring-2 ring-ring/20"
        )}
      >
        <span className={selected.length === 0 ? "text-muted-foreground" : "text-foreground font-medium"}>
          {label}
        </span>
        {selected.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform ml-1", open && "rotate-180")} />
      </span>

      {open && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-md border border-border bg-popover shadow-md z-50 overflow-hidden">
          <div className="max-h-72 overflow-y-auto py-1">
            {players.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Učitavanje...</p>
            )}
            {orderBy(players, ["last_name", "first_name"]).map((p) => {
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
                  <div
                    className={`w-5 h-5 rounded-full ${avatarColor(p.first_name, p.last_name)} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}
                  >
                    {p.first_name[0]}{p.last_name[0]}
                  </div>
                  <span className="truncate">{p.first_name} {p.last_name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MatchHistory() {
  const [matches, setMatches] = useState<JoinedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
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
        .select("*, player_one:player_one_id (*), player_two:player_two_id (*)")
        .eq("is_deleted", false)
        .in("status", ["played", "surrendered"]);
      if (data) setMatches(orderBy(data as JoinedMatch[], "created_at", "desc"));
      setLoading(false);
    };
    load();
  }, []);

  const filteredMatches = useMemo(() => {
    if (selectedPlayers.length === 0) return matches;
    return matches.filter(
      (m) =>
        selectedPlayers.includes(m.player_one_id) ||
        selectedPlayers.includes(m.player_two_id)
    );
  }, [matches, selectedPlayers]);


  const getWinnerName = (match: JoinedMatch) => {
    const winnerId = match.winner_id;
    if (!winnerId) return "-";
    const w = users.find((p) => p.user_id === winnerId);
    return w ? `${w.first_name} ${w.last_name}` : "-";
  };

  const getResult = (match: TMatch) => {
    const hasResults = match.sets.some((s) => s.player_one_games > 0 || s.player_two_games > 0);
    if (!hasResults) return "-";
    let p1 = 0, p2 = 0;
    match.sets.forEach((s) => {
      if (s.player_one_games > s.player_two_games) p1++;
      else if (s.player_two_games > s.player_one_games) p2++;
    });
    return `${p1} – ${p2}`;
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Povijest mečeva</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? "Učitavanje…"
              : `${filteredMatches.length} odigranih`}
          </p>
        </div>

        <PlayerMultiSelect
          players={activePlayers}
          selected={selectedPlayers}
          onChange={setSelectedPlayers}
        />
      </div>

      {loading ? (
        <Card className="shadow-sm overflow-hidden py-0">
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-32" />
                <div className="flex-1" />
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : filteredMatches.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nema mečeva"
          description="Nema mečeva za odabrani filter."
        />
      ) : (
        <Card className="shadow-sm overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                    <TableHead className="font-semibold">Igrač 1</TableHead>
                    <TableHead className="font-semibold">Igrač 2</TableHead>
                    <TableHead className="text-center font-semibold">Rezultat</TableHead>
                    <TableHead className="font-semibold">Pobjednik</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((match) => {
                    const p1 = match.player_one;
                    const p2 = match.player_two;
                    const isSurrendered = match.status === "surrendered";
                    const winnerName = getWinnerName(match);
                    const isMyMatch =
                      match.player_one_id === currentUser?.user_id ||
                      match.player_two_id === currentUser?.user_id;

                    return (
                      <TableRow
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className={cn(
                          "hover:bg-muted/30 transition-colors cursor-pointer",
                          isMyMatch && "bg-primary/[0.02]"
                        )}
                      >
                        {/* Player 1 */}
                        <TableCell>
                          {p1 && (
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full ${avatarColor(p1.first_name, p1.last_name)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                {p1.first_name[0]}{p1.last_name[0]}
                              </div>
                              <p className="text-sm font-medium">{p1.first_name} {p1.last_name}</p>
                            </div>
                          )}
                        </TableCell>

                        {/* Player 2 */}
                        <TableCell>
                          {p2 && (
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full ${avatarColor(p2.first_name, p2.last_name)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                {p2.first_name[0]}{p2.last_name[0]}
                              </div>
                              <p className="text-sm font-medium">{p2.first_name} {p2.last_name}</p>
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-center font-mono font-bold text-sm">
                          {getResult(match)}
                        </TableCell>

                        <TableCell>
                          {winnerName !== "-" ? (
                            <div className="flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              <span className="text-sm font-medium">{winnerName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs font-semibold border-0",
                              isSurrendered
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            {isSurrendered ? "Predaja" : "Završen"}
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
      )}

      <MatchDetailModal
        open={selectedMatch !== null}
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}
