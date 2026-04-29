"use client";

import { Campaign } from "@/types";
import CampaignScroller from "./CampaignScroller";

export default function PopularSection({ campaigns = [] }: { campaigns?: Campaign[] }) {
	return (
		<CampaignScroller
			campaigns={campaigns}
			showAllHref="/donasi"
			header={
				<h2 className="text-[15px] font-black text-foreground">
					Populer Saat Ini
				</h2>
			}
		/>
	);
}
