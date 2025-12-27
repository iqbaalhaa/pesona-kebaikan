"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Category, Campaign } from "@/types";
import { alpha, useTheme } from "@mui/material/styles";

// Icons
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import GridViewIcon from "@mui/icons-material/GridView";

const categories: Category[] = [
	{
		id: "bencana",
		label: "Bencana Alam",
		icon: <ThunderstormIcon sx={{ fontSize: 24 }} />,
	},
	{
		id: "anak",
		label: "Balita & Anak Sakit",
		icon: <ChildCareIcon sx={{ fontSize: 24 }} />,
	},
	{
		id: "kesehatan",
		label: "Bantuan Medis",
		icon: <MedicalServicesIcon sx={{ fontSize: 24 }} />,
	},
	{
		id: "lainnya",
		label: "Lainnya",
		icon: <GridViewIcon sx={{ fontSize: 24 }} />,
	},
];

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
			className="w-full p-3 cursor-pointer select-none transition-all duration-150 ease-out active:scale-95"
			sx={{
				borderRadius: 1,
				border: selected
					? `1px solid ${alpha(primaryMain, 0.45)}`
					: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
				bgcolor: selected ? alpha(primaryMain, 0.14) : "background.paper",
				boxShadow: selected
					? `0 16px 26px ${alpha(primaryMain, 0.14)}`
					: `0 14px 24px ${alpha(theme.palette.text.primary, 0.06)}`,
			}}
		>
			<Box
				className="w-11 h-11 rounded-full mx-auto grid place-items-center"
				sx={{
					bgcolor: selected ? alpha(primaryMain, 0.22) : "action.hover",
					border: selected
						? `1px solid ${alpha(primaryMain, 0.3)}`
						: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
					color: selected ? primaryMain : "text.secondary",
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

function CampaignRowCard({ item }: { item: Campaign }) {
	const theme = useTheme();
	const [imgSrc, setImgSrc] = React.useState(item.cover || "/defaultimg.webp");

	return (
		<Box
			className="flex gap-3 p-3 bg-white shadow-sm border border-slate-200"
			sx={{
				// Use theme values for precise border/shadow matching if needed, but tailwind is fine here
				bgcolor: "#fff",
				borderRadius: 1,
			}}
		>
			{/* Cover */}
			<Box
				className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-gray-100"
				sx={{ borderRadius: 1 }}
			>
				<Image
					src={imgSrc}
					alt={item.title}
					fill
					sizes="96px"
					style={{ objectFit: "cover" }}
					onError={() => setImgSrc("/defaultimg.webp")}
				/>
			</Box>

			{/* Info */}
			<Box className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
				<Box>
					<Typography
						variant="caption"
						className="text-[10px] font-bold uppercase tracking-wider text-primary"
						sx={{ color: "primary.main" }}
					>
						{item.organizer}
					</Typography>
					<Typography
						className="text-[13px] font-bold leading-snug line-clamp-2 mt-0.5"
						sx={{ color: "text.primary" }}
					>
						{item.title}
					</Typography>
				</Box>

				<Box>
					<Box className="flex items-center justify-between text-[11px] mb-1 mt-2">
						<span className="text-gray-500">Terkumpul</span>
						<span className="font-bold text-gray-600">
							Rp {rupiah(item.collected)}
						</span>
					</Box>
					{/* Progress Bar */}
					<Box className="h-1.5 w-full bg-red-500 rounded-full overflow-hidden">
						<Box
							className="h-full rounded-full bg-primary"
							sx={{ width: "55%", bgcolor: "primary.main" }}
						/>
					</Box>
					<Box className="flex items-center gap-1 mt-1.5">
						<Typography variant="caption" className="text-[10px] text-gray-500">
							Sisa hari
						</Typography>
						<Chip
							label={`${item.daysLeft} hari`}
							size="small"
							sx={{
								height: 18,
								fontSize: 9,
								fontWeight: 700,
								bgcolor: alpha(theme.palette.primary.main, 0.1),
								color: "primary.main",
								"& .MuiChip-label": { px: 0.8 },
							}}
						/>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export default function CategoryChips({
	campaigns = [],
}: {
	campaigns?: Campaign[];
}) {
	const router = useRouter();
	const [selected, setSelected] = React.useState("bencana");

	const filtered = React.useMemo(() => {
		// "lainnya" no longer shows all campaigns here, but we keep it safe
		if (selected === "lainnya") return campaigns;
		// Since real data might have different categoryIds, we might need a better matching strategy.
		// For now, let's assume categoryId matches or we show all if 'lainnya'.
		// Or filter by exact match if provided.
		// If the campaigns from DB don't have "bencana" etc as categoryId, this might show nothing.
		// Let's try to match loosely or show all for now if no match found?
		// Better: filtering by the hardcoded IDs.
		return campaigns.filter((c) => c.categoryId === selected);
	}, [selected, campaigns]);

	return (
		<Box className="px-4 mt-6 mb-6">
			<Box className="flex items-center justify-between mb-4">
				<Typography
					className="text-base font-extrabold"
					sx={{ color: "text.primary" }}
				>
					Pilih Kategori
				</Typography>
			</Box>

			{/* Grid Categories */}
			<Box className="grid grid-cols-4 gap-3">
				{categories.map((c) => (
					<CategoryButton
						key={c.id}
						c={c}
						selected={selected === c.id}
						onClick={() => {
							if (c.id === "lainnya") {
								router.push("/kategori");
							} else {
								setSelected(c.id);
							}
						}}
					/>
				))}
			</Box>

			{/* List Campaign */}
			<Box className="mt-5 flex flex-col gap-3">
				{filtered.map((item) => (
					<CampaignRowCard key={item.id} item={item} />
				))}
			</Box>
		</Box>
	);
}
