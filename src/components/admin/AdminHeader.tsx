"use client";

import React, { useState, useContext } from "react";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu"; // Hamburger
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Badge from "@mui/material/Badge";
import Link from "next/link";
import { ColorModeContext } from "@/components/layout/ThemeWrapper";
import { useTheme } from "@mui/material/styles";
import { signOut } from "next-auth/react";

export default function AdminHeader({
  onMobileToggle,
}: {
  onMobileToggle: () => void;
}) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(
    null
  );
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);

  const openProfile = Boolean(anchorElProfile);
  const openNotif = Boolean(anchorElNotif);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElProfile(event.currentTarget);
  };
  const handleProfileClose = () => {
    setAnchorElProfile(null);
  };

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotif(event.currentTarget);
  };
  const handleNotifClose = () => {
    setAnchorElNotif(null);
  };

  return (
    <div className="sticky top-0 z-10 mb-6">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-3 shadow-sm flex items-center gap-3">
        {/* Mobile Hamburger */}
        <IconButton
          onClick={onMobileToggle}
          className="lg:hidden text-gray-500 dark:text-gray-400"
        >
          <MenuIcon />
        </IconButton>

        {/* Search Bar */}
        <div className="flex-1 flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-[#0b1324] px-3 py-2 border border-gray-200 dark:border-gray-800">
          <SearchIcon
            fontSize="small"
            className="text-gray-500 dark:text-gray-400"
          />
          <input
            placeholder="Cari"
            className="w-full bg-transparent text-base outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Theme Toggle */}
        <Tooltip title="Ubah Tema">
          <IconButton
            onClick={colorMode.toggleColorMode}
            size="small"
            className="!h-9 !w-9 !rounded-lg !border !border-gray-200 dark:!border-gray-800 hover:!bg-gray-50 dark:hover:!bg-[#0b1324]"
          >
            {theme.palette.mode === "dark" ? (
              <LightModeIcon fontSize="small" className="text-yellow-400" />
            ) : (
              <DarkModeIcon
                fontSize="small"
                className="text-gray-700 dark:text-gray-300"
              />
            )}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifikasi">
          <IconButton
            onClick={handleNotifClick}
            size="small"
            aria-controls={openNotif ? "notifications-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openNotif ? "true" : undefined}
            className="!h-9 !w-9 !rounded-lg !border !border-gray-200 dark:!border-gray-800 hover:!bg-gray-50 dark:hover:!bg-[#0b1324]"
          >
            <Badge color="error" variant="dot">
              <NotificationsNoneIcon
                fontSize="small"
                className="text-gray-700 dark:text-gray-300"
              />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorElNotif}
          id="notifications-menu"
          open={openNotif}
          onClose={handleNotifClose}
          onClick={handleNotifClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleNotifClose}>Tidak ada notifikasi baru</MenuItem>
        </Menu>

        {/* Profile */}
        <Tooltip title="Pengaturan akun">
          <IconButton
            onClick={handleProfileClick}
            size="small"
            sx={{ ml: 0.5 }}
            aria-controls={openProfile ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openProfile ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorElProfile}
          id="account-menu"
          open={openProfile}
          onClose={handleProfileClose}
          onClick={handleProfileClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleProfileClose}>
            <Avatar /> Profil
          </MenuItem>
          <MenuItem onClick={handleProfileClose}>
            <Avatar /> Akun saya
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleProfileClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Tambah akun lain
          </MenuItem>
          <MenuItem onClick={handleProfileClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Pengaturan
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleProfileClose();
              signOut();
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Keluar
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
