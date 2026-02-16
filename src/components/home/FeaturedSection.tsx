"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Campaign } from "@/types";

const PRIMARY = "#0ba976";

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
				border: "none",
				boxShadow: "none",
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
					bgcolor: pct > 0 ? PRIMARY : "transparent",
					borderRadius: 999,
					transition: "width 250ms ease",
				}}
			/>
		</Box>
	);
}

function FeaturedCard({ c }: { c: Campaign }) {
	const router = useRouter();
	const [imgSrc, setImgSrc] = React.useState(c.cover || "/defaultimg.webp");
	const rawPct = c.target ? Math.round((c.collected / c.target) * 100) : 0;
	const pct = Math.min(100, Math.max(0, rawPct));

	const handleCardClick = () => {
		router.push(`/donasi/${c.slug || c.id}`);
	};

	return (
		<Box
			onClick={handleCardClick}
			sx={{
				minWidth: 240,
				maxWidth: 240,
				bgcolor: "#fff",
				boxShadow: "none",
				border: "1px solid rgba(15,23,42,0.06)",
				overflow: "hidden",
				scrollSnapAlign: "start",
				position: "relative",
				cursor: "pointer",
				userSelect: "none",
				transition: "transform 140ms ease",
				"&:active": { transform: "scale(0.99)" },
			}}
		>
			<Box sx={{ position: "relative", height: 140 }}>
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
			</Box>

			<Box sx={{ p: 1.5 }}>
				<Typography
					sx={{
						fontSize: 14,
						fontWeight: 900,
						color: "text.primary",
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
					{c.organizerVerifiedAt ? (
						<Chip
							label={c.organizerVerifiedAs === "organization" ? "ORG" : "PER"}
							size="small"
							sx={{
								height: 18,
								bgcolor: "rgba(11,169,118,0.14)",
								color: PRIMARY,
								fontWeight: 900,
								"& .MuiChip-label": { px: 0.8, fontSize: 9 },
							}}
						/>
					) : null}
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
							{`${pct}%`}
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

function FeaturedRow({ c, last = false }: { c: Campaign; last?: boolean }) {
	const router = useRouter();
	const [imgSrc, setImgSrc] = React.useState(c.cover || "/defaultimg.webp");
	const rawPct = c.target ? Math.round((c.collected / c.target) * 100) : 0;
	const pct = Math.min(100, Math.max(0, rawPct));
	const onClick = () => router.push(`/donasi/${c.slug || c.id}`);

	return (
		<Box
			onClick={onClick}
			sx={{
				display: "flex",
				gap: 1.5,
				py: 1.25,
				borderBottom: last ? "none" : "1px solid rgba(15,23,42,0.06)",
				cursor: "pointer",
				"&:active": { transform: "scale(0.995)" },
			}}
		>
			<Box
				sx={{
					position: "relative",
					width: 180,
					height: 104,
					overflow: "hidden",
				}}
			>
				<Image
					src={imgSrc}
					alt={c.title}
					fill
					sizes="180px"
					style={{ objectFit: "cover" }}
					onError={() => setImgSrc("/defaultimg.webp")}
				/>
			</Box>

			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography
					sx={{
						fontSize: 14,
						fontWeight: 900,
						color: "text.primary",
						lineHeight: 1.25,
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
					}}
				>
					{c.title}
				</Typography>

				<Box
					sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75 }}
				>
					<Typography sx={{ fontSize: 11, color: "rgba(15,23,42,.60)" }}>
						{c.organizer}
					</Typography>
					{c.organizerVerifiedAt ? (
						<Chip
							label={c.organizerVerifiedAs === "organization" ? "ORG" : "PER"}
							size="small"
							sx={{
								height: 18,
								bgcolor: "rgba(11,169,118,0.14)",
								color: PRIMARY,
								fontWeight: 900,
								"& .MuiChip-label": { px: 0.8, fontSize: 9 },
							}}
						/>
					) : null}
				</Box>

				<Box sx={{ mt: 1 }}>
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
							sx={{ fontSize: 10, fontWeight: 900, color: PRIMARY }}
						>{`${pct}%`}</Typography>
					</Box>
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
					<Box
						sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}
					>
						<Typography
							sx={{ fontSize: 11, fontWeight: 900, color: "text.primary" }}
						>
							Rp {new Intl.NumberFormat("id-ID").format(c.collected)}
						</Typography>
						<Typography
							sx={{
								fontSize: 11,
								fontWeight: 700,
								color: "rgba(15,23,42,.60)",
							}}
						>
							Sisa hari {c.daysLeft}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export default function FeaturedSection({
	campaigns = [],
	title = "Pilihan Kitabisa",
}: {
	campaigns?: Campaign[];
	title?: string;
}) {
	if (!campaigns || campaigns.length === 0) return null;
	const top = campaigns.slice(0, 5);

	return (
		<Box sx={{ px: 2, mt: 2.5 }}>
			<Box
				sx={{
					p: 2,
					borderRadius: 2,
					bgcolor: "#EAF7FF",
					border: "1px solid rgba(15,23,42,0.06)",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						mb: 1.5,
					}}
				>
					<Typography sx={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
						{title}
					</Typography>
				</Box>

				<Box>
					{top.map((c, i) => (
						<FeaturedRow key={c.id} c={c} last={i === top.length - 1} />
					))}
				</Box>

				<Box sx={{ mt: 1.5, display: "flex", justifyContent: "center" }}>
					<Button
						variant="text"
						component={Link}
						href="/galang-dana"
						sx={{
							textTransform: "none",
							fontWeight: 800,
							color: PRIMARY,
							bgcolor: "rgba(11,169,118,0.10)",
							px: 2,
							borderRadius: 999,
							"&:hover": { bgcolor: "rgba(11,169,118,0.18)" },
						}}
					>
						Lihat semua
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
