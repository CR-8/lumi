import type { PdfcnTheme } from "@/types/pdf-themes";

import { defaultPrimitives } from "./primitives";

/**
 * Lumi's PDF theme: the web app's palette (near-black ink, parchment, one blue accent) set in Inter.
 * Status colors are the accessible darker shades so every badge label clears 4.5:1 on white.
 */
export const lumiTheme: PdfcnTheme = {
  colors: {
    accent: "#0066cc",
    background: "#ffffff",
    border: "#e0e0e0",
    destructive: "#c9252c",
    foreground: "#1d1d1f",
    info: "#0066cc",
    muted: "#f5f5f7",
    mutedForeground: "#595959",
    primary: "#1d1d1f",
    primaryForeground: "#ffffff",
    success: "#1a7f37",
    warning: "#875a00",
  },
  name: "lumi",
  page: {
    orientation: "portrait",
    size: "A4",
  },
  primitives: defaultPrimitives,
  spacing: {
    componentGap: 12,
    page: {
      marginBottom: 48,
      marginLeft: 44,
      marginRight: 44,
      marginTop: 44,
    },
    paragraphGap: 8,
    sectionGap: 22,
  },
  typography: {
    body: {
      fontFamily: "Inter",
      fontSize: 10,
      lineHeight: 1.5,
    },
    heading: {
      fontFamily: "Inter",
      fontSize: {
        h1: 30,
        h2: 18,
        h3: 14,
        h4: 12,
        h5: 11,
        h6: 10,
      },
      fontWeight: 600,
      lineHeight: 1.2,
    },
  },
};
