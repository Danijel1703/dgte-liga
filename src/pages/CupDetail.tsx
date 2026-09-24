import {
  ArrowLeft,
  LayoutGrid,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Shuffle,
  Trophy,
  Users,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CupBracketMatch } from "../components/CupBracketMatch";
import CupGroupModal, {
  type TCupGroupDraftMember,
} from "../components/CupGroupModal";
import CupMatchModal, { type TCupMatchPatch } from "../components/CupMatchModal";
import CupModal, { type TCupFormValues } from "../components/CupModal";
import { useAuth } from "../providers/AuthProvider";
import { useLoader } from "../providers/Loader";
import { useUsers } from "../providers/UsersProvider";
import type { TCup, TCupGroup, TCupMatch, TUser } from "../types";
import { calculateCupPoints, cupGroupStandings } from "../utils/cupPoints";
import {
  CUP_PLACEMENT_MEDALS,
  CUP_STAGE_LABELS,
  CUP_STATUS_BADGE,
  formatCupDate,
  formatCupSetLength,
  resolveCupGroupGames,
  resolveCupKnockoutGames,
} from "../utils/cupDisplay";
import {
  CUP_DRAW_COLORS,
  CUP_DRAW_GROUP_SIZE,
  dealIntoGroups,
} from "../utils/dealCupGroups";
import {
  buildCupGroupMatches,
  buildKnockoutSkeleton,
  planPlayoff,
  playoffRule,
  type TCupGroupStandingSeed,
} from "../utils/generateCupSchedule";
import { supabase } from "../utils/supabase";

function matchesNoun(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "meč";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "meča";
  return "mečeva";
}

