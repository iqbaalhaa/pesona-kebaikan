import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import KabarClient from "./client";

export default async function KabarPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const { slug } = await params;

	const campaign = await prisma.campaign.findFirst({
		where: { OR: [{ slug }, { id: slug }] },
		select: {
			id: true,
			slug: true,
			title: true,
			createdById: true,
			updates: {
				orderBy: { createdAt: "desc" },
				include: { media: true },
			},
		},
	});

	if (!campaign) {
		notFound();
	}

	if (
		campaign.createdById !== session.user.id &&
		(session.user as any).role !== "ADMIN"
	) {
		redirect("/galang-dana");
	}

	const updates = campaign.updates.map((u) => ({
		...u,
		amount: u.amount ? Number(u.amount) : null,
	}));

	return (
		<KabarClient
			campaign={{ id: campaign.id, slug: campaign.slug ?? campaign.id, title: campaign.title }}
			updates={updates}
		/>
	);
}
