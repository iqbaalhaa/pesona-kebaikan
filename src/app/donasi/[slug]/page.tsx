import { getCampaignBySlug } from "@/actions/campaign";
import CampaignDetailView from "@/components/campaign/CampaignDetailView";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/auth";

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
		res.data.status === "rejected" ||
		res.data.daysLeft === 0
	) {
		return {
			title: "Campaign Not Found",
			robots: {
				index: false,
				follow: false,
				googleBot: {
					index: false,
					follow: false,
				},
			},
		};
	}

	return {
		title: `${res.data.title} | Pesona Kebaikan`,
		description: res.data.description.substring(0, 160),
		robots: {
			index: true,
			follow: true,
		},
		openGraph: {
			images: res.data.thumbnail ? [res.data.thumbnail] : [],
		},
	};
}

export default async function CampaignDetailPage({ params }: Props) {
	const { slug } = await params;

	// Restrict access to quick donation campaign
	if (slug === "donasi-cepat") {
		const session = await auth();
		if (session?.user?.role !== "ADMIN") {
			redirect("/");
		}
	}

	const res = await getCampaignBySlug(slug);

	if (!res.success || !res.data) {
		notFound();
	}

	// Double check if the resolved campaign is the restricted one (e.g. accessed via ID)
	if (res.data.slug === "donasi-cepat") {
		const session = await auth();
		if (session?.user?.role !== "ADMIN") {
			redirect("/");
		}
	}

	if (
		res.data.status === "paused" ||
		res.data.status === "ended" ||
		res.data.status === "rejected" ||
		res.data.daysLeft === 0
	) {
		notFound();
	}

	return <CampaignDetailView data={res.data} />;
}
