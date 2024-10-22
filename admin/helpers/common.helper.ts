export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL || "";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "";
export const resolveGeneralTheme = (resolvedTheme: string | undefined) =>
  resolvedTheme?.includes("light") ? "light" : resolvedTheme?.includes("dark") ? "dark" : "system";
