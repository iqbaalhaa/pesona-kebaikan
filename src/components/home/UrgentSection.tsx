"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Image from "next/image";

const PRIMARY = "#61ce70";

type Item = {
	id: string;
	title: string;
	organizer: string;
	tag?: string;
	cover: string;
	target: number;
	collected: number;
	daysLeft: number;
};

const items: Item[] = [
	{
		id: "1",
		title: "Selamatkan Ratusan Anabul Korban Banjir Sumatra!",
		organizer: "Suara Kasih Satwa Indonesia",
		tag: "ORG",
		cover: "/campaign/urgent-1.jpg",
		target: 500000000,
		collected: 294855927,
		daysLeft: 68,
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
	},
];

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
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
		<Box
			sx={{
				height: 7,
				borderRadius: 999,
				overflow: "hidden",
				display: "flex",
				bgcolor: "rgba(15,23,42,0.08)",
			}}
		>
			<Box
				sx={{
					width: `${pct}%`,
					bgcolor: PRIMARY,
					transition: "width 250ms ease",
				}}
			/>
			<Box
				sx={{
					width: `${100 - pct}%`,
					bgcolor: "rgba(225,29,72,0.85)",
					transition: "width 250ms ease",
				}}
			/>
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

	const ArrowButton = ({
		dir,
		onClick,
	}: {
		dir: "left" | "right";
		onClick: () => void;
	}) => (
		<Box
			role="button"
			tabIndex={0}
			aria-label={dir === "left" ? "Geser ke kiri" : "Geser ke kanan"}
			onClick={onClick}
			onKeyDown={(e) => e.key === "Enter" && onClick()}
			sx={{
				width: 38,
				height: 38,
				borderRadius: 999,
				display: "grid",
				placeItems: "center",
				cursor: "pointer",
				userSelect: "none",
				bgcolor: "rgba(255,255,255,0.92)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(15,23,42,0.10)",
				boxShadow: "0 14px 26px rgba(15,23,42,.14)",
				"&:active": { transform: "scale(0.98)" },
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
					Penggalangan Dana Mendesak
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
					onClick={() => alert("Lihat semua (route menyusul)")}
				>
					Lihat semua
				</Button>
			</Box>

			{/* Slider wrapper */}
			<Box
				sx={{
					position: "relative",
					// desktop: tombol muncul saat hover, mobile: tetap tampil kalau canLeft/Right
					"&:hover .urgentNav": { opacity: 1 },
					"&:focus-within .urgentNav": { opacity: 1 },
				}}
			>
				{/* Floating arrows */}
				{canLeft && (
					<Box
						className="urgentNav"
						sx={{
							position: "absolute",
							left: -6,
							top: 78,
							zIndex: 5,
							// default: mobile tampil, desktop hide sampai hover
							opacity: { xs: 1, md: 0 },
							transition: "opacity 160ms ease",
						}}
					>
						<ArrowButton dir="left" onClick={scrollPrev} />
					</Box>
				)}

				{canRight && (
					<Box
						className="urgentNav"
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

				{/* Slider */}
				<Box
					ref={scrollRef}
					sx={{
						display: "flex",
						gap: 1.5,
						overflowX: "auto",
						pb: 1,
						pr: 0.25,
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
					{items.map((c) => {
						const pct = Math.round((c.collected / c.target) * 100);
						const needed = Math.max(0, c.target - c.collected);

						return (
							<Box
								key={c.id}
								sx={{
									minWidth: 260,
									maxWidth: 260,
									borderRadius: 3,
									border: "1px solid rgba(15,23,42,0.08)",
									bgcolor: "#fff",
									boxShadow: "0 14px 30px rgba(15,23,42,.08)",
									overflow: "hidden",
									scrollSnapAlign: "start",
								}}
							>
								<Box sx={{ position: "relative", height: 140 }}>
									<Image
										src={c.cover}
										alt={c.title}
										fill
										sizes="260px"
										style={{ objectFit: "cover" }}
									/>
									<Chip
										label={`${c.daysLeft} hari lagi`}
										size="small"
										sx={{
											position: "absolute",
											top: 10,
											left: 10,
											height: 24,
											fontWeight: 900,
											bgcolor: "rgba(255,255,255,0.92)",
											backdropFilter: "blur(10px)",
											"& .MuiChip-label": { px: 1 },
										}}
									/>
								</Box>

								<Box sx={{ p: 1.5 }}>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<Typography
											sx={{ fontSize: 11.5, color: "rgba(15,23,42,.65)" }}
										>
											{c.organizer}
										</Typography>

										{c.tag && (
											<Box
												sx={{
													fontSize: 10,
													fontWeight: 900,
													px: 1,
													py: "1px",
													borderRadius: 999,
													bgcolor: "rgba(97,206,112,0.14)",
													color: PRIMARY,
													border: "1px solid rgba(97,206,112,0.28)",
												}}
											>
												{c.tag}
											</Box>
										)}
									</Box>

									<Typography
										sx={{
											mt: 0.75,
											fontSize: 13.5,
											fontWeight: 900,
											color: "#0f172a",
											lineHeight: 1.25,
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
											minHeight: 36,
										}}
									>
										{c.title}
									</Typography>

									<Box sx={{ mt: 1.1 }}>
										<ProgressBarDual
											collected={c.collected}
											target={c.target}
										/>

										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
												mt: 0.8,
											}}
										>
											<Typography
												sx={{ fontSize: 11, color: "rgba(15,23,42,.55)" }}
											>
												Terkumpul{" "}
												<Box
													component="span"
													sx={{ fontWeight: 900, color: "#0f172a" }}
												>
													Rp{rupiah(c.collected)}
												</Box>
											</Typography>

											<Typography
												sx={{ fontSize: 11, color: "rgba(15,23,42,.55)" }}
											>
												Target{" "}
												<Box
													component="span"
													sx={{ fontWeight: 900, color: "#0f172a" }}
												>
													Rp{rupiah(c.target)}
												</Box>
											</Typography>
										</Box>

										<Typography
											sx={{
												mt: 0.35,
												fontSize: 11,
												fontWeight: 900,
												color: "rgba(225,29,72,0.92)",
											}}
										>
											Dibutuhkan Rp{rupiah(needed)}
										</Typography>

										<Typography
											sx={{
												mt: 0.25,
												fontSize: 11,
												color: "rgba(15,23,42,.45)",
											}}
										>
											{Math.min(100, pct)}% terkumpul
										</Typography>
									</Box>

									<Button
										fullWidth
										variant="contained"
										sx={{
											mt: 1.25,
											textTransform: "none",
											fontWeight: 900,
											borderRadius: 2.5,
											py: 1,
											bgcolor: PRIMARY,
											color: "#0b1220",
											boxShadow: "0 14px 26px rgba(97,206,112,.22)",
											"&:hover": { bgcolor: PRIMARY },
											"&:active": { transform: "scale(0.99)" },
										}}
										onClick={() => alert("Donasi Sekarang (checkout menyusul)")}
									>
										Donasi Sekarang
									</Button>
								</Box>
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
}
