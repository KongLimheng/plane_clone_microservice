/**
 * @description calculates the total number of filters applied
 * @param {T} filters
 * @returns {number}
 */
export const calculateTotalFilters = <T>(filters: T): number =>
  filters && Object.keys(filters).length > 0
    ? Object.keys(filters)
        .map((key) => {
          const value = filters[key as keyof T];
          if (value === null) return 0;
          if (Array.isArray(value)) return value.length;
          if (typeof value === "boolean") return value ? 1 : 0;
          return 0;
        })
        .reduce((curr, prev) => curr + prev, 0)
    : 0;
