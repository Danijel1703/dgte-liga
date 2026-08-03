import { UserPlus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
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
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { TUser } from "../types";

export type TCupGroupDraftMember = {
  user_id: string;
  user: TUser;
};

export interface CupGroupModalProps {
  open: boolean;
  onClose: () => void;
  /** Omit for a new group. */
  name?: string;
  currentMembers?: TCupGroupDraftMember[];
  /** Players not already assigned to another group of this cup. */
  availableMembers: TUser[];
  onSave: (groupName: string, members: TCupGroupDraftMember[]) => Promise<void>;
}

/**
 * Assigns cup participants to a "Skupina". Membership here IS participation in
 * the cup, so this single step covers both picking participants and grouping
 * them — `availableMembers` is what constrains participants to league players.
 */
export default function CupGroupModal({
  open,
  onClose,
  name = "",
  currentMembers = [],
  availableMembers,
  onSave,
}: CupGroupModalProps) {
  const [groupName, setGroupName] = useState(name);
  const [members, setMembers] = useState<TCupGroupDraftMember[]>(currentMembers);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGroupName(name);
    setMembers(currentMembers);
    setSelectedUserId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    if (!groupName.trim()) return;
    setSaving(true);
    try {
      await onSave(groupName.trim(), members);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setMembers(currentMembers);
    setSelectedUserId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {name ? `Skupina — ${groupName}` : "Nova skupina"}
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">
              {members.length} sudionika
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="cup-group-name">Ime skupine</Label>
            <Input
              id="cup-group-name"
              autoFocus
              placeholder="npr. Skupina 1"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Dodaj sudionika</Label>
            <div className="flex gap-2">
              <Select
                value={selectedUserId}
                onValueChange={(v) => setSelectedUserId(v ?? "")}
              >
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

          <div className="space-y-2">
            <Label>Sudionici skupine</Label>
            {members.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl py-6 text-center text-muted-foreground text-sm">
                <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Nema sudionika u skupini
              </div>
            ) : (
              <div className="space-y-0 border rounded-xl overflow-hidden">
                {members.map((member, index) => (
                  <div
                    key={member.user_id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 ${
                      index < members.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}.
                    </span>
                    <PlayerAvatar
                      firstName={member.user.first_name}
                      lastName={member.user.last_name}
                    />
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
          <Button variant="outline" onClick={handleCancel}>
            Odustani
          </Button>
          <Button
            onClick={handleSave}
            disabled={!groupName.trim() || saving}
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
