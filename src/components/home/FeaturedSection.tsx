"use client";

import { Campaign } from "@/types";
import CampaignScroller from "./CampaignScroller";

export default function FeaturedSection({
	campaigns = [],
	title = "Pilihan Kami",
}: {
	campaigns?: Campaign[];
	title?: string;
}) {
	return (
		<CampaignScroller
			campaigns={campaigns}
			showAllHref="/donasi"
			header={
				<h2 className="text-base font-extrabold text-foreground">{title}</h2>
			}
		/>
	);
}
