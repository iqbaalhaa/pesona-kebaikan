"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Campaign } from "@/types";

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

function ArrowButton({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
	return (
		<button
			aria-label={dir === "left" ? "Geser ke kiri" : "Geser ke kanan"}
			onClick={onClick}
			className="grid h-[38px] w-[38px] cursor-pointer select-none place-items-center rounded-xl bg-white/92 backdrop-blur-lg transition-all hover:scale-105 hover:bg-white active:scale-[0.98]"
		>
			<span className="-mt-px text-xl font-black text-foreground/75">
				{dir === "left" ? "‹" : "›"}
			</span>
		</button>
	);
}

function ScrollCard({ item, priority = false }: { item: Campaign; priority?: boolean }) {
	const router = useRouter();
	const [imgSrc, setImgSrc] = React.useState(item.cover || "/defaultimg.webp");
	const isQuickDonate = item.slug === "donasi-cepat";
	const pct = item.target ? Math.max(0, Math.min(100, Math.round((item.collected / item.target) * 100))) : 0;

	return (
		<div
			role="link"
			tabIndex={0}
			aria-label={`Donasi: ${item.title}`}
			onClick={() => router.push(`/donasi/${item.slug || item.id}`)}
			onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/donasi/${item.slug || item.id}`); } }}
			className="w-[240px] min-w-[240px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-xl border border-divider bg-white transition-transform duration-200 hover:-translate-y-1"
		>
			<div className="relative h-35 overflow-hidden rounded-t-xl bg-slate-100">
				<Image
					src={imgSrc}
					alt={item.title}
					fill
					priority={priority}
					unoptimized
					sizes="200px"
					style={{ objectFit: "cover" }}
					onError={() => setImgSrc("/defaultimg.webp")}
				/>
				{item.organizerVerifiedAt && (
					<span
						className="absolute left-2 top-2 rounded bg-white/95 px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm"
						style={{ color: item.organizerVerifiedAs === "organization" ? "#0ba976" : "#3b82f6" }}
					>
						{item.organizerVerifiedAs === "organization" ? "ORGANISASI" : "PERSONAL"}
					</span>
				)}
				<span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
					{isQuickDonate ? "∞" : `${item.daysLeft} hari lagi`}
				</span>
			</div>

			<div className="p-3">
				<div className="mb-1 flex items-center gap-1.5">
					<span className="truncate text-[10px] font-medium text-foreground/50">
						{item.organizer}
					</span>
					{item.organizerVerifiedAt && (
						<svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-blue-500">
							<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
						</svg>
					)}
				</div>

				<p className="mb-3 line-clamp-2 min-h-10 text-[13px] font-bold leading-snug text-foreground">
					{item.title}
				</p>

				<p className="mb-1 text-[10px] text-slate-500">
					Terkumpul{" "}
					<span className="text-xs font-bold text-primary">Rp {rupiah(item.collected)}</span>
				</p>
				{!isQuickDonate && (
					<div className="flex h-1.5 overflow-hidden rounded-full bg-slate-100">
						<div className="rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
					</div>
				)}
			</div>
		</div>
	);
}

interface CampaignScrollerProps {
	campaigns: Campaign[];
	header: React.ReactNode;
	showAllHref?: string;
}

export default function CampaignScroller({ campaigns, header, showAllHref }: CampaignScrollerProps) {
	const scrollRef = React.useRef<HTMLDivElement | null>(null);
	const rafRef = React.useRef<number | null>(null);
	const [canLeft, setCanLeft] = React.useState(false);
	const [canRight, setCanRight] = React.useState(false);
	const CARD_STEP = 272;

	const updateArrows = React.useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanLeft(el.scrollLeft > 2);
		setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
	}, []);

	React.useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const onScroll = () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(updateArrows);
		};
		updateArrows();
		setTimeout(updateArrows, 500);
		el.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", updateArrows);
		return () => {
			el.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", updateArrows);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [updateArrows, campaigns]);

	if (!campaigns || campaigns.length === 0) return null;

	return (
		<div className="group relative mt-7 px-4">
			<div className="mb-4 flex items-center justify-between">
				{header}
				{showAllHref && (
					<Link href={showAllHref} className="rounded-lg px-1 text-sm font-semibold text-foreground/60 transition-colors hover:bg-foreground/4">
						Lihat semua
					</Link>
				)}
			</div>

			{canLeft && (
				<div className="absolute left-2 top-35 z-10 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
					<ArrowButton dir="left" onClick={() => scrollRef.current?.scrollBy({ left: -CARD_STEP, behavior: "smooth" })} />
				</div>
			)}
			{canRight && (
				<div className="absolute right-2 top-35 z-10 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
					<ArrowButton dir="right" onClick={() => scrollRef.current?.scrollBy({ left: CARD_STEP, behavior: "smooth" })} />
				</div>
			)}

			<div ref={scrollRef} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-0">
				{campaigns.map((item, i) => (
					<ScrollCard key={item.id} item={item} priority={i === 0} />
				))}
			</div>
		</div>
	);
}
