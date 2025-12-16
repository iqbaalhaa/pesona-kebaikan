"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import AdbIcon from "@mui/icons-material/Adb";
import Typography from "@mui/material/Typography";

export default function SimpleAppBar() {
  const [searchValue, setSearchValue] = React.useState("");

  return (
    <AppBar position="static" sx={{ backgroundColor: "#fff", color: "#000", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <Toolbar>
        {/* Logo Brand */}
        <AdbIcon sx={{ mr: 1, color: "#1976d2" }} />
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: "#1976d2", mr: 2 }}>
          LOGO
        </Typography>

        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <TextField
            size="small"
            placeholder="Cari..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{
              width: "100%",
              maxWidth: 300,
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                border: "none",
              },
            }}
          />
        </Box>

        {/* Notification Icon */}
        <IconButton color="inherit">
          <Badge badgeContent={3} color="error">
            <NotificationsIcon sx={{ color: "#000" }} />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
