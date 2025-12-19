"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Image from "next/image";

import { Campaign } from "@/types";

const PRIMARY = "#61ce70";

const popular: Campaign[] = [
	{
		id: "p1",
		title: "Bantu Operasi Darurat untuk Pasien Tidak Mampu",
		organizer: "Yayasan Harapan",
		category: "Kesehatan",
		cover: "/campaign/urgent-2.jpg",
		target: 80000000,
		collected: 52450000,
		donors: 1240,
		daysLeft: 5,
		latestUpdate: "Update: Jadwal operasi dipercepat minggu ini.",
	},
	{
		id: "p2",
		title: "DARURAT! Bantu Korban Banjir Sumut, Aceh & Sumbar",
		organizer: "Rumah Zakat",
		category: "Bencana",
		cover: "/campaign/urgent-1.jpg",
		target: 800000000,
		collected: 563200065,
		donors: 9234,
		daysLeft: 12,
		latestUpdate: "Update: Distribusi logistik tahap 2 dimulai.",
	},
	{
		id: "p3",
		title: "Beasiswa Anak Desa untuk Tetap Sekolah",
		organizer: "Relawan Pesona",
		category: "Pendidikan",
		cover: "/campaign/urgent-3.jpg",
		target: 20000000,
		collected: 5600000,
		donors: 210,
		daysLeft: 21,
		latestUpdate: "Update: Seleksi penerima beasiswa sedang berjalan.",
	},
	{
		id: "p4",
		title: "Pakan & Perawatan untuk Anabul Terdampak Banjir",
		organizer: "Suara Kasih Satwa",
		category: "Hewan",
		cover: "/campaign/urgent-1.jpg",
		target: 50000000,
		collected: 29485592,
		donors: 785,
		daysLeft: 9,
		latestUpdate: "Update: Tim rescue tambah 2 titik evakuasi.",
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
				width: 33,
				height: 33,
				borderRadius: "999px",
				display: "grid",
				placeItems: "center",
				cursor: "pointer",
				userSelect: "none",
				bgcolor: "rgba(255,255,255,0.92)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(15,23,42,0.10)",
				"&:active": { transform: "scale(0.98)" },
			}}
		>
			<Box
				sx={{
					fontSize: 18,
					fontWeight: 500,
					color: "rgba(15,23,42,.75)",
					mt: "-1px",
				}}
			>
				{dir === "left" ? "‹" : "›"}
			</Box>
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
					bgcolor: PRIMARY,
					borderRadius: 999,
					transition: "width 250ms ease",
				}}
			/>
		</Box>
	);
}

function PopularCard({ c }: { c: Campaign }) {
	const [imgSrc, setImgSrc] = React.useState(c.cover || "/defaultimg.webp");
	const pct = c.target ? Math.round((c.collected / c.target) * 100) : 0;

	return (
		<Box
			role="button"
			tabIndex={0}
			onClick={() => alert("Ke detail campaign (route menyusul)")}
			onKeyDown={(e) =>
				e.key === "Enter" && alert("Ke detail campaign (route menyusul)")
			}
			sx={{
				minWidth: 240,
				maxWidth: 240,
				borderRadius: { md: 1 },
				border: "1px solid rgba(15,23,42,0.08)",
				bgcolor: "#fff",
				boxShadow: "0 14px 30px rgba(15,23,42,.08)",
				overflow: "hidden",
				scrollSnapAlign: "start",
				cursor: "pointer",
				userSelect: "none",
				transition: "transform 140ms ease",
				"&:active": { transform: "scale(0.99)" },
			}}
		>
			{/* Cover */}
			<Box sx={{ position: "relative", height: 120 }}>
				<Image
					src={imgSrc}
					alt={c.title}
					fill
					sizes="240px"
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
					{c.daysLeft} hari
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
					{c.title}
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
						{c.organizer}
					</Typography>
					<Chip
						label="ORG"
						size="small"
						sx={{
							height: 18,
							bgcolor: "rgba(97,206,112,0.14)",
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
							Rp {rupiah(c.collected)}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export default function PopularSection() {
	const scrollRef = React.useRef<HTMLDivElement | null>(null);
	const rafRef = React.useRef<number | null>(null);

	const [canLeft, setCanLeft] = React.useState(false);
	const [canRight, setCanRight] = React.useState(false);

	const CARD_STEP = 252; // 240 width + gap (12px)

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

		const ro = new ResizeObserver(() => updateArrows());
		ro.observe(el);

		return () => {
			el.removeEventListener("scroll", onScroll);
			ro.disconnect();
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
		<Box sx={{ px: 2.5, mt: 2.5 }}>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: 1.5,
				}}
			>
				<Typography sx={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
					Populer
				</Typography>

				<Button
					size="small"
					variant="text"
					sx={{
						textTransform: "none",
						fontWeight: 800,
						color: "rgba(15,23,42,.60)",
						px: 1,
						borderRadius: 2,
						"&:hover": { bgcolor: "rgba(15,23,42,.04)" },
					}}
					onClick={() => alert("Lihat semua populer (route menyusul)")}
				>
					Lihat semua
				</Button>
			</Box>

			{/* Carousel wrapper */}
			<Box
				sx={{
					position: "relative",
					"&:hover .popularNav": { opacity: 1 },
					"&:focus-within .popularNav": { opacity: 1 },
				}}
			>
				{/* Floating arrows */}
				{canLeft && (
					<Box
						className="popularNav"
						sx={{
							position: "absolute",
							left: -6,
							top: 78,
							zIndex: 5,
							opacity: { xs: 1, md: 0 },
							transition: "opacity 160ms ease",
						}}
					>
						<ArrowButton dir="left" onClick={scrollPrev} />
					</Box>
				)}

				{canRight && (
					<Box
						className="popularNav"
						sx={{
							position: "absolute",
							right: -6,
							top: 78,
							zIndex: 5,
							opacity: { xs: 1, md: 0 },
							transition: "opacity 160ms ease",
						}}
					>
						<ArrowButton dir="right" onClick={scrollNext} />
					</Box>
				)}

				{/* Carousel */}
				<Box
					ref={scrollRef}
					sx={{
						display: "flex",
						gap: 1.5,
						overflowX: "auto",
						pb: 1,
						scrollSnapType: "x mandatory",
						WebkitOverflowScrolling: "touch",
						"&::-webkit-scrollbar": { height: 6 },
						"&::-webkit-scrollbar-thumb": {
							background: "rgba(15,23,42,0.18)",
							borderRadius: 999,
						},
						"&::-webkit-scrollbar-track": {
							background: "rgba(15,23,42,0.06)",
							borderRadius: 999,
						},
					}}
				>
					{popular.map((c) => (
						<PopularCard key={c.id} c={c} />
					))}
				</Box>
			</Box>

			<Box sx={{ mt: 1.5, height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />
		</Box>
	);
}
