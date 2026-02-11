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

	const [scrolled, setScrolled] = React.useState(false);

	React.useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 100);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const appBarVariant = isHome ? (scrolled ? "solid" : "overlay") : "solid";

	if (isAdmin) {
		return <>{children}</>;
	}

	return (
		<Paper
			elevation={0}
			sx={{
				position: "relative",
				width: "100%",
				maxWidth: { xs: "100%", sm: 480 }, // Full width on mobile, capped on desktop
				minHeight: "100dvh",
				borderRadius: { xs: 0, sm: 0 },
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.default",
				mx: "auto",
				border: "none",
			}}
		>
			{!shouldHideNav && <SimpleAppBar variant={appBarVariant} />}

			<Box
				className="no-scrollbar"
				sx={{
					flex: 1,
					backgroundColor: "#F8FAFC",
					pb: shouldHideNav ? 0 : 12, // Space for bottom nav (increased to avoid cutoff)
					pt: isHome || shouldHideNav ? 0 : 8, // Add space under AppBar for solid variant (Toolbar ~64px)
				}}
			>
				{children}
			</Box>

			{!shouldHideNav && <SimpleBottomNavigation />}
		</Paper>
	);
}
