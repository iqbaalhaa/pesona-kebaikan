"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
} from "@mui/material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";

type StatusKey = "all" | "action" | "active" | "draft" | "ended";

type FundraiseMine = {
	id: string;
	title: string;
	status: Exclude<StatusKey, "all">;
	stepsDone: number; // 0..7
	stepsTotal: number; // 7
	updatedAt: string; // "18 Desember 2025"
	lastStep?: string;
};

const TABS: { key: StatusKey; label: string }[] = [
	{ key: "all", label: "Semua" },
	{ key: "action", label: "Butuh tindakan" },
	{ key: "active", label: "Aktif" },
	{ key: "draft", label: "Belum jadi" },
	{ key: "ended", label: "Berakhir" },
];

// Dummy data (nanti ganti DB)
const MOCK: FundraiseMine[] = [
	{
		id: "draft-1",
		title: "[Penggalangan belum ada judul]",
		status: "draft",
		stepsDone: 0,
		stepsTotal: 7,
		updatedAt: "18 Desember 2025",
	},
];

function statusLabel(s: StatusKey) {
	if (s === "draft") return "Belum jadi";
	if (s === "active") return "Aktif";
	if (s === "action") return "Butuh tindakan";
	if (s === "ended") return "Berakhir";
	return "Semua";
}

function stepHint(stepsDone: number, stepsTotal: number) {
	const map: Record<number, string> = {
		0: "Isi judul & kategori",
		1: "Tentukan target & durasi",
		2: "Tulis ringkasan",
		3: "Tulis cerita lengkap",
		4: "Upload foto sampul",
		5: "Tambah bukti / dokumen",
		6: "Review & kirim pengajuan",
	};
	if (stepsDone >= stepsTotal) return "Selesai • Menunggu review";
	return `Tahap berikutnya: ${map[stepsDone] ?? "Lanjutkan pengisian"}`;
}

function CounterPill({ n }: { n: number }) {
	return (
		<Box
			sx={{
				ml: 0.75,
				px: 0.9,
				height: 20,
				display: "inline-flex",
				alignItems: "center",
				borderRadius: 999,
				fontSize: 12,
				fontWeight: 1000,
				bgcolor: "rgba(15,23,42,.08)",
				color: "text.primary",
			}}
		>
			{n}
		</Box>
	);
}

