"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Image from "next/image";

const PRIMARY = "#61ce70";

type Category = {
	id: string;
	label: string;
	emoji: string; // sementara, nanti bisa ganti icon png/svg
};

type Campaign = {
	id: string;
	categoryId: string;
	title: string;
	organizer: string;
	cover: string; // taruh file di public/campaign/
	collected: number;
	daysLeft: number;
	recommended?: boolean;
};

const categories: Category[] = [
	{ id: "bencana", label: "Bencana Alam", emoji: "🌧️" },
	{ id: "anak", label: "Balita & Anak Sakit", emoji: "🧒" },
	{ id: "kesehatan", label: "Bantuan Medis & Kesehatan", emoji: "🩺" },
	{ id: "lainnya", label: "Lainnya", emoji: "➕" },
];

const campaigns: Campaign[] = [
	{
		id: "c1",
		categoryId: "bencana",
		title: "Bersama BAZNAS, Bantu Sesama Bangkit dari Bencana",
		organizer: "BAZNAS Hub",
		cover: "/campaign/urgent-2.jpg",
		collected: 3591602064,
		daysLeft: 1840,
		recommended: true,
	},
	{
		id: "c2",
		categoryId: "bencana",
		title: "Kelambu Demi Pencegahan Penyakit Banjir Aceh",
		organizer: "Rumah Zakat",
		cover: "/campaign/urgent-1.jpg",
		collected: 165000,
		daysLeft: 29,
	},
	{
		id: "c3",
		categoryId: "bencana",
		title: "Truk Kemanusiaan untuk Korban Bencana",
		organizer: "IZI Zakat",
		cover: "/campaign/urgent-3.jpg",
		collected: 234000,
		daysLeft: 7,
	},

	{
		id: "c4",
		categoryId: "anak",
		title: "Bantu Biaya Perawatan Anak Pejuang Sembuh",
		organizer: "Relawan Pesona",
		cover: "/campaign/urgent-3.jpg",
		collected: 18350000,
		daysLeft: 12,
		recommended: true,
	},
	{
		id: "c5",
		categoryId: "anak",
		title: "Susu dan Nutrisi untuk Balita Kurang Gizi",
		organizer: "Komunitas Peduli",
		cover: "/campaign/urgent-1.jpg",
		collected: 5600000,
		daysLeft: 18,
	},

	{
		id: "c6",
		categoryId: "kesehatan",
		title: "Bantu Operasi Darurat untuk Pasien Tidak Mampu",
		organizer: "Yayasan Harapan",
		cover: "/campaign/urgent-2.jpg",
		collected: 22400000,
		daysLeft: 5,
		recommended: true,
	},
	{
		id: "c7",
		categoryId: "kesehatan",
		title: "Ambulans Gratis untuk Warga",
		organizer: "Lembaga Sosial",
		cover: "/campaign/urgent-1.jpg",
		collected: 12450000,
		daysLeft: 22,
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
	return (
		<Box
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => e.key === "Enter" && onClick()}
			sx={{
				width: "100%",
				borderRadius: 3,
				p: 1.25,
				cursor: "pointer",
				userSelect: "none",
				transition:
					"transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease",
				border: selected
					? "1px solid rgba(97,206,112,0.45)"
					: "1px solid rgba(15,23,42,0.10)",
				bgcolor: selected ? "rgba(97,206,112,0.14)" : "rgba(255,255,255,0.92)",
				boxShadow: selected
					? "0 16px 26px rgba(97,206,112,.14)"
					: "0 14px 24px rgba(15,23,42,.06)",
				"&:active": { transform: "scale(0.99)" },
			}}
		>
			<Box
				sx={{
					width: 44,
					height: 44,
					borderRadius: 999,
					mx: "auto",
					display: "grid",
					placeItems: "center",
					bgcolor: selected ? "rgba(97,206,112,0.22)" : "rgba(15,23,42,0.06)",
					border: selected
						? "1px solid rgba(97,206,112,0.30)"
						: "1px solid rgba(15,23,42,0.08)",
				}}
			>
				<Box sx={{ fontSize: 20 }}>{c.emoji}</Box>
			</Box>

			<Typography
				sx={{
					mt: 1,
					fontSize: 11.5,
					fontWeight: 900,
					textAlign: "center",
					color: selected ? "rgba(15,23,42,.92)" : "rgba(15,23,42,.72)",
					lineHeight: 1.15,
				}}
			>
				{c.label}
			</Typography>
		</Box>
	);
}

