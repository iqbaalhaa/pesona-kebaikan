"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Campaign } from "@/types";

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
				border: "none",
				boxShadow: "none",
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
		Math.min(100, Math.round((collected / target) * 100)),
	);

	return (
		<Box className="h-1.5 rounded-full overflow-hidden flex bg-gray-100">
			<Box
				className="transition-all duration-300 ease-out"
				sx={{
					width: `${pct}%`,
					bgcolor: pct > 0 ? "primary.main" : "transparent",
				}}
			/>
			<Box
				className="transition-all duration-300 ease-out"
				sx={{
					width: `${100 - pct}%`,
					bgcolor: "transparent",
				}}
			/>
		</Box>
	);
}

function UrgentCard({ item }: { item: Campaign }) {
	const router = useRouter();
	const [imgSrc, setImgSrc] = React.useState(item.cover || "/defaultimg.webp");

	const isQuickDonate = item.slug === "donasi-cepat";

	const handleCardClick = () => {
		router.push(`/donasi/${item.slug || item.id}`);
	};

	return (
		<Box
			onClick={handleCardClick}
			sx={{
				cursor: "pointer",
				minWidth: 200,
				maxWidth: 200,
				borderRadius: 0,
				overflow: "hidden",
				scrollSnapAlign: "start",
				position: "relative",
				bgcolor: "#fff",
				border: "none",
				boxShadow: "none",
				transition: "transform 0.2s ease",
				"&:hover": { transform: "translateY(-4px)" },
			}}
		>
			{/* Cover */}
			<Box
				className="relative h-[140px] overflow-hidden bg-gray-100"
				sx={{
					borderRadius: 0,
				}}
			>
				<Image
					src={imgSrc}
					alt={item.title}
					fill
					sizes="200px"
					style={{ objectFit: "cover" }}
					className="group-hover:scale-105 transition-transform duration-500"
					onError={() => setImgSrc("/defaultimg.webp")}
				/>
				{/* Tag */}
				<Box
					className="absolute top-2 left-2"
					onClick={(e) => e.stopPropagation()}
				>
					<Chip
						label={item.tag === "ORG" ? "ORGANISASI" : "TERVERIFIKASI"}
						component={Link}
						href="/galang-dana"
						className="h-5 text-[9px] font-bold bg-white/95 backdrop-blur-sm shadow-none"
						sx={{
							color: item.tag === "ORG" ? "primary.main" : "info.main",
							border: "1px solid",
							borderColor: "rgba(255,255,255,0.2)",
							cursor: "pointer",
						}}
					/>
				</Box>
				{/* Days Left Badge */}
				<Box className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
					{isQuickDonate ? "∞" : `${item.daysLeft} hari lagi`}
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
							sizes="16px"
							style={{ objectFit: "cover" }}
						/>
					</Box>
					<Typography
						className="text-[10px] font-medium truncate"
						sx={{ color: "text.secondary" }}
					>
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
				{!isQuickDonate && (
					<ProgressBarDual
						collected={item.collected}
						target={item.target || 0}
					/>
				)}

				<Box className="flex items-center justify-between mt-2 text-[10px]">
					<Box>
						<span className="block text-[10px] text-gray-500">Terkumpul</span>
						<span className="font-bold text-gray-800">
							Rp {rupiah(item.collected)}
						</span>
					</Box>
					<Box className="text-right">
						<span className="block text-[10px] text-gray-500">Donatur</span>
						<span className="font-bold text-gray-800">{item.donors}</span>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export default function UrgentSection({
	campaigns = [],
}: {
	campaigns?: Campaign[];
}) {
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

		// Initial check
		updateArrows();
		// Also check after a short delay to allow rendering
		setTimeout(updateArrows, 500);

		el.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", updateArrows);

		return () => {
			el.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", updateArrows);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [updateArrows, campaigns]);

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

	if (!campaigns || campaigns.length === 0) return null;

	return (
		<Box className="mt-6 px-4 relative group">
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
					component={Link}
					href="/galang-dana"
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
				className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-0"
				sx={{
					scrollPaddingLeft: 20,
					scrollPaddingRight: 20,
					"&::-webkit-scrollbar": { display: "none" },
					msOverflowStyle: "none",
					scrollbarWidth: "none",
				}}
			>
				{campaigns.map((item) => (
					<UrgentCard key={item.id} item={item} />
				))}
			</Box>
		</Box>
	);
}
