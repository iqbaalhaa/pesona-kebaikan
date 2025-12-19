"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Image from "next/image";
import { Campaign } from "@/types";

const items: Campaign[] = [
	{
		id: "1",
		title: "Selamatkan Ratusan Anabul Korban Banjir Sumatra!",
		organizer: "Suara Kasih Satwa Indonesia",
		tag: "ORG",
		cover: "/campaign/urgent-1.jpg",
		target: 500000000,
		collected: 294855927,
		daysLeft: 68,
		donors: 3240,
	},
	{
		id: "2",
		title: "DARURAT! Bantu Korban Banjir Sumut, Aceh & Sumbar",
		organizer: "Rumah Zakat",
		tag: "ORG",
		cover: "/campaign/urgent-2.jpg",
		target: 800000000,
		collected: 563200065,
		daysLeft: 12,
		donors: 5120,
	},
	{
		id: "3",
		title: "Bantu Biaya Berobat Anak Kecil yang Sakit",
		organizer: "Relawan Pesona",
		tag: "VERIFIED",
		cover: "/campaign/urgent-3.jpg",
		target: 50000000,
		collected: 18350000,
		daysLeft: 3,
		donors: 420,
	},
	{
		id: "4",
		title: "Bantu Renovasi Sekolah Terdampak Gempa",
		organizer: "Peduli Pendidikan",
		tag: "ORG",
		cover: "/campaign/urgent-1.jpg",
		target: 150000000,
		collected: 45000000,
		daysLeft: 25,
		donors: 890,
	},
];

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

function ArrowButton({
	dir,
	onClick,
}: {
	dir: "left" | "right";
	onClick: () => void;
}) {
	return (
		<Box
			role="button"
			tabIndex={0}
			aria-label={dir === "left" ? "Geser ke kiri" : "Geser ke kanan"}
			onClick={onClick}
			onKeyDown={(e) => e.key === "Enter" && onClick()}
			sx={{
				width: 38,
				height: 38,
				borderRadius: "12px",
				display: "grid",
				placeItems: "center",
				cursor: "pointer",
				userSelect: "none",
				bgcolor: "rgba(255,255,255,0.92)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(15,23,42,0.10)",
				boxShadow: "0 14px 26px rgba(15,23,42,.14)",
				"&:active": { transform: "scale(0.98)" },
				transition: "all 0.2s ease",
				"&:hover": { bgcolor: "#fff", transform: "scale(1.05)" },
			}}
		>
			<Box
				sx={{
					fontSize: 20,
					fontWeight: 900,
					color: "rgba(15,23,42,.75)",
					mt: "-1px",
				}}
			>
				{dir === "left" ? "‹" : "›"}
			</Box>
		</Box>
	);
}
function ProgressBarDual({
	collected,
	target,
}: {
	collected: number;
	target: number;
}) {
	const pct = Math.max(
		0,
		Math.min(100, Math.round((collected / target) * 100))
	);

	return (
		<Box className="h-1.5 rounded-full overflow-hidden flex bg-white">
			<Box
				className="transition-all duration-300 ease-out"
				sx={{
					width: `${pct}%`,
					bgcolor: "primary.main",
				}}
			/>
			<Box
				className="transition-all duration-300 ease-out"
				sx={{
					width: `${100 - pct}%`,
					bgcolor: "#e11d48", // rose-600 for urgency gap
				}}
			/>
		</Box>
	);
}

