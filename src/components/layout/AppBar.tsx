"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCampaigns } from "@/actions/campaign";
import SearchDropdown from "@/components/ui/SearchDropdown";
import NotificationPopover from "@/components/ui/NotificationPopover";

interface SimpleAppBarProps {
	variant?: "solid" | "overlay";
}

export default function SimpleAppBar({ variant = "solid" }: SimpleAppBarProps) {
	const router = useRouter();
	const [logoSrc, setLogoSrc] = React.useState("/brand/logo.png");
	const [scrolled, setScrolled] = React.useState(false);
	const isOverlay = variant === "overlay";

	React.useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const handleSearch = React.useCallback(async (query: string) => {
		const res = await getCampaigns(1, 5, "all", query);
		if (res.success && res.data) {
			return res.data
				.filter((c): c is NonNullable<typeof c> => c !== null)
				.map((c) => ({
					id: c.id,
					title: c.title,
					subtitle: c.category,
					image: c.thumbnail,
				}));
		}
		return [];
	}, []);

	const showCompact = isOverlay ? scrolled : scrolled;

	return (
		<header
			className={[
				"fixed left-1/2 top-0 z-[1100] w-full max-w-[480px] -translate-x-1/2 transition-all duration-300",
				showCompact
					? "bg-[var(--brand)]"
					: isOverlay
						? "bg-white/10 backdrop-blur-md"
						: "bg-[var(--surface)] border-b border-divider",
			].join(" ")}
		>
			<div className={`mx-auto flex items-center gap-1.5 px-3 transition-all duration-300 ${showCompact ? "h-13" : "h-14"}`}>
				<Link
					href="/"
					className={`shrink-0 transition-all duration-300 overflow-hidden ${showCompact ? "w-0 opacity-0" : "w-auto opacity-100"}`}
				>
					<Image
						src={logoSrc}
						alt="Pesona Kebaikan"
						width={0}
						height={0}
						sizes="100vw"
						priority
						style={{ width: "auto", height: "32px", objectFit: "contain", display: "block" }}
						onError={() => setLogoSrc("/defaultimg.webp")}
						unoptimized
					/>
				</Link>

				<SearchDropdown
					placeholder="Cari donasi…"
					onSearch={handleSearch}
					onSelect={(r) => router.push(`/donasi/${r.id}`)}
					onSubmit={(q) => router.push(`/donasi?q=${encodeURIComponent(q)}`)}
					overlay={isOverlay || showCompact}
				/>

				<div className="relative z-10 shrink-0 overflow-visible">
					<NotificationPopover overlay={isOverlay || showCompact} desktopSolid={!showCompact} />
				</div>
			</div>
		</header>
	);
}
