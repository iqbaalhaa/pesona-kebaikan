import { cache } from "react";
import { getFundraiserCampaign as fetchFundraiserCampaign } from "@/actions/fundraiser";
import CampaignDetailView from "@/components/campaign/CampaignDetailView";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/auth";

// generateMetadata and the page both need it — dedupe per request.
const getFundraiserCampaign = cache(fetchFundraiserCampaign);

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getFundraiserCampaign(slug);

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
    title: `${res.data.title} | Pesona Kebaikan`,
    description: res.data.description.substring(0, 160),
    openGraph: {
      images: res.data.thumbnail ? [res.data.thumbnail] : [],
    },
  };
}

export default async function FundraiserCampaignDetailPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "donasi-cepat") {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      redirect("/");
    }
  }

  const res = await getFundraiserCampaign(slug);

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

  return <CampaignDetailView data={res.data} showFundraiser={false} />;
}
