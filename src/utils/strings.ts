/**
 * Normalizes Croatian diacritical characters to their ASCII equivalents.
 * Used for generating email addresses and passwords from Croatian names.
 */
export function normalizeCroatianChars(text: string): string {
  if (!text) {
    return "";
  }

  // Step 1: Handle Digraphs (DŽ, LJ, NJ) first.
  let normalizedText = text;

  normalizedText = normalizedText
    .replace(/DŽ/g, "DZ")
    .replace(/Dž/g, "Dz")
    .replace(/dž/g, "dz")
    .replace(/LJ/g, "LJ")
    .replace(/Lj/g, "Lj")
    .replace(/lj/g, "lj")
    .replace(/NJ/g, "NJ")
    .replace(/Nj/g, "Nj")
    .replace(/nj/g, "nj");

  // Step 2: Handle single-character diacritics (Č, Ć, Š, Ž, Đ)
  const singleCharMap: { [key: string]: string } = {
    Č: "C",
    č: "c",
    Ć: "C",
    ć: "c",
    Š: "S",
    š: "s",
    Ž: "Z",
    ž: "z",
    Đ: "D",
    đ: "d",
  };

  const charRegex = /[ČčĆćŠšŽžĐđ]/g;
  normalizedText = normalizedText.replace(charRegex, (match: string) => {
    return singleCharMap[match];
  });

  return normalizedText;
}
