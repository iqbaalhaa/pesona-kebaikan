"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getMyCampaigns, deleteCampaign } from "@/actions/campaign";

import HealingRoundedIcon from "@mui/icons-material/HealingRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import {
	Box,
	Paper,
	Typography,
	Button,
	Stack,
	Chip,
	Divider,
	Card,
	CardContent,
	IconButton,
	Snackbar,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	LinearProgress,
	Drawer,
	ButtonBase,
	Container,
	alpha,
	useTheme,
} from "@mui/material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

type StatusKey = "all" | "action" | "active" | "draft" | "ended" | "pending";

type FundraiseMine = {
	id: string;
	title: string;
	status: Exclude<StatusKey, "all">;
	stepsDone: number; // 0..7
	stepsTotal: number; // 7
	updatedAt: string; // "18 Desember 2025"
	lastStep?: string;
	thumbnail?: string;
	collected?: number;
	target?: number;
	daysLeft?: number;
	donors?: number;
	slug?: string;
};

const TABS: { key: StatusKey; label: string }[] = [
	{ key: "all", label: "Semua" },
	{ key: "action", label: "Butuh tindakan" },
	{ key: "pending", label: "Menunggu Review" },
	{ key: "active", label: "Aktif" },
	{ key: "draft", label: "Draft" },
	{ key: "ended", label: "Selesai" },
];

function statusLabel(s: StatusKey) {
	if (s === "draft") return "Draft";
	if (s === "active") return "Aktif";
	if (s === "action") return "Butuh Tindakan";
	if (s === "ended") return "Selesai";
	if (s === "pending") return "Menunggu Review";
	return "Semua";
}

function statusColor(s: StatusKey) {
	if (s === "active") return "success";
	if (s === "action") return "error";
	if (s === "pending") return "warning";
	if (s === "ended") return "default";
	return "default";
}

function stepHint(stepsDone: number, stepsTotal: number) {
	const map: Record<number, string> = {
		0: "Isi tujuan & data",
		1: "Lengkapi detail medis/penerima",
		2: "Tentukan target donasi",
		3: "Isi judul campaign",
		4: "Tulis cerita lengkap",
		5: "Upload foto & dokumen",
		6: "Review & kirim",
	};
	if (stepsDone >= stepsTotal) return "Selesai • Menunggu review";
	return `Lanjut: ${map[stepsDone] ?? "Lanjutkan pengisian"}`;
}

function calculateStepsDone(c: any) {
	if (c.status !== "draft") return 7;

	const m = c.metadata || {};

	// Step 0: Tujuan
	if (!m.who && !m.purposeKey) return 0;

	// Step 1: Detail (Pasien / Data Diri)
	if (!m.patientName && !m.ktpName) return 1;

	// Step 2: Riwayat / Penerima
	if (c.type === "sakit") {
		if (!m.treatment) return 2;
	} else {
		if (!m.receiverName) return 2;
	}

	// Step 3: Target
	if (!c.target || Number(c.target) <= 0) return 3;

	// Step 4: Judul
	if (!c.title) return 4;

	// Step 5: Cerita
	if (!c.description) return 5;

	// Step 6: Ajakan (CTA) - Optional? No, usually last step before review
	// If we are strictly following 0-6 steps:
	// 0: Tujuan, 1: Detail, 2: Riwayat, 3: Target, 4: Judul, 5: Cerita, 6: Ajakan

	// If CTA is filled, then step 6 is done.
	if (!m.cta && !m.ctaOther) return 6;

	return 7;
}

function CounterPill({ n, active }: { n: number; active?: boolean }) {
	return (
		<Box
			sx={{
				ml: 0.75,
				px: 0.8,
				height: 20,
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 999,
				fontSize: 11,
				fontWeight: 800,
				bgcolor: active ? "primary.main" : "rgba(0,0,0,0.06)",
				color: active ? "primary.contrastText" : "text.secondary",
				transition: "all 0.2s",
			}}
		>
			{n}
		</Box>
	);
}

