"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { Category, Campaign } from "@/types";
import { CATEGORY_TITLE } from "@/lib/constants";
import { getCategoryIcon } from "@/lib/categoryIcons";

function buildDefaultCategories(): Category[] {
	const pick = ["medis", "pendidikan", "bencana"];
	const base = pick
		.map((id) => ({
			id,
			label: CATEGORY_TITLE[id],
			icon: getCategoryIcon(CATEGORY_TITLE[id]).icon,
		}))
		.filter((c) => !!c.label);
	return [
		...base,
		{ id: "lihat_semua", label: "Lihat Semua", icon: <LayoutGrid size={24} /> },
	];
}

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

function CategoryButton({
	c,
	selected,
	onClick,
}: {
	c: Category;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className="w-full cursor-pointer select-none p-2 transition-all duration-150 active:scale-95"
		>
			<div
				className="mx-auto grid h-14 w-14 place-items-center rounded-full border transition-colors"
				style={{
					backgroundColor: selected ? "rgba(11,169,118,0.22)" : "rgba(15,23,42,0.04)",
					borderColor: selected ? "rgba(11,169,118,0.3)" : "rgba(15,23,42,0.08)",
					color: selected ? "#0ba976" : "rgba(15,23,42,0.55)",
				}}
			>
				{c.icon}
			</div>
			<p
				className={`mt-2 text-center text-[11.5px] font-black leading-tight ${selected ? "text-foreground" : "text-foreground/55"}`}
			>
				{c.label}
			</p>
		</button>
	);
}

function CampaignRowCard({ item }: { item: Campaign }) {
	const router = useRouter();
	const [imgSrc, setImgSrc] = React.useState(item.cover || "/defaultimg.webp");
	const pct = item.target ? Math.round((item.collected / item.target) * 100) : 0;

	return (
		<div
			onClick={() => router.push(`/donasi/${item.slug || item.id}`)}
			className="w-[200px] min-w-[200px] shrink-0 cursor-pointer select-none snap-start overflow-hidden transition-transform active:scale-[0.99]"
		>
			<div className="relative h-[120px] overflow-hidden bg-slate-100">
				<Image
					src={imgSrc}
					alt={item.title}
					fill
					unoptimized
					sizes="200px"
					style={{ objectFit: "cover" }}
					onError={() => setImgSrc("/defaultimg.webp")}
				/>
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 to-transparent to-70%" />
				<span className="absolute left-2.5 top-2.5 rounded bg-white/92 px-1 py-px text-[11px] font-black backdrop-blur-lg">
					{item.category}
				</span>
				<span className="absolute bottom-2.5 left-2.5 rounded-full bg-foreground/72 px-1 py-px text-[10px] font-black text-white backdrop-blur-lg">
					{item.daysLeft} hari
				</span>
			</div>

			<div className="bg-white p-[5px]">
				<p className="line-clamp-2 min-h-[34px] text-[13px] font-black leading-tight text-foreground">
					{item.title}
				</p>
				<div className="mt-[3px] flex items-center gap-[3px]">
					<span className="text-[11px] text-foreground/60">{item.organizer}</span>
					{item.organizerVerifiedAt && (
						<span className="rounded bg-primary/14 px-[3px] py-px text-[9px] font-black text-primary">
							{item.organizerVerifiedAs === "organization" ? "ORG" : "PER"}
						</span>
					)}
				</div>
				<div className="mt-1.5">
					<div className="mb-0.5 flex items-center justify-between">
						<span className="text-[10px] font-bold text-foreground/50">Terkumpul</span>
						<span className="text-[10px] font-black text-primary">{pct}%</span>
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-foreground/8">
						<div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
					</div>
					<p className="mt-0.5 text-[11px] font-black text-foreground">
						Rp {rupiah(item.collected)}
					</p>
				</div>
			</div>
		</div>
	);
}

export default function CategoryChips({
	campaigns = [],
	categories = [],
}: {
	campaigns?: Campaign[];
	categories?: Category[];
}) {
	const router = useRouter();
	const [activeId, setActiveId] = React.useState<string>("bencana");

	const categoriesList = React.useMemo<Category[]>(() => {
		if (categories && categories.length > 0) {
			const allowed = new Set(["medis", "pendidikan", "bencana"]);
			const filtered = categories
				.filter((c) => allowed.has(c.id))
				.map((c) => ({
					...c,
					label: CATEGORY_TITLE[c.id] || c.label,
					icon: c.icon || getCategoryIcon(CATEGORY_TITLE[c.id] || c.label).icon,
				}));
			return [
				...filtered,
				{ id: "lihat_semua", label: "Lihat Semua", icon: <LayoutGrid size={24} /> },
			];
		}
		return buildDefaultCategories();
	}, [categories]);

	const filtered = React.useMemo(() => {
		if (activeId === "lihat_semua") return campaigns;
		const selected = categoriesList.find((c) => c.id === activeId);
		if (!selected) return campaigns;
		const label = selected.label.toLowerCase();
		const syn: Record<string, string[]> = {
			medis: ["medis", "kesehatan", "bantuan medis", "bantuan medis & kesehatan"],
			pendidikan: ["pendidikan", "bantuan pendidikan"],
			bencana: ["bencana", "bencana alam"],
		};
		const names = syn[activeId] || [label];
		return campaigns.filter((c) => {
			const slug = (c.categorySlug || "").toLowerCase();
			const name = (c.category || "").toLowerCase();
			return slug === activeId || names.includes(name);
		});
	}, [activeId, campaigns, categoriesList]);

	return (
		<div className="mt-3 px-2">
			<div className="mb-2 flex items-center justify-between">
				<h2 className="text-base font-black text-foreground">Kategori Pilihan</h2>
			</div>

			<div className="grid grid-cols-4 gap-2">
				{categoriesList.map((cat) => (
					<CategoryButton
						key={cat.id}
						c={cat}
						selected={activeId === cat.id}
						onClick={() => {
							if (cat.id === "lihat_semua") {
								router.push("/kategori");
								return;
							}
							setActiveId(cat.id);
						}}
					/>
				))}
			</div>

			<div className="mt-3">
				{filtered.length > 0 ? (
					<div className="no-scrollbar flex snap-x snap-mandatory gap-1.5 overflow-x-auto">
						{filtered.map((item) => (
							<CampaignRowCard key={item.id} item={item} />
						))}
					</div>
				) : (
					<p className="py-8 text-center text-sm text-slate-500">
						Belum ada penggalangan dana di kategori ini
					</p>
				)}
			</div>

			<div className="mt-2 h-px bg-foreground/6" />
		</div>
	);
}
