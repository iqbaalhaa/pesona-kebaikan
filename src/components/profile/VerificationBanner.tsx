"use client";

import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function VerificationBanner({ onClick }: { onClick: () => void }) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        bgcolor: "#f0fdf4",
        borderColor: "#bbf7d0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": { bgcolor: "#dcfce7" },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #bbf7d0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <VerifiedUserIcon sx={{ color: "#0ba976" }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#166534" }}>
            Verifikasi Akun
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#15803d" }}>
            Lengkapi data diri Anda
          </Typography>
        </Box>
      </Box>
      <ChevronRightIcon sx={{ fontSize: 20, color: "#15803d" }} />
    </Paper>
  );
}