function CampaignRowCard({ item }: { item: Campaign }) {
	return (
		<Box
			sx={{
				display: "flex",
				gap: 1.25,
				p: 1.25,
				borderRadius: 3,
				border: "1px solid rgba(15,23,42,0.08)",
				bgcolor: "#fff",
				boxShadow: "0 14px 24px rgba(15,23,42,.06)",
			}}
		>
			{/* Cover */}
			<Box
				sx={{
					position: "relative",
					width: 110,
					height: 70,
					borderRadius: 2,
					overflow: "hidden",
					flexShrink: 0,
					bgcolor: "rgba(15,23,42,.06)",
				}}
			>
				<Image
					src={item.cover}
					alt={item.title}
					fill
					sizes="110px"
					style={{ objectFit: "cover" }}
				/>
				{item.recommended && (
					<Box
						sx={{
							position: "absolute",
							top: 8,
							left: 8,
							px: 1,
							py: "2px",
							borderRadius: 999,
							fontSize: 9,
							fontWeight: 900,
							color: "#fff",
							bgcolor: "#f97316",
							boxShadow: "0 12px 20px rgba(249,115,22,.20)",
						}}
					>
						REKOMENDASI
					</Box>
				)}
			</Box>

			{/* Content */}
			<Box sx={{ minWidth: 0, flex: 1 }}>
				<Typography
					sx={{
						fontSize: 12.5,
						fontWeight: 900,
						color: "#0f172a",
						lineHeight: 1.2,
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
					}}
				>
					{item.title}
				</Typography>

				<Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
					<Typography sx={{ fontSize: 11, color: "rgba(15,23,42,.60)" }}>
						{item.organizer}
					</Typography>
					<Chip
						label="ORG"
						size="small"
						sx={{
							height: 18,
							bgcolor: "rgba(97,206,112,0.14)",
							color: PRIMARY,
							border: "1px solid rgba(97,206,112,0.28)",
							fontWeight: 900,
							"& .MuiChip-label": { px: 0.75, fontSize: 10 },
						}}
					/>
				</Box>

				<Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
					<Typography sx={{ fontSize: 11, color: "rgba(15,23,42,.55)" }}>
						Terkumpul{" "}
						<Box component="span" sx={{ fontWeight: 900, color: "#0f172a" }}>
							Rp{rupiah(item.collected)}
						</Box>
					</Typography>

					<Typography sx={{ fontSize: 11, color: "rgba(15,23,42,.55)" }}>
						Sisa hari{" "}
						<Box component="span" sx={{ fontWeight: 900, color: "#0f172a" }}>
							{item.daysLeft}
						</Box>
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}

export default function CategoryChips() {
	const [active, setActive] = React.useState(categories[0].id);

	const list =
		active === "lainnya"
			? campaigns.slice(0, 3)
			: campaigns.filter((c) => c.categoryId === active).slice(0, 3);

	return (
		<Box sx={{ px: 2.5, mt: 2.5 }}>
			<Typography
				sx={{ fontSize: 16, fontWeight: 900, color: "#0f172a", mb: 1.25 }}
			>
				Pilih Kategori Favoritmu
			</Typography>

			{/* Kategori buttons: fix lebar (4 kolom) */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
					gap: 1.25,
				}}
			>
				{categories.map((c) => (
					<CategoryButton
						key={c.id}
						c={c}
						selected={active === c.id}
						onClick={() => setActive(c.id)}
					/>
				))}
			</Box>

			{/* Cards berdasarkan kategori */}
			<Box sx={{ mt: 1.75, display: "grid", gap: 1.25 }}>
				{list.map((item) => (
					<CampaignRowCard key={item.id} item={item} />
				))}
			</Box>

			{/* CTA Lihat semua */}
			<Button
				fullWidth
				variant="contained"
				sx={{
					mt: 1.75,
					textTransform: "none",
					fontWeight: 900,
					borderRadius: 999,
					py: 1.05,
					bgcolor: "rgba(97,206,112,0.16)",
					color: "#0f172a",
					border: "1px solid rgba(97,206,112,0.30)",
					boxShadow: "0 14px 26px rgba(97,206,112,.12)",
					"&:hover": { bgcolor: "rgba(97,206,112,0.20)" },
				}}
				onClick={() =>
					alert("Lihat semua campaign kategori ini (route menyusul)")
				}
			>
				Lihat semua
			</Button>

			<Box sx={{ mt: 2, height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />
		</Box>
	);
}
