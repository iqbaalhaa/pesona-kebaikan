import { getCampaignBySlug } from "@/actions/campaign";
import CampaignDetailView from "@/components/campaign/CampaignDetailView";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
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
			title: "Campaign Not Found | Pesona Kebaikan",
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

	const rawFundraiserTitle = (res.data as any).fundraiserTitle;
	const effectiveTitle =
		typeof rawFundraiserTitle === "string" && rawFundraiserTitle.trim().length > 0
			? rawFundraiserTitle
			: res.data.title;

	const siteUrl =
		process.env.NEXT_PUBLIC_BASE_URL || "https://pesonakebaikan.id";
	const campaignUrl = `${siteUrl}/donasi/${res.data.slug || res.data.id}`;

	const plainTextDescription = res.data.description.replace(/<[^>]*>?/gm, "");
	const description =
		plainTextDescription.length > 160
			? `${plainTextDescription.substring(0, 157)}...`
			: plainTextDescription;

	const imagesFromField =
		Array.isArray(res.data.images) && res.data.images.length > 0
			? res.data.images
					.map((img: any) => (typeof img === "string" ? img : img?.url))
					.filter(Boolean)
			: [];

	const fallbackImage =
		res.data.thumbnail ||
		(Array.isArray(res.data.media)
			? res.data.media.find((m: any) => m?.isThumbnail)?.url
			: undefined) ||
		"/defaultimg.webp";

	const ogImages = imagesFromField.length > 0 ? imagesFromField : [fallbackImage];
	const primaryImage = ogImages[0];

	return {
		title: `${effectiveTitle} | Pesona Kebaikan`,
		description,
		robots: {
			index: true,
			follow: true,
		},
		openGraph: {
			title: effectiveTitle,
			description,
			type: "website",
			url: campaignUrl,
			siteName: "Pesona Kebaikan",
			images: ogImages.map((url: string) => ({
				url,
				width: 1200,
				height: 630,
				alt: effectiveTitle,
			})),
		},
		twitter: {
			card: "summary_large_image",
			title: effectiveTitle,
			description,
			images: [primaryImage],
		},
		alternates: {
			canonical: campaignUrl,
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

	const siteUrl =
		process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.id";
	const campaignUrl = `${siteUrl}/donasi/${res.data.slug || res.data.id}`;

	const rawFundraiserTitle = (res.data as any).fundraiserTitle;
	const effectiveTitle =
		typeof rawFundraiserTitle === "string" && rawFundraiserTitle.trim().length > 0
			? rawFundraiserTitle
			: res.data.title;

	const rawDescription =
		typeof res.data.description === "string" ? res.data.description : "";
	const plainTextDescription = rawDescription.replace(/<[^>]*>?/gm, "");
	const description =
		plainTextDescription.length > 160
			? `${plainTextDescription.substring(0, 157)}...`
			: plainTextDescription;

	const imagesFromField =
		Array.isArray(res.data.images) && res.data.images.length > 0
			? res.data.images
					.map((img: any) => (typeof img === "string" ? img : img?.url))
					.filter(Boolean)
			: [];

	const fallbackImage =
		res.data.thumbnail ||
		(Array.isArray(res.data.media)
			? res.data.media.find((m: any) => m?.isThumbnail)?.url
			: undefined) ||
		"/defaultimg.webp";

	const ogImages = imagesFromField.length > 0 ? imagesFromField : [fallbackImage];
	const safeTarget = Number((res.data as any).target) || 0;
	const safeCollected = Number((res.data as any).collected) || 0;

	const startDate = new Date(res.data.start || res.data.createdAt);
	const endDate = (res.data as any).end
		? new Date((res.data as any).end)
		: null;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "DonateAction",
		name: effectiveTitle,
		description,
		image: ogImages,
		url: campaignUrl,
		startTime: startDate.toISOString(),
		...(endDate && { endTime: endDate.toISOString() }),
		amount: {
			"@type": "MonetaryAmount",
			currency: "IDR",
			value: safeTarget,
		},
		amountRaised: {
			"@type": "MonetaryAmount",
			currency: "IDR",
			value: safeCollected,
		},
		organizer: {
			"@type": "Organization",
			name: "Pesona Kebaikan",
			url: siteUrl,
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<CampaignDetailView data={res.data} />
		</>
	);
}
