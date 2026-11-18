"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import HeroCarousel, { CarouselItem } from "./HeroCarousel";
import QuickDonate from "./QuickDonate";
import QuickMenu from "./QuickMenu";
import FeaturedSection from "./FeaturedSection";
import UrgentSection from "./UrgentSection";
import CategoryChips from "./CategoryChips";
import PopularSection from "./PopularSection";
import PrayerSection from "./PrayerSection";
import BannerSection, { BannerItem } from "./BannerSection";
import type { Campaign } from "@/types";

// Home feed. Normally receives the data prerendered into "/" (ISR); falls back
// to fetching /api/home when the prerender couldn't reach the DB.
type HomeData = {
	urgent: Campaign[];
	popular: Campaign[];
	featured: Campaign[];
	latestDonations: any[];
	allCampaigns: Campaign[];
	heroItems: CarouselItem[];
	bannerItems: BannerItem[];
	featuredTitle: string;
	showPilihan: boolean;
	showMendesak: boolean;
};

const EMPTY: HomeData = {
	urgent: [],
	popular: [],
	featured: [],
	latestDonations: [],
	allCampaigns: [],
	heroItems: [],
	bannerItems: [],
	featuredTitle: "Pilihan Pesona Kebaikan",
	showPilihan: true,
	showMendesak: true,
};

function SectionSkeleton() {
	return (
		<Box sx={{ display: "flex", gap: 2, px: { xs: 2, lg: 6 }, py: 2 }}>
			{[0, 1, 2].map((i) => (
				<Skeleton
					key={i}
					variant="rounded"
					sx={{ flex: 1, minWidth: 0, height: 220, borderRadius: 2 }}
				/>
			))}
		</Box>
	);
}

export default function HomeFeed({ initialData }: { initialData?: HomeData }) {
	const [data, setData] = useState<HomeData>(initialData ?? EMPTY);
	const [loading, setLoading] = useState(!initialData);

	useEffect(() => {
		if (initialData) return;
		let alive = true;
		fetch("/api/home")
			.then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
			.then((json) => {
				if (alive) setData({ ...EMPTY, ...json });
			})
			.catch((e) => console.error("home feed load failed:", e))
			.finally(() => {
				if (alive) setLoading(false);
			});
		return () => {
			alive = false;
		};
	}, [initialData]);

	return (
		<>
			<div className="bg-gradient-to-b from-[var(--brand)] via-[var(--brand)]/60 to-transparent pt-16">
				<HeroCarousel items={data.heroItems} loading={loading} />
				<QuickDonate />
			</div>
			<QuickMenu />
			{loading ? (
				<>
					<SectionSkeleton />
					<SectionSkeleton />
				</>
			) : (
				<>
					{data.showPilihan && (
						<FeaturedSection
							campaigns={data.featured}
							title={data.featuredTitle}
						/>
					)}
					{data.showMendesak && (
						<UrgentSection campaigns={data.urgent} />
					)}
					<CategoryChips campaigns={data.allCampaigns} />
					<PopularSection campaigns={data.popular} />
					<PrayerSection prayers={data.latestDonations} />
					<BannerSection items={data.bannerItems} />
				</>
			)}
		</>
	);
}