export default function GalangDanaSayaPage() {
	const router = useRouter();

	const BOTTOM_NAV_H = 64; // samakan dengan bottom nav kamu

	const [tab, setTab] = React.useState<StatusKey>("all");
	const [items, setItems] = React.useState<FundraiseMine[]>(MOCK);

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
		setOpenPick(false); // tutup drawer
		setOpenMedicalReq(true); // buka syarat
	};

	const handlePickLainnya = () => {
		setOpenPick(false);
		router.push("/galang-dana/kategori"); // ✅ page seluruh kategori
	};

	const handleAgreeMedical = () => {
		setOpenMedicalReq(false);
		router.push("/galang-dana/buat?type=sakit");
	};

	const handleSeeExample = () => {
		// kalau belum bikin page contoh, pakai toast dulu
		setSnack({
			open: true,
			msg: "Contoh dokumen medis — segera hadir",
			type: "info",
		});
	};

	const counts = React.useMemo(() => {
		const base = {
			all: items.length,
			action: 0,
			active: 0,
			draft: 0,
			ended: 0,
		};
		items.forEach((x) => {
			base[x.status] += 1;
		});
		return base;
	}, [items]);

	const filtered = React.useMemo(() => {
		if (tab === "all") return items;
		return items.filter((x) => x.status === tab);
	}, [items, tab]);

	const askDelete = (id: string) => setConfirm({ open: true, id });

	const doDelete = () => {
		const id = confirm.id;
		setConfirm({ open: false, id: undefined });
		if (!id) return;

		setItems((prev) => prev.filter((x) => x.id !== id));
		setSnack({
			open: true,
			msg: "Draft galang dana dihapus (dummy).",
			type: "success",
		});
	};

	return (
		<Box sx={{ px: 2, pb: 2 }}>
			{/* Header bar */}
			<Paper
				elevation={0}
				sx={{
					mt: 1.5,
					p: 1.25,
					borderRadius: 3,
					border: "1px solid",
					borderColor: "divider",
					bgcolor: "primary.main",
					color: "primary.contrastText",
				}}
			>
				<Typography sx={{ fontWeight: 1000, fontSize: 16 }}>
					Galang dana saya
				</Typography>
			</Paper>

			{/* Buat galang dana */}
			<Box sx={{ mt: 1.5 }}>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<Typography sx={{ fontWeight: 900, fontSize: 13 }}>
						Buat galang dana
					</Typography>
				</Stack>

				<Paper
					elevation={0}
					sx={{
						mt: 1,
						p: 1.1,
						borderRadius: 3,
						border: "1px dashed",
						borderColor: "primary.main",
						bgcolor: "background.paper",
					}}
				>
					<Button
						onClick={() => setOpenPick(true)}
						fullWidth
						variant="text"
						startIcon={<AddRoundedIcon />}
						sx={{ fontWeight: 1000, borderRadius: 2.5, py: 1.25 }}
					>
						Buat baru galang dana +
					</Button>
				</Paper>

				{/* Banner panduan */}
				<Paper
					elevation={0}
					sx={{
						mt: 1,
						p: 1,
						borderRadius: 2.5,
						border: "1px solid",
						borderColor: "divider",
						bgcolor: "rgba(2,132,199,.06)",
					}}
				>
					<Stack direction="row" spacing={1} alignItems="center">
						<InfoOutlinedIcon fontSize="small" />
						<Typography sx={{ fontSize: 12.5 }}>
							Ingin galang danamu lebih sukses?{" "}
							<Box
								component={Link}
								href="/galang-dana/panduan"
								sx={{
									fontWeight: 900,
									color: "primary.main",
									textDecoration: "none",
								}}
							>
								Lihat panduan galang dana
							</Box>
						</Typography>
					</Stack>
				</Paper>
			</Box>

			{/* Kelola */}
			<Box sx={{ mt: 2 }}>
				<Typography sx={{ fontWeight: 900, fontSize: 13, mb: 1 }}>
					Kelola galang dana
				</Typography>

				{/* Tabs + counter */}
				<Box
					sx={{
						display: "flex",
						gap: 1,
						overflowX: "auto",
						pb: 0.5,
						"&::-webkit-scrollbar": { display: "none" },
					}}
				>
					{TABS.map((t) => {
						const n = (counts as any)[t.key] as number;
						const selected = tab === t.key;

						return (
							<Chip
								key={t.key}
								clickable
								onClick={() => setTab(t.key)}
								color={selected ? "primary" : "default"}
								variant={selected ? "filled" : "outlined"}
								sx={{ borderRadius: 999, fontWeight: 1000, pr: 0.5 }}
								label={
									<Box sx={{ display: "inline-flex", alignItems: "center" }}>
										{t.label}
										<CounterPill n={n} />
									</Box>
								}
							/>
						);
					})}
				</Box>

				{/* List */}
				<Box sx={{ mt: 1.25 }}>
					{filtered.length === 0 ? (
						<Paper
							elevation={0}
							sx={{
								p: 2,
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								textAlign: "center",
							}}
						>
							<Typography sx={{ fontWeight: 1000 }}>Belum ada data</Typography>
							<Typography
								sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
							>
								Kamu belum punya galang dana di kategori ini.
							</Typography>

							<Button
								onClick={() => setOpenPick(true)}
								variant="contained"
								sx={{ mt: 1.25, borderRadius: 999, fontWeight: 1000 }}
								startIcon={<AddRoundedIcon />}
							>
								Buat Galang Dana
							</Button>
						</Paper>
					) : (
						filtered.map((x) => {
							const pct = Math.min(
								100,
								Math.round((x.stepsDone / x.stepsTotal) * 100)
							);
							const hint = x.lastStep ?? stepHint(x.stepsDone, x.stepsTotal);

							return (
								<Card
									key={x.id}
									elevation={0}
									sx={{
										borderRadius: 3,
										border: "1px solid",
										borderColor: "divider",
										overflow: "hidden",
										mb: 1.25,
									}}
								>
									<CardContent sx={{ p: 1.25 }}>
										<Stack direction="row" spacing={1.25} alignItems="center">
											<Paper
												variant="outlined"
												sx={{
													width: 56,
													height: 56,
													borderRadius: 2,
													display: "grid",
													placeItems: "center",
													bgcolor: "background.default",
													flexShrink: 0,
												}}
											>
												<ImageNotSupportedRoundedIcon
													sx={{ color: "text.disabled" }}
												/>
											</Paper>

											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Typography
													sx={{ fontWeight: 1000, fontSize: 13 }}
													className="line-clamp-2"
												>
													{x.title}
												</Typography>

												<Stack
													direction="row"
													spacing={1}
													alignItems="center"
													sx={{ mt: 0.6, flexWrap: "wrap" }}
												>
													<Chip
														label={statusLabel(x.status)}
														size="small"
														variant="outlined"
														sx={{ borderRadius: 999, fontWeight: 1000 }}
													/>
													<Typography
														sx={{ fontSize: 12, color: "text.secondary" }}
													>
														{x.stepsDone} dari {x.stepsTotal} tahap • Update{" "}
														<b>{x.updatedAt}</b>
													</Typography>
												</Stack>
											</Box>
										</Stack>

										<Box sx={{ mt: 1.25 }}>
											<LinearProgress variant="determinate" value={pct} />
											<Typography
												sx={{
													mt: 0.6,
													fontSize: 12.5,
													color: "text.secondary",
												}}
											>
												{hint}
											</Typography>
										</Box>

										<Divider sx={{ my: 1.25 }} />

										<Stack direction="row" spacing={1} alignItems="center">
											<Button
												component={Link}
												href={`/galang-dana/buat?draft=${x.id}`}
												fullWidth
												variant="outlined"
												endIcon={<ArrowForwardRoundedIcon />}
												sx={{ borderRadius: 2.5, fontWeight: 1000, py: 1 }}
											>
												Lanjutkan
											</Button>

											<IconButton
												onClick={() => askDelete(x.id)}
												sx={{
													borderRadius: 2.5,
													border: "1px solid",
													borderColor: "divider",
													width: 46,
													height: 46,
												}}
											>
												<DeleteOutlineRoundedIcon />
											</IconButton>
										</Stack>
									</CardContent>
								</Card>
							);
						})
					)}
				</Box>
			</Box>

			{/* Confirm delete */}
			<Dialog open={confirm.open} onClose={() => setConfirm({ open: false })}>
				<DialogTitle sx={{ fontWeight: 1000 }}>Hapus draft?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Draft yang dihapus tidak bisa dikembalikan (untuk sekarang ini
						dummy).
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setConfirm({ open: false })}
						variant="outlined"
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Batal
					</Button>
					<Button
						onClick={doDelete}
						variant="contained"
						color="error"
						sx={{ borderRadius: 999, fontWeight: 1000 }}
					>
						Hapus
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
						bgcolor: snack.type === "success" ? "text.primary" : undefined,
						color: snack.type === "success" ? "background.paper" : undefined,
						"& .MuiAlert-icon": {
							color: snack.type === "success" ? "background.paper" : undefined,
						},
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
				ModalProps={{
					BackdropProps: {
						sx: {
							bottom: `calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom))`,
						},
					},
				}}
				PaperProps={{
					sx: {
						bottom: `calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom))`,
						maxHeight: `calc(100dvh - (${BOTTOM_NAV_H}px + env(safe-area-inset-bottom)))`,
						borderTopLeftRadius: 22,
						borderTopRightRadius: 22,
						overflow: "hidden",
						maxWidth: 480,
						mx: "auto",
						width: "100%",
						bgcolor: "#fff",
					},
				}}
			>
				<Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<IconButton
							onClick={() => setOpenPick(false)}
							sx={{
								borderRadius: 999,
								border: "1px solid",
								borderColor: "divider",
								width: 36,
								height: 36,
							}}
						>
							<CloseRoundedIcon fontSize="small" />
						</IconButton>

						<Box sx={{ flex: 1 }}>
							<Typography sx={{ fontWeight: 1000, fontSize: 16 }}>
								Hai, #OrangBaik!
							</Typography>
							<Typography sx={{ color: "text.secondary", fontSize: 12.5 }}>
								Kamu ingin menggalang dana untuk...
							</Typography>
						</Box>
					</Box>
				</Box>

				<Box sx={{ px: 2, pb: 2 }}>
					<PickCard
						iconBg="rgba(14,165,233,.12)"
						icon={<HealingRoundedIcon sx={{ color: "#0ea5e9" }} />}
						title="Galang dana bantuan orang sakit"
						desc="Khusus biaya pengobatan atau perawatan penyakit tertentu."
						buttonText="Buat galang dana orang sakit"
						onClick={handlePickSakit}
					/>

					<Box sx={{ height: 12 }} />

					<PickCard
						iconBg="rgba(251,113,133,.12)"
						icon={<FavoriteRoundedIcon sx={{ color: "#fb7185" }} />}
						title="Galang dana bantuan lainnya"
						desc="Untuk bantuan pendidikan, kemanusiaan, bencana alam, dsb."
						buttonText="Pilih kategori galang dana"
						onClick={handlePickLainnya}
					/>
				</Box>
			</Drawer>

			{/* ===== Modal syarat dokumen (khusus sakit) ===== */}
			<Dialog
				open={openMedicalReq}
				onClose={() => setOpenMedicalReq(false)}
				fullWidth
				maxWidth="sm"
				sx={{
					"& .MuiDialog-container": {
						// jangan nutup bottom navbar
						alignItems: "center",
						pb: `calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom) + 8px)`,
					},
				}}
				slotProps={{
					backdrop: {
						sx: {
							bottom: `calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom))`,
						},
					},
				}}
				PaperProps={{
					sx: {
						borderRadius: 3,
						maxWidth: 480,
						mx: "auto",
						width: "100%",
						overflow: "hidden",
					},
				}}
			>
				<Box sx={{ p: 2 }}>
					<Typography sx={{ fontWeight: 1000, fontSize: 13.5, mb: 1 }}>
						Pastikan kamu orang yang berhak membuat galang dana dengan memiliki
						dokumen berikut:
					</Typography>

					<Box component="ul" sx={{ m: 0, pl: 2.2 }}>
						<li>
							<Typography sx={{ fontSize: 13 }}>
								<b>KTP</b> kamu sebagai penggalang dana
							</Typography>
						</li>
						<li>
							<Typography sx={{ fontSize: 13 }}>
								<b>Kartu Keluarga pasien</b>
							</Typography>
							<Box
								component="ul"
								sx={{ mt: 0.5, mb: 0.5, pl: 2.2, color: "text.secondary" }}
							>
								<li>
									<Typography sx={{ fontSize: 13 }}>
										Jika pasien belum ada di KK, sertakan{" "}
										<b>akta/Surat Keterangan Lahir</b>
									</Typography>
								</li>
							</Box>
						</li>
						<li>
							<Typography sx={{ fontSize: 13 }}>
								<b>Surat keterangan medis</b> dengan keterangan{" "}
								<b>diagnosis/penyakit</b>
							</Typography>
						</li>
						<li>
							<Typography sx={{ fontSize: 13 }}>
								<b>Hasil pemeriksaan</b> (lab, rontgen, dsb.)
							</Typography>
						</li>
					</Box>

					<Paper
						elevation={0}
						sx={{
							mt: 1.5,
							p: 1.25,
							borderRadius: 2,
							border: "1px solid",
							borderColor: "divider",
							bgcolor: "rgba(2,132,199,.06)",
							display: "flex",
							gap: 1,
							alignItems: "flex-start",
						}}
					>
						<InfoOutlinedIcon fontSize="small" sx={{ mt: "2px" }} />
						<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
							Disclaimer: Pastikan bahwa setiap dokumen yang diunggah dalam
							galang dana ini telah melalui proses validasi. Dengan demikian,
							dokumen yang disertakan adalah asli dan dapat
							dipertanggungjawabkan.
						</Typography>
					</Paper>

					<Stack spacing={1.1} sx={{ mt: 1.75 }}>
						<Button
							variant="outlined"
							fullWidth
							sx={{ borderRadius: 2.5, fontWeight: 900, py: 1.1 }}
							onClick={handleSeeExample}
						>
							Lihat contoh dokumen medis
						</Button>

						<Button
							variant="contained"
							fullWidth
							sx={{ borderRadius: 2.5, fontWeight: 1000, py: 1.15 }}
							onClick={handleAgreeMedical}
						>
							Mengerti
						</Button>
					</Stack>
				</Box>
			</Dialog>
		</Box>
	);
}

