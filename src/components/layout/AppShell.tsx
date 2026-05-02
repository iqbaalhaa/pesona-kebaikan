"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import SimpleAppBar from "./AppBar";
import SimpleBottomNavigation from "./BottomNavigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isHome = pathname === "/";
	const isAdmin = pathname.startsWith("/admin");
	const isAuth = pathname.startsWith("/auth");
	const isDonasiDetail = pathname.startsWith("/donasi/");
	const isBlogDetail = /^\/blog\/[^/]+$/.test(pathname);
	const isFundraiserGuide = pathname.startsWith("/panduan-fundraiser");
	const isIndependentScreen =
		pathname === "/donasi" ||
		pathname.startsWith("/blog") ||
		pathname === "/donasi-saya" ||
		pathname.startsWith("/donasi-saya/") ||
		pathname.startsWith("/galang-dana") ||
		pathname.startsWith("/profil") ||
		isFundraiserGuide;

	const isGalangDanaBuat = pathname === "/galang-dana/buat";
	const isGalangDanaKategori = pathname === "/galang-dana/kategori";
	const shouldHideNav =
		isAuth || isDonasiDetail || isBlogDetail || isGalangDanaBuat || isGalangDanaKategori || isFundraiserGuide;
	const shouldHideAppBar = shouldHideNav || isIndependentScreen;

	const [scrolled, setScrolled] = React.useState(false);

	React.useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 100);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const appBarVariant = isHome ? (scrolled ? "solid" : "overlay") : "solid";

	if (isAdmin) return <>{children}</>;

	return (
		<div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background sm:max-w-[480px]">
			{!shouldHideAppBar && <SimpleAppBar variant={appBarVariant} />}

			<main
				id="main-content"
				className="no-scrollbar flex-1 bg-[#F8FAFC] dark:bg-background"
				style={{
					paddingBottom: shouldHideNav ? 0 : "3.75rem",
					paddingTop: isHome || shouldHideAppBar ? 0 : "3.5rem",
				}}
			>
				{children}
			</main>

			{!shouldHideNav && <SimpleBottomNavigation />}
		</div>
	);
}
