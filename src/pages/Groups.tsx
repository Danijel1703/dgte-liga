import {
  Create,
  Delete,
  Edit,
  Group,
  MoreVert,
  Person,
  Refresh,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
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

dayjs.extend(isBetween);

export const colors = [
  "#1976d2", // primary.main (blue)
  "#9c27b0", // secondary.main (purple)
  "#d32f2f", // error.main (red)
  "#ed6c02", // warning.main (orange)
  "#2e7d32", // success.main (green)
  "#0288d1", // info.main (cyan/teal)
  "#1565c0", // primary.dark (deep blue)
  "#7b1fa2", // secondary.dark (deep purple)
];

export default function GroupsPage() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<TGroup | null>();
  const [open, setIsOpen] = useState(false);
  const [createGroup, setCreateGroup] = useState(false);
  const { users: players } = useUsers();
  const [groups, setGroups] = useState<TGroup[]>([]);
  const { user } = useAuth();
  const player = players.find((p) => p.user_id === user?.id);
  const isAdmin = !!player?.is_admin;
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const { setLoading } = useLoader();

  useEffect(() => {
    if (player && player.is_viewer) {
      setShowOnlyMine(false);
    }
  }, [user?.id, players]);

  const initialize = async () => {
    setLoading(true);

    let query = supabase
      .from("group")
      .select(
        `
      *,
      members:group_member (
        *,
        user:user_id (*)
      ),
      match (*)
    `
      )
      .eq("is_deleted", false) // Filter groups where is_deleted is false
      .eq("members.is_deleted", false); // Filter members where is_deleted is false

    // 1. Apply created_at filter based on selectedMonth directly to the query
    if (selectedMonth) {
      const startOfMonth = selectedMonth.startOf("month");
      const endOfMonth = selectedMonth.endOf("month");

      // Filter groups where the 'created_at' date falls within the selected month range.
      query = query
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());
    }

    const { data } = await query;

    // 2. Client-side Processing (Mapping and User Filtering)
    if (data) {
      const mappedGroups = (data as TGroup[]).map((group) => {
        // Calculate points for members
        return {
          ...group,
          members: group.members.map((member) => {
            return {
              ...member,
              points_in_group:
                group.match.filter(
                  (match) => match.winner_id === member.user_id
                ).length * 3,
            };
          }),
        };
      });

      let filteredGroups = showOnlyMine
        ? mappedGroups.filter((g) =>
            g.members.map((t) => t.user_id).includes(user?.id as string)
          )
        : mappedGroups;

      // The previous client-side date filtering logic is now removed/redundant
      // because the groups are already filtered by created_at in the query.
      // If you need to filter based on match dates *within* the month as a secondary criteria,
      // you would need a more complex Supabase function or view, but for simple
      // group lifecycle filtering, the server-side created_at filter is best.

      setGroups(filteredGroups);
    }

    setLoading(false);
  };

  useEffect(() => {
    initialize();
  }, [showOnlyMine, selectedMonth]);

  const availableMembers = useMemo(() => {
    const members = flatMap(groups.map((t) => t.members));
    return players.filter((p) => !members.some((m) => m.user_id === p.user_id));
  }, [groups, players]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    groupId: string
  ) => {
    setAnchorEl(event.currentTarget);
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const onGroupDelete = async () => {
    if (!selectedGroup?.id) return;
    await supabase
      .from("group")
      .update({ is_deleted: true })
      .eq("id", selectedGroup.id);
    handleMenuClose();
    await initialize();
  };

  const onGroupCreate = async (groupName: string, members: TGroupMember[]) => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const { data } = await supabase
      .from("group")
      .insert({
        name: groupName,
        color: randomColor,
      })
      .select("*");

    if (data) {
      const group = data[0];
      for (const member of members) {
        await supabase.from("group_member").insert({
          group_id: group.id,
          user_id: member.user_id,
          is_deleted: false,
        });
      }
    }
    await initialize();
  };

  const onGroupEdit = async (groupName: string, members: TGroupMember[]) => {
    if (!selectedGroup?.id) return;

    await supabase
      .from("group")
      .update({ name: groupName })
      .eq("id", selectedGroup.id);

    const currentMemberIds = (selectedGroup.members || []).map(
      (m) => m.user_id
    );
    const nextMemberIds = members.map((m) => m.user_id);

    const toRemove = currentMemberIds.filter(
      (id) => !nextMemberIds.includes(id)
    );
    const toAdd = nextMemberIds.filter((id) => !currentMemberIds.includes(id));

    if (toRemove.length > 0) {
      await supabase
        .from("group_member")
        .update({ is_deleted: true })
        .eq("group_id", selectedGroup.id)
        .in("user_id", toRemove);
    }

    if (toAdd.length > 0) {
      const { data: existing } = await supabase
        .from("group_member")
        .select("user_id, is_deleted")
        .eq("group_id", selectedGroup.id)
        .in("user_id", toAdd);

      const existingIds = (existing || []).map(
        (e: { user_id: string }) => e.user_id
      );
      const needUndelete = toAdd.filter((id) => existingIds.includes(id));
      const needInsert = toAdd.filter((id) => !existingIds.includes(id));

      if (needUndelete.length > 0) {
        await supabase
          .from("group_member")
          .update({ is_deleted: false })
          .eq("group_id", selectedGroup.id)
          .in("user_id", needUndelete);
      }

      if (needInsert.length > 0) {
        const rows = needInsert.map((id) => ({
          group_id: selectedGroup.id,
          user_id: id,
          is_deleted: false,
        }));
        await supabase.from("group_member").insert(rows);
      }
    }

    await initialize();
  };

  const handleGenerateGroups = async () => {
    try {
      setLoading(true);

      const currentMonth = dayjs();
      const previousMonth = currentMonth.subtract(1, "month");
      const startOfPrevMonth = previousMonth.startOf("month");
      const endOfPrevMonth = previousMonth.endOf("month");

      const membersPerGroup = 4;

      // 1. Fetch Previous Groups and Matches
      const { data: prevGroups } = (await supabase
        .from("group")
        .select(
          `
        *,
        members:group_member (
          *,
          user:user_id (*)
        ),
        match (*)
      `
        )
        .eq("is_deleted", false)
        .eq("members.is_deleted", false)
        .gte("created_at", startOfPrevMonth.toISOString())
        .lte("created_at", endOfPrevMonth.toISOString())) as {
        data: TGroup[] | null;
      };

      if (!prevGroups || prevGroups.length === 0) {
        console.log(
          "No groups found for previous month:",
          previousMonth.format("MM/YYYY")
        );
        setLoading(false);
        return;
      }

      // 2. Calculate Rankings (Points)
      const groupsWithRankings = prevGroups.map((group) => {
        const prevMonthMatches = group.match.filter((match: any) => {
          const matchDate = dayjs(match.created_at);
          return matchDate.isBetween(
            startOfPrevMonth,
            endOfPrevMonth,
            "day",
            "[]"
          );
        });

        const membersWithPoints = group.members.map((member: any) => ({
          ...member,
          points_in_group:
            prevMonthMatches.filter(
              (match: any) => match.winner_id === member.user_id
            ).length * 3,
        }));

        // Sort members by points (best to worst/descending)
        const sortedMembers = reverse(
          sortBy(membersWithPoints, "points_in_group")
        );

        return {
          ...group,
          members: sortedMembers,
        };
      });

      // Sort groups by name (Skupina 1, Skupina 2, ...) to establish order (0 is highest)
      const sortedGroups = sortBy(groupsWithRankings, "name") as (TGroup & {
        members: TGroupMember[];
      })[];

      const numberOfGroups = sortedGroups.length;
      const uniqueGroupNames = [
        ...new Set(sortedGroups.map((group) => group.name)),
      ].sort();

      const newGroups: any[] = [];

      // 3. CORE LOGIC: Promotion and Relegation
      for (let i = 0; i < numberOfGroups; i++) {
        const newGroupMembers: any[] = [];
        const currentGroup = sortedGroups[i];
        const currentGroupMembers = currentGroup.members;

        // Ensure the group has enough members to process the top 4
        if (currentGroupMembers.length < 4) {
          // If a group is not full, it makes promotion/relegation complex.
          // For simplicity, we only run logic if minimum members exist.
          // Handle groups with less than 4 members gracefully (e.g., keep them all).
          if (currentGroupMembers.length > 0) {
            newGroupMembers.push(...currentGroupMembers);
          }
        } else {
          // --- Slot 1: Rank 1 (Igor Mijatov's Slot) ---
          if (i === 0) {
            // Highest Group (i=0): Rank 1 stays (Igor Mijatov)
            newGroupMembers.push(currentGroupMembers[0]);
          } else {
            // All other Groups: Rank 4 from the higher group (i-1) is RELEGATED
            const higherGroup = sortedGroups[i - 1];
            if (higherGroup.members.length >= 4) {
              newGroupMembers.push(higherGroup.members[3]); // Rank 4 from i-1 (e.g., Dario Jagarinec to Skupina 2)
            } else {
              // Fallback: If higher group wasn't full, keep current Rank 1
              newGroupMembers.push(currentGroupMembers[0]);
            }
          }

          // --- Slot 2 & 3: Rank 2 and Rank 3 always stay ---
          newGroupMembers.push(currentGroupMembers[1]); // Rank 2 stays
          newGroupMembers.push(currentGroupMembers[2]); // Rank 3 stays

          // --- Slot 4: Rank 4 Player ---
          if (i === numberOfGroups - 1) {
            // Lowest Group (i=N-1): Rank 4 stays (Marko Jović)
            newGroupMembers.push(currentGroupMembers[3]);
          } else {
            // All other Groups: Rank 1 from the lower group (i+1) is PROMOTED
            const lowerGroup = sortedGroups[i + 1];
            if (lowerGroup.members.length > 0) {
              newGroupMembers.push(lowerGroup.members[0]); // Rank 1 from i+1 (e.g., Krešimir Lončarević to Skupina 1)
            } else {
              // Fallback: If lower group was empty, keep current Rank 4
              newGroupMembers.push(currentGroupMembers[3]);
            }
          }
        }

        // --- Finalizing Group Members (Crucial for eliminating duplicates) ---

        // Remove duplicates and limit to membersPerGroup
        const uniqueMembers = newGroupMembers
          .filter(
            (member: any, index: number, self: any[]) =>
              index === self.findIndex((m: any) => m.user_id === member.user_id)
          )
          .slice(0, membersPerGroup);

        if (uniqueMembers.length === 0) continue;

        // 4. Create New Group and Insert Members
        const groupColor = currentGroup.color || colors[i % colors.length];
        const groupName =
          uniqueGroupNames[i] || `Grupa ${String.fromCharCode(65 + i)}`;

        const { data: newGroup } = await supabase
          .from("group")
          .insert({
            name: groupName,
            color: groupColor,
            is_deleted: false,
          })
          .select("*");

        if (newGroup && newGroup[0]) {
          const memberInserts = uniqueMembers.map((member: any) => ({
            group_id: newGroup[0].id,
            user_id: member.user_id,
            is_deleted: false,
          }));

          const { error: memberError } = await supabase
            .from("group_member")
            .insert(memberInserts);

          if (memberError) {
            console.error("Error inserting group members:", memberError);
            continue;
          }

          newGroups.push({
            ...newGroup[0],
            members: uniqueMembers,
          });
        }
      }

      await initialize();
    } catch (error) {
      console.error("Error generating groups:", error);
    } finally {
      setLoading(false);
    }
  };

  // const createSchedule = async () => {
  //   const matches = await generateSchedule();
  // };

  return (
    <>
      <Container maxWidth="lg" className="py-6">
        <div className="flex items-center gap-3 mb-6">
          <Group
            sx={{
              color: "primary.main",
            }}
          />
          <Typography variant="h4" className="font-semibold text-gray-800">
            Grupe
          </Typography>
        </div>

        <Box sx={{ mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedMonth}
              onChange={(newValue) => setSelectedMonth(newValue)}
              label="Odaberi mjesec"
              views={["month", "year"]}
              format="MM/YYYY"
            />
          </LocalizationProvider>
        </Box>
        <Button
          sx={{
            mb: 2,
          }}
          variant="contained"
          onClick={() => setShowOnlyMine((oldState) => !oldState)}
        >
          {showOnlyMine ? "Prikaži sve grupe" : "Prikaži samo moju grupu"}
        </Button>
        {isAdmin && (
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => setCreateGroup(true)}
              startIcon={<Create />}
            >
              Kreiraj grupu
            </Button>
            {/* <Button
              variant="outlined"
              onClick={handleGenerateGroups}
              startIcon={<Refresh />}
              disabled={
                !selectedMonth || !selectedMonth.isSame(dayjs(), "month")
              }
            >
              Generiraj grupe
            </Button> */}
          </Box>
        )}
        <div className="flex flex-wrap gap-4">
          {sortBy(groups, "name").map((group) => (
            <Card
              key={group.id}
              className="h-full shadow-md hover:shadow-lg transition-shadow duration-200"
              sx={{
                minWidth: 300,
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Chip
                      label={group.name}
                      variant="filled"
                      sx={{
                        backgroundColor: group.color,
                        color: "white",
                      }}
                      className="font-medium"
                    />
                    <Typography variant="body2" className="text-gray-500">
                      {group.members.length} člana
                    </Typography>
                  </div>
                  {isAdmin && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, group.id!)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </div>

                {group.members && (
                  <div className="flex flex-col gap-2">
                    <Typography
                      variant="subtitle2"
                      className="text-gray-700 font-medium flex items-center gap-1"
                    >
                      <Person fontSize="small" />
                      Članovi skupine:
                    </Typography>
                    <div className="flex flex-col gap-2">
                      {reverse(sortBy(group.members, "points_in_group")).map(
                        (member, index) => (
                          <div
                            key={member.user.user_id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <p className="mx-2 font-semibold">{index + 1}.</p>
                            <Avatar className="w-8 h-8 text-sm bg-blue-500">
                              {member.user.avatar}
                            </Avatar>
                            <div className="min-w-0 flex-1 flex justify-between mx-2">
                              <Typography
                                variant="body2"
                                className="font-medium text-gray-800 truncate"
                              >
                                {member.user.first_name}
                                &nbsp;
                                {member.user.last_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                className="font-medium text-gray-800 truncate"
                              >
                                {member.points_in_group}
                              </Typography>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {isAdmin && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            className="mt-2"
          >
            <MenuItem onClick={() => setIsOpen(true)}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Uredi grupu" />
            </MenuItem>

            <MenuItem onClick={onGroupDelete}>
              <ListItemIcon>
                <Delete fontSize="small" className="text-red-600" />
              </ListItemIcon>
              <ListItemText primary="Obriši grupu" className="text-red-600" />
            </MenuItem>
          </Menu>
        )}
      </Container>
      {selectedGroup && open && (
        <EditGroupModal
          onClose={() => setIsOpen(false)}
          open={open}
          currentMembers={[...selectedGroup.members]}
          name={selectedGroup.name}
          availableMembers={availableMembers}
          onSave={onGroupEdit}
        />
      )}
      {createGroup && (
        <CreateGroupModal
          onClose={() => setCreateGroup(false)}
          open={createGroup}
          availableMembers={availableMembers}
          onSave={onGroupCreate}
        />
      )}
    </>
  );
}
