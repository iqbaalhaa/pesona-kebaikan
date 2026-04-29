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
	const isOverlay = variant === "overlay";

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

	return (
		<header
			className="fixed left-1/2 top-0 z-[1100] w-full max-w-[480px] -translate-x-1/2 transition-all duration-300"
			style={{
				backgroundColor: isOverlay ? "rgba(255,255,255,0.06)" : "var(--surface)",
				backdropFilter: isOverlay ? "blur(12px)" : "none",
			}}
		>
			<div className="flex h-16 items-center gap-1.5 px-2">
				<Link href="/" className="shrink-0">
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
					overlay={isOverlay}
				/>

				<NotificationPopover overlay={isOverlay} />
			</div>
		</header>
	);
}
