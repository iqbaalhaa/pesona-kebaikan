import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import WithdrawalList from "./client";

export default async function PencairanPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ tab?: string }>;
}) {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const { slug } = await params;
	const { tab } = await searchParams;
	const initialTab = tab === "1" ? 1 : 0;

	const campaign = await prisma.campaign.findFirst({
		where: {
			OR: [{ slug }, { id: slug }],
		},
		include: {
			donations: {
				where: {
					status: {
						in: ["PAID", "paid", "SETTLED", "COMPLETED", "ACTIVE"],
					},
				},
				select: {
					amount: true,
					fee: true,
				},
			},
			withdrawals: {
				orderBy: { createdAt: "desc" },
			},
			updates: {
				orderBy: { createdAt: "desc" },
				include: { media: true },
			},
		},
	});

	if (!campaign) {
		notFound();
	}

	// Verify ownership
	if (
		campaign.createdById !== session.user.id &&
		session.user.role !== "ADMIN"
	) {
		redirect("/galang-dana");
	}

	// Calculate finances (gross collected, fees, foundation fee)
	const collected = campaign.donations.reduce(
		(acc, d) => acc + Number(d.amount),
		0,
	);
	const totalFees = campaign.donations.reduce(
		(acc, d) => acc + (Number((d as any).fee) || 0),
		0,
	);
	const foundationFeePercentage = Number((campaign as any).foundationFee || 0);
	const foundationFeeAmount = Math.round(
		collected * (foundationFeePercentage / 100),
	);

	const campaignData = {
		id: campaign.id,
		slug: campaign.slug,
		title: campaign.title,
		collected,
		totalFees,
		foundationFeeAmount,
	};

	// Convert Decimal to number for Client Component
	const withdrawals = campaign.withdrawals.map((w) => ({
		...w,
		amount: Number(w.amount),
	}));

	const updates = campaign.updates.map((u) => ({
		...u,
		amount: u.amount ? Number(u.amount) : null,
	}));

	return (
		<WithdrawalList
			campaign={campaignData}
			withdrawals={withdrawals}
			updates={updates}
			initialTab={initialTab}
		/>
	);
}
