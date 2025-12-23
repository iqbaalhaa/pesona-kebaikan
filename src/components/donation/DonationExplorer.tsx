"use client";

import * as React from "react";
import {
	Box,
	Container,
	Typography,
	Card,
	CardMedia,
	CardContent,
	Chip,
	Stack,
	LinearProgress,
	TextField,
	InputAdornment,
	useTheme,
	alpha,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

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
	isEmergency?: boolean;
	verifiedAt?: Date | string | null;
};

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

	// URL State
	const q = searchParams.get("q") || "";
	const category = searchParams.get("category") || "Semua";
	const onlyVerified = searchParams.get("verified") === "true";
	const onlyUrgent = searchParams.get("urgent") === "true";

	// Local state for search input
	const [searchVal, setSearchVal] = React.useState(q);

	React.useEffect(() => {
		setSearchVal(q);
	}, [q]);

	const updateParam = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) params.set(key, value);
		else params.delete(key);
		router.push(`?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		updateParam("q", searchVal || null);
	};

	const toggleVerified = () =>
		updateParam("verified", onlyVerified ? null : "true");
	const toggleUrgent = () => updateParam("urgent", onlyUrgent ? null : "true");

	const categoryList = ["Semua", ...categories];

	return (
		<Container maxWidth="xl" sx={{ py: 4 }}>
			{/* Header & Search */}
			<Box
				sx={{
					mb: 4,
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					gap: 2,
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box>
					<Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
						Jelajahi Donasi
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Temukan kampanye yang sesuai dengan kepedulian Anda.
					</Typography>
				</Box>

				<Box
					component="form"
					onSubmit={handleSearch}
					sx={{ width: { xs: "100%", md: 400 } }}
				>
					<TextField
						fullWidth
						placeholder="Cari donasi..."
						value={searchVal}
						onChange={(e) => setSearchVal(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchRoundedIcon />
								</InputAdornment>
							),
							sx: { borderRadius: 3, bgcolor: "background.paper" },
						}}
						size="small"
					/>
				</Box>
			</Box>

			{/* Filters */}
			<Stack
				direction="row"
				spacing={1}
				sx={{ mb: 3, overflowX: "auto", pb: 1 }}
				alignItems="center"
			>
				{categoryList.map((cat) => (
					<Chip
						key={cat}
						label={cat}
						onClick={() =>
							updateParam("category", cat === "Semua" ? null : cat)
						}
						color={category === cat ? "primary" : "default"}
						variant={category === cat ? "filled" : "outlined"}
						clickable
						sx={{ fontWeight: 600 }}
					/>
				))}

				<Box sx={{ flexGrow: 1 }} />

				<Chip
					label="Mendesak"
					onClick={toggleUrgent}
					color={onlyUrgent ? "error" : "default"}
					variant={onlyUrgent ? "filled" : "outlined"}
					clickable
				/>
				<Chip
					label="Terverifikasi"
					onClick={toggleVerified}
					color={onlyVerified ? "info" : "default"}
					variant={onlyVerified ? "filled" : "outlined"}
					icon={onlyVerified ? <VerifiedRoundedIcon /> : undefined}
					clickable
				/>
			</Stack>

			{/* List Grid */}
			<Box
				sx={{
					mt: 2,
					display: "grid",
					gridTemplateColumns: "repeat(2, minmax(0, 1fr))", // ✅ selalu 2 kolom
					gap: 1.25, // ✅ lebih rapat (sebelumnya 2)
				}}
			>
				{initialData.length === 0 && (
					<Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 6 }}>
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
									height: "100%",
									display: "flex",
									flexDirection: "column",
									borderRadius: 1, // sedikit lebih kecil
									border: "1px solid",
									borderColor: "divider",
									overflow: "hidden",
									transition: "all 0.2s ease",
									"&:hover": {
										borderColor: "transparent",
										boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
										transform: "translateY(-4px)",
									},
								}}
							>
								<CardMedia
									component="img"
									image={x.thumbnail || "/defaultimg.webp"}
									alt={x.title}
									sx={{
										width: "100%",
										height: 110, // ✅ lebih pendek (sebelumnya 140)
										objectFit: "cover",
										bgcolor: "#f1f5f9",
									}}
								/>

								<CardContent
									sx={{
										p: 1.25, // ✅ lebih rapat (sebelumnya 1.5)
										"&:last-child": { pb: 1.25 },
										flex: 1,
										display: "flex",
										flexDirection: "column",
									}}
								>
									{/* chips */}
									<Stack
										direction="row"
										spacing={0.5}
										alignItems="center"
										flexWrap="wrap"
										gap={0.5}
										sx={{ mb: 0.75 }} // ✅ rapatkan
									>
										<Chip
											label={x.category}
											size="small"
											sx={{
												borderRadius: 1.5,
												fontWeight: 600,
												height: 18, // ✅ lebih kecil
												fontSize: 10,
												bgcolor: alpha(theme.palette.primary.main, 0.08),
												color: theme.palette.primary.main,
											}}
										/>
										{x.ownerName === "Verified User" || x.verifiedAt ? (
											<Chip
												icon={
													<VerifiedRoundedIcon
														sx={{ fontSize: "12px !important" }}
													/>
												}
												label="Verified"
												size="small"
												variant="outlined"
												sx={{
													borderRadius: 1.5,
													height: 18, // ✅ lebih kecil
													fontSize: 10,
													borderColor: alpha(theme.palette.primary.main, 0.3),
													color: theme.palette.primary.main,
												}}
											/>
										) : null}
									</Stack>

									{/* title */}
									<Typography
										sx={{
											fontWeight: 800,
											fontSize: 13, // ✅ sedikit turun
											lineHeight: 1.35,
											color: "text.primary",
											mb: 0.25,
											minHeight: 34, // ✅ lebih pendek (sebelumnya 40)
										}}
										className="line-clamp-2"
									>
										{x.title}
									</Typography>

									{/* owner */}
									<Typography
										sx={{
											fontSize: 11,
											color: "text.secondary",
											mb: "auto",
										}}
									>
										{x.ownerName}
									</Typography>

									{/* progress */}
									<Box sx={{ mt: 1.5 }}>
										<LinearProgress
											variant="determinate"
											value={progress}
											sx={{
												height: 5, // ✅ lebih tipis (sebelumnya 6)
												borderRadius: 3,
												bgcolor: alpha(theme.palette.primary.main, 0.1),
												"& .MuiLinearProgress-bar": { borderRadius: 3 },
											}}
										/>

										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
												mt: 0.75, // ✅ rapatkan
												alignItems: "flex-end",
											}}
										>
											<Box>
												<Typography
													sx={{
														fontSize: 10,
														color: "text.secondary",
														fontWeight: 500,
													}}
												>
													Terkumpul
												</Typography>
												<Typography
													sx={{
														fontSize: 12,
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
														fontSize: 10,
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
														sx={{ fontSize: 12, color: "text.secondary" }}
													/>
													<Typography
														sx={{
															fontSize: 12,
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
							</Card>
						</Link>
					);
				})}
			</Box>
		</Container>
	);
}
