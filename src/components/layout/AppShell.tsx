"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import SimpleAppBar from "./AppBar";
import SimpleBottomNavigation from "./BottomNavigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

export default function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isHome = pathname === "/";
	const isAdmin = pathname.startsWith("/admin");
	const isAuth = pathname.startsWith("/auth");
	// Hide nav on campaign detail pages (/donasi/[slug]) but not on listing (/donasi)
	// We check startsWith("/donasi/") to match subpaths.
	const isDonasiDetail = pathname.startsWith("/donasi/");

	const shouldHideNav = isAuth || isDonasiDetail;

	const scrollRef = React.useRef<HTMLDivElement | null>(null);
	const [scrolled, setScrolled] = React.useState(false);

	React.useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		const onScroll = () => {
			setScrolled(el.scrollTop > 280);
		};

		onScroll();
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, []);

	const appBarVariant = isHome ? (scrolled ? "solid" : "overlay") : "solid";

	if (isAdmin) {
		return <>{children}</>;
	}

	return (
		<Paper
			elevation={5}
			sx={{
				position: "relative",
				width: "100%",
				maxWidth: { xs: "100%", sm: 480 }, // Full width on mobile, capped on desktop
				height: "100vh",
				maxHeight: { xs: "100vh", sm: "calc(100vh - 6px)" }, // Full screen on mobile, windowed on desktop (minus padding top/bottom)
				borderRadius: { xs: 0, sm: 1 },
				overflow: "hidden",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.default",
				mx: "auto",
				border: { xs: "none", sm: "1px solid rgba(0,0,0,0.08)" },
			}}
		>
			{!shouldHideNav && <SimpleAppBar variant={appBarVariant} />}

			<Box
				ref={scrollRef}
				className="no-scrollbar"
				sx={{
					flex: 1,
					overflowY: "auto",
					background: isHome
						? "linear-gradient(180deg,rgba(255, 255, 255, 1) 0%, rgba(176, 230, 183, 1) 50%, rgba(97, 206, 112, 1) 100%)"
						: "var(--background)",
					pb: shouldHideNav ? 0 : 7, // Space for bottom nav
					pt: isHome || shouldHideNav ? 0 : 8, // Add space under AppBar for solid variant (Toolbar ~64px)
				}}
			>
				{children}
			</Box>

			{!shouldHideNav && <SimpleBottomNavigation />}
		</Paper>
	);
}
