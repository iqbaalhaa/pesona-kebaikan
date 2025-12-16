"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ArticleIcon from "@mui/icons-material/Article";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonIcon from "@mui/icons-material/Person";

const menus = [
  { label: "Donasi", path: "/", icon: <VolunteerActivismIcon /> },
  { label: "Blog", path: "/blog", icon: <ArticleIcon /> },
  { label: "Donasi Saya", path: "/donasi-saya", icon: <ReceiptLongIcon /> },
  { label: "Galang Dana", path: "/galang-dana", icon: <CampaignIcon /> },
  { label: "Profil", path: "/profil", icon: <PersonIcon /> },
];

export default function SimpleBottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = menus.findIndex((menu) => pathname.startsWith(menu.path));

  return (
    <Box>
      <BottomNavigation
        showLabels
        value={currentIndex === -1 ? 0 : currentIndex}
        onChange={(event, newValue) => {
          router.push(menus[newValue].path);
        }}
      >
        {menus.map((menu) => (
          <BottomNavigationAction key={menu.path} label={menu.label} icon={menu.icon} />
        ))}
      </BottomNavigation>
    </Box>
  );
}