function UrgentCard({ item }: { item: Campaign }) {
	const [imgSrc, setImgSrc] = React.useState(item.cover || "/defaultimg.webp");

	return (
		<Box
			className="flex-shrink-0 w-[260px] snap-center bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
			sx={{ bgcolor: "#fff", borderRadius: { md: 1 } }}
		>
			{/* Cover */}
			<Box
				className="relative h-[140px] overflow-hidden bg-gray-100"
				sx={{ borderTopLeftRadius: { md: 3 }, borderTopRightRadius: { md: 3 } }}
			>
				<Image
					src={imgSrc}
					alt={item.title}
					fill
					sizes="260px"
					style={{ objectFit: "cover" }}
					className="group-hover:scale-105 transition-transform duration-500"
					onError={() => setImgSrc("/defaultimg.webp")}
				/>
				{/* Tag */}
				<Box className="absolute top-2 left-2">
					<Chip
						label={item.tag === "ORG" ? "ORGANISASI" : "TERVERIFIKASI"}
						size="small"
						className="h-5 text-[9px] font-bold bg-white/95 backdrop-blur-sm shadow-sm"
						sx={{
							color: item.tag === "ORG" ? "primary.main" : "info.main",
							border: "1px solid",
							borderColor: "rgba(255,255,255,0.2)",
						}}
					/>
				</Box>
				{/* Days Left Badge */}
				<Box className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
					{item.daysLeft} hari lagi
				</Box>
			</Box>

			{/* Content */}
			<Box className="p-3">
				<Typography
					className="text-[13px] font-bold leading-snug line-clamp-2 min-h-[40px]"
					sx={{ color: "text.primary" }}
				>
					{item.title}
				</Typography>

				<Box className="flex items-center gap-1.5 mt-2 mb-3">
					<Box className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden relative flex-shrink-0">
						<Image
							src="/brand/logo.png"
							alt={item.organizer}
							fill
							style={{ objectFit: "cover" }}
						/>
					</Box>
					<Typography className="text-[10px] font-medium truncate">
						{item.organizer}
					</Typography>
					{item.tag === "ORG" && (
						<Box className="w-3 h-3 text-blue-500">
							<svg
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-full h-full"
							>
								<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
							</svg>
						</Box>
					)}
				</Box>

				{/* Progress Bar Dual */}
				<ProgressBarDual collected={item.collected} target={item.target || 0} />

				<Box className="flex items-center justify-between mt-2 text-[10px]">
					<Box>
						<span className="block text-[10px]">Terkumpul</span>
						<span className="font-bold ">Rp {rupiah(item.collected)}</span>
					</Box>
					<Box className="text-right">
						<span className="block text-[10px]">Donatur</span>
						<span className="font-bold ">{item.donors}</span>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export default function UrgentSection() {
	const scrollRef = React.useRef<HTMLDivElement | null>(null);
	const rafRef = React.useRef<number | null>(null);

	const [canLeft, setCanLeft] = React.useState(false);
	const [canRight, setCanRight] = React.useState(false);

	const CARD_STEP = 272; // 260 + gap

	const updateArrows = React.useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;

		const left = el.scrollLeft;
		const rightEdge = el.scrollLeft + el.clientWidth;
		const max = el.scrollWidth;

		setCanLeft(left > 2);
		setCanRight(rightEdge < max - 2);
	}, []);

	React.useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		const onScroll = () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(updateArrows);
		};

		updateArrows();
		el.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", updateArrows);

		return () => {
			el.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", updateArrows);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [updateArrows]);

	const scrollPrev = React.useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: -CARD_STEP, top: 0, behavior: "smooth" });
	}, []);

	const scrollNext = React.useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: CARD_STEP, top: 0, behavior: "smooth" });
	}, []);

	return (
		<Box className="mt-6 px-5 relative group">
			<Box className="flex items-center justify-between mb-4">
				<Box className="flex items-center gap-2.5">
					<Box className="relative flex h-3 w-3">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
						<span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
					</Box>
					<Typography
						className="text-base font-extrabold"
						sx={{ color: "text.primary" }}
					>
						Mendesak & Darurat
					</Typography>
				</Box>
				<Button
					size="small"
					variant="text"
					sx={{
						textTransform: "none",
						fontWeight: 600,
						color: "rgba(15,23,42,.60)",
						px: 1,
						borderRadius: 2,
						"&:hover": { bgcolor: "rgba(15,23,42,.04)" },
					}}
				>
					Lihat semua
				</Button>
			</Box>

			{/* Floating arrows */}
			{canLeft && (
				<Box className="hidden md:block absolute left-2 top-[140px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<ArrowButton dir="left" onClick={scrollPrev} />
				</Box>
			)}

			{canRight && (
				<Box className="hidden md:block absolute right-2 top-[140px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<ArrowButton dir="right" onClick={scrollNext} />
				</Box>
			)}

			<Box
				ref={scrollRef}
				className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
				sx={{
					scrollPaddingLeft: 20,
					scrollPaddingRight: 20,
				}}
			>
				{items.map((item) => (
					<UrgentCard key={item.id} item={item} />
				))}
			</Box>
		</Box>
	);
}
