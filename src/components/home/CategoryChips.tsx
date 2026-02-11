"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Category, Campaign } from "@/types";
import { alpha, useTheme } from "@mui/material/styles";
import { CATEGORY_TITLE } from "@/lib/constants";
import { getCategoryIcon } from "@/lib/categoryIcons";

// Icons
import GridViewIcon from "@mui/icons-material/GridView";

const PRIMARY = "#0ba976";

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
		{
			id: "lihat_semua",
			label: "Lihat Semua",
			icon: <GridViewIcon sx={{ fontSize: 24 }} />,
		},
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
	const theme = useTheme();
	const primaryMain = theme.palette.primary.main;

	return (
		<Box
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => e.key === "Enter" && onClick()}
			className="w-full p-2 cursor-pointer select-none transition-all duration-150 ease-out active:scale-95"
			sx={{
				borderRadius: 1,
				border: "none",
				bgcolor: "transparent",
				boxShadow: "none",
			}}
		>
			<Box
				className="w-14 h-14 rounded-full mx-auto grid place-items-center"
				sx={{
					bgcolor: selected ? alpha(primaryMain, 0.22) : "action.hover",
					border: selected
						? `1px solid ${alpha(primaryMain, 0.3)}`
						: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
					color: selected ? primaryMain : "text.secondary",
					"& .MuiSvgIcon-root": { fontSize: 32 },
				}}
			>
				{c.icon}
			</Box>

			<Typography
				className="mt-2 text-[11.5px] font-black text-center leading-tight"
				sx={{
					color: selected ? "text.primary" : "text.secondary",
				}}
			>
				{c.label}
			</Typography>
		</Box>
	);
}

function ProgressMini({ pct }: { pct: number }) {
	return (
		<Box
			sx={{
				height: 6,
				borderRadius: 999,
				bgcolor: "rgba(15,23,42,0.08)",
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					height: "100%",
					width: `${Math.min(100, Math.max(0, pct))}%`,
					bgcolor: pct > 0 ? PRIMARY : "transparent",
					borderRadius: 999,
					transition: "width 250ms ease",
				}}
			/>
		</Box>
	);
}

function CampaignRowCard({ item }: { item: Campaign }) {
	const router = useRouter();
	const [imgSrc, setImgSrc] = React.useState(item.cover || "/defaultimg.webp");
	const pct = item.target
		? Math.round((item.collected / item.target) * 100)
		: 0;

	const handleCardClick = () => {
		router.push(`/donasi/${item.slug || item.id}`);
	};

	return (
		<Box
			onClick={handleCardClick}
			sx={{
				minWidth: 200,
				maxWidth: 200,
								borderRadius: 0,
								border: "none",
								bgcolor: "#fff",
				boxShadow: "0 14px 26px rgba(15,23,42,.06)",
				overflow: "hidden",
				position: "relative",
				cursor: "pointer",
				userSelect: "none",
				transition: "transform 140ms ease",
				"&:active": { transform: "scale(0.99)" },
			}}
		>
			{/* Cover */}
			<Box sx={{ position: "relative", height: 120 }}>
				<Box
					className="relative w-full h-full flex-shrink-0 overflow-hidden bg-gray-100"
					sx={{ borderRadius: 0 }}
				>
					<Image
						src={imgSrc}
						alt={item.title}
						fill
						sizes="(max-width: 768px) 100vw, 400px"
						style={{ objectFit: "cover" }}
						onError={() => setImgSrc("/defaultimg.webp")}
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
							label={item.category}
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
						{item.daysLeft} hari
					</Box>
				</Box>
			</Box>

			{/* Body */}
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
					{item.title}
				</Typography>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 0.75,
						mt: 0.8,
					}}
				>
					<Typography sx={{ fontSize: 11, color: "rgba(15,23,42,.60)" }}>
						{item.organizer}
					</Typography>
					<Chip
						label="ORG"
						size="small"
						sx={{
							height: 18,
							bgcolor: "rgba(11,169,118,0.14)",
							color: PRIMARY,
							fontWeight: 900,
							"& .MuiChip-label": { px: 0.8, fontSize: 9 },
						}}
					/>
				</Box>

				<Box sx={{ mt: 1.5 }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 0.5,
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
						<Typography
							sx={{
								fontSize: 10,
								fontWeight: 900,
								color: PRIMARY,
							}}
						>
							{pct}%
						</Typography>
					</Box>
					<ProgressMini pct={pct} />
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							mt: 0.5,
						}}
					>
						<Typography
							sx={{ fontSize: 11, fontWeight: 900, color: "text.primary" }}
						>
							Rp {rupiah(item.collected)}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
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
		const base =
			categories && categories.length > 0
				? categories
				: buildDefaultCategories();
		const allowed = new Set(["medis", "pendidikan", "bencana"]);
		if (categories && categories.length > 0) {
			const filtered = categories
				.filter((c) => allowed.has(c.id))
				.map((c) => ({
					...c,
					label: CATEGORY_TITLE[c.id] || c.label,
					icon: c.icon || getCategoryIcon(CATEGORY_TITLE[c.id] || c.label).icon,
				}));
			return [
				...filtered,
				{
					id: "lihat_semua",
					label: "Lihat Semua",
					icon: <GridViewIcon sx={{ fontSize: 24 }} />,
				},
			];
		}
		return base;
	}, [categories]);

	const filtered = React.useMemo(() => {
		if (activeId === "lihat_semua") return campaigns;
		const selected = categoriesList.find((c) => c.id === activeId);
		if (!selected) return campaigns;
		const label = selected.label.toLowerCase();
		const syn: Record<string, string[]> = {
			medis: [
				"medis",
				"kesehatan",
				"bantuan medis",
				"bantuan medis & kesehatan",
			],
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
		<Box sx={{ px: 2, mt: 3 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography sx={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
					Kategori Pilihan
				</Typography>
			</Box>

			{/* Chips Grid */}
			<Box className="grid grid-cols-4 gap-2">
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
			</Box>

			{/* Filtered List - Horizontal Scroll */}
			<Box sx={{ mt: 3 }}>
				{filtered.length > 0 ? (
					<Box
						sx={{
							display: "flex",
							gap: 1.5,
							overflowX: "auto",
							pb: 0,
							scrollSnapType: "x mandatory",
							WebkitOverflowScrolling: "touch",
							"&::-webkit-scrollbar": { display: "none" },
							msOverflowStyle: "none",
							scrollbarWidth: "none",
						}}
					>
						{filtered.map((item) => (
							<Box key={item.id} sx={{ scrollSnapAlign: "start" }}>
								<CampaignRowCard item={item} />
							</Box>
						))}
					</Box>
				) : (
					<Typography className="text-center text-gray-500 text-sm py-8">
						Belum ada penggalangan dana di kategori ini
					</Typography>
				)}
			</Box>

			<Box sx={{ mt: 2, height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />
		</Box>
	);
}
