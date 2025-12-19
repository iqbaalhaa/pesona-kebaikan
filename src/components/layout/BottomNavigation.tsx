"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
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

function isActive(pathname: string, path: string) {
	if (path === "/") return pathname === "/";
	return pathname === path || pathname.startsWith(path + "/");
}

export default function SimpleBottomNavigation() {
	const router = useRouter();
	const pathname = usePathname();

	const ref = React.useRef<HTMLDivElement | null>(null);

	const currentIndex = React.useMemo(() => {
		const idx = menus.findIndex((m) => isActive(pathname, m.path));
		return idx === -1 ? 0 : idx;
	}, [pathname]);

	// ✅ ukur tinggi navbar & simpan ke CSS var global: --bottom-nav-h
	React.useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		const setVar = () => {
			const h = el.getBoundingClientRect().height || 64;
			document.documentElement.style.setProperty(
				"--bottom-nav-h",
				`${Math.ceil(h)}px`
			);
		};

		setVar();

		const ro = new ResizeObserver(() => setVar());
		ro.observe(el);

		window.addEventListener("resize", setVar);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", setVar);
		};
	}, []);

	return (
		<Paper
			ref={ref}
			elevation={0}
			className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[480px] overflow-hidden pb-[env(safe-area-inset-bottom)]"
			sx={{
				// ✅ jangan 1300 biar gak tabrakan sama modal MUI (modal default 1300)
				zIndex: 1100,
				borderTop: "1px solid rgba(0,0,0,0.12)",
				borderTopLeftRadius: 16,
				borderTopRightRadius: 16,
				bgcolor: "#ffffff",
				boxShadow: "0 -5px 20px rgba(0,0,0,0.1)",
			}}
		>
			<BottomNavigation
				showLabels
				value={currentIndex}
				onChange={(_, newValue) => router.push(menus[newValue].path)}
				className="bottom-nav"
			>
				{menus.map((menu) => (
					<BottomNavigationAction
						key={menu.path}
						label={menu.label}
						icon={menu.icon}
					/>
				))}
			</BottomNavigation>
		</Paper>
	);
}
