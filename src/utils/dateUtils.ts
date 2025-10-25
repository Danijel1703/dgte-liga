import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

/**
 * Gets the start and end of a month for filtering
 */
export function getMonthRange(month: Dayjs) {
  return {
    start: month.startOf("month").toISOString(),
    end: month.endOf("month").toISOString(),
  };
}

/**
 * Checks if a date falls within a given month
 */
export function isDateInMonth(date: string | Date, month: Dayjs): boolean {
  return dayjs(date).isBetween(
    month.startOf("month"),
    month.endOf("month"),
    "day",
    "[]"
  );
}

/**
 * Formats a date for display
 */
export function formatDate(
  date: string | Date,
  format: string = "DD.MM.YYYY"
): string {
  return dayjs(date).format(format);
}
