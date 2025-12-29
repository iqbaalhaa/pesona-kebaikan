"use client";

import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function ProfileMenu({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        "&:hover": {
          bgcolor: danger ? "rgba(239,68,68,0.08)" : "rgba(0,0,0,0.04)",
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 40,
          color: danger ? "#ef4444" : "rgba(15,23,42,0.6)",
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontSize: 14,
          fontWeight: 600,
          color: danger ? "#ef4444" : "#0f172a",
        }}
      />
      <ChevronRightIcon sx={{ fontSize: 20, color: "rgba(15,23,42,0.3)" }} />
    </ListItemButton>
  );
}

