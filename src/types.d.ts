import type { Timestamp } from "firebase/firestore";

export interface EditGroupModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  currentMembers: TGroupMember[];
  availableMembers: TUser[];
  onSave: (groupName: string, members: TGroupMember[]) => Promise<void>;
}

export interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  availableMembers: TUser[];
  onSave: (groupName: string, members: TGroupMember[]) => Promise<void>;
}

/**
 * Defines the core structure for a User profile.
 */
export type TUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar: string;
  email: string;
  phone: string;
  is_admin: boolean;
  is_viewer: boolean;
  is_deleted: boolean;
};

/**
 * Defines the status for a Match.
 */
export type TStatus = "waiting" | "played" | "surrendered";

/**
 * Defines the structure for a Group member with group-specific data.
 */
export type TGroupMember = {
  user_id: string;
  points_in_group?: number;
  user: TUser;
};

/**
 * Defines the structure for a Group.
 */
export type TGroup = {
  id?: string;
  name: string;
  member_ids: string[];
  members: Array<TGroupMember>;
  created_at: Timestamp;
  color: string;
  is_deleted: boolean;
  match: Array<TMatch>;
};

/**
 * Defines the structure for a single Set within a Match.
 */
export type TSet = {
  set_number: number;
  player_one_games: number;
  player_two_games: number;
};

/**
 * Defines the structure for a Match.
 */
export type TMatch = {
  id?: string;
  player_one_id: string;
  player_two_id: string;
  sets: TSet[];
  winner_id: string | null;
  status: TStatus;
  group_id: string;
  is_surrender: boolean;
  is_deleted: boolean;
  created_at?: Timestamp;
};