export default function GalangDanaSayaPage() {
	const router = useRouter();
	const theme = useTheme();
	const { status } = useSession();

	React.useEffect(() => {
		if (status === "unauthenticated") {
			router.replace("/auth/login?callbackUrl=/galang-dana");
		}
	}, [status, router]);

	const BOTTOM_NAV_H = 64;

	const [tab, setTab] = React.useState<StatusKey>("all");
	const [items, setItems] = React.useState<FundraiseMine[]>([]);
	const [loading, setLoading] = React.useState(true);

	const fetchCampaigns = React.useCallback(async () => {
		setLoading(true);
		// Fetch ALL to allow client-side filtering and counting
		const res = await getMyCampaigns(1, 100, "all");
		if (res.success && "data" in res && Array.isArray(res.data)) {
			const mapped: FundraiseMine[] = res.data.map((c: any) => ({
				id: c.id,
				title: c.title,
				status: c.status,
				stepsDone: calculateStepsDone(c),
				stepsTotal: 7,
				updatedAt: c.updatedAt,
				thumbnail: c.thumbnail,
				collected: c.collected,
				target: c.target,
				daysLeft: c.daysLeft,
				donors: c.donors,
				slug: c.slug,
			}));
			setItems(mapped);
		}
		setLoading(false);
	}, []);

	React.useEffect(() => {
		fetchCampaigns();
	}, [fetchCampaigns]);

	const [snack, setSnack] = React.useState({
		open: false,
		msg: "",
		type: "info" as "info" | "success",
	});

	const [confirm, setConfirm] = React.useState<{ open: boolean; id?: string }>({
		open: false,
	});

	// Drawer pilih jenis (sakit / lainnya)
	const [openPick, setOpenPick] = React.useState(false);

	// Modal syarat dokumen medis (khusus sakit)
	const [openMedicalReq, setOpenMedicalReq] = React.useState(false);

	const handlePickSakit = () => {
		setOpenPick(false);
		setOpenMedicalReq(true);
	};

	const handlePickLainnya = () => {
		setOpenPick(false);
		router.push("/galang-dana/kategori");
	};

	const handleAgreeMedical = () => {
		setOpenMedicalReq(false);
		router.push("/galang-dana/buat?type=sakit");
	};

	const counts: Record<StatusKey, number> = React.useMemo(() => {
		const base = {
			all: items.length,
			action: 0,
			active: 0,
			draft: 0,
			ended: 0,
			pending: 0,
		};
		items.forEach((x) => {
			if (base[x.status] !== undefined) {
				base[x.status] += 1;
			}
		});
		return base;
	}, [items]);

	const filtered = React.useMemo(() => {
		if (tab === "all") return items;
		return items.filter((x) => x.status === tab);
	}, [items, tab]);

	const askDelete = (id: string) => setConfirm({ open: true, id });

	const doDelete = async () => {
		const id = confirm.id;
		setConfirm({ open: false, id: undefined });
		if (!id) return;

		const res = await deleteCampaign(id);
		if (res.success) {
			setItems((prev) => prev.filter((x) => x.id !== id));
			setSnack({
				open: true,
				msg: "Campaign berhasil dihapus.",
				type: "success",
			});
		} else {
			setSnack({
				open: true,
				msg: res.error || "Gagal menghapus campaign.",
				type: "info",
			});
		}
	};

	if (status === "loading") {
		return (
			<Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
				<LinearProgress sx={{ width: 120, borderRadius: 99 }} />
			</Box>
		);
	}

	return (
		<Box
			sx={{
				pb: `calc(${BOTTOM_NAV_H}px + 24px)`,
				bgcolor: "background.default",
				minHeight: "100dvh",
			}}
		>
			{/* Modern Header */}
			<Box
				sx={{
					pt: 3,
					pb: 1,
					px: 2,
					bgcolor: "background.paper",
					borderBottom: "1px solid",
					borderColor: "divider",
					position: "sticky",
					top: 0,
					zIndex: 10,
				}}
			>
				<Typography
					variant="h5"
					sx={{ fontWeight: 800, fontSize: 22, color: "text.primary" }}
				>
					Galang Dana Saya
				</Typography>
				<Typography
					variant="body2"
					sx={{ color: "text.secondary", mt: 0.5, fontWeight: 500 }}
				>
					Kelola dan pantau perkembangan campaign kamu
				</Typography>
			</Box>

			<Container maxWidth="sm" sx={{ px: 2, mt: 3 }}>
				{/* Hero Card for Creation */}
				<Paper
					elevation={0}
					sx={{
						p: 3,
						borderRadius: 4,
						background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
						color: "white",
						boxShadow: "0 10px 30px -10px rgba(0, 150, 100, 0.4)",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<Box
						sx={{
							position: "absolute",
							top: -20,
							right: -20,
							width: 120,
							height: 120,
							bgcolor: "rgba(255,255,255,0.1)",
							borderRadius: "50%",
						}}
					/>
					<Box
						sx={{
							position: "absolute",
							bottom: -40,
							left: -10,
							width: 80,
							height: 80,
							bgcolor: "rgba(255,255,255,0.1)",
							borderRadius: "50%",
						}}
					/>

					<Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
						<Box>
							<Typography sx={{ fontWeight: 800, fontSize: 18, mb: 0.5 }}>
								Mulai Kebaikan Baru
							</Typography>
							<Typography sx={{ fontSize: 13, opacity: 0.9, maxWidth: "85%" }}>
								Buat campaign galang dana untuk membantu mereka yang
								membutuhkan.
							</Typography>
						</Box>

						<Button
							onClick={() => setOpenPick(true)}
							variant="contained"
							startIcon={<AddRoundedIcon />}
							sx={{
								bgcolor: "white",
								color: "primary.main",
								borderRadius: 3,
								fontWeight: 700,
								textTransform: "none",
								py: 1.2,
								px: 3,
								alignSelf: "flex-start",
								boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								"&:hover": {
									bgcolor: "rgba(255,255,255,0.9)",
								},
							}}
						>
							Buat Galang Dana
						</Button>
					</Stack>
				</Paper>

				{/* Guide Banner */}
				<Paper
					elevation={0}
					component={Link}
					href="/galang-dana/panduan"
					sx={{
						mt: 2,
						p: 1.5,
						borderRadius: 3,
						border: "1px solid",
						borderColor: alpha(theme.palette.info.main, 0.2),
						bgcolor: alpha(theme.palette.info.main, 0.05),
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						textDecoration: "none",
						transition: "all 0.2s",
						"&:hover": {
							bgcolor: alpha(theme.palette.info.main, 0.08),
						},
					}}
				>
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: "50%",
							bgcolor: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "info.main",
							boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
						}}
					>
						<InfoOutlinedIcon fontSize="small" />
					</Box>
					<Box sx={{ flex: 1 }}>
						<Typography
							sx={{ fontWeight: 700, fontSize: 13, color: "text.primary" }}
						>
							Panduan Galang Dana
						</Typography>
						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
							Tips agar campaign kamu lebih sukses
						</Typography>
					</Box>
					<ArrowForwardRoundedIcon
						sx={{ fontSize: 18, color: "text.disabled" }}
					/>
				</Paper>

				{/* Campaign List Section */}
				<Box sx={{ mt: 4 }}>
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						sx={{ mb: 2 }}
					>
						<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
							Daftar Campaign
						</Typography>
					</Stack>

					{/* Custom Tabs */}
					<Box
						sx={{
							display: "flex",
							gap: 1,
							overflowX: "auto",
							pb: 1,
							mx: -2,
							px: 2,
							"&::-webkit-scrollbar": { display: "none" },
						}}
					>
						{TABS.map((t) => {
							const n = counts[t.key];
							const selected = tab === t.key;

							return (
								<ButtonBase
									key={t.key}
									onClick={() => setTab(t.key)}
									sx={{
										px: 2,
										py: 1,
										borderRadius: 99,
										bgcolor: selected ? "text.primary" : "transparent",
										color: selected ? "background.paper" : "text.secondary",
										border: "1px solid",
										borderColor: selected ? "text.primary" : "divider",
										fontSize: 13,
										fontWeight: 700,
										whiteSpace: "nowrap",
										transition: "all 0.2s",
										flexShrink: 0,
									}}
								>
									{t.label}
									{n > 0 && (
										<Box
											component="span"
											sx={{
												ml: 1,
												bgcolor: selected
													? "rgba(255,255,255,0.2)"
													: "rgba(0,0,0,0.08)",
												color: selected ? "white" : "text.primary",
												px: 0.8,
												py: 0.2,
												borderRadius: 99,
												fontSize: 10,
												fontWeight: 800,
											}}
										>
											{n}
										</Box>
									)}
								</ButtonBase>
							);
						})}
					</Box>

					{/* List Items */}
					<Box sx={{ mt: 1 }}>
						{loading ? (
							<Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
								<LinearProgress sx={{ width: "50%", borderRadius: 4 }} />
							</Box>
						) : filtered.length === 0 ? (
							<Paper
								elevation={0}
								sx={{
									py: 6,
									px: 3,
									borderRadius: 4,
									border: "1px dashed",
									borderColor: "divider",
									textAlign: "center",
									bgcolor: "background.default",
								}}
							>
								<Box
									sx={{
										width: 64,
										height: 64,
										mx: "auto",
										bgcolor: "rgba(0,0,0,0.03)",
										borderRadius: "50%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mb: 2,
										color: "text.disabled",
									}}
								>
									<CampaignRoundedIcon sx={{ fontSize: 32 }} />
								</Box>
								<Typography sx={{ fontWeight: 700, color: "text.primary" }}>
									Belum ada campaign
								</Typography>
								<Typography
									sx={{
										mt: 0.5,
										fontSize: 13,
										color: "text.secondary",
										maxWidth: 280,
										mx: "auto",
									}}
								>
									Kamu belum memiliki campaign dengan status ini. Yuk buat
									sekarang!
								</Typography>
								<Button
									onClick={() => setOpenPick(true)}
									variant="text"
									color="primary"
									sx={{ mt: 2, fontWeight: 700 }}
								>
									Buat Galang Dana
								</Button>
							</Paper>
						) : (
							<Stack spacing={2}>
								{filtered.map((x) => {
									const isDraft = x.status === "draft";
									const isQuickDonate = x.slug === "donasi-cepat";
									const pct = isDraft
										? Math.min(
												100,
												Math.round((x.stepsDone / x.stepsTotal) * 100),
											)
										: Math.min(
												100,
												Math.round(
													((x.collected || 0) / (x.target || 1)) * 100,
												),
											);

									const hint = isDraft
										? (x.lastStep ?? stepHint(x.stepsDone, x.stepsTotal))
										: isQuickDonate
											? "Tanpa batas waktu & target"
											: `${new Intl.NumberFormat("id-ID", {
													style: "currency",
													currency: "IDR",
													maximumFractionDigits: 0,
												}).format(x.collected || 0)} terkumpul`;

									return (
										<Paper
											key={x.id}
											elevation={0}
											sx={{
												borderRadius: 3.5,
												border: "1px solid",
												borderColor: "divider",
												overflow: "hidden",
												transition: "all 0.2s",
												"&:hover": {
													borderColor: "primary.main",
													boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
													transform: "translateY(-2px)",
												},
											}}
										>
											<Box sx={{ p: 2 }}>
												<Stack direction="row" spacing={2}>
													<Box
														sx={{
															width: 72,
															height: 72,
															borderRadius: 2.5,
															bgcolor: "background.default",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															flexShrink: 0,
															overflow: "hidden",
															border: "1px solid",
															borderColor: "divider",
														}}
													>
														{x.thumbnail ? (
															<Box
																component="img"
																src={x.thumbnail}
																alt=""
																sx={{
																	width: "100%",
																	height: "100%",
																	objectFit: "cover",
																}}
															/>
														) : (
															<ImageNotSupportedRoundedIcon
																sx={{ color: "text.disabled" }}
															/>
														)}
													</Box>

													<Box sx={{ flex: 1, minWidth: 0 }}>
														<Stack
															direction="row"
															alignItems="flex-start"
															justifyContent="space-between"
															spacing={1}
														>
															<Typography
																sx={{
																	fontWeight: 700,
																	fontSize: 14,
																	lineHeight: 1.4,
																}}
																className="line-clamp-2"
															>
																{x.title}
															</Typography>
															<IconButton
																size="small"
																onClick={() => askDelete(x.id)}
															>
																<MoreVertRoundedIcon fontSize="small" />
															</IconButton>
														</Stack>

														<Stack
															direction="row"
															spacing={1}
															alignItems="center"
															sx={{ mt: 1, flexWrap: "wrap" }}
														>
															<Chip
																label={statusLabel(x.status)}
																size="small"
																color={statusColor(x.status) as any}
																sx={{
																	height: 22,
																	fontSize: 11,
																	fontWeight: 700,
																	borderRadius: 1,
																}}
															/>
															<Typography
																sx={{ fontSize: 11, color: "text.secondary" }}
															>
																Update: {x.updatedAt}
															</Typography>
														</Stack>
													</Box>
												</Stack>

												<Box sx={{ mt: 2 }}>
													<Stack
														direction="row"
														justifyContent="space-between"
														alignItems="center"
														sx={{ mb: 0.8 }}
													>
														<Typography
															sx={{
																fontSize: 12,
																fontWeight: 600,
																color: "text.secondary",
															}}
														>
															{isDraft
																? "Kelengkapan Data"
																: isQuickDonate
																	? "Total Donasi"
																	: "Dana Terkumpul"}
														</Typography>
														<Typography
															sx={{
																fontSize: 12,
																fontWeight: 700,
																color: "primary.main",
															}}
														>
															{isQuickDonate ? "∞" : `${pct}%`}
														</Typography>
													</Stack>
													{!isQuickDonate && (
														<LinearProgress
															variant="determinate"
															value={pct}
															sx={{
																height: 6,
																borderRadius: 99,
																bgcolor: alpha(theme.palette.primary.main, 0.1),
																"& .MuiLinearProgress-bar": {
																	borderRadius: 99,
																},
															}}
														/>
													)}
													<Typography
														sx={{
															mt: 1,
															fontSize: 12,
															color: "text.secondary",
															display: "flex",
															alignItems: "center",
															gap: 0.5,
														}}
													>
														<InfoOutlinedIcon sx={{ fontSize: 14 }} />
														{hint}
													</Typography>
												</Box>
											</Box>

											<Divider />

											<ButtonBase
												component={Link}
												href={
													isDraft
														? `/galang-dana/buat?draft=${x.id}`
														: `/galang-dana/${x.slug || x.id}`
												}
												sx={{
													width: "100%",
													py: 1.5,
													bgcolor: "background.paper",
													fontSize: 13,
													fontWeight: 700,
													color: "primary.main",
													"&:hover": {
														bgcolor: alpha(theme.palette.primary.main, 0.05),
													},
												}}
											>
												{isDraft ? "Lanjutkan Pengisian" : "Lihat Detail"}{" "}
												<ArrowForwardRoundedIcon sx={{ fontSize: 16, ml: 1 }} />
											</ButtonBase>
										</Paper>
									);
								})}
							</Stack>
						)}
					</Box>
				</Box>
			</Container>

			{/* Confirm delete */}
			<Dialog
				open={confirm.open}
				onClose={() => setConfirm({ open: false })}
				PaperProps={{
					sx: { borderRadius: 4, width: "100%", maxWidth: 360, m: 2 },
				}}
			>
				<DialogTitle sx={{ fontWeight: 800, textAlign: "center", pt: 3 }}>
					Hapus Campaign?
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ textAlign: "center", fontSize: 14 }}>
						Campaign yang dihapus tidak dapat dikembalikan. Apakah kamu yakin
						ingin melanjutkan?
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 0, justifyContent: "center", gap: 1 }}>
					<Button
						onClick={() => setConfirm({ open: false })}
						variant="outlined"
						sx={{
							borderRadius: 99,
							fontWeight: 700,
							px: 3,
							color: "text.primary",
							borderColor: "divider",
						}}
					>
						Batal
					</Button>
					<Button
						onClick={doDelete}
						variant="contained"
						color="error"
						sx={{ borderRadius: 99, fontWeight: 700, px: 3, boxShadow: "none" }}
					>
						Ya, Hapus
					</Button>
				</DialogActions>
			</Dialog>

			{/* Toast */}
			<Snackbar
				open={snack.open}
				autoHideDuration={2200}
				onClose={() => setSnack((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					severity={snack.type}
					variant="filled"
					onClose={() => setSnack((s) => ({ ...s, open: false }))}
					sx={{
						borderRadius: 3,
						fontWeight: 600,
						boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
					}}
				>
					{snack.msg}
				</Alert>
			</Snackbar>

			{/* ===== Drawer pilih jenis (sakit / lainnya) ===== */}
			<Drawer
				anchor="bottom"
				open={openPick}
				onClose={() => setOpenPick(false)}
				ModalProps={{ hideBackdrop: false }}
				PaperProps={{
					sx: {
						borderTopLeftRadius: 28,
						borderTopRightRadius: 28,
						maxHeight: "90dvh",
						maxWidth: 500,
						mx: "auto",
					},
				}}
			>
				<Box
					sx={{
						width: 40,
						height: 4,
						bgcolor: "divider",
						borderRadius: 99,
						mx: "auto",
						mt: 1.5,
						mb: 2,
					}}
				/>

				<Box sx={{ px: 3, pb: 4 }}>
					<Typography
						sx={{ fontWeight: 800, fontSize: 20, mb: 1, textAlign: "center" }}
					>
						Mulai Galang Dana
					</Typography>
					<Typography
						sx={{
							color: "text.secondary",
							fontSize: 14,
							mb: 3,
							textAlign: "center",
						}}
					></Typography>

					<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
						<PickCard
							iconBg={alpha("#0ea5e9", 0.1)}
							icon={
								<HealingRoundedIcon sx={{ color: "#0ea5e9", fontSize: 36 }} />
							}
							title="Bantuan Medis"
							desc="Galang dana untuk biaya pengobatan, rawat inap, atau kebutuhan medis lainnya."
							onClick={handlePickSakit}
						/>

						<PickCard
							iconBg={alpha("#fb7185", 0.1)}
							icon={
								<FavoriteRoundedIcon sx={{ color: "#fb7185", fontSize: 32 }} />
							}
							title="Non Medis"
							desc="Untuk pendidikan, bencana alam, rumah ibadah, panti asuhan, dan sosial."
							onClick={handlePickLainnya}
						/>
					</Box>
				</Box>
			</Drawer>

			{/* ===== Modal syarat dokumen (khusus sakit) ===== */}
			<Dialog
				open={openMedicalReq}
				onClose={() => setOpenMedicalReq(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: {
						borderRadius: 4,
						maxWidth: 480,
						m: 2,
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 800, fontSize: 18, pb: 1 }}>
					Syarat Dokumen Medis
				</DialogTitle>
				<DialogContent>
					<Typography sx={{ fontSize: 14, mb: 2, color: "text.secondary" }}>
						Untuk menjaga kepercayaan donatur, mohon siapkan dokumen berikut:
					</Typography>

					<Stack spacing={2}>
						{[
							"Foto KTP penggalang dana",
							"Foto Kartu Keluarga (KK) pasien",
							"Surat keterangan medis / diagnosis dokter",
							"Hasil pemeriksaan penunjang (jika ada)",
						].map((item, i) => (
							<Box
								key={i}
								sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
							>
								<Box
									sx={{
										width: 24,
										height: 24,
										borderRadius: "50%",
										bgcolor: alpha(theme.palette.primary.main, 0.1),
										color: "primary.main",
										fontSize: 12,
										fontWeight: 700,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									{i + 1}
								</Box>
								<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
									{item}
								</Typography>
							</Box>
						))}
					</Stack>

					<Paper
						elevation={0}
						sx={{
							mt: 3,
							p: 2,
							borderRadius: 3,
							bgcolor: alpha(theme.palette.warning.main, 0.05),
							border: "1px solid",
							borderColor: alpha(theme.palette.warning.main, 0.2),
							display: "flex",
							gap: 1.5,
						}}
					>
						<InfoOutlinedIcon fontSize="small" color="warning" />
						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
							Semua dokumen akan diverifikasi oleh tim kami untuk memastikan
							keasliannya.
						</Typography>
					</Paper>
				</DialogContent>
				<DialogActions
					sx={{
						p: 3,
						pt: 1,
						display: "flex",
						flexDirection: "column",
						gap: 1.5,
					}}
				>
					<Button
						variant="contained"
						fullWidth
						size="large"
						sx={{ borderRadius: 99, fontWeight: 700, boxShadow: "none" }}
						onClick={handleAgreeMedical}
					>
						Saya Mengerti, Lanjut
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

function PickCard({
	icon,
	iconBg,
	title,
	desc,
	onClick,
}: {
	icon: React.ReactNode;
	iconBg: string;
	title: string;
	desc: string;
	onClick: () => void;
}) {
	return (
		<Paper
			component={ButtonBase}
			onClick={onClick}
			elevation={0}
			sx={{
				p: 3,
				width: "100%",
				height: "100%",
				borderRadius: 4,
				border: "1px solid",
				borderColor: "divider",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 2,
				textAlign: "center",
				transition: "all 0.2s",
				"&:hover": {
					borderColor: "primary.main",
					bgcolor: alpha(iconBg, 0.1),
					transform: "translateY(-4px)",
					boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
				},
			}}
		>
			<Box
				sx={{
					width: 72,
					height: 72,
					borderRadius: 3.5,
					display: "grid",
					placeItems: "center",
					bgcolor: iconBg,
					flexShrink: 0,
					mb: 0.5,
				}}
			>
				{icon}
			</Box>

			<Box>
				<Typography
					sx={{
						fontWeight: 700,
						fontSize: 15,
						color: "#0f172a",
						lineHeight: 1.3,
						mb: 1,
					}}
				>
					{title}
				</Typography>
				<Typography
					sx={{
						fontSize: 13,
						color: "text.secondary",
						lineHeight: 1.5,
					}}
				>
					{desc}
				</Typography>
			</Box>
		</Paper>
	);
}
