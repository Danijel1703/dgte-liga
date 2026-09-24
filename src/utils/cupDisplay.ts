import type { TCupStage, TCupStatus } from "../types";

/** Historical cup: groups to 4, playoff to 6. Used when the columns are absent. */
export const DEFAULT_CUP_GROUP_GAMES = 4;
export const DEFAULT_CUP_KNOCKOUT_GAMES = 6;
/** New cups start as one set to 6 in both phases. */
export const NEW_CUP_SET_GAMES = 6;
export const CUP_SET_GAMES_MIN = 1;
export const CUP_SET_GAMES_MAX = 15;

export function resolveCupGroupGames(value: number | null | undefined): number {
  return clampCupSetGames(value, DEFAULT_CUP_GROUP_GAMES);
}

export function resolveCupKnockoutGames(value: number | null | undefined): number {
  return clampCupSetGames(value, DEFAULT_CUP_KNOCKOUT_GAMES);
}

function clampCupSetGames(value: number | null | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(value)) return fallback;
  const n = Math.round(value);
  if (n < CUP_SET_GAMES_MIN || n > CUP_SET_GAMES_MAX) return fallback;
  return n;
}

/** Croatian noun for a game count: 1 gem, 4 gema, 6 gemova. */
export function gemsNoun(count: number): string {
  const abs = Math.abs(Math.trunc(count));
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return "gem";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "gema";
  return "gemova";
}

export function formatCupSetLength(
  groupGames: number | null | undefined,
  knockoutGames: number | null | undefined
): string {
  const group = resolveCupGroupGames(groupGames);
  const knockout = resolveCupKnockoutGames(knockoutGames);
  if (group === knockout) return `set do ${group} ${gemsNoun(group)}`;
  return `skupine do ${group} ${gemsNoun(group)}, playoff do ${knockout} ${gemsNoun(knockout)}`;
}

export const CUP_STAGE_LABELS: Record<TCupStage, string> = {
  group: "Skupina",
  semifinal: "Polufinale",
  final: "Finale",
  third_place: "3. mjesto",
};

/**
 * Croatian long date. Uses Intl rather than dayjs because `dayjs.locale("hr")`
 * is imported in main.tsx but never actually activated — the rest of the app
 * formats Croatian dates through Intl for the same reason.
 */
export function formatCupDate(playedOn: string | null): string {
  if (!playedOn) return "Datum nije određen";
  const date = new Date(playedOn);
  if (Number.isNaN(date.getTime())) return "Datum nije određen";
  return new Intl.DateTimeFormat("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export const CUP_STATUS_BADGE: Record<
  TCupStatus,
  { label: string; className: string }
> = {
  group_stage: { label: "Skupine", className: "bg-muted text-muted-foreground" },
  knockout: { label: "Eliminacije", className: "bg-amber-100 text-amber-700" },
  finished: { label: "Završen", className: "bg-emerald-100 text-emerald-700" },
};

export const CUP_PLACEMENT_MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};
