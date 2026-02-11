import Link from "next/link";
import { Box, Typography, Chip } from "@mui/material";
import Image from "next/image";
import { getCampaigns } from "@/actions/campaign";
import { CATEGORY_TITLE } from "@/lib/constants";

const PRIMARY = "#0ba976";

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

function SortLink({
	label,
	selected,
	href,
}: {
	label: string;
	selected?: boolean;
	href: string;
}) {
	return (
		<Link href={href}>
			<Box
				component="a"
				sx={{
					px: 1.5,
					py: 0.75,
					borderRadius: 999,
					border: "1px solid",
					borderColor: selected ? "text.primary" : "divider",
					bgcolor: selected ? "text.primary" : "transparent",
					color: selected ? "background.paper" : "text.secondary",
					fontSize: 12.5,
					fontWeight: 800,
					textDecoration: "none",
					whiteSpace: "nowrap",
				}}
			>
				{label}
			</Box>
		</Link>
	);
}

function CampaignCard({ c }: { c: any }) {
	const img = c.thumbnail || "/defaultimg.webp";
	const rawPct = c.target ? Math.round((c.collected / c.target) * 100) : 0;
	const pct = Math.min(100, Math.max(0, rawPct));

	const isQuickDonate = c.slug === "donasi-cepat";

	return (
		<Link href={`/donasi/${c.slug || c.id}`}>
			<Box
				component="a"
				sx={{
					display: "block",
					borderRadius: 2,
					border: "1px solid rgba(15,23,42,0.08)",
					bgcolor: "#fff",
					boxShadow: "0 14px 26px rgba(15,23,42,.06)",
					overflow: "hidden",
					textDecoration: "none",
				}}
			>
				<Box sx={{ position: "relative", height: 140 }}>
					<Image
						src={img}
						alt={c.title}
						fill
						sizes="(max-width: 768px) 100vw, 400px"
						style={{ objectFit: "cover" }}
					/>
					<Box
						sx={{
							position: "absolute",
							inset: 0,
							background:
								"linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 70%)",
							pointerEvents: "none",
						}}
					/>
					<Box sx={{ position: "absolute", top: 10, left: 10 }}>
						<Chip
							label={c.category}
							size="small"
							sx={{
								height: 22,
								bgcolor: "rgba(255,255,255,0.92)",
								backdropFilter: "blur(10px)",
								fontWeight: 900,
								"& .MuiChip-label": { px: 1, fontSize: 11 },
							}}
						/>
					</Box>
					<Box
						sx={{
							position: "absolute",
							bottom: 10,
							left: 10,
							px: 1,
							py: "2px",
							borderRadius: 999,
							fontSize: 10,
							fontWeight: 900,
							color: "#fff",
							bgcolor: "rgba(15,23,42,0.72)",
							backdropFilter: "blur(10px)",
						}}
					>
						{isQuickDonate ? "∞" : `${c.daysLeft} hari`}
					</Box>
				</Box>
				<Box sx={{ p: 1.25 }}>
					<Typography
						sx={{
							fontSize: 13,
							fontWeight: 900,
							color: "text.primary",
							lineHeight: 1.25,
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
							overflow: "hidden",
							minHeight: 34,
						}}
					>
						{c.title}
					</Typography>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mt: 1,
						}}
					>
						<Typography
							sx={{
								fontSize: 10,
								fontWeight: 700,
								color: "rgba(15,23,42,.50)",
							}}
						>
							Terkumpul
						</Typography>
						<Typography sx={{ fontSize: 10, fontWeight: 900, color: PRIMARY }}>
							{isQuickDonate ? "∞" : `${pct}%`}
						</Typography>
					</Box>
					{!isQuickDonate && (
						<Box
							sx={{
								height: 6,
								borderRadius: 999,
								bgcolor: "#e11d48",
								overflow: "hidden",
							}}
						>
							<Box
								sx={{
									height: "100%",
									width: `${pct}%`,
									bgcolor: PRIMARY,
									borderRadius: 999,
									transition: "width 250ms ease",
								}}
							/>
						</Box>
					)}
					<Box
						sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}
					>
						<Typography
							sx={{ fontSize: 11, fontWeight: 900, color: "text.primary" }}
						>
							Rp {rupiah(c.collected)}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Link>
	);
}

export default async function KategoriIdPage({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: { sort?: string };
}) {
	const categorySlug = params.id;
	const sortKey = searchParams?.sort || "newest";
	const categoryName = CATEGORY_TITLE[categorySlug] || undefined;

	const sortMap: Record<string, string> = {
		newest: "newest",
		oldest: "oldest",
		most_collected: "most_collected",
		ending_soon: "ending_soon",
	};
	const sortParam = sortMap[sortKey] || "newest";

	const res = await getCampaigns(
		1,
		48,
		"active",
		"",
		undefined,
		categoryName,
		undefined,
		undefined,
		sortParam,
	);

	const rows: any[] =
		res.success && Array.isArray((res as any).data) ? (res as any).data : [];

	const sorts = [
		{ key: "newest", label: "Terbaru" },
		{ key: "oldest", label: "Terlama" },
		{ key: "most_collected", label: "Terkumpul Terbanyak" },
		{ key: "ending_soon", label: "Segera Berakhir" },
	];

	const title = categoryName || "Semua Campaign";
	const base = `/kategori/${encodeURIComponent(categorySlug)}`;

	return (
		<Box sx={{ px: 2, py: 2 }}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: 2,
				}}
			>
				<Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
					{title}
				</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					gap: 1,
					overflowX: "auto",
					pb: 1,
					mb: 2,
					"&::-webkit-scrollbar": { display: "none" },
				}}
			>
				{sorts.map((s) => {
					const href = `${base}?sort=${s.key}`;
					return (
						<SortLink
							key={s.key}
							label={s.label}
							href={href}
							selected={sortKey === s.key}
						/>
					);
				})}
			</Box>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(2, 1fr)",
					gap: 1.5,
				}}
			>
				{rows.map((c) => (
					<CampaignCard key={c.id} c={c} />
				))}
			</Box>
		</Box>
	);
}
