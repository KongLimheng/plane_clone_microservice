import { differenceInCalendarDays, format, formatDate, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { isNumber } from "lodash";

/**
 * @returns {string | null} formatted date in the format of yyyy-mm-dd to be used in payload
 * @description Returns date in the formatted format to be used in payload
 * @param {Date | string} date
 * @example renderFormattedPayloadDate("Jan 01, 20224") // "2024-01-01"
 */
export const renderFormattedPayloadDate = (date: Date | string | undefined | null): string | undefined => {
  // Parse the date to check if it is valid
  const parsedDate = getDate(date);
  // return if undefined
  if (!parsedDate) return;
  // Check if the parsed date is valid before formatting
  if (!isValid(parsedDate)) return; // Return null for invalid dates
  // Format the date in payload format (yyyy-mm-dd)
  const formattedDate = format(parsedDate, "yyyy-MM-dd");
  return formattedDate;
};

// Format Date Helpers
/**
 * @returns {string | null} formatted date in the desired format or platform default format (MMM dd, yyyy)
 * @description Returns date in the formatted format
 * @param {Date | string} date
 * @param {string} formatToken (optional) // default MMM dd, yyyy
 * @example renderFormattedDate("2024-01-01", "MM-DD-YYYY") // Jan 01, 2024
 * @example renderFormattedDate("2024-01-01") // Jan 01, 2024
 */
export const renderFormattedDate = (
  date: string | Date | undefined | null,
  formatToken: string = "MMM dd, yyyy"
): string | undefined => {
  // Parse the date to check if it is valid
  const parsedDate = getDate(date);
  // return if undefined
  if (!parsedDate) return;
  // Check if the parsed date is valid before formatting
  if (!isValid(parsedDate)) return; // Return null for invalid dates
  let formattedDate;
  try {
    // Format the date in the format provided or default format (MMM dd, yyyy)
    formattedDate = format(parsedDate, formatToken);
  } catch (e) {
    // Format the date in format (MMM dd, yyyy) in case of any error
    formattedDate = format(parsedDate, "MMM dd, yyyy");
  }
  return formattedDate;
};

/**
 * This method returns a date from string of type yyyy-mm-dd
 * This method is recommended to use instead of new Date() as this does not introduce any timezone offsets
 * @param date
 * @returns date or undefined
 */
export const getDate = (date: string | Date | undefined | null): Date | undefined => {
  try {
    if (!date || date === "") return;

    if (typeof date !== "string" && !(date instanceof String)) return date;

    const [yearString, monthString, dayString] = date.substring(0, 10).split("-");
    const year = parseInt(yearString);
    const month = parseInt(monthString);
    const day = parseInt(dayString);
    if (!isNumber(year) || !isNumber(month) || !isNumber(day)) return;

    return new Date(year, month - 1, day);
  } catch (e) {
    return undefined;
  }
};

export const isInDateFormat = (date: string) => {
  if (!date) return;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return datePattern.test(date);
};

/**
 * @description checks if the date satisfies the filter
 * @param {Date} date
 * @param {string} filter
 * @returns {boolean}
 */
export const satisfiesDateFilter = (date: Date, filter: string): boolean => {
  const [value, operator, from] = filter.split(";");

  const dateValue = getDate(value);
  const differenceInDays = differenceInCalendarDays(date, new Date());

  if (operator === "custom" && from === "custom") {
    if (value === "today") return differenceInDays === 0;
    if (value === "yesterday") return differenceInDays === -1;
    if (value === "last_7_days") return differenceInDays >= -7;
    if (value === "last_30_days") return differenceInDays >= -30;
  }

  if (!from && dateValue) {
    if (operator === "after") return date >= dateValue;
    if (operator === "before") return date <= dateValue;
  }

  if (from === "fromnow") {
    if (operator === "before") {
      if (value === "1_weeks") return differenceInDays <= -7;
      if (value === "2_weeks") return differenceInDays <= -14;
      if (value === "1_months") return differenceInDays <= -30;
    }

    if (operator === "after") {
      if (value === "1_weeks") return differenceInDays >= 7;
      if (value === "2_weeks") return differenceInDays >= 14;
      if (value === "1_months") return differenceInDays >= 30;
      if (value === "2_months") return differenceInDays >= 60;
    }
  }

  return false;
};

// Time Difference Helpers
/**
 * @returns {string} formatted date in the form of amount of time passed since the event happened
 * @description Returns time passed since the event happened
 * @param {string | Date} time
 * @example calculateTimeAgo("2023-01-01") // 1 year ago
 */
export const calculateTimeAgo = (time: string | number | Date | null): string => {
  if (!time) return "";
  // Parse the time to check if it is valid
  const parsedTime = typeof time === "string" || typeof time === "number" ? parseISO(String(time)) : time;
  // return if undefined
  if (!parsedTime) return ""; // Return empty string for invalid dates
  // Format the time in the form of amount of time passed since the event happened
  const distance = formatDistanceToNow(parsedTime, { addSuffix: true });

  console.log(distance);
  return distance;
};

/**
 * get current Date time in UTC ISO format
 * @returns
 */
export const getCurrentDateTimeInISO = () => {
  const date = new Date();
  return date.toISOString();
};

/**
 * returns the date string in ISO format regardless of the timezone in input date string
 * @param dateString
 * @returns
 */
export const convertToISODateString = (dateString: string | undefined) => {
  if (!dateString) return dateString;

  const date = new Date(dateString);
  return date.toISOString();
};

export function calculateTimeAgoShort(date: string | number | Date | null): string {
  if (!date) {
    return "";
  }

  const parsedDate = typeof date === "string" ? parseISO(date) : new Date(date);
  const now = new Date();
  const diffInSeconds = (now.getTime() - parsedDate.getTime()) / 1000;

  if (diffInSeconds < 60) {
    return `${Math.floor(diffInSeconds)}s`;
  }

  const diffInMinutes = diffInSeconds / 60;
  if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m`;
  }

  const diffInHours = diffInMinutes / 60;
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  }

  const diffInDays = diffInHours / 24;
  if (diffInDays < 30) {
    return `${Math.floor(diffInDays)}d`;
  }

  const diffInMonths = diffInDays / 30;
  if (diffInMonths < 12) {
    return `${Math.floor(diffInMonths)}mo`;
  }

  const diffInYears = diffInMonths / 12;
  return `${Math.floor(diffInYears)}y`;
}
