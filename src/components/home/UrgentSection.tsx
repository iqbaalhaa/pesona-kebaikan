"use client";

import { Campaign } from "@/types";
import CampaignScroller from "./CampaignScroller";

export default function UrgentSection({ campaigns = [] }: { campaigns?: Campaign[] }) {
	return (
		<CampaignScroller
			campaigns={campaigns}
			showAllHref="/donasi"
			header={
				<div className="flex items-center gap-2.5">
					<span className="relative flex h-3 w-3">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
						<span className="relative inline-flex h-3 w-3 rounded-full bg-rose-600" />
					</span>
					<h2 className="text-base font-extrabold text-foreground">
						Mendesak & Darurat
					</h2>
				</div>
			}
		/>
	);
}
