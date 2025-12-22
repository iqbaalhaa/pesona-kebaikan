import { getCampaigns } from "@/actions/campaign";
import DonationExplorer, {
	CampaignItem,
} from "@/components/donation/DonationExplorer";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
	title: "Donasi | Pesona Kebaikan",
	description:
		"Temukan dan bantu mereka yang membutuhkan melalui Pesona Kebaikan.",
};

export default async function DonationPage({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const page = 1;
	const limit = 50; // Load many for exploration
	const search = typeof searchParams.q === "string" ? searchParams.q : "";
	const category =
		typeof searchParams.category === "string"
			? searchParams.category
			: undefined;
	const isEmergency = searchParams.urgent === "true";
	const isVerified = searchParams.verified === "true";
	const sort =
		typeof searchParams.sort === "string" ? searchParams.sort : "newest";

	const [res, categoriesData] = await Promise.all([
		getCampaigns(
			page,
			limit,
			"all", // status filter
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