export default function CupDetail() {
  const { id: cupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users: players } = useUsers();
  const { user } = useAuth();
  const { setLoading } = useLoader();

  const [cup, setCup] = useState<TCup | null>(null);
  const [groups, setGroups] = useState<TCupGroup[]>([]);
  const [matches, setMatches] = useState<TCupMatch[]>([]);
  const [entrantIds, setEntrantIds] = useState<string[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [editCupOpen, setEditCupOpen] = useState(false);
  const [deleteCupOpen, setDeleteCupOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TCupGroup | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<TCupMatch | null>(null);

  const isAdmin = !!players.find((p) => p.user_id === user?.id)?.is_admin;

  const playerById = useMemo(() => {
    const map = new Map<string, TUser>();
    for (const p of players) map.set(p.user_id, p);
    return map;
  }, [players]);

  // Users are resolved client-side from UsersProvider rather than via a
  // PostgREST embed, because the cup tables deliberately carry no foreign key
  // to "user" (matching migration 001) and so cannot be joined to it.
  const playerOf = (userId: string | null) =>
    userId ? playerById.get(userId) : undefined;

  const nameOf = (userId: string | null) => {
    const p = playerOf(userId);
    return p ? `${p.first_name} ${p.last_name}` : "—";
  };

  const initialize = async () => {
    if (!cupId) return;
    setLoading(true);
    setDataLoading(true);

    const [cupRes, groupRes, matchRes, entrantRes] = await Promise.all([
      supabase.from("cup").select("*").eq("id", cupId).eq("is_deleted", false).maybeSingle(),
      supabase
        .from("cup_group")
        .select("*, members:cup_group_member (*)")
        .eq("cup_id", cupId)
        .eq("is_deleted", false)
        .eq("members.is_deleted", false)
        .order("sort_order", { ascending: true }),
      supabase
        .from("cup_match")
        .select("*")
        .eq("cup_id", cupId)
        .eq("is_deleted", false),
      supabase
        .from("cup_participant")
        .select("user_id")
        .eq("cup_id", cupId)
        .eq("is_deleted", false),
    ]);

    if (cupRes.error || groupRes.error || matchRes.error || entrantRes.error) {
      toast.error("Greška pri učitavanju kupa.");
    }

    setCup((cupRes.data as TCup) ?? null);
    setGroups(((groupRes.data ?? []) as TCupGroup[]).map((g) => ({ ...g, members: g.members ?? [] })));
    setMatches((matchRes.data ?? []) as TCupMatch[]);
    setEntrantIds(((entrantRes.data ?? []) as Array<{ user_id: string }>).map((row) => row.user_id));

    setLoading(false);
    setDataLoading(false);
  };

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cupId]);

  // ---------------------------------------------------------------- derived
  const groupMatches = matches.filter((m) => m.stage === "group");
  const semifinals = matches
    .filter((m) => m.stage === "semifinal")
    .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
  const final = matches.find((m) => m.stage === "final") ?? null;
  const thirdPlace = matches.find((m) => m.stage === "third_place") ?? null;
  const hasKnockout = semifinals.length > 0 || !!final;

  const groupNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) if (g.id) map.set(g.id, g.name);
    return map;
  }, [groups]);

  const participantIds = useMemo(() => {
    const ids = new Set<string>(entrantIds);
    for (const g of groups) for (const m of g.members) ids.add(m.user_id);
    return ids;
  }, [entrantIds, groups]);

  const entrantPlayers = useMemo(
    () =>
      entrantIds
        .map((id) => playerById.get(id))
        .filter((p): p is TUser => !!p)
        .sort(
          (a, b) =>
            a.last_name.localeCompare(b.last_name, "hr") ||
            a.first_name.localeCompare(b.first_name, "hr")
        ),
    [entrantIds, playerById]
  );

  const participants = useMemo(
    () => players.filter((p) => participantIds.has(p.user_id)),
    [players, participantIds]
  );

  const pointRows = useMemo(
    () => calculateCupPoints(groups, matches),
    [groups, matches]
  );

  const sortedPointRows = useMemo(
    () =>
      Array.from(pointRows.values()).sort(
        (a, b) => b.total - a.total || b.groupWins - a.groupWins
      ),
    [pointRows]
  );

  const availableMembers = useMemo(() => {
    const assignedElsewhere = new Set<string>();
    for (const g of groups) {
      if (g.id === selectedGroup?.id) continue;
      for (const m of g.members) assignedElsewhere.add(m.user_id);
    }
    return players.filter(
      (p) => !p.is_deleted && !p.is_viewer && !assignedElsewhere.has(p.user_id)
    );
  }, [groups, players, selectedGroup]);

  const allGroupMatchesDecided =
    groupMatches.length > 0 && groupMatches.every((m) => !!m.winner_id);

  const playoffSeeds = useMemo<TCupGroupStandingSeed[]>(
    () =>
      groups
        .filter((g) => g.id)
        .map((g) => ({
          cupGroupId: g.id!,
          name: g.name,
          sortOrder: g.sort_order,
          ordered: cupGroupStandings(g, matches).map((row) => ({
            userId: row.userId,
            groupWins: row.groupWins,
            gameDifference: row.gameDifference,
            gamesFor: row.gamesFor,
          })),
        })),
    [groups, matches]
  );

  const playoffPreview = useMemo(() => {
    if (!allGroupMatchesDecided || hasKnockout) return null;
    try {
      return { plan: planPlayoff(playoffSeeds), error: null as string | null };
    } catch (e) {
      return {
        plan: null,
        error: e instanceof Error ? e.message : "Playoff se ne može složiti.",
      };
    }
  }, [allGroupMatchesDecided, hasKnockout, playoffSeeds]);

  // ---------------------------------------------------------------- actions
  const onCupEdit = async (values: TCupFormValues) => {
    if (!cupId) return;
    const { error } = await supabase
      .from("cup")
      .update({
        name: values.name,
        played_on: values.playedOn,
        group_games: values.groupGames,
        knockout_games: values.knockoutGames,
      })
      .eq("id", cupId);
    if (error) {
      toast.error("Kup nije spremljen.");
      return;
    }
    toast.success("Kup je spremljen.");
    await initialize();
  };

  const onCupDelete = async () => {
    if (!cupId) return;
    const { error } = await supabase
      .from("cup")
      .update({ is_deleted: true })
      .eq("id", cupId);
    if (error) {
      toast.error("Kup nije obrisan.");
      return;
    }
    toast.success("Kup je obrisan.");
    navigate("/kupovi");
  };

  const onGroupSave = async (
    groupName: string,
    members: TCupGroupDraftMember[]
  ) => {
    if (!cupId) return;

    let groupId = selectedGroup?.id;

    if (groupId) {
      await supabase.from("cup_group").update({ name: groupName }).eq("id", groupId);
    } else {
      const hue = Math.floor(Math.random() * 360);
      const { data, error } = await supabase
        .from("cup_group")
        .insert({
          cup_id: cupId,
          name: groupName,
          color: `hsl(${hue}, 65%, 45%)`,
          sort_order: (groups.length + 1) * 10,
        })
        .select("id")
        .single();
      if (error) {
        toast.error("Skupina nije kreirana.");
        return;
      }
      groupId = data.id as string;
    }

    const currentIds = (selectedGroup?.members ?? []).map((m) => m.user_id);
    const nextIds = members.map((m) => m.user_id);
    const toRemove = currentIds.filter((cid) => !nextIds.includes(cid));
    const toAdd = nextIds.filter((nid) => !currentIds.includes(nid));

    if (toRemove.length > 0) {
      await supabase
        .from("cup_group_member")
        .update({ is_deleted: true })
        .eq("cup_group_id", groupId)
        .in("user_id", toRemove);
    }
    if (toAdd.length > 0) {
      // A previously removed member still holds the (cup_group_id, user_id)
      // unique row, so revive those instead of inserting a duplicate.
      const { data: existing } = await supabase
        .from("cup_group_member")
        .select("user_id")
        .eq("cup_group_id", groupId)
        .in("user_id", toAdd);
      const existingIds = ((existing ?? []) as Array<{ user_id: string }>).map(
        (e) => e.user_id
      );
      const needRevive = toAdd.filter((uid) => existingIds.includes(uid));
      const needInsert = toAdd.filter((uid) => !existingIds.includes(uid));
      if (needRevive.length > 0) {
        await supabase
          .from("cup_group_member")
          .update({ is_deleted: false })
          .eq("cup_group_id", groupId)
          .in("user_id", needRevive);
      }
      if (needInsert.length > 0) {
        await supabase.from("cup_group_member").insert(
          needInsert.map((uid) => ({
            cup_group_id: groupId,
            user_id: uid,
            is_deleted: false,
          }))
        );
      }
    }

    toast.success("Skupina je spremljena.");
    await initialize();
  };

  const onGroupDelete = async (group: TCupGroup) => {
    if (!group.id) return;
    await supabase.from("cup_group").update({ is_deleted: true }).eq("id", group.id);
    await supabase
      .from("cup_match")
      .update({ is_deleted: true })
      .eq("cup_group_id", group.id);
    toast.success("Skupina je obrisana.");
    await initialize();
  };

  const handleGenerateGroupFixtures = async () => {
    if (!cupId) return;

    // Same guard as the league schedule generator: never generate twice.
    if (groupMatches.length > 0) {
      toast.info("Raspored skupina već postoji.");
      return;
    }
    const seeds = groups
      .filter((g) => g.id && g.members.length >= 2)
      .map((g) => ({ cupGroupId: g.id!, userIds: g.members.map((m) => m.user_id) }));

    if (seeds.length === 0) {
      toast.error("Dodaj barem jednu skupinu s dva ili više sudionika.");
      return;
    }

    const fixtures = buildCupGroupMatches(cupId, seeds);
    const { error } = await supabase.from("cup_match").insert(fixtures);
    if (error) {
      toast.error("Raspored nije generiran.");
      return;
    }
    toast.success(`Generirano ${fixtures.length} mečeva.`);
    await initialize();
  };

  /**
   * Deals the pre-filled entrants into groups of four. Runs in the browser
   * on click so the draw the admin films is the one that gets saved.
   * Allowed again only until a group schedule exists.
   */
  const handleRandomizeGroups = async () => {
    if (!cupId || drawing) return;
    if (groupMatches.length > 0) {
      toast.error("Raspored je već generiran. Skupine se više ne mogu miješati.");
      return;
    }
    const ids = entrantIds.length > 0 ? entrantIds : Array.from(participantIds);
    if (ids.length < CUP_DRAW_GROUP_SIZE) {
      toast.error(`Za ždrijeb treba barem ${CUP_DRAW_GROUP_SIZE} sudionika.`);
      return;
    }

    setDrawing(true);
    try {
      const dealt = dealIntoGroups(ids, CUP_DRAW_GROUP_SIZE);
      const existingIds = groups.map((g) => g.id).filter((id): id is string => !!id);
      if (existingIds.length > 0) {
        await supabase.from("cup_group_member").update({ is_deleted: true }).in("cup_group_id", existingIds);
        await supabase.from("cup_match").update({ is_deleted: true }).in("cup_group_id", existingIds);
        const { error: clearErr } = await supabase
          .from("cup_group")
          .update({ is_deleted: true })
          .in("id", existingIds);
        if (clearErr) {
          toast.error("Stare skupine nisu obrisane.");
          return;
        }
      }

      for (let i = 0; i < dealt.length; i++) {
        const { data, error } = await supabase
          .from("cup_group")
          .insert({
            cup_id: cupId,
            name: `Skupina ${i + 1}`,
            color: CUP_DRAW_COLORS[i % CUP_DRAW_COLORS.length],
            sort_order: (i + 1) * 10,
          })
          .select("id")
          .single();
        if (error || !data) {
          toast.error("Ždrijeb nije spremljen.");
          return;
        }
        const { error: memberErr } = await supabase.from("cup_group_member").insert(
          dealt[i].map((userId) => ({
            cup_group_id: data.id,
            user_id: userId,
            is_deleted: false,
          }))
        );
        if (memberErr) {
          toast.error("Igrači nisu raspoređeni.");
          return;
        }
      }

      toast.success("Skupine su izvučene.");
      await initialize();
    } finally {
      setDrawing(false);
    }
  };

  const handleSeedKnockout = async () => {
    if (!cupId) return;
    if (hasKnockout) {
      toast.info("Eliminacijska faza već postoji.");
      return;
    }

    try {
      const pairs = planPlayoff(playoffSeeds).semifinals.map(
        (pair) => [pair[0].userId, pair[1].userId] as [string, string]
      );
      const skeleton = buildKnockoutSkeleton(cupId, pairs);
      const { error } = await supabase.from("cup_match").insert(skeleton);
      if (error) {
        toast.error("Eliminacijska faza nije generirana.");
        return;
      }
      await supabase.from("cup").update({ status: "knockout" }).eq("id", cupId);
      toast.success("Eliminacijska faza je generirana.");
      await initialize();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eliminacijska faza nije generirana.");
    }
  };

  /**
   * Fills the final and 3rd-place pairings once both semifinals have a winner.
   * Only ever fills empty slots, so an admin's manual pairing override is never
   * clobbered by a later semifinal edit.
   */
  const propagateKnockout = async (allMatches: TCupMatch[]) => {
    const semis = allMatches
      .filter((m) => m.stage === "semifinal" && !m.is_deleted)
      .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
    if (semis.length !== 2 || semis.some((s) => !s.winner_id)) return;

    const winners = semis.map((s) => s.winner_id!);
    const losers = semis.map((s) =>
      s.winner_id === s.player_one_id ? s.player_two_id : s.player_one_id
    );

    const finalRow = allMatches.find((m) => m.stage === "final" && !m.is_deleted);
    const thirdRow = allMatches.find((m) => m.stage === "third_place" && !m.is_deleted);

    if (finalRow?.id && !finalRow.player_one_id && !finalRow.player_two_id) {
      await supabase
        .from("cup_match")
        .update({ player_one_id: winners[0], player_two_id: winners[1] })
        .eq("id", finalRow.id);
    }
    if (thirdRow?.id && !thirdRow.player_one_id && !thirdRow.player_two_id) {
      await supabase
        .from("cup_match")
        .update({ player_one_id: losers[0], player_two_id: losers[1] })
        .eq("id", thirdRow.id);
    }
  };

  const handleMatchSave = async (match: TCupMatch, patch: TCupMatchPatch) => {
    if (!match.id || !cupId) return;

    const { error } = await supabase.from("cup_match").update(patch).eq("id", match.id);
    if (error) {
      toast.error("Rezultat nije spremljen.");
      return;
    }

    const updated = matches.map((m) => (m.id === match.id ? { ...m, ...patch } : m));

    if (match.stage === "semifinal") {
      await propagateKnockout(updated);
    }

    const finalRow = updated.find((m) => m.stage === "final");
    const nextStatus = finalRow?.winner_id
      ? "finished"
      : updated.some((m) => m.stage !== "group")
        ? "knockout"
        : "group_stage";
    if (cup && nextStatus !== cup.status) {
      await supabase.from("cup").update({ status: nextStatus }).eq("id", cupId);
    }

    toast.success("Rezultat je spremljen.");
    await initialize();
  };

  // ---------------------------------------------------------------- render
  if (dataLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
        <div className="h-7 bg-muted rounded animate-pulse w-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-sm overflow-hidden py-0">
              <div className="h-1 bg-muted" />
              <CardContent className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <div key={r} className="h-8 bg-muted rounded animate-pulse" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!cup) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <EmptyState
          icon={Trophy}
          title="Kup nije pronađen"
          description="Provjerite link ili se vratite na popis kupova."
          action={
            <Button variant="outline" onClick={() => navigate("/kupovi")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Popis kupova
            </Button>
          }
        />
      </div>
    );
  }

  const badge = CUP_STATUS_BADGE[cup.status];

  return (
    <>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <button
          onClick={() => navigate("/kupovi")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kupovi
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{cup.name}</h1>
              <Badge className={`text-xs border-0 ${badge.className}`}>
                {badge.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatCupDate(cup.played_on)} · {participantIds.size} sudionika ·{" "}
              {formatCupSetLength(cup.group_games, cup.knockout_games)}
            </p>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditCupOpen(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Uredi kup
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedGroup(null);
                    setGroupModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj skupinu
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteCupOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Obriši kup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* ----------------------------------------------------- Skupine */}
        <section className="mb-10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Skupine
            </h2>
            {isAdmin && groupMatches.length === 0 && entrantPlayers.length >= CUP_DRAW_GROUP_SIZE && (
              <Button
                onClick={handleRandomizeGroups}
                disabled={drawing}
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                {drawing
                  ? "Izvlačenje..."
                  : groups.length > 0
                    ? "Randomiziraj ponovno"
                    : "Randomiziraj skupine"}
              </Button>
            )}
          </div>
          {groups.length === 0 ? (
            entrantPlayers.length > 0 ? (
              <Card className="shadow-sm py-0">
                <CardContent className="p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {entrantPlayers.length} sudionika čeka ždrijeb. Jedan klik dijeli
                    ih u skupine po {CUP_DRAW_GROUP_SIZE}.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {entrantPlayers.map((p) => (
                      <div
                        key={p.user_id}
                        className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
                      >
                        <PlayerAvatar
                          firstName={p.first_name}
                          lastName={p.last_name}
                          size="xs"
                        />
                        <span className="text-sm font-medium truncate">
                          {p.first_name} {p.last_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
            <EmptyState
              icon={LayoutGrid}
              title="Nema skupina"
              description="Skupine određuju sudionike kupa."
              action={
                isAdmin ? (
                  <Button
                    onClick={() => {
                      setSelectedGroup(null);
                      setGroupModalOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj skupinu
                  </Button>
                ) : undefined
              }
            />
            )
          ) : (
            <div className={`grid grid-cols-1 gap-4 ${groups.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
              {groups.map((group) => {
                const standings = cupGroupStandings(group, matches);
                return (
                  <Card
                    key={group.id}
                    className="shadow-sm overflow-hidden py-0"
                  >
                    <div className="h-1" style={{ background: group.color }} />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: group.color }}
                          />
                          <span className="font-bold text-base truncate">
                            {group.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            · {group.members.length} sud.
                          </span>
                        </div>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedGroup(group);
                                  setGroupModalOpen(true);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Uredi skupinu
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onGroupDelete(group)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Obriši skupinu
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 mb-2">
                        <Users className="w-3 h-3" />
                        Poredak
                      </p>
                      <div className="space-y-1">
                        {standings.map((row, index) => {
                          const p = playerOf(row.userId);
                          if (!p) return null;
                          return (
                            <div
                              key={row.userId}
                              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                                {index + 1}.
                              </span>
                              <PlayerAvatar
                                firstName={p.first_name}
                                lastName={p.last_name}
                                size="xs"
                              />
                              <span className="flex-1 text-sm font-medium truncate">
                                {p.first_name} {p.last_name}
                              </span>
                              <div className="text-sm font-bold">
                                {row.groupWins}
                                <span
                                  className={`text-xs font-normal ml-1 ${
                                    row.gameDifference >= 0
                                      ? "text-emerald-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  ({row.gameDifference > 0 ? "+" : ""}
                                  {row.gameDifference})
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ------------------------------------- Mečevi u skupinama */}
        {groups.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3 gap-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Mečevi u skupinama
              </h2>
              {isAdmin && groupMatches.length === 0 && (
                <Button
                  size="sm"
                  onClick={handleGenerateGroupFixtures}
                  className="gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Generiraj raspored skupina
                </Button>
              )}
            </div>

            {groupMatches.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl py-6 text-center text-muted-foreground text-sm">
                Raspored skupina još nije generiran
              </div>
            ) : (
              <div className={`grid grid-cols-1 gap-4 ${groups.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
                {groups.map((group) => {
                  const rows = groupMatches
                    .filter((match) => match.cup_group_id === group.id)
                    .sort((a, b) => (a.round ?? 0) - (b.round ?? 0));
                  if (rows.length === 0) return null;
                  return (
                    <Card key={group.id} className="shadow-sm overflow-hidden py-0">
                      <div className="h-1" style={{ background: group.color }} />
                      <CardContent className="p-0">
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: group.color }}
                          />
                          <span className="font-bold text-sm">{group.name}</span>
                          <span className="text-xs text-muted-foreground">
                            · {rows.length} {matchesNoun(rows.length)}
                          </span>
                        </div>
                        <div>
                          {rows.map((match) => {
                            const hasScore =
                              match.player_one_games !== null &&
                              match.player_two_games !== null;
                            const isTieBreak =
                              hasScore &&
                              match.player_one_games === match.player_two_games &&
                              !!match.winner_id;
                            const oneWon = match.winner_id === match.player_one_id;
                            const twoWon = match.winner_id === match.player_two_id;
                            return (
                              <div
                                key={match.id}
                                className="flex items-center gap-2 px-3 py-2.5 border-b last:border-b-0"
                              >
                                <span
                                  className={`flex-1 min-w-0 text-sm truncate ${
                                    oneWon ? "font-semibold" : "text-muted-foreground"
                                  }`}
                                >
                                  {nameOf(match.player_one_id)}
                                </span>
                                <div className="shrink-0 text-center">
                                  <span className="font-mono font-bold text-sm">
                                    {hasScore
                                      ? `${match.player_one_games}:${match.player_two_games}`
                                      : "–"}
                                  </span>
                                  {isTieBreak && (
                                    <span className="block text-[10px] font-bold text-amber-700">
                                      TB
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`flex-1 min-w-0 text-sm truncate text-right ${
                                    twoWon ? "font-semibold" : "text-muted-foreground"
                                  }`}
                                >
                                  {nameOf(match.player_two_id)}
                                </span>
                                {isAdmin && (
                                  <button
                                    onClick={() => setSelectedMatch(match)}
                                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                                    aria-label="Uredi rezultat"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------- Eliminacijska faza */}
        {groupMatches.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3 gap-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Eliminacijska faza
              </h2>
              {isAdmin && !hasKnockout && (
                <Button
                  size="sm"
                  onClick={handleSeedKnockout}
                  disabled={!allGroupMatchesDecided || !!playoffPreview?.error}
                  className="gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Generiraj eliminacijsku fazu
                </Button>
              )}
            </div>

            {!hasKnockout ? (
              <div className="border-2 border-dashed rounded-xl px-4 py-6 text-center text-sm text-muted-foreground space-y-2">
                <p>Eliminacijska faza još nije određena</p>
                <p className="text-xs max-w-lg mx-auto">
                  {playoffPreview?.error ??
                    playoffPreview?.plan?.summary ??
                    playoffRule(groups.length)}
                </p>
                {!allGroupMatchesDecided && (
                  <p className="text-xs">Završite sve mečeve u skupinama</p>
                )}
                {playoffPreview?.plan && (
                  <ul className="text-left text-xs max-w-md mx-auto space-y-1.5 text-foreground pt-1">
                    {playoffPreview.plan?.semifinals.map((pair, index) => (
                      <li key={index}>
                        <span className="font-semibold">Polufinale {index + 1}:</span>{" "}
                        {nameOf(pair[0].userId)} ({pair[0].note}) —{" "}
                        {nameOf(pair[1].userId)} ({pair[1].note})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <>
                <div className="md:grid md:grid-cols-2 md:gap-6 md:items-center space-y-6 md:space-y-0">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Polufinale
                    </p>
                    {semifinals.map((match) => (
                      <CupBracketMatch
                        key={match.id}
                        match={match}
                        playerOf={playerOf}
                        onEdit={isAdmin ? setSelectedMatch : undefined}
                      />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Finale
                    </p>
                    <CupBracketMatch
                      match={final}
                      playerOf={playerOf}
                      isFinal
                      onEdit={isAdmin ? setSelectedMatch : undefined}
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-3 md:max-w-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    3. mjesto
                  </p>
                  <CupBracketMatch
                    match={thirdPlace}
                    playerOf={playerOf}
                    onEdit={isAdmin ? setSelectedMatch : undefined}
                  />
                </div>
              </>
            )}
          </section>
        )}

        {/* ------------------------------------------ Bodovi na kupu */}
        {sortedPointRows.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Bodovi na kupu
            </h2>
            <Card className="shadow-sm overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-14 font-semibold">Rang</TableHead>
                        <TableHead className="font-semibold">Igrač</TableHead>
                        <TableHead className="text-center font-semibold">
                          Nastup
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Pob. skupina
                        </TableHead>
                        <TableHead className="text-center font-semibold">
                          Plasman
                        </TableHead>
                        <TableHead className="text-center font-bold">Bodovi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPointRows.map((row, index) => {
                        const p = playerOf(row.userId);
                        if (!p) return null;
                        return (
                          <TableRow
                            key={row.userId}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <TableCell>
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                                  ${
                                    index === 0
                                      ? "bg-yellow-100 text-yellow-700"
                                      : index === 1
                                        ? "bg-slate-100 text-slate-600"
                                        : index === 2
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-muted text-muted-foreground"
                                  }`}
                              >
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <PlayerAvatar
                                  firstName={p.first_name}
                                  lastName={p.last_name}
                                />
                                <span className="font-medium text-sm whitespace-nowrap">
                                  {p.first_name} {p.last_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground">
                              {row.participation}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {row.groupWins}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {row.placement
                                ? (CUP_PLACEMENT_MEDALS[row.placement] ??
                                  `${row.placement}.`)
                                : "–"}
                            </TableCell>
                            <TableCell className="text-center font-bold text-sm">
                              {row.total}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {editCupOpen && (
        <CupModal
          open={editCupOpen}
          cup={cup}
          onClose={() => setEditCupOpen(false)}
          onSave={onCupEdit}
        />
      )}

      {groupModalOpen && (
        <CupGroupModal
          open={groupModalOpen}
          onClose={() => {
            setGroupModalOpen(false);
            setSelectedGroup(null);
          }}
          name={selectedGroup?.name}
          currentMembers={(selectedGroup?.members ?? [])
            .map((m) => ({ user_id: m.user_id, user: playerById.get(m.user_id) }))
            .filter((m): m is TCupGroupDraftMember => !!m.user)}
          availableMembers={availableMembers}
          onSave={onGroupSave}
        />
      )}

      {selectedMatch && (
        <CupMatchModal
          open={!!selectedMatch}
          match={selectedMatch}
          stageLabel={
            selectedMatch.stage === "group"
              ? (groupNameById.get(selectedMatch.cup_group_id ?? "") ?? "Skupina")
              : CUP_STAGE_LABELS[selectedMatch.stage]
          }
          participants={participants}
          maxGames={
            selectedMatch.stage === "group"
              ? resolveCupGroupGames(cup.group_games)
              : resolveCupKnockoutGames(cup.knockout_games)
          }
          onClose={() => setSelectedMatch(null)}
          onSave={handleMatchSave}
        />
      )}

      <Dialog open={deleteCupOpen} onOpenChange={(o) => !o && setDeleteCupOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Obriši kup</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Kup <span className="font-semibold text-foreground">{cup.name}</span> i
            svi njegovi bodovi bit će uklonjeni s rang liste. Radnja se može
            vratiti samo u bazi.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCupOpen(false)}>
              Odustani
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteCupOpen(false);
                onCupDelete();
              }}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Obriši
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
