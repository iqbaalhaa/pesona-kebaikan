import { getCampaignBySlug } from "@/actions/campaign";
import DonationForm from "@/components/donation/DonationForm";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const res = await getCampaignBySlug(slug);

	if (!res.success || !res.data) {
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

	return (
		<DonationForm
			campaignId={res.data.id}
			campaignTitle={res.data.title}
			campaignSlug={res.data.slug || slug}
		/>
	);
}
