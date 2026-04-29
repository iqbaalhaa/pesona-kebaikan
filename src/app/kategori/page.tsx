"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCategoryIcon } from "@/lib/categoryIcons";

type DbCategory = {
	id: string;
	slug?: string;
	name: string;
	createdAt: string;
	updatedAt: string;
};

export default function KategoriPage() {
	const router = useRouter();
	const [rows, setRows] = React.useState<DbCategory[]>([]);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/campaigns/categories", {
					cache: "no-store",
				});
				const data = await res.json();
				if (mounted) setRows(Array.isArray(data) ? data : []);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div>
			{/* Header */}
			<div className="sticky top-0 z-50 flex items-center gap-1.5 border-b border-foreground/6 bg-white/80 px-2 py-1.5 backdrop-blur-md dark:bg-background/80">
				<button
					onClick={() => router.back()}
					className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-foreground/10 bg-white text-foreground transition-all active:scale-95 dark:bg-surface"
				>
					<ChevronLeft size={20} />
				</button>
				<span className="text-base font-extrabold text-foreground">
					Semua Kategori
				</span>
			</div>

			{/* Grid */}
			<div className="p-2">
				<div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
					{loading
						? Array.from({ length: 12 }).map((_, i) => (
								<div
									key={i}
									className="h-full rounded-2xl border border-foreground/8 bg-white p-2 shadow-sm dark:bg-surface"
								>
									<div className="h-14 w-14 animate-pulse rounded-2xl bg-foreground/5" />
									<div className="mt-1.5 h-4 animate-pulse rounded bg-foreground/5" />
								</div>
							))
						: rows
								.filter((c) => c.name !== "Lainnya")
								.map((cat) => {
									const { icon, color } = getCategoryIcon(cat.name);
									return (
										<button
											key={cat.id}
											onClick={() => {
												const slug = cat.slug || cat.id;
												router.push(
													`/kategori/${encodeURIComponent(slug)}`,
												);
											}}
											className="flex h-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-foreground/8 bg-white p-2 text-center shadow-sm transition-all active:scale-96 dark:bg-surface"
										>
											<div
												className="mb-1.5 grid h-14 w-14 place-items-center rounded-2xl"
												style={{
													backgroundColor: `${color}1a`,
													color,
												}}
											>
												{icon}
											</div>
											<span className="text-xs font-bold leading-tight text-slate-700 dark:text-slate-300">
												{cat.name}
											</span>
										</button>
									);
								})}
				</div>
			</div>
		</div>
	);
}
