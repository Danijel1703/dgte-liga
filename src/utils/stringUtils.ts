/**
 * Normalizes Croatian characters to ASCII equivalents
 * Used for email normalization in authentication
 */
export function normalizeCroatianChars(text: string): string {
  const croatianChars: { [key: string]: string } = {
    č: "c",
    ć: "c",
    đ: "d",
    š: "s",
    ž: "z",
    Č: "C",
    Ć: "C",
    Đ: "D",
    Š: "S",
    Ž: "Z",
  };

  return text.replace(
    /[čćđšžČĆĐŠŽ]/g,
    (match) => croatianChars[match] || match
  );
}

/**
 * Formats a date string to Croatian locale format
 */
export function formatDateToCroatian(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/**
 * Capitalizes the first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
