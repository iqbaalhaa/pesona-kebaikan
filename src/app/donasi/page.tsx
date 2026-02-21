import { getCampaigns } from "@/actions/campaign";
import DonationExplorer, {
	CampaignItem,
} from "@/components/donation/DonationExplorer";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
	title: "Donasi | Pesona Kebaikan",
	description:
		"Temukan dan bantu mereka yang membutuhkan melalui Pesona Kebaikan.",
	openGraph: {
		title: "Donasi | Pesona Kebaikan",
		description:
			"Temukan dan bantu mereka yang membutuhkan melalui Pesona Kebaikan.",
		url: "/donasi",
		siteName: "Pesona Kebaikan",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Donasi | Pesona Kebaikan",
		description:
			"Temukan dan bantu mereka yang membutuhkan melalui Pesona Kebaikan.",
	},
};

export default async function DonationPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const page = 1;
	const limit = 50; // Load many for exploration
	const search = typeof params.q === "string" ? params.q : "";
	const category =
		typeof params.category === "string" ? params.category : undefined;
	const isEmergency = params.urgent === "true";
	const isVerified = params.verified === "true";
	const sort = typeof params.sort === "string" ? params.sort : "newest";

	const [res, categoriesData] = await Promise.all([
		getCampaigns(
			page,
			limit,
			"active", // status filter: only show active campaigns
			search,
			undefined, // userId
			category,
			isEmergency,
			isVerified,
			sort
		),
		prisma.campaignCategory.findMany({
			orderBy: { name: "asc" },
		}),
	]);

	const campaigns = (res.success && res.data ? res.data : []) as CampaignItem[];
	const categories = categoriesData.map((c) => c.name);

	return <DonationExplorer initialData={campaigns} categories={categories} />;
}
