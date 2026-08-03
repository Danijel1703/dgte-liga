import type { TCupMatch, TCupStage, TCupStatus } from "../types";

/** Games a cup match is played to: 4 in the group stage, 6 in the knockout. */
export function maxGamesForStage(stage: TCupMatch["stage"]): number {
  return stage === "group" ? 4 : 6;
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
