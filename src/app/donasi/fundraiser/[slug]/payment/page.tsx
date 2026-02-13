import { getFundraiserCampaign } from "@/actions/fundraiser";
import DonationForm from "@/components/donation/DonationForm";
import { notFound } from "next/navigation";
import { Metadata } from "next";

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
    title: `Donasi untuk ${res.data.title} | Pesona Kebaikan`,
  };
}

export default async function FundraiserDonationPaymentPage({ params }: Props) {
  const { slug } = await params;
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

  return (
    <DonationForm
      campaignId={res.data.id}
      campaignTitle={res.data.title}
      campaignSlug={res.data.slug || slug}
      fundraiserId={(res.data as any).fundraiserId}
    />
  );
}
