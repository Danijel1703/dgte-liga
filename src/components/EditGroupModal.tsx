import { UserPlus, Trash2, User } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { TGroupMember, TUser } from "../types";

export interface EditGroupModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  currentMembers: TGroupMember[];
  availableMembers: TUser[];
  onSave: (groupName: string, members: TGroupMember[]) => Promise<void>;
}

const AVATAR_COLORS = [
  "bg-blue-600", "bg-violet-600",
  "bg-emerald-600", "bg-amber-600",
  "bg-rose-600",
];

function PlayerAvatar({ first, last }: { first: string; last: string }) {
  const color = AVATAR_COLORS[(first.charCodeAt(0) + last.charCodeAt(0)) % AVATAR_COLORS.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {first[0]}{last[0]}
    </div>
  );
}

export default function EditGroupModal({
  open, onClose, name, currentMembers, availableMembers, onSave,
}: EditGroupModalProps) {
  const [groupName, setGroupName] = useState(name);
  const [members, setMembers] = useState<TGroupMember[]>(currentMembers);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const filteredAvailable = availableMembers.filter(
    (m) => !members.some((gm) => gm.user_id === m.user_id)
  );

  const handleAddMember = () => {
    if (!selectedUserId) return;
    const user = filteredAvailable.find((u) => u.user_id === selectedUserId);
    if (user) {
      setMembers((prev) => [...prev, { user_id: user.user_id, user }]);
      setSelectedUserId("");
    }
  };

  const handleRemoveMember = (userId: string) => {
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
  };

  const handleSave = async () => {
    await onSave(groupName, members);
    onClose();
  };

  const handleCancel = () => {
    setMembers(currentMembers);
    setSelectedUserId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Uredi Grupu — {groupName}
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">
              {members.length} članova
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Group name */}
          <div className="space-y-2">
            <Label htmlFor="edit-group-name">Ime grupe</Label>
            <Input
              id="edit-group-name"
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <Separator />

          {/* Add member */}
          <div className="space-y-2">
            <Label>Dodaj člana</Label>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v ?? "")}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Izaberi igrača..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredAvailable.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.first_name} {u.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddMember}
                disabled={!selectedUserId}
                className="flex-shrink-0"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Members list */}
          <div className="space-y-2">
            <Label>Trenutni članovi</Label>
            {members.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl py-6 text-center text-muted-foreground text-sm">
                <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Nema članova u grupi
              </div>
            ) : (
              <div className="space-y-0 border rounded-xl overflow-hidden">
                {members.map((member, index) => (
                  <div
                    key={member.user_id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 ${index < members.length - 1 ? "border-b" : ""}`}
                  >
                    <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                    <PlayerAvatar first={member.user.first_name} last={member.user.last_name} />
                    <span className="flex-1 text-sm font-medium">
                      {member.user.first_name} {member.user.last_name}
                    </span>
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Odustani</Button>
          <Button
            onClick={handleSave}
            disabled={!groupName.trim()}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Spremi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
