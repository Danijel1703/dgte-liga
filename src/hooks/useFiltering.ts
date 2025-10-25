import { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";

/**
 * Custom hook for managing filtering state
 */
export function useFiltering() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [showOnlyMine, setShowOnlyMine] = useState(true);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedMonth(dayjs());
    setShowOnlyMine(true);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedMonth,
    setSelectedMonth,
    showOnlyMine,
    setShowOnlyMine,
    resetFilters,
  };
}

/**
 * Custom hook for filtering data based on search term
 */
export function useSearchFilter<T>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
) {
  return useMemo(() => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(term);
        }
        return false;
      })
    );
  }, [data, searchTerm, searchFields]);
}
