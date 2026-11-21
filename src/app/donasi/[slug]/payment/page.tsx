import { cache } from "react";
import { getCampaignBySlug as fetchCampaignBySlug } from "@/actions/campaign";
import DonationForm from "@/components/donation/DonationForm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import CampaignTracker from "@/components/tracking/CampaignTracker";
import { getCampaignPagePixelId } from "@/lib/tracking-settings";

// generateMetadata and the page both need it — dedupe per request.
const getCampaignBySlug = cache(fetchCampaignBySlug);

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const res = await getCampaignBySlug(slug);

	if (
		!res.success ||
		!res.data ||
		res.data.status === "paused" ||
		res.data.status === "ended" ||
		res.data.status === "rejected"
	) {
		return {
			title: "Campaign Not Found",
		};
	}

	return {
		title: `Donasi untuk ${res.data.title} | Pesona Kebaikan`,
	};
}

export default async function DonationPaymentPage({ params }: Props) {
	const { slug } = await params;
	const res = await getCampaignBySlug(slug);

	if (!res.success || !res.data) {
		notFound();
	}

	if (
		res.data.status === "paused" ||
		res.data.status === "ended" ||
		res.data.status === "rejected"
	) {
		notFound();
	}

	return (
		<>
			<CampaignTracker
				campaignId={res.data.id}
				fundraiserId={null}
				campaignTitle={res.data.title}
				ownerPixelId={await getCampaignPagePixelId(res.data.id)}
				step="DONATE_CLICK"
			/>
			<DonationForm
			campaignId={res.data.id}
			campaignTitle={res.data.title}
			campaignSlug={res.data.slug || slug}
			/>
		</>
	);
}
