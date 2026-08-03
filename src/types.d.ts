
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
  paid: boolean;
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
  gems_in_group?: number;
  gem_difference?: number;
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
  created_at: string;
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
  round?: number;
  is_deleted: boolean;
  created_at?: string;
  group?: {
    group_member: Array<{ is_deleted: boolean; user_id: string }>;
  };
};

/**
 * Defines the structure for an Announcement.
 */
export type TAnnouncement = {
  id?: string;
  text: string;
  created_at?: string;
};

/**
 * Stage of a cup match. "group" is the round-robin phase, everything else
 * is the knockout phase.
 */
export type TCupStage = "group" | "semifinal" | "final" | "third_place";

/**
 * Lifecycle of a cup event.
 */
export type TCupStatus = "group_stage" | "knockout" | "finished";

/**
 * Defines the structure for a Cup event (a one-off tournament).
 */
export type TCup = {
  id?: string;
  name: string;
  played_on: string | null;
  status: TCupStatus;
  is_deleted: boolean;
  created_at?: string;
};

/**
 * Defines the structure for a "Skupina" inside a Cup.
 */
export type TCupGroup = {
  id?: string;
  cup_id: string;
  name: string;
  color: string;
  sort_order: number;
  is_deleted: boolean;
  created_at?: string;
  members: TCupGroupMember[];
};

/**
 * Membership in a cup group. Being on this list IS participation in the cup,
 * which is what earns the participation point.
 */
export type TCupGroupMember = {
  id?: string;
  cup_group_id: string;
  user_id: string;
  is_deleted: boolean;
  created_at?: string;
  user?: TUser;
};

/**
 * Defines the structure for a Cup match.
 *
 * A cup match is a single set, so games are flat columns rather than the
 * league's `sets` array. Both game columns are nullable: null means "no score
 * recorded", a legal state for knockout matches. `winner_id` is authoritative
 * and never derived from the score — that is what makes a score-less final and
 * a tied group match decided by tie-break both representable.
 */
export type TCupMatch = {
  id?: string;
  cup_id: string;
  cup_group_id: string | null;
  stage: TCupStage;
  round: number | null;
  slot: number | null;
  player_one_id: string | null;
  player_two_id: string | null;
  player_one_games: number | null;
  player_two_games: number | null;
  winner_id: string | null;
  status: TStatus;
  is_surrender: boolean;
  is_deleted: boolean;
  created_at?: string;
};
