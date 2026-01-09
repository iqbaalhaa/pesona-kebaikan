"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Backdrop from "@mui/material/Backdrop";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Portal from "@mui/material/Portal";
import { alpha } from "@mui/material/styles";

import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MosqueIcon from "@mui/icons-material/Mosque";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import type { SvgIconComponent } from "@mui/icons-material";

const BRAND = "#61ce70";

type MenuStatus = "new" | "soon";
type MenuItem = {
  id: string;
  label: string;
  href?: string;
  status?: MenuStatus;
  Icon: SvgIconComponent;
};

const MENUS: readonly MenuItem[] = [
  { id: "donasi", label: "Donasi", href: "/donasi", status: "new", Icon: VolunteerActivismIcon },
  { id: "zakat", label: "Zakat", status: "soon", Icon: MosqueIcon },
  { id: "galang-dana", label: "Galang Dana", href: "/galang-dana", Icon: CampaignIcon },
  { id: "donasi-otomatis", label: "Donasi Otomatis", status: "soon", Icon: EventRepeatIcon },
];

export default function QuickMenu() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [toastKey, setToastKey] = React.useState(0);

  const timerRef = React.useRef<number | null>(null);

  const showToast = React.useCallback((text: string) => {
    setMsg(text);
    setToastKey((k) => k + 1); // restart animation
    setOpen(true);
  }, []);

  // auto close (restart tiap kali toastKey berubah)
  React.useEffect(() => {
    if (!open) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(false), 2200);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [open, toastKey]);

  const handleActivate = React.useCallback(
    (m: MenuItem) => {
      if (m.href) {
        router.push(m.href);
        return;
      }
      showToast(`${m.label} — fitur segera hadir`);
    },
    [router, showToast]
  );

  return (
    <Box sx={{ px: 2, mt: 2, position: "relative", zIndex: 2 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary", mb: 1.5 }}>
        Mau berbuat baik apa hari ini?
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 1.25,
          borderRadius: 1,
          bgcolor: "background.paper",
        }}
      >
        {MENUS.map((m) => {
          const content = (
            <ButtonBase
              onClick={() => handleActivate(m)}
              sx={(theme) => ({
                width: "100%",
                textAlign: "center",
                py: 1,
                borderRadius: 1,
                position: "relative",
                display: "block",
                transition: "transform 120ms ease, background-color 120ms ease",
                "&:active": { transform: "scale(0.98)" },
                "&:hover": { backgroundColor: theme.palette.action.hover },
              })}
            >
              <Box
                sx={(theme) => ({
                  mx: "auto",
                  width: 50,
                  height: 50,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.success.main, 0.14),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.28)}`,
                  boxShadow: "0 10px 24px rgba(15,23,42,.06)",
                  overflow: "hidden",
                })}
              >
                <m.Icon fontSize="large" color="primary" />
              </Box>

              {m.status && (
                <Box
                  sx={(theme) => ({
                    position: "absolute",
                    top: 4,
                    right: 10,
                    bgcolor: m.status === "soon" ? theme.palette.error.main : theme.palette.success.main,
                    color: "white",
                    fontSize: "0.5rem",
                    fontWeight: 900,
                    px: 0.45,
                    py: 0.12,
                    borderRadius: 0.6,
                    boxShadow: 1,
                    zIndex: 2,
                  })}
                >
                  {m.status === "soon" ? "SOON" : "NEW"}
                </Box>
              )}

              <Typography
                sx={{
                  mt: 0.9,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "text.primary",
                  lineHeight: 1.2,
                  px: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {m.label}
              </Typography>
            </ButtonBase>
          );

          return m.href ? (
            <Box key={m.id} component={Link} href={m.href} sx={{ textDecoration: "none" }}>
              {content}
            </Box>
          ) : (
            <Box key={m.id}>{content}</Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 2, height: 1, bgcolor: "divider" }} />

      <Portal>
  <Backdrop
    key={toastKey}
    open={open}
    onClick={() => setOpen(false)}
    sx={{
      zIndex: 13000,
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 2,
      // lebih soft, tidak bikin gelap berat
      backgroundColor: alpha("#0f172a", 0.06),
    }}
  >
    <Grow in={open} timeout={160}>
      <Paper
        onClick={(e) => e.stopPropagation()}
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: "background.paper",
          color: "text.primary",
          px: 2,
          py: 1.25,
          minWidth: 220,
          maxWidth: "min(420px, calc(100vw - 32px))",
          display: "flex",
          alignItems: "center",
          gap: 1,
          border: `1px solid ${alpha(BRAND, 0.28)}`,
          boxShadow: "0 14px 34px rgba(15,23,42,.14)",
          position: "relative",
          overflow: "hidden",
          // aksen brand di kiri
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: BRAND,
          },
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1.3, flex: 1 }}>
          {msg}
        </Typography>

        <IconButton
          size="small"
          onClick={() => setOpen(false)}
          sx={{
            color: alpha("#0f172a", 0.7),
            "&:hover": { bgcolor: alpha(BRAND, 0.10) },
          }}
          aria-label="Close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Grow>
  </Backdrop>
</Portal>

    </Box>
  );
}
