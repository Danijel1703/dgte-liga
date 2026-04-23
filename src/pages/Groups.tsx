import { Pencil, Plus, Trash2, Users, MoreVertical, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { flatMap, reverse, sortBy } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import CreateGroupModal from "../components/CreateGroupModal";
import EditGroupModal from "../components/EditGroupModal";
import { useAuth } from "../providers/AuthProvider";
import { useLoader } from "../providers/Loader";
import { useUsers } from "../providers/UsersProvider";
import type { TGroup, TGroupMember } from "../types";
import { supabase } from "../utils/supabase";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

dayjs.extend(isBetween);

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

export default function GroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState<TGroup | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { users: players } = useUsers();
  const [groups, setGroups] = useState<TGroup[]>([]);
  const { user } = useAuth();
  const player = players.find((p) => p.user_id === user?.id);
  const isAdmin = !!player?.is_admin;
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const now = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(String(now.month() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.year()));
  const { setLoading } = useLoader();

  const selectedDayjs: Dayjs = dayjs(`${selectedYear}-${selectedMonth.padStart(2, "0")}-01`);

  useEffect(() => {
    if (player?.is_viewer) setShowOnlyMine(false);
  }, [user?.id, players]);

  const initialize = async () => {
    setLoading(true);
    const startOfMonth = selectedDayjs.startOf("month");
    const endOfMonth = selectedDayjs.endOf("month");

    const query = supabase
      .from("group")
      .select(`*, members:group_member (*, user:user_id (*)), match (*)`)
      .eq("is_deleted", false)
      .eq("members.is_deleted", false)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString());

    const { data } = await query;

    if (data) {
      const mappedGroups = (data as TGroup[]).map((group) => ({
        ...group,
        members: group.members.map((member) => {
          const matchesWon = group.match.filter((m) => m.winner_id === member.user_id);
          const points = matchesWon.length * 3;
          let gems = 0, gemsLost = 0;
          const playerMatches = group.match.filter(
            (m) => m.player_one_id === member.user_id || m.player_two_id === member.user_id
          );
          playerMatches.forEach((match) => {
            const isPlayerOne = match.player_one_id === member.user_id;
            if (match.sets && Array.isArray(match.sets)) {
              match.sets.forEach((set) => {
                if (set) {
                  gems += isPlayerOne ? set.player_one_games || 0 : set.player_two_games || 0;
                  gemsLost += isPlayerOne ? set.player_two_games || 0 : set.player_one_games || 0;
                }
              });
            }
          });
          return { ...member, points_in_group: points, gems_in_group: gems, gem_difference: gems - gemsLost };
        }),
      }));

      const filtered = showOnlyMine
        ? mappedGroups.filter((g) => g.members.map((t) => t.user_id).includes(user?.id as string))
        : mappedGroups;
      setGroups(filtered);
    }
    setLoading(false);
  };

  useEffect(() => { initialize(); }, [showOnlyMine, selectedMonth, selectedYear]);

  const availableMembers = useMemo(() => {
    const members = flatMap(groups.map((t) => t.members));
    return players.filter((p) => !members.some((m) => m.user_id === p.user_id));
  }, [groups, players]);

  const onGroupDelete = async () => {
    if (!selectedGroup?.id) return;
    await supabase.from("group").update({ is_deleted: true }).eq("id", selectedGroup.id);
    setSelectedGroup(null);
    await initialize();
  };

  const onGroupCreate = async (groupName: string, members: TGroupMember[]) => {
    const hue = Math.floor(Math.random() * 360);
    const randomColor = `hsl(${hue}, 65%, 45%)`;
    const { data } = await supabase.from("group").insert({ name: groupName, color: randomColor }).select("*");
    if (data) {
      const group = data[0];
      for (const member of members) {
        await supabase.from("group_member").insert({ group_id: group.id, user_id: member.user_id, is_deleted: false });
      }
    }
    await initialize();
  };

  const onGroupEdit = async (groupName: string, members: TGroupMember[]) => {
    if (!selectedGroup?.id) return;
    await supabase.from("group").update({ name: groupName }).eq("id", selectedGroup.id);
    const currentMemberIds = (selectedGroup.members || []).map((m) => m.user_id);
    const nextMemberIds = members.map((m) => m.user_id);
    const toRemove = currentMemberIds.filter((id) => !nextMemberIds.includes(id));
    const toAdd = nextMemberIds.filter((id) => !currentMemberIds.includes(id));
    if (toRemove.length > 0) {
      await supabase.from("group_member").update({ is_deleted: true }).eq("group_id", selectedGroup.id).in("user_id", toRemove);
    }
    if (toAdd.length > 0) {
      const { data: existing } = await supabase.from("group_member").select("user_id, is_deleted").eq("group_id", selectedGroup.id).in("user_id", toAdd);
      const existingIds = (existing || []).map((e: { user_id: string }) => e.user_id);
      const needUndelete = toAdd.filter((id) => existingIds.includes(id));
      const needInsert = toAdd.filter((id) => !existingIds.includes(id));
      if (needUndelete.length > 0) {
        await supabase.from("group_member").update({ is_deleted: false }).eq("group_id", selectedGroup.id).in("user_id", needUndelete);
      }
      if (needInsert.length > 0) {
        await supabase.from("group_member").insert(needInsert.map((id) => ({ group_id: selectedGroup.id, user_id: id, is_deleted: false })));
      }
    }
    await initialize();
  };

  const years = ["2024", "2025", "2026"];

  return (
    <>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Grupe</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Praćenje natjecanja po grupama</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Kreiraj grupu
            </Button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl bg-muted/40 border border-border">
          <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v ?? selectedMonth)}>
            <SelectTrigger className="w-36 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v ?? selectedYear)}>
            <SelectTrigger className="w-24 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showOnlyMine ? "default" : "outline"}
            onClick={() => setShowOnlyMine((s) => !s)}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            {showOnlyMine ? "Moja grupa" : "Sve grupe"}
          </Button>
        </div>

        {/* Groups grid */}
        {groups.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="Nema grupa za ovaj period"
            description="Odaberite drugi mjesec ili godinu, ili kreirajte novu grupu."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortBy(groups, "name").map((group) => (
              <Card
                key={group.id}
                className="shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Colored top accent */}
                <div className="h-1" style={{ background: group.color }} />

                <CardContent className="p-4">
                  {/* Group header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: group.color }}
                      />
                      <span className="font-bold text-base">{group.name}</span>
                      <span className="text-xs text-muted-foreground">
                        · {group.members.length} čl.
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
                            onClick={() => { setSelectedGroup(group); setEditOpen(true); }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Uredi grupu
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => { setSelectedGroup(group); onGroupDelete(); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Obriši grupu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Members list */}
                  {group.members && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 mb-2">
                        <Users className="w-3 h-3" />
                        Poredak
                      </p>
                      {reverse(
                        sortBy(group.members, ["points_in_group", "gem_difference", "gems_in_group"])
                      ).map((member, index) => (
                        <div
                          key={member.user.user_id}
                          className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                            {index + 1}.
                          </span>
                          <PlayerAvatar
                            firstName={member.user.first_name}
                            lastName={member.user.last_name}
                            size="xs"
                          />
                          <span className="flex-1 text-sm font-medium text-foreground truncate">
                            {member.user.first_name} {member.user.last_name}
                          </span>
                          <div className="text-sm font-bold text-foreground">
                            {member.points_in_group}
                            <span className={`text-xs font-normal ml-1 ${(member.gem_difference ?? 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              ({(member.gem_difference ?? 0) > 0 ? "+" : ""}{member.gem_difference})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedGroup && editOpen && (
        <EditGroupModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          currentMembers={[...selectedGroup.members]}
          name={selectedGroup.name}
          availableMembers={availableMembers}
          onSave={onGroupEdit}
        />
      )}
      {createOpen && (
        <CreateGroupModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          availableMembers={availableMembers}
          onSave={onGroupCreate}
        />
      )}
    </>
  );
}
