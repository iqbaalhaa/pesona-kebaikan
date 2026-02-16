"use client";

import { createTheme, alpha } from "@mui/material/styles";

const PRIMARY_COLOR = "#0ba976";

const baseTheme = {
  typography: {
    fontFamily: "var(--font-pjs)",
    allVariants: {
      letterSpacing: "-0.015em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        color: "primary",
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 8,
        },
        contained: {
          backgroundColor: PRIMARY_COLOR,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: alpha(PRIMARY_COLOR, 0.85),
          },
          "&:disabled": {
            backgroundColor: alpha(PRIMARY_COLOR, 0.4),
            color: "#ffffff",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
    primary: {
      main: PRIMARY_COLOR,
      light: alpha(PRIMARY_COLOR, 0.5),
      dark: alpha(PRIMARY_COLOR, 0.9),
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc", // slate-50
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // slate-900
      secondary: "rgba(15, 23, 42, 0.55)",
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: {
      main: PRIMARY_COLOR,
      light: alpha(PRIMARY_COLOR, 0.5),
      dark: alpha(PRIMARY_COLOR, 0.9),
      contrastText: "#000000",
    },
    background: {
      default: "#0b1220",
      paper: "rgba(11, 18, 32, 0.85)",
    },
    text: {
      primary: "#f8fafc",
      secondary: "rgba(248, 250, 252, 0.6)",
    },
  },
});
