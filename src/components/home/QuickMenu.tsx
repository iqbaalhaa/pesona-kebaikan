"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";

import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MosqueIcon from "@mui/icons-material/Mosque";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  isNew?: boolean;
  soon?: boolean;
  href?: string;
};

const menus: MenuItem[] = [
  {
    label: "Donasi",
    href: "/donasi",
    icon: <VolunteerActivismIcon fontSize="large" color="primary" />,
    isNew: true,
  },
  {
    label: "Zakat",
    soon: true,
    icon: <MosqueIcon fontSize="large" color="primary" />,
  },
  {
    label: "Galang Dana",
    href: "/galang-dana",
    icon: <CampaignIcon fontSize="large" color="primary" />,
  },
  {
    label: "Donasi Otomatis",
    soon: true,
    icon: <EventRepeatIcon fontSize="large" color="primary" />,
  },
];

export default function QuickMenu() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const [snackKey, setSnackKey] = React.useState(0);

  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const toastSoon = (label: string, isSoon?: boolean) => {
    const text = isSoon ? "Coming Soon" : `${label} — fitur segera hadir`;
    setMsg(text);

    // force remount snackbar biar animasinya “restart” walau lagi open
    setSnackKey((k) => k + 1);

    // kalau sebelumnya lagi open, tutup dulu biar berasa “pop” lagi
    setOpen(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(true), 30);
  };

  const handleActivate = (m: MenuItem) => {
    if (m.href) {
      router.push(m.href);
      return;
    }
    toastSoon(m.label, m.soon);
  };

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
        {menus.map((m) => (
          <Box
            key={m.label}
            role="button"
            aria-label={m.label}
            tabIndex={0}
            onClick={() => handleActivate(m)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleActivate(m);
            }}
            sx={{
              textAlign: "center",
              py: 1,
              position: "relative",
              borderRadius: 1,
              cursor: "pointer",
              userSelect: "none",
              transition: "transform 120ms ease, background-color 120ms ease",
              "&:active": { transform: "scale(0.98)" },
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {/* Icon bubble */}
            <Box
              sx={{
                mx: "auto",
                width: 50,
                height: 50,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(97,206,112,0.14)",
                border: "1px solid rgba(97,206,112,0.28)",
                boxShadow: "0 10px 24px rgba(15,23,42,.06)",
                overflow: "hidden",
              }}
            >
              {m.icon}
            </Box>

            {/* Badge SOON / NEW */}
            {(m.soon || m.isNew) && (
              <Box
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 10,
                  bgcolor: m.soon ? "error.main" : "success.main",
                  color: "white",
                  fontSize: "0.5rem",
                  fontWeight: 900,
                  px: 0.45,
                  py: 0.12,
                  borderRadius: 0.6,
                  boxShadow: 1,
                  zIndex: 2,
                }}
              >
                {m.soon ? "SOON" : "NEW"}
              </Box>
            )}

            {/* Label */}
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
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, height: 1, bgcolor: "divider" }} />

      {/* Toast (center screen) */}
      <Snackbar
  key={snackbarAnchor.vertical + snackbarAnchor.horizontal}
  open={open}
  autoHideDuration={2200}
  onClose={() => setOpen(false)}
  anchorOrigin={{ vertical: "top", horizontal: "center" }}
  TransitionComponent={Slide}
  TransitionProps={{ direction: "down" }}
  sx={{
    zIndex: 10000,
    "& .MuiSnackbar-anchorOriginTopCenter": {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      right: "auto",
      bottom: "auto",
    },
  }}
  container={typeof window !== "undefined" ? document.body : undefined}
>
  <Alert
    onClose={() => setOpen(false)}
    severity="info"
    variant="filled"
    sx={{
      borderRadius: 3,
      bgcolor: "text.primary",
      color: "background.paper",
      "& .MuiAlert-icon": { color: "background.paper" },
    }}
  >
    {msg}
  </Alert>
</Snackbar>

    </Box>
  );
}
