"use client";

import React, { useState } from "react";
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
import Badge from "@mui/material/Badge";
import Link from "next/link";

export default function AdminHeader() {
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const [anchorElSettings, setAnchorElSettings] = useState<null | HTMLElement>(null);

  const openProfile = Boolean(anchorElProfile);
  const openNotif = Boolean(anchorElNotif);
  const openSettings = Boolean(anchorElSettings);

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

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSettings(event.currentTarget);
  };
  const handleSettingsClose = () => {
    setAnchorElSettings(null);
  };

  return (
    <div className="sticky top-0 z-10">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-3 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-[#0b1324] px-3 py-2 border border-gray-200 dark:border-gray-800">
            <SearchIcon fontSize="small" className="text-gray-500 dark:text-gray-400" />
            <input
              placeholder="Search"
              className="w-full bg-transparent text-base outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotifClick}
              size="small"
              aria-controls={openNotif ? "notifications-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openNotif ? "true" : undefined}
              className="!h-9 !w-9 !rounded-lg !border !border-gray-200 dark:!border-gray-800 hover:!bg-gray-50 dark:hover:!bg-[#0b1324]"
            >
              <Badge color="error" variant="dot">
                <NotificationsNoneIcon fontSize="small" className="text-gray-700 dark:text-gray-300" />
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
            <MenuItem onClick={handleNotifClose}>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">New Campaign Created</span>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
            </MenuItem>
            <MenuItem onClick={handleNotifClose}>
               <div className="flex flex-col">
                <span className="font-semibold text-sm">Donation Received</span>
                <span className="text-xs text-gray-500">5 minutes ago</span>
              </div>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotifClose} sx={{ justifyContent: "center", fontSize: "0.875rem", color: "primary.main" }}>
              View all notifications
            </MenuItem>
          </Menu>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              onClick={handleSettingsClick}
              size="small"
              aria-controls={openSettings ? "settings-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openSettings ? "true" : undefined}
              className="!h-9 !w-9 !rounded-lg !border !border-gray-200 dark:!border-gray-800 hover:!bg-gray-50 dark:hover:!bg-[#0b1324]"
            >
              <SettingsOutlinedIcon fontSize="small" className="text-gray-700 dark:text-gray-300" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElSettings}
            id="settings-menu"
            open={openSettings}
            onClose={handleSettingsClose}
            onClick={handleSettingsClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
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
             <MenuItem onClick={handleSettingsClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              General Settings
            </MenuItem>
            <MenuItem onClick={handleSettingsClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Account Settings
            </MenuItem>
          </Menu>

          {/* Avatar Profile */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileClick}
              size="small"
              sx={{ ml: 0 }}
              aria-controls={openProfile ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openProfile ? "true" : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }} />
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
              <Avatar /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleProfileClose}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
}
