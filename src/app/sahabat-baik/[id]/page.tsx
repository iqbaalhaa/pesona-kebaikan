"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, MapPin, Calendar, Share2 } from "lucide-react";

const USER_DATA = {
	id: "collab-for-change",
	name: "CollabForChange",
	avatar: "https://i.pravatar.cc/150?u=collab",
	cover:
		"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80",
	verified: true,
	type: "Yayasan",
	joinedAt: "Bergabung sejak 2021",
	location: "Bandung, Jawa Barat",
	about: `CollabForChange adalah yayasan sosial yang berfokus pada pemberdayaan masyarakat marginal dan penyandang disabilitas. Kami percaya bahwa setiap orang berhak mendapatkan kesempatan yang sama untuk berkembang.

Visi kami adalah menciptakan ekosistem inklusif di mana difabel dapat mandiri secara ekonomi dan sosial.`,
	campaigns: [
		{
			id: "tanam-harapan-difabel",
			title: "Tanam Harapan untuk Para Petani Difabel!",
			image:
				"https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=600&q=70",
			collected: 483580004,
			target: 800000000,
			daysLeft: 86,
			status: "active",
		},
		{
			id: "bantu-sekolah-yatim",
			title: "Bantu 100 Anak Yatim Kembali Sekolah",
			image:
				"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=70",
			collected: 150000000,
			target: 150000000,
			daysLeft: 0,
			status: "finished",
		},
	],
};

function formatIDR(amount: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function SahabatBaikPage() {
	const router = useRouter();
	const [tabValue, setTabValue] = React.useState<0 | 1>(0);
	const data = USER_DATA;

	return (
		<div className="min-h-screen bg-white pb-12">
			{/* Cover */}
			<div className="relative h-40 bg-slate-100">
				{data.cover && (
					<img
						src={data.cover}
						alt="Cover"
						className="h-full w-full object-cover"
					/>
				)}
				<div className="absolute inset-x-0 top-0 flex justify-between p-2">
					<button
						onClick={() => router.back()}
						className="grid h-9 w-9 place-items-center rounded-full bg-white/80 transition-colors hover:bg-white"
					>
						<ArrowLeft size={20} />
					</button>
					<button className="grid h-9 w-9 place-items-center rounded-full bg-white/80 transition-colors hover:bg-white">
						<Share2 size={20} />
					</button>
				</div>
			</div>

			<div className="mx-auto max-w-2xl">
				{/* Profile Info */}
				<div className="relative -mt-5 mb-3 px-2">
					<div className="mb-2">
						<img
							src={data.avatar}
							alt={data.name}
							className="h-20 w-20 rounded-full border-4 border-white bg-white object-cover shadow-md"
						/>
					</div>
					<div className="mb-0.5 flex items-center gap-1">
						<h1 className="text-xl font-bold text-foreground">{data.name}</h1>
						{data.verified && (
							<ShieldCheck size={20} className="text-blue-500" />
						)}
					</div>
					<p className="mb-2 text-sm text-slate-500">{data.type}</p>

					<div className="mb-2 flex gap-2">
						<span className="flex items-center gap-0.5 text-xs text-slate-500">
							<MapPin size={14} className="text-slate-400" />
							{data.location}
						</span>
						<span className="flex items-center gap-0.5 text-xs text-slate-500">
							<Calendar size={14} className="text-slate-400" />
							{data.joinedAt}
						</span>
					</div>
				</div>

				<hr className="border-divider" />

				{/* Tabs */}
				<div className="flex border-b border-divider">
					{(["Tentang", "Penggalangan Dana"] as const).map((label, i) => (
						<button
							key={label}
							onClick={() => setTabValue(i as 0 | 1)}
							className={[
								"flex-1 py-3 text-sm font-semibold transition-colors",
								tabValue === i
									? "border-b-2 border-primary text-primary"
									: "text-foreground/50",
							].join(" ")}
						>
							{label}
						</button>
					))}
				</div>

				{/* Tab: Tentang */}
				{tabValue === 0 && (
					<div className="px-2 py-3">
						<p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
							{data.about}
						</p>
					</div>
				)}

				{/* Tab: Penggalangan Dana */}
				{tabValue === 1 && (
					<div className="flex flex-col gap-2 px-2 py-3">
						{data.campaigns.map((campaign) => {
							const progress = Math.min(
								100,
								Math.round(
									(campaign.collected / campaign.target) * 100,
								),
							);
							return (
								<button
									key={campaign.id}
									onClick={() => router.push(`/donasi/${campaign.id}`)}
									className="flex cursor-pointer overflow-hidden rounded-2xl border border-divider text-left"
								>
									<img
										src={campaign.image}
										alt={campaign.title}
										className="h-[120px] w-1/3 object-cover"
									/>
									<div className="flex-1 p-2">
										<p className="mb-1 text-sm font-bold leading-tight">
											{campaign.title}
										</p>
										<div className="mb-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
											<div
												className="h-full rounded-full bg-primary"
												style={{ width: `${progress}%` }}
											/>
										</div>
										<div className="flex items-center justify-between">
											<div>
												<p className="text-xs text-slate-500">Terkumpul</p>
												<p className="text-xs font-bold text-primary">
													{formatIDR(campaign.collected)}
												</p>
											</div>
											{campaign.status === "active" ? (
												<div className="text-right">
													<p className="text-xs text-slate-500">
														Sisa hari
													</p>
													<p className="text-xs font-bold text-foreground">
														{campaign.daysLeft}
													</p>
												</div>
											) : (
												<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
													Selesai
												</span>
											)}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
