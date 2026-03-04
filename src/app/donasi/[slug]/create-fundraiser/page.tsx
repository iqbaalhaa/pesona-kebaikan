import * as React from "react";
import CreateFundraiserClient from "./CreateFundraiserClient";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CreateFundraiserPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const session = await auth();

	if (!session?.user?.id) {
		redirect(
			`/auth/login?callbackUrl=${encodeURIComponent(`/donasi/${slug}/create-fundraiser`)}`,
		);
	}

	// Handle case where slug might be undefined or encoded
	const decodedSlug = decodeURIComponent(slug);

	const campaign = await prisma.campaign.findFirst({
		where: {
			OR: [{ slug: decodedSlug }, { id: decodedSlug }],
		},
		select: { id: true, target: true },
	});

	if (!campaign) {
		notFound();
	}

	return (
		<CreateFundraiserClient
			campaignSlug={slug}
			campaignTarget={Number(campaign.target)}
		/>
	);
}
