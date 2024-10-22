import { hexToRgb, TRgb } from "./color.helper";

type TShades = {
  10: TRgb;
  20: TRgb;
  30: TRgb;
  40: TRgb;
  50: TRgb;
  60: TRgb;
  70: TRgb;
  80: TRgb;
  90: TRgb;
  100: TRgb;
  200: TRgb;
  300: TRgb;
  400: TRgb;
  500: TRgb;
  600: TRgb;
  700: TRgb;
  800: TRgb;
  900: TRgb;
};

const calulateShades = (hexValue: string): TShades => {
  const shades: Partial<TShades> = {};

  const { r, g, b } = hexToRgb(hexValue);
  const convertHexToSpecificShade = (shade: number): TRgb => {
    if (shade <= 100) {
      const decimalValue = (100 - shade) / 100;
    }
  };
};

export const resolveGeneralTheme = (resolvedTheme: string | undefined) =>
  resolvedTheme?.includes("light") ? "light" : resolvedTheme?.includes("dark") ? "dark" : "system";
