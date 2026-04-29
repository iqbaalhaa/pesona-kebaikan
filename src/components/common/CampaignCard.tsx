"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export type CampaignCardProps = {
	id: string;
	slug?: string;
	title: string;
	category: string;
	ownerName: string;
	collected: number;
	target: number;
	daysLeft: number;
	thumbnail?: string;
	verifiedAt?: Date | string | null;
};

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

export function CampaignCardSkeleton() {
	return (
		<div className="h-full rounded-lg border border-divider bg-surface">
			<div className="h-[110px] w-full animate-pulse bg-foreground/5" />
			<div className="p-[5px]">
				<div className="mb-1 flex gap-0.5">
					<div className="h-[18px] w-[60px] animate-pulse rounded bg-foreground/5" />
					<div className="h-[18px] w-[74px] animate-pulse rounded bg-foreground/5" />
				</div>
				<div className="mb-1 h-8 animate-pulse rounded bg-foreground/5" />
				<div className="h-3 w-3/5 animate-pulse rounded bg-foreground/5" />
				<div className="mt-1.5">
					<div className="h-[5px] overflow-hidden rounded-full bg-primary/10">
						<div className="h-full w-1/3 animate-pulse rounded-full bg-primary/30" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CampaignCard(props: CampaignCardProps) {
	const x = props;
	const isQuickDonate = x.slug === "donasi-cepat";
	const progress =
		x.target > 0
			? Math.min(100, Math.round((x.collected / x.target) * 100))
			: 0;

	const [img, setImg] = React.useState(x.thumbnail || "/defaultimg.webp");

	return (
		<Link
			href={`/donasi/${x.slug || x.id}`}
			aria-label={`Donasi: ${x.title}`}
			className="block h-full no-underline"
		>
			<div className="flex h-full flex-col overflow-hidden rounded-lg border border-divider bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
				<img
					src={img}
					alt={x.title}
					onError={() => setImg("/defaultimg.webp")}
					className="h-[110px] w-full bg-slate-100 object-cover"
				/>
				<div className="flex flex-1 flex-col p-[5px]">
					<div className="mb-[3px] flex flex-wrap items-center gap-0.5">
						<span className="rounded-md bg-primary/8 px-1.5 py-px text-[10px] font-semibold text-primary">
							{x.category}
						</span>
						{x.verifiedAt && (
							<span className="inline-flex items-center gap-0.5 rounded-md border border-primary/30 px-1.5 py-px text-[10px] text-primary">
								<ShieldCheck size={12} />
								Verified
							</span>
						)}
					</div>

					<p className="mb-[2px] text-[11px] text-text-secondary">
						{x.ownerName}
					</p>

					<p className="mb-auto line-clamp-2 min-h-[34px] text-[13px] font-extrabold leading-tight text-foreground">
						{x.title}
					</p>

					<div className="mt-1.5">
						<p className="mb-1 text-[10px] font-medium text-text-secondary">
							Terkumpul{" "}
							<span className="text-xs font-extrabold text-primary">
								Rp{rupiah(x.collected)}
							</span>
						</p>
						{!isQuickDonate && (
							<div className="h-[5px] overflow-hidden rounded-full bg-primary/10">
								<div
									className="h-full rounded-full bg-primary transition-all duration-300"
									style={{ width: `${progress}%` }}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
