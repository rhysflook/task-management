import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./stores/store.js";
import { Provider } from "react-redux";
import {
  createTheme,
  ThemeProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from "@mui/material/styles";
import {
  CssVarsProvider as JoyCssVarsProvider,
  extendTheme as extendJoyTheme,
} from "@mui/joy/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./echo"

/** 🎨 Diverse, clinical-friendly palette:
 *  - Primary: Teal (calm, clean)
 *  - Secondary: Plum (rich accent)
 *  - Success: Emerald, Warning: Amber, Danger: Rose, Info: Sky
 *  - Neutral: Slate
 */
const joyTheme = extendJoyTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1400,
      xl: 1536,
    },
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50:  "#e6fffb",
          100: "#bff7f3",
          200: "#99efe9",
          300: "#67dfd9",
          400: "#34c8c3",
          500: "#0ea5a6", // main teal
          600: "#0b8e8f",
          700: "#0a7677",
          800: "#085f60",
          900: "#074e4f",
          solidBg: "#0ea5a6",
          solidHoverBg: "#0b8e8f",
          solidActiveBg: "#0a7677",
          softBg: "#e6fffb",
          softColor: "#0b5b5c",
        },
        secondary: {
          50:  "#f3e8ff",
          100: "#e9d5ff",
          200: "#d8b4fe",
          300: "#c084fc",
          400: "#a855f7",
          500: "#7c3aed", // plum
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b1573",
          solidBg: "#7c3aed",
          solidHoverBg: "#6d28d9",
          solidActiveBg: "#5b21b6",
          softBg: "#f3e8ff",
          softColor: "#4c1d95",
        },
        success: {
          500: "#16a34a",
          solidBg: "#16a34a",
          softBg: "#eaf7ee",
        },
        warning: {
          500: "#f59e0b",
          solidBg: "#f59e0b",
          softBg: "#fff7e6",
        },
        danger: {
          500: "#e11d48",
          solidBg: "#e11d48",
          softBg: "#ffe9ee",
        },
        info: {
          500: "#0ea5e9",
          solidBg: "#0ea5e9",
          softBg: "#e6f7ff",
        },
        neutral: {
          50: "#fafbfc",
          100: "#f4f6f8",
          200: "#e9ecef",
          300: "#d9dde2",
          400: "#bfc6ce",
          500: "#8b939c",
          600: "#6b737c",
          700: "#4f5560",
          800: "#383e47",
          900: "#1f242b",
        },
        background: {
          body: "#f7f9fb",
          surface: "#ffffff",
          popup: "#ffffff",
          level1: "#fafbfc",
          level2: "#f4f6f8",
        },
        text: {
          primary: "#1f2a36",
          secondary: "#5a6570",
          tertiary: "#7a8590",
        },
      },
    },
    dark: {
      palette: {
        primary: { solidBg: "#22d3d6", solidHoverBg: "#14b8bc", solidActiveBg: "#0ea5a6" },
        secondary: { solidBg: "#a78bfa" },
        background: { body: "#0f1418", surface: "#171c21", level1: "#1b2127" },
        text: { primary: "#e4e8eb", secondary: "#a9b1b8", tertiary: "#8d97a1" },
        neutral: { 800: "#2a3138", 900: "#171c21" },
      },
    },
  },
  fontFamily: {
    body: '"Inter","Noto Sans JP","Helvetica","Arial",sans-serif',
  },
  components: {
    JoyFormLabel: {
      styleOverrides: {
        root: {
          userSelect: 'text',
        },
      },
    },
  },
});

/** MUI palette coordinated with Joy */
const materialTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0ea5a6", light: "#67dfd9", dark: "#0a7677", contrastText: "#fff" },
    secondary: { main: "#7c3aed", light: "#a855f7", dark: "#5b21b6", contrastText: "#fff" },
    success: { main: "#16a34a" },
    warning: { main: "#f59e0b" },
    error:   { main: "#e11d48" },
    info:    { main: "#0ea5e9" },
    background: { default: "#f7f9fb", paper: "#ffffff" },
    text: { primary: "#1f2a36", secondary: "#5a6570" },
    divider: "rgba(2, 6, 12, 0.08)",
  },
  typography: {
    fontFamily: `"Inter","Noto Sans JP","Helvetica","Arial",sans-serif`,
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: "6px 16px", boxShadow: "none" },
        containedPrimary: { "&:hover": { boxShadow: "0 0 0 2px rgba(14,165,166,0.2)" } },
      },
    },
    MuiPaper: { styleOverrides: { root: { boxShadow: "0 2px 6px rgba(0,0,0,0.05)" } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: "0 2px 10px rgba(0,0,0,0.06)" } } },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider theme={joyTheme} defaultMode="light">
        <CssBaseline enableColorScheme />
        <Provider store={store}>
          <App />
        </Provider>
      </JoyCssVarsProvider>
    </ThemeProvider>
  </StrictMode>
);
