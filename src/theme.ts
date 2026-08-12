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
        color: "primary" as const,
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
    // Applies to every MUI <Dialog> app-wide (admin panel is almost entirely
    // MUI) — previously each dialog was a bare white rectangle with no
    // depth. Individual dialogs can still override via PaperProps/sx; this
    // just raises the shared baseline instead of every dialog needing its
    // own polish.
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow:
            "0 24px 60px -12px rgba(15,23,42,0.35), 0 8px 24px -8px rgba(15,23,42,0.12)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          padding: "22px 24px 16px",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "4px 24px 20px",
        },
        dividers: {
          borderColor: "rgba(15,23,42,0.08)",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "14px 24px",
          gap: 8,
          borderTop: "1px solid rgba(15,23,42,0.06)",
          backgroundColor: "#f8fafc",
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
