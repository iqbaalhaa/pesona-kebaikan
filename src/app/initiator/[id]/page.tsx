import { getCampaigns } from "@/actions/campaign";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function InitiatorPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			verifiedAs: true,
			_count: { select: { campaigns: true } },
		},
	});

	if (!user) notFound();

	const campaignsRes = await getCampaigns(1, 50, "all", "", user.id);
	const campaigns =
		campaignsRes.success && campaignsRes.data
			? campaignsRes.data.filter((c) => c !== null)
			: [];

	const avatarInitial = (user.name?.trim()?.[0] ?? "?").toUpperCase();

	return (
		<div className="min-h-screen bg-slate-50 pb-8">
			{/* Header Profile */}
			<div className="relative border-b border-slate-200 bg-white pb-6 pt-12">
				<div className="absolute left-0 right-0 top-3 z-1 mx-auto max-w-2xl px-2">
					<ProfileHeader title="Profil Penggalang" container={false} />
				</div>
				<div className="mx-auto flex max-w-2xl flex-col items-center px-2 text-center">
					{user.image ? (
						<img
							src={user.image}
							alt={user.name || ""}
							className="mb-2 h-[100px] w-[100px] rounded-full border-4 border-white object-cover shadow-md"
						/>
					) : (
						<div className="mb-2 grid h-[100px] w-[100px] place-items-center rounded-full border-4 border-white bg-primary/10 text-3xl font-bold text-primary shadow-md">
							{avatarInitial}
						</div>
					)}

					<div className="mb-0.5 flex items-center gap-1">
						<h1 className="text-xl font-bold text-foreground">
							{user.name}
						</h1>
						{user.verifiedAs && (
							<ShieldCheck size={20} className="text-primary" />
						)}
					</div>

					<p className="mb-3 text-text-secondary">{user.email}</p>

					<div className="inline-flex rounded-2xl bg-slate-100 px-3 py-1 text-center">
						<div>
							<p className="text-lg font-bold text-foreground">
								{user._count.campaigns}
							</p>
							<p className="text-xs text-text-secondary">Campaigns</p>
						</div>
					</div>
				</div>
			</div>

			{/* Campaigns List */}
			<div className="mx-auto mt-4 max-w-2xl px-2">
				<h2 className="mb-3 text-lg font-bold text-foreground">Campaigns</h2>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
					{campaigns.map((campaign) => {
						if (!campaign) return null;
						const progress = Math.min(
							((campaign.collected || 0) / (campaign.target || 1)) * 100,
							100,
						);
						return (
							<Link
								key={campaign.id}
								href={`/donasi/${campaign.slug || campaign.id}`}
								className="block no-underline"
							>
								<div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
									<div className="relative bg-slate-200 pt-[56.25%]">
										<Image
											src={campaign.thumbnail || "/defaultimg.webp"}
											alt={campaign.title}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											style={{ objectFit: "cover" }}
											unoptimized
										/>
									</div>
									<div className="flex-1 p-2">
										<p className="line-clamp-2 min-h-[2.8em] text-base font-bold leading-snug text-foreground">
											{campaign.title}
										</p>
										<div className="mt-2 flex items-center justify-between">
											<span className="text-xs text-text-secondary">
												Terkumpul
											</span>
											<span className="text-xs font-bold text-primary">
												Rp{" "}
												{campaign.collected?.toLocaleString("id-ID") || 0}
											</span>
										</div>
										<div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200">
											<div
												className="h-full rounded-full bg-primary"
												style={{ width: `${progress}%` }}
											/>
										</div>
										<div className="mt-1 flex justify-between">
											<span className="text-xs text-text-secondary">
												Sisa hari
											</span>
											<span className="text-xs font-bold">
												{campaign.daysLeft} hari
											</span>
										</div>
									</div>
								</div>
							</Link>
						);
					})}

					{campaigns.length === 0 && (
						<div className="col-span-full rounded-xl border border-slate-200 bg-white py-8 text-center">
							<p className="text-text-secondary">
								Belum ada campaign aktif yang dibuat.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