function PickCard({
	icon,
	iconBg,
	title,
	desc,
	buttonText,
	onClick,
}: {
	icon: React.ReactNode;
	iconBg: string;
	title: string;
	desc: string;
	buttonText: string;
	onClick: () => void;
}) {
	return (
		<Paper
			elevation={0}
			sx={{
				borderRadius: 3,
				border: "1px solid",
				borderColor: "divider",
				overflow: "hidden",
				boxShadow: "0 10px 28px rgba(15,23,42,.06)",
			}}
		>
			<Box sx={{ p: 1.5, display: "flex", gap: 1.25 }}>
				<Box
					sx={{
						width: 44,
						height: 44,
						borderRadius: 2,
						display: "grid",
						placeItems: "center",
						bgcolor: iconBg,
						flexShrink: 0,
					}}
				>
					{icon}
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
						{title}
					</Typography>
					<Typography sx={{ mt: 0.4, fontSize: 12.5, color: "text.secondary" }}>
						{desc}
					</Typography>
				</Box>
			</Box>

			<Box sx={{ px: 1.5, pb: 1.5 }}>
				<ButtonBase
					onClick={onClick}
					sx={{
						width: "100%",
						borderRadius: 2,
						border: "1px solid",
						borderColor: "primary.main",
						bgcolor: "primary.main",
						color: "primary.contrastText",
						fontWeight: 1000,
						py: 1.15,
						justifyContent: "center",
						transition: "transform 120ms ease",
						"&:active": { transform: "scale(.99)" },
					}}
				>
					{buttonText}
				</ButtonBase>
			</Box>
		</Paper>
	);
}
