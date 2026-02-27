"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import {
	Box,
	Paper,
	Typography,
	IconButton,
	Stack,
	LinearProgress,
	Alert,
	Divider,
	Grid,
	Card,
	CardActionArea,
	CardContent,
} from "@mui/material";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";

import { getCategoryIcon } from "@/lib/categoryIcons";
import {
	processCategories,
	CategoryData,
	MEDICAL_SLUG,
	MEDICAL_TITLE,
} from "@/lib/categoryUtils";

const BRAND = "#0ba976";

type Example = { id: string; title: string; img?: string };

function ExampleCard({ e }: { e: Example }) {
	return (
		<Paper
			elevation={0}
			sx={{
				width: 168,
				borderRadius: 2,
				overflow: "hidden",
				border: "1px solid",
				borderColor: "divider",
				flexShrink: 0,
				bgcolor: "background.paper",
			}}
		>
			<Box
				component="img"
				src={e.img || "/defaultimg.webp"}
				alt={e.title}
				sx={{
					width: "100%",
					height: 96,
					objectFit: "cover",
					display: "block",
					bgcolor: "background.default",
				}}
				onError={(ev: React.SyntheticEvent<HTMLImageElement, Event>) => {
					ev.currentTarget.style.display = "none";
				}}
			/>
			<Box sx={{ p: 1 }}>
				<Typography
					sx={{ fontSize: 12.5, fontWeight: 900 }}
					className="line-clamp-2"
				>
					{e.title}
				</Typography>
			</Box>
		</Paper>
	);
}

