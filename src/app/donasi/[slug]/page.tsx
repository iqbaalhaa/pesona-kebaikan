import { getCampaignBySlug } from "@/actions/campaign";
import CampaignDetailView from "@/components/campaign/CampaignDetailView";
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
    title: `${res.data.title} | Pesona Kebaikan`,
    description: res.data.description.substring(0, 160),
    openGraph: {
      images: res.data.thumbnail ? [res.data.thumbnail] : [],
    },
  };
}

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getCampaignBySlug(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  return <CampaignDetailView data={res.data} />;
}
