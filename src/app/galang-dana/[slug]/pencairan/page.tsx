import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import WithdrawalList from "./client";

export default async function PencairanPage({
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
		where: {
			OR: [{ slug }, { id: slug }],
		},
		include: {
			createdBy: { select: { verifiedAt: true } },
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
		ownerVerified: Boolean(campaign.createdBy.verifiedAt),
	};

	const withdrawals = campaign.withdrawals.map((w) => ({
		...w,
		amount: Number(w.amount),
		transferAmount: w.transferAmount ? Number(w.transferAmount) : null,
	}));

	return (
		<WithdrawalList
			campaign={campaignData}
			withdrawals={withdrawals}
		/>
	);
}