export default function GalangDanaKategoriPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { status } = useSession();

	const [categories, setCategories] = React.useState<CategoryData[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const isLainnyaCategory = React.useCallback((c: CategoryData) => {
		const slug = (c.slug || "").trim().toLowerCase();
		const name = (c.name || "").trim().toLowerCase();
		return slug === "lainnya" || name === "lainnya";
	}, []);

	// Parse initial type from query params
	const initialType = searchParams.get("type");
	const initialStep =
		initialType === "medis" || initialType === "non-medis"
			? "CATEGORY_SELECTION"
			: "TYPE_SELECTION";
	const initialSelectedType =
		initialType === "medis"
			? "medis"
			: initialType === "non-medis"
				? "non-medis"
				: null;

	// Step: 'TYPE_SELECTION' (Medis vs Non-Medis) or 'CATEGORY_SELECTION' (List of Medis or Non-Medis)
	const [step, setStep] = React.useState<
		"TYPE_SELECTION" | "CATEGORY_SELECTION"
	>(initialStep);
	const [selectedType, setSelectedType] = React.useState<
		"medis" | "non-medis" | null
	>(initialSelectedType);

	React.useEffect(() => {
		if (status === "unauthenticated") {
			router.replace("/auth/login?callbackUrl=/galang-dana/kategori");
		}
	}, [status, router]);

	React.useEffect(() => {
		const fetchCats = async () => {
			try {
				const res = await fetch("/api/campaigns/categories?active=true");
				if (!res.ok) throw new Error("Gagal memuat kategori");
				const data = await res.json();
				const processed = processCategories(data);
				setCategories(processed);
			} catch (err: any) {
				console.error("Fetch categories error:", err);
				setError(err.message || "Terjadi kesalahan saat memuat kategori");
			} finally {
				setLoading(false);
			}
		};

		if (status === "authenticated") {
			fetchCats();
		}
	}, [status]);

	const handleTypeSelect = (type: "medis" | "non-medis") => {
		setSelectedType(type);
		setStep("CATEGORY_SELECTION");
	};

	const handleCategorySelect = (cat: CategoryData) => {
		if (cat.slug === MEDICAL_SLUG) {
			router.push("/galang-dana/buat?type=sakit");
		} else {
			router.push(`/galang-dana/buat?type=lainnya&category=${cat.slug}`);
		}
	};

	const handleBack = () => {
		if (step === "CATEGORY_SELECTION") {
			setStep("TYPE_SELECTION");
			setSelectedType(null);
		} else {
			router.back();
		}
	};

	if (status === "loading" || (status === "authenticated" && loading)) {
		return (
			<Box sx={{ p: 2 }}>
				<LinearProgress color="success" sx={{ borderRadius: 1, height: 6 }} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 2 }}>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
			{/* Header */}
			<Paper
				elevation={0}
				square
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 1100,
					borderBottom: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ height: 56, px: 2 }}
				>
					<IconButton
						onClick={handleBack}
						edge="start"
						sx={{ color: "text.primary" }}
					>
						<ArrowBackIosNewRoundedIcon fontSize="small" />
					</IconButton>
					<Typography sx={{ fontSize: 16, fontWeight: 700 }}>
						{step === "TYPE_SELECTION" ? "Mulai Galang Dana" : "Pilih Kategori"}
					</Typography>
				</Stack>
			</Paper>

			{step === "TYPE_SELECTION" ? (
				<Box sx={{ p: 2 }}>
					<Grid container spacing={2}>
						<Grid size={6}>
							<Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
								<CardActionArea
									onClick={() => handleTypeSelect("medis")}
									sx={{
										height: "100%",
										p: 2,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										textAlign: "center",
									}}
								>
									<Box
										sx={{
											width: 64,
											height: 64,
											borderRadius: "50%",
											bgcolor: "rgba(11, 169, 118, 0.1)",
											color: BRAND,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: 2,
										}}
									>
										<MedicalServicesRoundedIcon sx={{ fontSize: 32 }} />
									</Box>
									<Typography
										variant="h6"
										sx={{ fontSize: 15, fontWeight: 700, mb: 1 }}
									>
										Bantuan Medis
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ fontSize: 12, lineHeight: 1.4 }}
									>
										Galang dana untuk biaya pengobatan, rawat inap, atau
										kebutuhan medis lainnya.
									</Typography>
								</CardActionArea>
							</Card>
						</Grid>
						<Grid size={6}>
							<Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
								<CardActionArea
									onClick={() => handleTypeSelect("non-medis")}
									sx={{
										height: "100%",
										p: 2,
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										textAlign: "center",
									}}
								>
									<Box
										sx={{
											width: 64,
											height: 64,
											borderRadius: "50%",
											bgcolor: "rgba(240, 98, 146, 0.1)",
											color: "#f06292",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											mb: 2,
										}}
									>
										<VolunteerActivismRoundedIcon sx={{ fontSize: 32 }} />
									</Box>
									<Typography
										variant="h6"
										sx={{ fontSize: 15, fontWeight: 700, mb: 1 }}
									>
										Non Medis
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ fontSize: 12, lineHeight: 1.4 }}
									>
										Untuk pendidikan, bencana alam, rumah ibadah, panti asuhan,
										dan sosial.
									</Typography>
								</CardActionArea>
							</Card>
						</Grid>
					</Grid>
				</Box>
			) : (
				<Stack spacing={0} divider={<Divider />}>
					{categories
						.filter((c) => {
							if (selectedType === "medis") return c.slug === MEDICAL_SLUG;
							return c.slug !== MEDICAL_SLUG && !isLainnyaCategory(c);
						})
						.map((cat) => {
							const { icon, color } = getCategoryIcon(cat.icon || cat.slug);
							const hasExamples =
								Array.isArray(cat.examples) && cat.examples.length > 0;

							return (
								<Box
									key={cat.id || cat.slug}
									sx={{ bgcolor: "background.paper" }}
								>
									<Stack
										component="div"
										onClick={() => handleCategorySelect(cat)}
										direction="row"
										alignItems="center"
										justifyContent="space-between"
										sx={{
											p: 2,
											cursor: "pointer",
											"&:active": { bgcolor: "action.hover" },
										}}
									>
										<Stack direction="row" spacing={2} alignItems="center">
											{/* Icon Wrapper */}
											<Box
												sx={{
													width: 40,
													height: 40,
													borderRadius: "50%",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													color: color || BRAND,
													bgcolor: (theme) =>
														theme.palette.mode === "dark"
															? "rgba(255,255,255,0.05)"
															: "rgba(0,0,0,0.04)",
												}}
											>
												{icon}
											</Box>
											<Box>
												<Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
													{cat.name}
												</Typography>
												{cat.desc && (
													<Typography
														sx={{
															fontSize: 12,
															color: "text.secondary",
															mt: 0.5,
															lineHeight: 1.4,
														}}
													>
														{cat.desc}
													</Typography>
												)}
											</Box>
										</Stack>
										<ChevronRightRoundedIcon
											sx={{ color: "text.disabled", fontSize: 20 }}
										/>
									</Stack>

									{/* Horizontal Scroll Examples */}
									{hasExamples && (
										<Box
											sx={{
												display: "flex",
												gap: 1.5,
												overflowX: "auto",
												px: 2,
												pb: 2,
												"&::-webkit-scrollbar": { display: "none" },
											}}
										>
											{cat.examples!.map((ex: any) => (
												<ExampleCard key={ex.id || ex.title} e={ex} />
											))}
										</Box>
									)}
								</Box>
							);
						})}
				</Stack>
			)}
		</Box>
	);
}
