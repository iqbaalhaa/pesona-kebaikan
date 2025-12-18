"use client";

import * as React from "react";
import Link from "next/link";
import {
	Box,
	Paper,
	Typography,
	IconButton,
	InputBase,
	Divider,
	ButtonBase,
	Drawer,
	List,
	ListItemButton,
	ListItemText,
	Chip,
	Card,
	CardContent,
	CardMedia,
	LinearProgress,
	Stack,
	Checkbox,
	FormControlLabel,
	Slider,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

type DrawerType = "category" | "sort" | "filter" | null;

type Campaign = {
	id: string;
	title: string;
	org: string;
	verified?: boolean;
	category: string;
	img: string;
	collected: number;
	target: number;
	daysLeft: number;
	urgent?: boolean;
};

const CATEGORIES = [
	"Semua",
	"Mendesak & Darurat",
	"Kesehatan",
	"Bencana Alam",
	"Pendidikan",
	"Rumah Ibadah",
	"Zakat",
	"Anak & Yatim",
	"Difabel",
];

const SORTS = [
	{ key: "recommended", label: "Rekomendasi" },
	{ key: "newest", label: "Terbaru" },
	{ key: "most_collected", label: "Paling banyak terkumpul" },
	{ key: "ending_soon", label: "Mau berakhir" },
];

const MOCK: Campaign[] = [
	{
		id: "tanam-harapan-difabel",
		title: "Tanam Harapan untuk Para Petani Difabel!",
		org: "CollabForChange",
		verified: true,
		category: "Difabel",
		img: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=70",
		collected: 483_580_004,
		target: 800_000_000,
		daysLeft: 86,
	},
	{
		id: "bantu-pak-cecep",
		title: "TOLONG! Sebatangkara, Bantu Perjuangan Pak Cecep",
		org: "Kebaikan Indonesia",
		verified: true,
		category: "Kesehatan",
		img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=70",
		collected: 925_000,
		target: 20_000_000,
		daysLeft: 119,
		urgent: true,
	},
	{
		id: "bapak-tunanetra",
		title: "Bapak Tunanetra Penjual Serai Berjuang Untuk Hidup",
		org: "Yayasan Bina Mulia",
		verified: false,
		category: "Mendesak & Darurat",
		img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=70",
		collected: 544_000,
		target: 15_000_000,
		daysLeft: 59,
	},
];

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

export default function DonasiPage() {
	const [drawer, setDrawer] = React.useState<DrawerType>(null);

	const [q, setQ] = React.useState("");
	const [category, setCategory] = React.useState("Semua");
	const [sort, setSort] =
		React.useState<(typeof SORTS)[number]["key"]>("recommended");

	// Filter state (simple)
	const [onlyVerified, setOnlyVerified] = React.useState(false);
	const [onlyUrgent, setOnlyUrgent] = React.useState(false);
	const [maxDaysLeft, setMaxDaysLeft] = React.useState<number>(365);

	const data = React.useMemo(() => {
		let items = [...MOCK];

		// category
		if (category !== "Semua")
			items = items.filter((x) => x.category === category);

		// search
		if (q.trim()) {
			const k = q.trim().toLowerCase();
			items = items.filter(
				(x) =>
					x.title.toLowerCase().includes(k) || x.org.toLowerCase().includes(k)
			);
		}

		// filters
		if (onlyVerified) items = items.filter((x) => !!x.verified);
		if (onlyUrgent) items = items.filter((x) => !!x.urgent);
		items = items.filter((x) => x.daysLeft <= maxDaysLeft);

		// sort
		if (sort === "newest") {
			// mock: keep as is (nanti ganti dari API)
		} else if (sort === "most_collected") {
			items.sort((a, b) => b.collected - a.collected);
		} else if (sort === "ending_soon") {
			items.sort((a, b) => a.daysLeft - b.daysLeft);
		} else {
			// recommended (mock)
		}

		return items;
	}, [q, category, sort, onlyVerified, onlyUrgent, maxDaysLeft]);

	return (
		<Box sx={{ px: 2, pb: 2 }}>
			{/* Header in-page */}
			<Typography sx={{ fontWeight: 800, fontSize: 18, pt: 2 }}>
				Bantu Siapa Hari Ini?
			</Typography>
			<Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}>
				Cari donasi yang paling cocok buat kamu.
			</Typography>

			{/* Sticky Search + Action Bar */}
			<Box
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 3,
					bgcolor: "background.default",
					pt: 1.5,
					pb: 1,
				}}
			>
				{/* Search form (di atas tombol kategori/urutkan/filter) */}
				<Paper
					component="form"
					onSubmit={(e) => e.preventDefault()}
					elevation={0}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						px: 1.25,
						py: 0.75,
						borderRadius: 999,
						border: "1px solid",
						borderColor: "divider",
						bgcolor: "background.paper",
					}}
				>
					<IconButton size="small" sx={{ color: "text.secondary" }}>
						<SearchRoundedIcon />
					</IconButton>
					<InputBase
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari donasi, lembaga, atau judul…"
						sx={{ flex: 1, fontSize: 14 }}
					/>
					{q ? (
						<Chip
							label="Reset"
							size="small"
							variant="outlined"
							onClick={() => setQ("")}
							sx={{ borderRadius: 999 }}
						/>
					) : null}
				</Paper>

				{/* Action row */}
				<Paper
					elevation={0}
					sx={{
						mt: 1.25,
						borderRadius: 2,
						border: "1px solid",
						borderColor: "divider",
						overflow: "hidden",
					}}
				>
					<Box sx={{ display: "flex" }}>
						<ActionButton
							icon={<CategoryOutlinedIcon fontSize="small" />}
							label="Kategori"
							value={category === "Semua" ? "" : category}
							onClick={() => setDrawer("category")}
						/>
						<Divider flexItem orientation="vertical" />
						<ActionButton
							icon={<SortOutlinedIcon fontSize="small" />}
							label="Urutkan"
							value={SORTS.find((s) => s.key === sort)?.label ?? ""}
							onClick={() => setDrawer("sort")}
						/>
						<Divider flexItem orientation="vertical" />
						<ActionButton
							icon={<TuneOutlinedIcon fontSize="small" />}
							label="Filter"
							value={
								[
									onlyVerified ? "Verified" : null,
									onlyUrgent ? "Darurat" : null,
									maxDaysLeft < 365 ? `≤${maxDaysLeft} hari` : null,
								]
									.filter(Boolean)
									.join(" • ") || ""
							}
							onClick={() => setDrawer("filter")}
						/>
					</Box>
				</Paper>

				{/* Quick chips (optional, biar enak pindah kategori cepat) */}
				<Box
					sx={{
						mt: 1,
						display: "flex",
						gap: 1,
						overflowX: "auto",
						pb: 0.5,
						"&::-webkit-scrollbar": { display: "none" },
					}}
				>
					{CATEGORIES.map((c) => (
						<Chip
							key={c}
							label={c}
							clickable
							variant={category === c ? "filled" : "outlined"}
							onClick={() => setCategory(c)}
							sx={{ borderRadius: 999 }}
						/>
					))}
				</Box>
			</Box>

			{/* List */}
			<Box sx={{ mt: 1 }}>
				{data.map((x) => {
					const progress = Math.min(
						100,
						Math.round((x.collected / x.target) * 100)
					);
					return (
						<Link
							key={x.id}
							href={`/donasi/${x.id}`}
							style={{ textDecoration: "none" }}
						>
							<Card
								elevation={0}
								sx={{
									borderRadius: 3,
									border: "1px solid",
									borderColor: "divider",
									overflow: "hidden",
									mb: 1.25,
								}}
							>
								<Box sx={{ display: "flex", gap: 1.25, p: 1.25 }}>
									<CardMedia
										component="img"
										image={x.img}
										alt={x.title}
										sx={{
											width: 130,
											height: 88,
											borderRadius: 2,
											objectFit: "cover",
											flexShrink: 0,
										}}
									/>
									<CardContent
										sx={{ p: 0, "&:last-child": { pb: 0 }, flex: 1 }}
									>
										<Stack direction="row" spacing={1} alignItems="center">
											{x.urgent ? (
												<Chip
													label="DARURAT"
													size="small"
													color="error"
													sx={{ borderRadius: 999, fontWeight: 700 }}
												/>
											) : (
												<Chip
													label="REKOMENDASI"
													size="small"
													sx={{ borderRadius: 999, fontWeight: 700 }}
												/>
											)}
											{x.verified ? (
												<Chip
													icon={<VerifiedRoundedIcon />}
													label="Terverifikasi"
													size="small"
													variant="outlined"
													sx={{ borderRadius: 999 }}
												/>
											) : null}
										</Stack>

										<Typography
											sx={{
												mt: 0.75,
												fontWeight: 800,
												fontSize: 14,
												lineHeight: 1.25,
												color: "text.primary",
											}}
											className="line-clamp-2"
										>
											{x.title}
										</Typography>

										<Typography
											sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}
										>
											{x.org} • {x.category}
										</Typography>

										<Box sx={{ mt: 1 }}>
											<LinearProgress variant="determinate" value={progress} />
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													mt: 0.6,
												}}
											>
												<Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>
													Rp{rupiah(x.collected)}
												</Typography>
												<Typography
													sx={{ fontSize: 12.5, color: "text.secondary" }}
												>
													Sisa {x.daysLeft} hari
												</Typography>
											</Box>
										</Box>
									</CardContent>
								</Box>
							</Card>
						</Link>
					);
				})}
			</Box>

			{/* Bottom Sheets */}
			<BottomSheet
				open={drawer === "category"}
				title="Pilih Kategori"
				onClose={() => setDrawer(null)}
			>
				<List sx={{ p: 0 }}>
					{CATEGORIES.map((c) => (
						<ListItemButton
							key={c}
							selected={category === c}
							onClick={() => {
								setCategory(c);
								setDrawer(null);
							}}
						>
							<ListItemText primary={c} />
						</ListItemButton>
					))}
				</List>
			</BottomSheet>

			<BottomSheet
				open={drawer === "sort"}
				title="Urutkan"
				onClose={() => setDrawer(null)}
			>
				<List sx={{ p: 0 }}>
					{SORTS.map((s) => (
						<ListItemButton
							key={s.key}
							selected={sort === s.key}
							onClick={() => {
								setSort(s.key);
								setDrawer(null);
							}}
						>
							<ListItemText primary={s.label} />
						</ListItemButton>
					))}
				</List>
			</BottomSheet>

			<BottomSheet
				open={drawer === "filter"}
				title="Filter"
				onClose={() => setDrawer(null)}
			>
				<Box sx={{ px: 2, pb: 2 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={onlyVerified}
								onChange={(e) => setOnlyVerified(e.target.checked)}
							/>
						}
						label="Hanya yang terverifikasi"
					/>
					<FormControlLabel
						control={
							<Checkbox
								checked={onlyUrgent}
								onChange={(e) => setOnlyUrgent(e.target.checked)}
							/>
						}
						label="Tampilkan yang darurat saja"
					/>

					<Box sx={{ mt: 2 }}>
						<Typography sx={{ fontWeight: 800, fontSize: 13 }}>
							Batas sisa hari (≤ {maxDaysLeft} hari)
						</Typography>
						<Slider
							value={maxDaysLeft}
							onChange={(_, v) => setMaxDaysLeft(v as number)}
							min={7}
							max={365}
							step={7}
							valueLabelDisplay="auto"
						/>
					</Box>

					<Stack direction="row" spacing={1} sx={{ mt: 2 }}>
						<Chip
							label="Reset"
							variant="outlined"
							onClick={() => {
								setOnlyVerified(false);
								setOnlyUrgent(false);
								setMaxDaysLeft(365);
							}}
							sx={{ borderRadius: 999 }}
						/>
						<Chip
							label="Terapkan"
							color="success"
							onClick={() => setDrawer(null)}
							sx={{ borderRadius: 999, fontWeight: 800 }}
						/>
					</Stack>
				</Box>
			</BottomSheet>
		</Box>
	);
}

