"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
	useTheme,
	alpha,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Types matching the API response
export type CampaignItem = {
	id: string;
	slug?: string;
	title: string;
	category: string;
	type?: string;
	ownerName: string;
	target: number;
	collected: number;
	donors: number;
	daysLeft: number;
	status: string;
	updatedAt: string;
	thumbnail: string;
	isEmergency?: boolean; // If available
	verifiedAt?: Date | string | null; // If available
};

type DrawerType = "category" | "sort" | "filter" | null;

const CATEGORIES = [
	"Semua",
	"Bantuan Medis & Kesehatan",
	"Bencana Alam",
	"Pendidikan",
	"Rumah Ibadah",
	"Zakat",
	"Anak & Yatim",
	"Difabel",
	"Infrastruktur Umum",
	"Karya Kreatif & Modal Usaha",
	"Kegiatan Sosial",
	"Kemanusiaan",
	"Lingkungan",
	"Lainnya",
];

const SORTS = [
	{ key: "recommended", label: "Rekomendasi" },
	{ key: "newest", label: "Terbaru" },
	{ key: "most_collected", label: "Paling banyak terkumpul" },
	{ key: "ending_soon", label: "Mau berakhir" },
];

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

export default function DonationExplorer({
	initialData,
	categories = [],
}: {
	initialData: CampaignItem[];
	categories?: string[];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const theme = useTheme();

	// Drawer state
	const [drawer, setDrawer] = React.useState<DrawerType>(null);

	// Merge default categories if empty (fallback) or prepend 'Semua'
	const categoryList = ["Semua", ...categories];
	const q = searchParams.get("q") || "";
	const category = searchParams.get("category") || "Semua";
	const sort = searchParams.get("sort") || "recommended";
	const onlyVerified = searchParams.get("verified") === "true";
	const onlyUrgent = searchParams.get("urgent") === "true";
	// const maxDaysLeft = parseInt(searchParams.get("maxDays") || "365");

	// Local state for immediate feedback (debounced search, etc) could be added
	// For now, we drive everything via URL for simplicity + shareability

	const updateParam = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		router.push(`?${params.toString()}`);
	};

	const handleSearch = (newQ: string) => {
		// Debouncing could be good here, but for now simple state
		// We'll just update URL on Enter or blur to avoid too many refreshes
		// Or keep local state for input and push on submit
	};

	const [localQ, setLocalQ] = React.useState(q);

	return (
		<Box sx={{ px: 2, pb: 12 }}>
			{/* Header in-page */}
			<Typography
				sx={{ fontWeight: 800, fontSize: 20, pt: 3, color: "#0f172a" }}
			>
				Bantu Siapa Hari Ini?
			</Typography>
			<Typography
				sx={{ color: "text.secondary", fontSize: 14, mt: 0.5, mb: 2 }}
			>
				Temukan ribuan kebaikan yang menunggu uluran tanganmu.
			</Typography>

			{/* Sticky Search + Action Bar */}
			<Box
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 10,
					mx: -2,
					px: 2,
					py: 2,
					background: "rgba(248, 250, 252, 0.8)",
					backdropFilter: "blur(12px)",
					borderBottom: "1px solid rgba(0,0,0,0.04)",
				}}
			>
				{/* Search form */}
				<Paper
					component="form"
					onSubmit={(e) => {
						e.preventDefault();
						updateParam("q", localQ);
					}}
					elevation={0}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						px: 2,
						py: 1.2,
						borderRadius: 4,
						border: "1px solid",
						borderColor: alpha(theme.palette.divider, 0.8),
						bgcolor: "#fff",
						boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
						transition: "all 0.2s ease",
						"&:focus-within": {
							borderColor: theme.palette.primary.main,
							boxShadow: `0 4px 20px ${alpha(
								theme.palette.primary.main,
								0.15
							)}`,
						},
					}}
				>
					<SearchRoundedIcon sx={{ color: "text.secondary" }} />
					<InputBase
						value={localQ}
						onChange={(e) => setLocalQ(e.target.value)}
						placeholder="Cari donasi, lembaga, atau judul…"
						sx={{ flex: 1, fontSize: 15, fontWeight: 500 }}
					/>
					{localQ ? (
						<IconButton
							size="small"
							onClick={() => {
								setLocalQ("");
								updateParam("q", null);
							}}
						>
							<CloseRoundedIcon fontSize="small" />
						</IconButton>
					) : null}
				</Paper>

				{/* Action row */}
				<Stack
					direction="row"
					spacing={1}
					sx={{ mt: 1.5, overflowX: "auto", pb: 0.5 }}
					className="no-scrollbar"
				>
					{/* Category Button */}
					<Chip
						icon={<CategoryOutlinedIcon fontSize="small" />}
						label={category === "Semua" ? "Kategori" : category}
						onClick={() => setDrawer("category")}
						variant={category === "Semua" ? "outlined" : "filled"}
						color={category === "Semua" ? "default" : "primary"}
						sx={{
							borderRadius: 2,
							fontWeight: 600,
							height: 36,
							borderStyle: category === "Semua" ? "solid" : "none",
						}}
					/>

					{/* Filter Button */}
					<Chip
						icon={<TuneOutlinedIcon fontSize="small" />}
						label="Filter"
						onClick={() => setDrawer("filter")}
						variant={onlyVerified || onlyUrgent ? "filled" : "outlined"}
						color={onlyVerified || onlyUrgent ? "primary" : "default"}
						sx={{ borderRadius: 2, fontWeight: 600, height: 36 }}
					/>

					{/* Sort Button */}
					<Chip
						icon={<SortOutlinedIcon fontSize="small" />}
						label={SORTS.find((s) => s.key === sort)?.label || "Urutkan"}
						onClick={() => setDrawer("sort")}
						variant="outlined"
						sx={{ borderRadius: 2, fontWeight: 600, height: 36 }}
					/>
				</Stack>
			</Box>

			{/* List */}
			<Box sx={{ mt: 1 }}>
				{initialData.length === 0 && (
					<Box sx={{ textAlign: "center", py: 8 }}>
						<Typography variant="body1" color="text.secondary">
							Belum ada donasi yang sesuai kriteria.
						</Typography>
					</Box>
				)}

				{initialData.map((x) => {
					const progress = Math.min(
						100,
						Math.round((x.collected / x.target) * 100)
					);
					return (
						<Link
							key={x.id}
							href={`/donasi/${x.slug || x.id}`}
							style={{ textDecoration: "none" }}
						>
							<Card
								elevation={0}
								sx={{
									borderRadius: 4,
									border: "1px solid",
									borderColor: "divider",
									overflow: "hidden",
									mb: 2,
									transition: "all 0.2s ease",
									"&:hover": {
										borderColor: "transparent",
										boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
										transform: "translateY(-2px)",
									},
								}}
							>
								<Box sx={{ display: "flex", gap: 2, p: 2 }}>
									<CardMedia
										component="img"
										image={x.thumbnail || "/defaultimg.webp"}
										alt={x.title}
										sx={{
											width: 120,
											height: 120,
											borderRadius: 3,
											objectFit: "cover",
											flexShrink: 0,
											bgcolor: "#f1f5f9",
										}}
									/>
									<CardContent
										sx={{
											p: 0,
											"&:last-child": { pb: 0 },
											flex: 1,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<Stack
											direction="row"
											spacing={0.5}
											alignItems="center"
											flexWrap="wrap"
											gap={0.5}
											sx={{ mb: 1 }}
										>
											{/* {x.isEmergency && ( // Need to expose isEmergency in getCampaigns
												<Chip
													label="DARURAT"
													size="small"
													color="error"
													sx={{ borderRadius: 1, fontWeight: 800, height: 20, fontSize: 10 }}
												/>
											)} */}
											{/* We can use category as tag */}
											<Chip
												label={x.category}
												size="small"
												sx={{
													borderRadius: 1.5,
													fontWeight: 600,
													height: 22,
													fontSize: 10,
													bgcolor: alpha(theme.palette.primary.main, 0.08),
													color: theme.palette.primary.main,
												}}
											/>
											{x.ownerName === "Verified User" || x.verifiedAt ? ( // Check actual verified field if available
												<Chip
													icon={
														<VerifiedRoundedIcon
															sx={{ fontSize: "14px !important" }}
														/>
													}
													label="Verified"
													size="small"
													variant="outlined"
													sx={{
														borderRadius: 1.5,
														height: 22,
														fontSize: 10,
														borderColor: alpha(theme.palette.primary.main, 0.3),
														color: theme.palette.primary.main,
													}}
												/>
											) : null}
										</Stack>

										<Typography
											sx={{
												fontWeight: 800,
												fontSize: 15,
												lineHeight: 1.4,
												color: "text.primary",
												mb: 0.5,
											}}
											className="line-clamp-2"
										>
											{x.title}
										</Typography>

										<Typography
											sx={{ fontSize: 12, color: "text.secondary", mb: "auto" }}
										>
											{x.ownerName}
										</Typography>

										<Box sx={{ mt: 2 }}>
											<LinearProgress
												variant="determinate"
												value={progress}
												sx={{
													height: 6,
													borderRadius: 3,
													bgcolor: alpha(theme.palette.primary.main, 0.1),
													"& .MuiLinearProgress-bar": {
														borderRadius: 3,
													},
												}}
											/>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													mt: 1,
													alignItems: "flex-end",
												}}
											>
												<Box>
													<Typography
														sx={{
															fontSize: 11,
															color: "text.secondary",
															fontWeight: 500,
														}}
													>
														Terkumpul
													</Typography>
													<Typography
														sx={{
															fontSize: 14,
															fontWeight: 800,
															color: theme.palette.primary.main,
														}}
													>
														Rp{rupiah(x.collected)}
													</Typography>
												</Box>
												<Box sx={{ textAlign: "right" }}>
													<Typography
														sx={{
															fontSize: 11,
															color: "text.secondary",
															fontWeight: 500,
														}}
													>
														Sisa Hari
													</Typography>
													<Stack
														direction="row"
														alignItems="center"
														spacing={0.5}
														justifyContent="flex-end"
													>
														<AccessTimeRoundedIcon
															sx={{ fontSize: 14, color: "text.secondary" }}
														/>
														<Typography
															sx={{
																fontSize: 13,
																fontWeight: 700,
																color: "text.primary",
															}}
														>
															{x.daysLeft}
														</Typography>
													</Stack>
												</Box>
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
					{categoryList.map((c) => (
						<ListItemButton
							key={c}
							selected={category === c}
							onClick={() => {
								updateParam("category", c);
								setDrawer(null);
							}}
							sx={{ borderRadius: 2, mb: 0.5 }}
						>
							<ListItemText
								primary={c}
								primaryTypographyProps={{
									fontWeight: category === c ? 700 : 500,
								}}
							/>
							{category === c && (
								<VerifiedRoundedIcon color="primary" fontSize="small" />
							)}
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
								updateParam("sort", s.key);
								setDrawer(null);
							}}
							sx={{ borderRadius: 2, mb: 0.5 }}
						>
							<ListItemText
								primary={s.label}
								primaryTypographyProps={{
									fontWeight: sort === s.key ? 700 : 500,
								}}
							/>
							{sort === s.key && (
								<VerifiedRoundedIcon color="primary" fontSize="small" />
							)}
						</ListItemButton>
					))}
				</List>
			</BottomSheet>

			<BottomSheet
				open={drawer === "filter"}
				title="Filter"
				onClose={() => setDrawer(null)}
			>
				<Box sx={{ px: 2, pb: 4 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={onlyVerified}
								onChange={(e) =>
									updateParam("verified", e.target.checked ? "true" : null)
								}
							/>
						}
						label={
							<Typography fontWeight={600}>Hanya yang terverifikasi</Typography>
						}
						sx={{ display: "flex", mb: 1 }}
					/>
					<FormControlLabel
						control={
							<Checkbox
								checked={onlyUrgent}
								onChange={(e) =>
									updateParam("urgent", e.target.checked ? "true" : null)
								}
							/>
						}
						label={
							<Typography fontWeight={600}>
								Tampilkan yang darurat saja
							</Typography>
						}
						sx={{ display: "flex", mb: 1 }}
					/>

					<Stack direction="row" spacing={1} sx={{ mt: 3 }}>
						<Chip
							label="Reset Filter"
							variant="outlined"
							onClick={() => {
								const params = new URLSearchParams(searchParams.toString());
								params.delete("verified");
								params.delete("urgent");
								router.push(`?${params.toString()}`);
								setDrawer(null);
							}}
							sx={{ borderRadius: 3, flex: 1, fontWeight: 700, py: 2.5 }}
							clickable
						/>
						<Chip
							label="Terapkan"
							color="primary"
							onClick={() => setDrawer(null)}
							sx={{ borderRadius: 3, flex: 1, fontWeight: 700, py: 2.5 }}
							clickable
						/>
					</Stack>
				</Box>
			</BottomSheet>
		</Box>
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
			ModalProps={{ hideBackdrop: false }} // Better with backdrop
			PaperProps={{
				sx: {
					// Make it look like a nice bottom sheet
					mx: { xs: 0, sm: "auto" },
					width: "100%",
					maxWidth: 480,
					borderTopLeftRadius: 24,
					borderTopRightRadius: 24,
					overflow: "hidden",
					pb: "env(safe-area-inset-bottom)",
				},
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 1 }}>
				<Box
					sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "divider" }}
				/>
			</Box>
			<Box
				sx={{
					px: 3,
					pb: 2,
					borderBottom: "1px solid",
					borderColor: "divider",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Typography sx={{ fontWeight: 800, fontSize: 18 }}>{title}</Typography>
				<IconButton size="small" onClick={onClose}>
					<CloseRoundedIcon />
				</IconButton>
			</Box>
			<Box sx={{ maxHeight: "70vh", overflowY: "auto", px: 1 }}>{children}</Box>
			<Box sx={{ height: 10 }} />
		</Drawer>
	);
}
