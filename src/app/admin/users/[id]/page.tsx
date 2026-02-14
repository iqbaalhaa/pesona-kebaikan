import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminUserDetailClient from "./AdminUserDetailClient";

export default async function AdminUserDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const { id } = await params;

	const user = await prisma.user.findUnique({
		where: { id },
		include: {
			donations: {
				orderBy: { createdAt: "desc" },
				take: 20,
				include: {
					campaign: {
						select: {
							id: true,
							title: true,
							slug: true,
							media: {
								take: 1,
								where: { type: "IMAGE" },
							},
						},
					},
				},
			},
			campaigns: {
				orderBy: { createdAt: "desc" },
				take: 10,
				include: {
					category: {
						select: { name: true },
					},
				},
			},
			verificationRequests: {
				orderBy: { createdAt: "desc" },
			},
			province: true,
			regency: true,
			district: true,
			village: true,
		},
	});

	if (!user) {
		notFound();
	}

	// Serialize data to plain objects for Client Component
	const serializedUser = {
		...user,
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
		emailVerified: user.emailVerified?.toISOString() || null,
		phoneVerified: user.phoneVerified?.toISOString() || null,
		verifiedAt: user.verifiedAt?.toISOString() || null,
		donations: user.donations.map((d) => ({
			...d,
			amount: d.amount.toString(),
			fee: d.fee.toString(),
			createdAt: d.createdAt.toISOString(),
			updatedAt: d.updatedAt.toISOString(),
			campaign: {
				...d.campaign,
				image: d.campaign.media[0]?.url || null,
			},
		})),
		campaigns: user.campaigns.map((c) => ({
			...c,
			target: c.target.toString(),
			start: c.start.toISOString(),
			end: c.end?.toISOString() || null,
			createdAt: c.createdAt.toISOString(),
			updatedAt: c.updatedAt.toISOString(),
			verifiedAt: c.verifiedAt?.toISOString() || null,
		})),
		verificationRequests: user.verificationRequests.map((v) => ({
			...v,
			createdAt: v.createdAt.toISOString(),
			updatedAt: v.updatedAt.toISOString(),
			reviewedAt: v.reviewedAt?.toISOString() || null,
		})),
	};

	return <AdminUserDetailClient user={serializedUser} />;
}