function ActionButton({
	icon,
	label,
	value,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	value?: string;
	onClick: () => void;
}) {
	return (
		<ButtonBase
			onClick={onClick}
			sx={{
				flex: 1,
				px: 1,
				py: 1.25,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: 0.75,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
				<Box
					sx={{
						color: "text.secondary",
						display: "grid",
						placeItems: "center",
					}}
				>
					{icon}
				</Box>
				<Box>
					<Typography sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.1 }}>
						{label}
					</Typography>
					{value ? (
						<Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.2 }}>
							{value}
						</Typography>
					) : (
						<Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.2 }}>
							Pilih
						</Typography>
					)}
				</Box>
			</Box>
		</ButtonBase>
	);
}

function BottomSheet({
	open,
	title,
	onClose,
	children,
}: {
	open: boolean;
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}) {
	return (
		<Drawer
			anchor="bottom"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					borderTopLeftRadius: 18,
					borderTopRightRadius: 18,
					overflow: "hidden",
					maxWidth: 480,
					mx: "auto",
					width: "100%",
				},
			}}
		>
			<Box
				sx={{
					px: 2,
					py: 1.5,
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Typography sx={{ fontWeight: 900 }}>{title}</Typography>
			</Box>
			{children}
			<Box sx={{ height: 10 }} />
		</Drawer>
	);
}
