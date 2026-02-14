"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import {
	Box,
	Paper,
	Typography,
	Stack,
	Chip,
	Button,
	Divider,
	LinearProgress,
	CircularProgress,
	IconButton,
	TextField,
	Snackbar,
	Alert,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	useTheme,
	alpha,
	Checkbox,
	FormControlLabel,
} from "@mui/material";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import ThumbDownAltRoundedIcon from "@mui/icons-material/ThumbDownAltRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";

import {
	getCampaignById,
	updateCampaignStatus,
	deleteCampaign,
	addCampaignMedia,
	finishCampaign,
	updateCampaignStory,
} from "@/actions/campaign";
import { getCampaignTransactions } from "@/actions/admin";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import RichTextEditor from "@/components/admin/RichTextEditor";

type CampaignStatus =
	| "draft"
	| "review"
	| "active"
	| "ended"
	| "rejected"
	| "pending"
	| "paused";
type CampaignType = "sakit" | "lainnya";

type AuditEvent = {
	id: string;
	at: string;
	title: string;
	meta?: string;
	tone?: "neutral" | "success" | "warning" | "error" | "info";
};

type DocKey = "cover" | "ktp" | "resume_medis" | "surat_rs" | "pendukung";

type DocItem = {
	key: DocKey;
	title: string;
	required: boolean;
	help?: string;
	uploaded: boolean;
	filename?: string;
	previewUrl?: string; // blob url
	updatedAt?: string;
};

const STATUS_META: Record<
	CampaignStatus,
	{ label: string; tone: "neutral" | "warning" | "success" | "info" | "error" }
> = {
	draft: { label: "Draft", tone: "neutral" },
	review: { label: "Review", tone: "warning" },
	active: { label: "Aktif", tone: "success" },
	ended: { label: "Berakhir", tone: "error" },
	rejected: { label: "Ditolak", tone: "error" },
	pending: { label: "Menunggu Verifikasi", tone: "warning" },
	paused: { label: "Jeda", tone: "warning" },
};

// Transaction Types & Helpers
type TxStatus = "paid" | "pending" | "failed" | "refunded";
type PayMethod = "qris" | "va_bca" | "va_bri" | "gopay" | "manual";

type TxRow = {
	id: string;
	createdAt: string;
	campaignId: string;
	campaignTitle: string;
	donorName: string;
	donorPhone: string;
	donorEmail: string;
	message: string;
	isAnonymous: boolean;
	amount: number;
	method: PayMethod;
	status: TxStatus;
	refCode: string;
	account: {
		name: string;
		email: string;
		phone: string;
	} | null;
};

function statusMeta(status: TxStatus) {
	switch (status) {
		case "paid":
			return {
				label: "Berhasil",
				icon: <CheckCircleRoundedIcon fontSize="small" />,
				tone: "success" as const,
			};
		case "pending":
			return {
				label: "Pending",
				icon: <HourglassBottomRoundedIcon fontSize="small" />,
				tone: "warning" as const,
			};
		case "failed":
			return {
				label: "Gagal",
				icon: <ErrorRoundedIcon fontSize="small" />,
				tone: "error" as const,
			};
		case "refunded":
			return {
				label: "Refund",
				icon: <ErrorRoundedIcon fontSize="small" />,
				tone: "info" as const,
			};
	}
}

function methodLabel(m: PayMethod) {
	switch (m) {
		case "qris":
			return "QRIS";
		case "va_bca":
			return "VA BCA";
		case "va_bri":
			return "VA BRI";
		case "gopay":
			return "GoPay";
		case "manual":
			return "Manual";
	}
}

function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function pct(collected: number, target: number) {
	if (!target || target <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((collected / target) * 100)));
}

function nowLabel() {
	// dummy readable label
	const d = new Date();
	const pad = (x: number) => String(x).padStart(2, "0");
	return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(
		d.getHours()
	)}:${pad(d.getMinutes())}`;
}

export default function AdminCampaignDetailPage() {
	const theme = useTheme();
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const id = params?.id ?? "";

	const [loading, setLoading] = React.useState(true);
	const [data, setData] = React.useState<any>(null);

	const [tab, setTab] = React.useState<
		"overview" | "story" | "docs" | "verify" | "timeline" | "transactions"
	>("overview");

	const [snack, setSnack] = React.useState<{
		open: boolean;
		msg: string;
		type: "success" | "info" | "warning" | "error";
	}>({ open: false, msg: "", type: "info" });

	const [confirmEnd, setConfirmEnd] = React.useState(false);
	const [confirmPause, setConfirmPause] = React.useState(false);
	const [confirmResume, setConfirmResume] = React.useState(false);

	// docs state
	const [docs, setDocs] = React.useState<DocItem[]>([]);

	// transactions state
	const [txRows, setTxRows] = React.useState<TxRow[]>([]);
	const [txLoading, setTxLoading] = React.useState(false);

	const fetchTransactions = React.useCallback(async () => {
		setTxLoading(true);
		try {
			const res = await getCampaignTransactions(id);
			if (res.success && res.data) {
				// @ts-ignore
				setTxRows(res.data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setTxLoading(false);
		}
	}, [id]);

	React.useEffect(() => {
		if (tab === "transactions") {
			fetchTransactions();
		}
	}, [tab, fetchTransactions]);

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		try {
			const res = await getCampaignById(id);
			if (res.success && res.data) {
				const c = res.data;
				const statusMap: Record<string, CampaignStatus> = {
					// values from getCampaignById
					pending: "pending",
					active: "active",
					rejected: "rejected",
					ended: "ended",
					paused: "paused",

					// Fallbacks/Legacy/Direct DB values
					PENDING: "pending",
					ACTIVE: "active",
					REJECTED: "rejected",
					COMPLETED: "ended",
					PAUSED: "paused",
					accepted: "active",
					finished: "ended",
					review: "review",
				};

				const cleanStory = c.description
					.replace(/\s*Detail Pasien:[\s\S]*/i, "")
					.replace(/\s*Tujuan:[\s\S]*/i, "")
					.trim();

				const mappedData = {
					id: c.id,
					title: c.title,
					type:
						c.type === "sakit" || c.category === "Bantuan Medis & Kesehatan"
							? "sakit"
							: "lainnya",
					category: c.category || "-",
					status: statusMap[c.status] || "review",
					ownerName: c.ownerName || "-",
					ownerEmail: c.ownerEmail || "-",
					ownerPhone: c.ownerPhone || "-",
					phone: c.phone || "-",
					target: Number(c.target),
					collected: Number(c.collected),
					donors: c.donations?.length || 0,
					createdAt: new Date(c.updatedAt).toLocaleDateString("id-ID", {
						day: "numeric",
						month: "long",
						year: "numeric",
					}),
					updatedAt: new Date(c.updatedAt).toLocaleDateString("id-ID", {
						day: "numeric",
						month: "long",
						year: "numeric",
					}),
					publicUrl: `/donasi/${c.slug || c.id}`,
					shortInvite: cleanStory.substring(0, 100) + "...",
					story: c.description, // Use full description (HTML or text)
				};
				setData(mappedData);

				// Setup docs
				const base: DocItem[] = [
					{
						key: "cover",
						title: "Foto Sampul",
						required: false,
						help: "Foto utama yang tampil di campaign.",
						uploaded: !!c.thumbnail,
						previewUrl: c.thumbnail,
					},
					{
						key: "ktp",
						title: "Identitas / KTP Penggalang",
						required: false,
						help: "KTP pemilik akun/penggalang.",
						uploaded: false, // Need to check if KTP is in media
					},
				];

				if (mappedData.type === "sakit") {
					base.push(
						{
							key: "resume_medis",
							title: "Surat / Resume Medis",
							required: false,
							help: "Dokumen diagnosis/riwayat medis.",
							uploaded: false,
						},
						{
							key: "surat_rs",
							title: "Dokumen Rumah Sakit",
							required: false,
							help: "Surat rujukan, rincian biaya, dll (opsional).",
							uploaded: false,
						}
					);
				} else {
					base.push({
						key: "pendukung",
						title: "Dokumen Pendukung",
						required: false,
						help: "Surat izin, proposal, foto kondisi, dll.",
						uploaded: false,
					});
				}
				setDocs(base);
			} else {
				setSnack({
					open: true,
					msg: "Gagal memuat data campaign",
					type: "error",
				});
			}
		} catch (e) {
			console.error(e);
			setSnack({ open: true, msg: "Terjadi kesalahan", type: "error" });
		}
		setLoading(false);
	}, [id]);

	React.useEffect(() => {
		if (id) fetchData();
	}, [id, fetchData]);

	// preview dialog
	const [preview, setPreview] = React.useState<{
		open: boolean;
		title?: string;
		url?: string;
	}>({ open: false });

	// audit timeline
	const [audit, setAudit] = React.useState<AuditEvent[]>([]);

	React.useEffect(() => {
		if (data) {
			const initialAudit: AuditEvent[] = [
				{
					id: "created",
					at: data.createdAt,
					title: "Campaign dibuat",
					meta: "Campaign berhasil dibuat.",
					tone: "info",
				},
			];
			if (data.status !== "review" && data.status !== "draft") {
				initialAudit.unshift({
					id: "updated",
					at: data.updatedAt,
					title: "Status diperbarui",
					meta: `Status saat ini: ${data.status}`,
					tone: "warning",
				});
			}
			setAudit(initialAudit);
		}
	}, [data]);

	const pushAudit = React.useCallback((e: Omit<AuditEvent, "id" | "at">) => {
		setAudit((prev) => [
			{
				id: crypto.randomUUID?.() ?? String(Date.now()),
				at: nowLabel(),
				...e,
			},
			...prev,
		]);
	}, []);

	// verify checklist
	const [check, setCheck] = React.useState({
		identityOk: false,
		coverOk: false,
		storyOk: false,
		targetOk: false,
		categoryOk: true,
		phoneOk: true,
	});
	const [rejectReason, setRejectReason] = React.useState("");
	const [confirmApprove, setConfirmApprove] = React.useState(false);
	const [confirmReject, setConfirmReject] = React.useState(false);

	const progress = pct(data?.collected || 0, data?.target || 0);
	const statusMeta = data
		? STATUS_META[data.status as CampaignStatus]
		: STATUS_META.review;

	const toneColor = (tone: typeof statusMeta.tone) => {
		switch (tone) {
			case "warning":
				return theme.palette.warning.main;
			case "success":
				return theme.palette.success.main;
			case "info":
				return theme.palette.info.main;
			case "error":
				return theme.palette.error.main;
			default:
				return theme.palette.text.secondary;
		}
	};

	const statusChipSx = React.useMemo(() => {
		const c = toneColor(statusMeta.tone);
		return {
			borderRadius: 999,
			fontWeight: 900,
			borderColor: alpha(c, 0.25),
			bgcolor: alpha(c, theme.palette.mode === "dark" ? 0.16 : 0.1),
			color: theme.palette.mode === "dark" ? alpha(c, 0.95) : c,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.status, theme.palette.mode]);

	const typeMeta =
		data?.type === "sakit"
			? {
					label: "Medis",
					icon: <LocalHospitalRoundedIcon fontSize="small" />,
					color: theme.palette.info.main,
			  }
			: {
					label: "Lainnya",
					icon: <CategoryRoundedIcon fontSize="small" />,
					color: theme.palette.success.main,
			  };

	const shellSx = {
		borderRadius: 3,
		border: "1px solid",
		borderColor: alpha(
			theme.palette.divider,
			theme.palette.mode === "dark" ? 0.9 : 1
		),
		bgcolor: alpha(
			theme.palette.background.paper,
			theme.palette.mode === "dark" ? 0.92 : 1
		),
		backdropFilter: "blur(10px)",
	};

	const copy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setSnack({ open: true, msg: "Tersalin.", type: "success" });
		} catch {
			setSnack({ open: true, msg: "Gagal menyalin.", type: "error" });
		}
	};

	const canVerify = data?.status === "review" || data?.status === "pending";
	const canEnd = data?.status === "active" || data?.status === "paused";
	const canPause = data?.status === "active";
	const canResume = data?.status === "paused";

	// derive checklist suggestions from current state (soft suggestion)
	React.useEffect(() => {
		if (!data) return;
		const hasCover = docs.find((d) => d.key === "cover")?.uploaded ?? false;
		const hasKtp = docs.find((d) => d.key === "ktp")?.uploaded ?? false;

		setCheck((c) => ({
			...c,
			coverOk: c.coverOk || hasCover,
			identityOk: c.identityOk || hasKtp,
			storyOk: c.storyOk || (data.story?.trim().length ?? 0) >= 80,
			targetOk: c.targetOk || (data.target ?? 0) > 0,
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [docs, data?.story, data?.target]);

	if (loading) {
		return (
			<Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!data) {
		return (
			<Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
				<Typography>Data tidak ditemukan</Typography>
			</Box>
		);
	}

	const verifyReady =
		check.identityOk &&
		check.coverOk &&
		check.storyOk &&
		check.targetOk &&
		check.categoryOk &&
		check.phoneOk;

	const handleUpload = async (key: DocKey, file?: File | null) => {
		if (!file) return;

		// Optimistic update
		const url = URL.createObjectURL(file);
		setDocs((prev) =>
			prev.map((d) =>
				d.key === key
					? {
							...d,
							uploaded: true,
							filename: file.name,
							previewUrl: url,
							updatedAt: nowLabel(),
					  }
					: d
			)
		);

		const formData = new FormData();
		formData.append("file", file);
		if (key === "cover") {
			formData.append("isThumbnail", "true");
		}

		try {
			const res = await addCampaignMedia(id, formData);

			if (res.success) {
				pushAudit({
					title: "Dokumen diupload",
					meta: `${file.name} (${key})`,
					tone: "info",
				});
				setSnack({
					open: true,
					msg: "Dokumen berhasil diupload.",
					type: "success",
				});
			} else {
				throw new Error(res.error);
			}
		} catch (e) {
			console.error(e);
			// Revert
			setDocs((prev) =>
				prev.map((d) =>
					d.key === key
						? {
								...d,
								uploaded: false,
								filename: undefined,
								previewUrl: undefined,
								updatedAt: undefined,
						  }
						: d
				)
			);
			setSnack({ open: true, msg: "Gagal upload dokumen.", type: "error" });
		}
	};

	const handleRemoveDoc = (key: DocKey) => {
		setDocs((prev) =>
			prev.map((d) =>
				d.key === key
					? {
							...d,
							uploaded: false,
							filename: undefined,
							previewUrl: undefined,
							updatedAt: nowLabel(),
					  }
					: d
			)
		);
		pushAudit({
			title: "Dokumen dihapus",
			meta: `(${key})`,
			tone: "warning",
		});
	};

	const onApprove = async () => {
		setConfirmApprove(false);
		const res = await updateCampaignStatus(id, "ACTIVE");
		if (res.success) {
			setData((d: any) => ({ ...d, status: "active", updatedAt: "Hari ini" }));
			pushAudit({
				title: "Campaign disetujui",
				meta: "Status berubah menjadi Aktif.",
				tone: "success",
			});
			setSnack({
				open: true,
				msg: "Campaign approved.",
				type: "success",
			});
		} else {
			setSnack({
				open: true,
				msg: "Gagal approve campaign.",
				type: "error",
			});
		}
	};

	const onReject = async () => {
		setConfirmReject(false);
		const res = await updateCampaignStatus(id, "REJECTED");
		if (res.success) {
			setData((d: any) => ({
				...d,
				status: "rejected",
				updatedAt: "Hari ini",
			}));
			pushAudit({
				title: "Campaign ditolak",
				meta: rejectReason ? `Alasan: ${rejectReason}` : "Tanpa alasan.",
				tone: "error",
			});
			setSnack({
				open: true,
				msg: "Campaign rejected.",
				type: "warning",
			});
		} else {
			setSnack({
				open: true,
				msg: "Gagal reject campaign.",
				type: "error",
			});
		}
	};

	const onPause = async () => {
		setConfirmPause(false);
		const res = await updateCampaignStatus(id, "PAUSED");
		if (res.success) {
			setData((d: any) => ({ ...d, status: "paused", updatedAt: "Hari ini" }));
			pushAudit({
				title: "Campaign dijeda",
				meta: "Status berubah menjadi Jeda.",
				tone: "warning",
			});
			setSnack({
				open: true,
				msg: "Campaign dijeda.",
				type: "warning",
			});
		} else {
			setSnack({
				open: true,
				msg: res.error || "Gagal menjeda campaign.",
				type: "error",
			});
		}
	};

	const onResume = async () => {
		setConfirmResume(false);
		const res = await updateCampaignStatus(id, "ACTIVE");
		if (res.success) {
			setData((d: any) => ({ ...d, status: "active", updatedAt: "Hari ini" }));
			pushAudit({
				title: "Campaign dilanjutkan",
				meta: "Status kembali Aktif.",
				tone: "success",
			});
			setSnack({
				open: true,
				msg: "Campaign dilanjutkan.",
				type: "success",
			});
		} else {
			setSnack({
				open: true,
				msg: res.error || "Gagal melanjutkan campaign.",
				type: "error",
			});
		}
	};

	const onSaveStory = async () => {
		const res = await updateCampaignStory(id, data.title, data.story);
		if (res.success) {
			pushAudit({
				title: "Konten campaign disimpan",
				meta: "Judul/Cerita diperbarui.",
				tone: "info",
			});
			setSnack({ open: true, msg: "Disimpan.", type: "success" });
		} else {
			setSnack({ open: true, msg: "Gagal menyimpan.", type: "error" });
		}
	};

	const requiredMissing = docs.filter((d) => d.required && !d.uploaded).length;

	return (
		<Box sx={{ display: "grid", gap: 2 }}>
			{/* TOP HEADER */}
			<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
				<Stack direction="row" spacing={1.25} alignItems="center">
					<Tooltip title="Kembali">
						<IconButton
							onClick={() => router.back()}
							sx={{
								borderRadius: 2,
								// border: "1px solid",
								// borderColor: alpha(theme.palette.divider, 1),
								width: 40,
								height: 40,
								bgcolor: alpha(
									theme.palette.background.default,
									theme.palette.mode === "dark" ? 0.25 : 1
								),
							}}
						>
							<ArrowBackIosNewRoundedIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 16 }}
							className="line-clamp-2"
						>
							{data.title}
						</Typography>

						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
							sx={{ mt: 0.4, flexWrap: "wrap" }}
						>
							<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
								Update <b>{data.updatedAt}</b>
							</Typography>
						</Stack>
					</Box>

					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						sx={{ flexWrap: "wrap" }}
					>
						<Chip
							label={typeMeta.label}
							icon={typeMeta.icon as any}
							variant="outlined"
							sx={{
								borderRadius: 999,
								fontWeight: 900,
								borderColor: alpha(typeMeta.color, 0.25),
								bgcolor: alpha(
									typeMeta.color,
									theme.palette.mode === "dark" ? 0.16 : 0.1
								),
								color:
									theme.palette.mode === "dark"
										? alpha(typeMeta.color, 0.95)
										: typeMeta.color,
								"& .MuiChip-icon": {
									color:
										theme.palette.mode === "dark"
											? alpha(typeMeta.color, 0.95)
											: typeMeta.color,
								},
							}}
						/>
						<Chip
							label={statusMeta.label}
							variant="outlined"
							sx={statusChipSx}
						/>
					</Stack>
				</Stack>

				<Divider
					sx={{ my: 1.25, borderColor: alpha(theme.palette.divider, 1) }}
				/>

				{/* Actions */}
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={1}
					alignItems={{ md: "center" }}
					justifyContent="space-between"
				>
					<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
						<Button
							onClick={() => router.push(`/admin/campaign/${data.id}/edit`)}
							variant="outlined"
							startIcon={<EditRoundedIcon />}
							sx={{ borderRadius: 999, fontWeight: 900 }}
						>
							Edit
						</Button>

						<Button
							onClick={() => setTab("verify")}
							variant="outlined"
							startIcon={<VerifiedRoundedIcon />}
							disabled={!canVerify}
							sx={{ borderRadius: 999, fontWeight: 900 }}
						>
							Verifikasi
						</Button>

						{data.status === "paused" ? (
							<Button
								onClick={() => setConfirmResume(true)}
								variant="outlined"
								color="success"
								startIcon={<PlayCircleFilledRoundedIcon />}
								disabled={!canResume}
								sx={{ borderRadius: 999, fontWeight: 900 }}
							>
								Lanjutkan
							</Button>
						) : (
							<Button
								onClick={() => setConfirmPause(true)}
								variant="outlined"
								color="warning"
								startIcon={<PauseCircleIcon />}
								disabled={!canPause}
								sx={{ borderRadius: 999, fontWeight: 900 }}
							>
								Jeda
							</Button>
						)}

						<Button
							onClick={() => setConfirmEnd(true)}
							variant="outlined"
							color="error"
							startIcon={<StopCircleRoundedIcon />}
							disabled={!canEnd}
							sx={{ borderRadius: 999, fontWeight: 900 }}
						>
							Akhiri
						</Button>
					</Stack>

					<Stack direction="row" spacing={1} alignItems="center">
						<Button
							href={data.publicUrl}
							target="_blank"
							variant="contained"
							endIcon={<OpenInNewRoundedIcon />}
							sx={{
								borderRadius: 999,
								fontWeight: 900,
								px: 2,
								boxShadow: "none",
							}}
						>
							Buka Public Page
						</Button>

						<Tooltip title="Copy public URL">
							<IconButton
								onClick={() => copy(data.publicUrl)}
								sx={{
									borderRadius: 2,
									// border: "1px solid",
									// borderColor: alpha(theme.palette.divider, 1),
									width: 42,
									height: 42,
								}}
							>
								<ContentCopyRoundedIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>
			</Paper>

			{/* MAIN GRID */}
			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr" },
					alignItems: "start",
				}}
			>
				{/* LEFT */}
				<Stack spacing={2}>
					{/* Progress */}
					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
							alignItems={{ sm: "center" }}
						>
							<Box sx={{ flex: 1 }}>
								<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
									{idr(data.collected)}{" "}
									<Typography
										component="span"
										sx={{ fontWeight: 800, color: "text.secondary" }}
									>
										/ {idr(data.target)}
									</Typography>{" "}
									<Typography
										component="span"
										sx={{
											fontWeight: 900,
											color: alpha(theme.palette.text.primary, 0.75),
										}}
									>
										({progress}%)
									</Typography>
								</Typography>

								<Box sx={{ mt: 1 }}>
									<LinearProgress
										variant="determinate"
										value={progress}
										sx={{
											height: 8,
											borderRadius: 999,
											bgcolor: alpha(
												theme.palette.text.primary,
												theme.palette.mode === "dark" ? 0.1 : 0.06
											),
											"& .MuiLinearProgress-bar": { borderRadius: 999 },
										}}
									/>
									<Typography
										sx={{ mt: 0.75, fontSize: 12.5, color: "text.secondary" }}
									>
										<b>{data.donors}</b> donatur • Dibuat{" "}
										<b>{data.createdAt}</b>
									</Typography>
								</Box>
							</Box>

							<Stack
								direction="row"
								spacing={1}
								sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}
							>
								<QuickPill label="Owner" value={data.ownerName} />
								<QuickPill label="Email" value={data.ownerEmail} />
								<QuickPill label="HP" value={data.phone} />
								<QuickPill label="Kategori" value={data.category} />
							</Stack>
						</Stack>
					</Paper>

					{/* Tabs */}
					<Paper elevation={0} sx={{ ...shellSx, p: 1.25 }}>
						<Stack
							direction="row"
							spacing={1}
							sx={{
								overflowX: "auto",
								pb: 0.25,
								"&::-webkit-scrollbar": { display: "none" },
							}}
						>
							<SegTab
								label="Overview"
								active={tab === "overview"}
								onClick={() => setTab("overview")}
							/>
							<SegTab
								label="Story"
								active={tab === "story"}
								onClick={() => setTab("story")}
							/>
							<SegTab
								label="Dokumen"
								active={tab === "docs"}
								onClick={() => setTab("docs")}
							/>
							<SegTab
								label="Verifikasi"
								active={tab === "verify"}
								onClick={() => setTab("verify")}
							/>
							<SegTab
								label="Timeline"
								active={tab === "timeline"}
								onClick={() => setTab("timeline")}
							/>
							<SegTab
								label="Transaksi"
								active={tab === "transactions"}
								onClick={() => setTab("transactions")}
							/>
						</Stack>
					</Paper>

					{/* Content */}
					{tab === "overview" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
								Ringkasan
							</Typography>
							<Typography
								sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
							>
								Ringkasan admin untuk memastikan campaign siap masuk verifikasi
								& publik.
							</Typography>

							<Divider sx={{ my: 1.25 }} />

							<Stack spacing={1}>
								<InfoRow k="Tipe" v={typeMeta.label} />
								<InfoRow k="Kategori" v={data.category} />
								<InfoRow k="Status" v={statusMeta.label} />
								<InfoRow k="Target" v={idr(data.target)} />
								<InfoRow k="Terkumpul" v={idr(data.collected)} />
								<InfoRow k="Donatur" v={`${data.donors}`} />
							</Stack>

							<Divider sx={{ my: 1.25 }} />

							<Typography
								sx={{ fontWeight: 1000, fontSize: 13.5, color: "text.primary" }}
							>
								Penggalang Dana
							</Typography>
							<Stack spacing={1} sx={{ mt: 1 }}>
								<InfoRow k="Nama" v={data.ownerName} />
								<InfoRow k="Email" v={data.ownerEmail} />
								<InfoRow k="No. HP" v={data.ownerPhone} />
							</Stack>
						</Paper>
					)}

					{tab === "story" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Stack
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								sx={{ gap: 1, flexWrap: "wrap" }}
							>
								<Box>
									<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
										Konten Campaign
									</Typography>
									<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
										Edit cepat untuk judul, cerita, dan ajakan.
									</Typography>
								</Box>

								<Button
									variant="contained"
									startIcon={<SaveRoundedIcon />}
									onClick={onSaveStory}
									sx={{
										borderRadius: 999,
										fontWeight: 900,
										px: 2,
										boxShadow: "none",
									}}
								>
									Simpan
								</Button>
							</Stack>

							<Divider sx={{ my: 1.25 }} />

							<FormBlock label="Judul">
								<TextField
									size="small"
									value={data.title}
									onChange={(e) =>
										setData((d: any) => ({ ...d, title: e.target.value }))
									}
									fullWidth
									sx={fieldSx(theme)}
								/>
							</FormBlock>

							<FormBlock label="Cerita">
								<RichTextEditor
									value={data.story}
									onChange={(val) =>
										setData((d: any) => ({ ...d, story: val }))
									}
									placeholder="Tulis cerita lengkap..."
									minHeight={300}
								/>
								<Typography
									sx={{ mt: 0.75, fontSize: 12, color: "text.secondary" }}
								>
									Minimal disarankan 80+ karakter untuk lolos review cepat.
								</Typography>
							</FormBlock>

							<FormBlock label="Ajakan singkat">
								<TextField
									size="small"
									value={data.shortInvite}
									onChange={(e) =>
										setData((d: any) => ({ ...d, shortInvite: e.target.value }))
									}
									fullWidth
									multiline
									minRows={3}
									sx={fieldSx(theme)}
								/>
							</FormBlock>
						</Paper>
					)}

					{tab === "docs" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
								sx={{ gap: 1, flexWrap: "wrap" }}
							>
								<Box>
									<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
										Dokumen
									</Typography>
									<Typography
										sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
									>
										Upload dokumen untuk verifikasi. Required missing:{" "}
										<b>{requiredMissing}</b>
									</Typography>
								</Box>
								<Button
									variant="outlined"
									startIcon={<VisibilityRoundedIcon />}
									onClick={() => setTab("verify")}
									sx={{ borderRadius: 999, fontWeight: 900 }}
								>
									Cek Verifikasi
								</Button>
							</Stack>

							<Divider sx={{ my: 1.25 }} />

							<Stack spacing={1}>
								{docs.map((d) => (
									<DocRow
										key={d.key}
										doc={d}
										onUpload={(file) => handleUpload(d.key, file)}
										onPreview={() =>
											setPreview({
												open: true,
												title: d.title,
												url: d.previewUrl,
											})
										}
										onRemove={() => handleRemoveDoc(d.key)}
									/>
								))}
							</Stack>
						</Paper>
					)}

					{tab === "verify" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Stack
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								sx={{ gap: 1, flexWrap: "wrap" }}
							>
								<Box>
									<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
										Verifikasi Campaign
									</Typography>
									<Typography
										sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
									>
										Centang checklist, lalu approve / reject.
									</Typography>
								</Box>

								<Chip
									label={verifyReady ? "Siap Approve" : "Belum lengkap"}
									variant="outlined"
									sx={{
										borderRadius: 999,
										fontWeight: 900,
										borderColor: alpha(
											verifyReady
												? theme.palette.success.main
												: theme.palette.warning.main,
											0.3
										),
										bgcolor: alpha(
											verifyReady
												? theme.palette.success.main
												: theme.palette.warning.main,
											theme.palette.mode === "dark" ? 0.18 : 0.1
										),
										color: verifyReady
											? theme.palette.success.main
											: theme.palette.warning.main,
									}}
								/>
							</Stack>

							<Divider sx={{ my: 1.25 }} />

							<Stack spacing={0.5}>
								<VerifyItem
									label="Identitas/KTP valid"
									checked={check.identityOk}
									onChange={(v) => setCheck((c) => ({ ...c, identityOk: v }))}
									hint="Pastikan KTP jelas dan sesuai."
								/>
								<VerifyItem
									label="Foto sampul sesuai"
									checked={check.coverOk}
									onChange={(v) => setCheck((c) => ({ ...c, coverOk: v }))}
									hint="Tidak mengandung konten sensitif/menyesatkan."
								/>
								<VerifyItem
									label="Cerita memadai & meyakinkan"
									checked={check.storyOk}
									onChange={(v) => setCheck((c) => ({ ...c, storyOk: v }))}
									hint="Kronologi, kebutuhan biaya, Useran dana jelas."
								/>
								<VerifyItem
									label="Target biaya wajar & terisi"
									checked={check.targetOk}
									onChange={(v) => setCheck((c) => ({ ...c, targetOk: v }))}
									hint="Nominal tidak nol, masuk akal."
								/>
								<VerifyItem
									label="Kategori sesuai"
									checked={check.categoryOk}
									onChange={(v) => setCheck((c) => ({ ...c, categoryOk: v }))}
									hint="Pastikan masuk kategori yang benar."
								/>
								<VerifyItem
									label="Nomor HP dapat dihubungi"
									checked={check.phoneOk}
									onChange={(v) => setCheck((c) => ({ ...c, phoneOk: v }))}
									hint="Minimal bisa dihubungi WA/telepon."
								/>
							</Stack>

							<Divider sx={{ my: 1.25 }} />

							<TextField
								size="small"
								label="Catatan / Alasan penolakan (opsional)"
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								fullWidth
								multiline
								minRows={3}
								sx={fieldSx(theme)}
							/>

							<Stack
								direction={{ xs: "column", sm: "row" }}
								spacing={1}
								sx={{ mt: 1.25 }}
							>
								<Button
									variant="contained"
									startIcon={<ThumbUpAltRoundedIcon />}
									onClick={() => setConfirmApprove(true)}
									sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
								>
									Approve (Aktifkan)
								</Button>

								<Button
									variant="outlined"
									color="error"
									startIcon={<ThumbDownAltRoundedIcon />}
									onClick={() => setConfirmReject(true)}
									sx={{ borderRadius: 999, fontWeight: 900 }}
								>
									Reject
								</Button>

								<Box sx={{ flex: 1 }} />

								<Button
									variant="outlined"
									onClick={() => setTab("docs")}
									startIcon={<UploadFileRoundedIcon />}
									sx={{ borderRadius: 999, fontWeight: 900 }}
								>
									Ke Dokumen
								</Button>
							</Stack>

							{!verifyReady ? (
								<Paper
									variant="outlined"
									sx={{
										mt: 1.25,
										borderRadius: 2.5,
										p: 1,
										// borderColor: alpha(theme.palette.warning.main, 0.25),
										border: "none",
										bgcolor: alpha(
											theme.palette.warning.main,
											theme.palette.mode === "dark" ? 0.12 : 0.06
										),
									}}
								>
									<Typography sx={{ fontSize: 12.5, fontWeight: 900 }}>
										Belum siap approve
									</Typography>
									<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
										Cek dokumen required, cerita, dan target biaya. Setelah
										complete, tombol approve akan aktif.
									</Typography>
								</Paper>
							) : null}
						</Paper>
					)}

					{tab === "timeline" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
								Timeline
							</Typography>
							<Typography
								sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
							>
								Audit log aktivitas campaign.
							</Typography>

							<Divider sx={{ my: 1.25 }} />

							<Stack spacing={1}>
								{audit.map((e) => (
									<TimelineRow key={e.id} event={e} />
								))}
							</Stack>
						</Paper>
					)}

					{tab === "transactions" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
								Transaksi
							</Typography>
							<Typography
								sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
							>
								Daftar donasi yang masuk ke campaign ini.
							</Typography>

							<Divider sx={{ my: 1.25 }} />

							<Stack spacing={1}>
								{txLoading ? (
									<Stack alignItems="center" sx={{ py: 4 }}>
										<CircularProgress size={24} />
									</Stack>
								) : txRows.length === 0 ? (
									<Typography
										sx={{
											fontSize: 13,
											color: "text.secondary",
											textAlign: "center",
											py: 4,
										}}
									>
										Belum ada transaksi.
									</Typography>
								) : (
									txRows.map((row) => <TxRowCard key={row.id} row={row} />)
								)}
							</Stack>
						</Paper>
					)}
				</Stack>

				{/* RIGHT SIDEBAR */}
				<Stack spacing={2}>
					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
							Informasi
						</Typography>
						<Typography
							sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
						>
							Data ringkas untuk pengecekan cepat.
						</Typography>

						<Divider sx={{ my: 1.25 }} />

						<Stack spacing={1}>
							<MiniStat label="Pemilik" value={data.ownerName} />
							<MiniStat label="Email" value={data.ownerEmail} />
							<MiniStat label="No. HP" value={data.ownerPhone} />
							<MiniStat label="Kategori" value={data.category} />
							<MiniStat label="Status" value={statusMeta.label} />
						</Stack>
					</Paper>

					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
							Quick Actions
						</Typography>
						<Typography
							sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
						>
							Aksi cepat untuk admin.
						</Typography>

						<Divider sx={{ my: 1.25 }} />

						<Stack spacing={1}>
							<Button
								variant="outlined"
								startIcon={<UploadFileRoundedIcon />}
								onClick={() => setTab("docs")}
								sx={{
									borderRadius: 999,
									fontWeight: 900,
									justifyContent: "flex-start",
								}}
							>
								Cek Dokumen
							</Button>

							<Button
								variant="outlined"
								startIcon={<VerifiedRoundedIcon />}
								onClick={() => setTab("verify")}
								disabled={!canVerify}
								sx={{
									borderRadius: 999,
									fontWeight: 900,
									justifyContent: "flex-start",
								}}
							>
								Buka Verifikasi
							</Button>

							<Button
								href={data.publicUrl}
								target="_blank"
								variant="contained"
								endIcon={<OpenInNewRoundedIcon />}
								sx={{
									borderRadius: 999,
									fontWeight: 900,
									boxShadow: "none",
									justifyContent: "flex-start",
								}}
							>
								Buka Public Page
							</Button>

							<Button
								variant="outlined"
								startIcon={<ContentCopyRoundedIcon />}
								onClick={() => copy(data.publicUrl)}
								sx={{
									borderRadius: 999,
									fontWeight: 900,
									justifyContent: "flex-start",
								}}
							>
								Copy Public URL
							</Button>
						</Stack>
					</Paper>

					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
							Public URL
						</Typography>
						<Typography
							sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
						>
							Pakai untuk cek halaman publik atau kirim ke tim.
						</Typography>

						<Divider sx={{ my: 1.25 }} />

						<TextField
							size="small"
							value={data.publicUrl}
							fullWidth
							InputProps={{ readOnly: true }}
							sx={fieldSx(theme)}
						/>
					</Paper>
				</Stack>
			</Box>

			{/* Preview Doc */}
			<Dialog
				open={preview.open}
				onClose={() => setPreview({ open: false })}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 1000 }}>
					{preview.title || "Preview"}
				</DialogTitle>
				<DialogContent>
					{preview.url ? (
						<Box
							component="img"
							src={preview.url}
							alt={preview.title || "preview"}
							sx={{
								width: "100%",
								borderRadius: 2,
								border: "1px solid",
								borderColor: "divider",
								bgcolor: "background.default",
							}}
						/>
					) : (
						<Typography sx={{ color: "text.secondary" }}>
							Tidak ada preview.
						</Typography>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setPreview({ open: false })}
						variant="outlined"
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Tutup
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm End */}
			<Dialog
				open={confirmEnd}
				onClose={() => setConfirmEnd(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 1000 }}>Akhiri campaign?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Campaign akan diubah statusnya menjadi <b>Berakhir</b>.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setConfirmEnd(false)}
						variant="outlined"
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Batal
					</Button>
					<Button
						onClick={async () => {
							setConfirmEnd(false);
							try {
								const res = await finishCampaign(id);
								if (res.success) {
									setData((d: any) => ({
										...d,
										status: "ended",
										updatedAt: "Hari ini",
									}));
									pushAudit({
										title: "Campaign diakhiri",
										meta: "Status menjadi Berakhir.",
										tone: "warning",
									});
									setSnack({
										open: true,
										msg: "Campaign berhasil diakhiri.",
										type: "success",
									});
								} else {
									setSnack({
										open: true,
										msg: res.error || "Gagal mengakhiri campaign.",
										type: "error",
									});
								}
							} catch (e) {
								console.error(e);
								setSnack({
									open: true,
									msg: "Terjadi kesalahan.",
									type: "error",
								});
							}
						}}
						variant="contained"
						color="error"
						sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
					>
						Akhiri
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm Pause */}
			<Dialog
				open={confirmPause}
				onClose={() => setConfirmPause(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 1000 }}>Jeda campaign?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Campaign akan dijeda sementara dan tidak dapat menerima donasi.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setConfirmPause(false)}
						variant="outlined"
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Batal
					</Button>
					<Button
						onClick={onPause}
						variant="contained"
						color="warning"
						sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
					>
						Jeda
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm Resume */}
			<Dialog
				open={confirmResume}
				onClose={() => setConfirmResume(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 1000 }}>Lanjutkan campaign?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Campaign akan diaktifkan kembali dan dapat menerima donasi.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setConfirmResume(false)}
						variant="outlined"
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Batal
					</Button>
					<Button
						onClick={onResume}
						variant="contained"
						color="success"
						sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
					>
						Lanjutkan
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm Approve */}
			<Dialog
				open={confirmApprove}
				onClose={() => setConfirmApprove(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 1000 }}>Approve campaign?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Status akan menjadi <b>Aktif</b>. Pastikan checklist sudah benar.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setConfirmApprove(false)}
						variant="outlined"
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Batal
					</Button>
					<Button
						onClick={onApprove}
						variant="contained"
						sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
					>
						Approve
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm Reject */}
			<Dialog
				open={confirmReject}
				onClose={() => setConfirmReject(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 1000 }}>Reject campaign?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Status akan menjadi <b>Ditolak</b>. Catatan/alasan akan tercatat di
						timeline.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setConfirmReject(false)}
						variant="outlined"
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Batal
					</Button>
					<Button
						onClick={onReject}
						variant="contained"
						color="error"
						sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
					>
						Reject
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
					sx={{ borderRadius: 3 }}
				>
					{snack.msg}
				</Alert>
			</Snackbar>
		</Box>
	);
}

/* ---------- UI bits ---------- */

function fieldSx(theme: any) {
	return {
		"& .MuiOutlinedInput-root": {
			borderRadius: 2.5,
			bgcolor: alpha(
				theme.palette.background.default,
				theme.palette.mode === "dark" ? 0.22 : 1
			),
		},
		"& .MuiInputBase-input": { fontSize: 13.5 },
	};
}

function SegTab({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	const theme = useTheme();
	return (
		<Chip
			label={label}
			clickable
			onClick={onClick}
			variant="outlined"
			sx={{
				borderRadius: 999,
				fontWeight: 1000,
				px: 0.5,
				borderColor: active
					? alpha(theme.palette.primary.main, 0.35)
					: alpha(theme.palette.divider, 1),
				bgcolor: active
					? alpha(
							theme.palette.primary.main,
							theme.palette.mode === "dark" ? 0.18 : 0.08
					  )
					: "transparent",
				color: active
					? theme.palette.primary.main
					: theme.palette.text.secondary,
				transition: "all 140ms ease",
				"&:hover": {
					bgcolor: alpha(
						theme.palette.primary.main,
						theme.palette.mode === "dark" ? 0.14 : 0.06
					),
				},
			}}
		/>
	);
}

function QuickPill({ label, value }: { label: string; value: string }) {
	const theme = useTheme();
	return (
		<Box
			sx={{
				px: 1.25,
				py: 0.75,
				borderRadius: 2,
				bgcolor: alpha(
					theme.palette.background.default,
					theme.palette.mode === "dark" ? 0.18 : 1
				),
				minWidth: 180,
			}}
		>
			<Typography
				sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 900 }}
			>
				{label}
			</Typography>
			<Typography
				sx={{ mt: 0.2, fontSize: 12.5, fontWeight: 1000 }}
				className="line-clamp-1"
			>
				{value}
			</Typography>
		</Box>
	);
}

function MiniStat({ label, value }: { label: string; value: string }) {
	const theme = useTheme();
	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 2.5,
				p: 1,
				borderColor: alpha(theme.palette.divider, 1),
				bgcolor: alpha(
					theme.palette.background.default,
					theme.palette.mode === "dark" ? 0.2 : 1
				),
			}}
		>
			<Typography
				sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 900 }}
			>
				{label}
			</Typography>
			<Typography
				sx={{ mt: 0.2, fontSize: 12.5, fontWeight: 1000 }}
				className="line-clamp-2"
			>
				{value}
			</Typography>
		</Paper>
	);
}

function InfoRow({ k, v }: { k: string; v: string }) {
	return (
		<Box sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
			<Typography sx={{ width: 120, fontSize: 12.5, color: "text.secondary" }}>
				{k}
			</Typography>
			<Typography sx={{ fontSize: 12.5, fontWeight: 900 }}>{v}</Typography>
		</Box>
	);
}

function FormBlock({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<Box sx={{ mt: 2 }}>
			<Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>{label}</Typography>
			<Box sx={{ mt: 1 }}>{children}</Box>
		</Box>
	);
}

function VerifyItem({
	label,
	checked,
	onChange,
	hint,
}: {
	label: string;
	checked: boolean;
	onChange: (v: boolean) => void;
	hint?: string;
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 0.25 }}>
			<FormControlLabel
				control={
					<Checkbox
						checked={checked}
						onChange={(e) => onChange(e.target.checked)}
					/>
				}
				label={
					<Box>
						<Typography sx={{ fontSize: 13, fontWeight: 900 }}>
							{label}
						</Typography>
						{hint ? (
							<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
								{hint}
							</Typography>
						) : null}
					</Box>
				}
				sx={{ m: 0 }}
			/>
		</Box>
	);
}

function DocRow({
	doc,
	onUpload,
	onPreview,
	onRemove,
}: {
	doc: DocItem;
	onUpload: (file?: File | null) => void;
	onPreview: () => void;
	onRemove: () => void;
}) {
	const theme = useTheme();
	const id = `file-${doc.key}`;
	const badgeColor = doc.uploaded
		? theme.palette.success.main
		: theme.palette.warning.main;

	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 2.5,
				p: 1,
				// borderColor: alpha(theme.palette.divider, 1),
				border: "none",
				bgcolor: alpha(
					theme.palette.background.default,
					theme.palette.mode === "dark" ? 0.2 : 1
				),
			}}
		>
			<input
				id={id}
				type="file"
				hidden
				accept="image/*,.pdf"
				onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
			/>

			<Stack direction="row" spacing={1} alignItems="center">
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						sx={{ flexWrap: "wrap" }}
					>
						<Typography
							sx={{ fontSize: 13, fontWeight: 1000 }}
							className="line-clamp-1"
						>
							{doc.title}
						</Typography>

						<Chip
							size="small"
							label={doc.required ? "Required" : "Opsional"}
							variant="outlined"
							sx={{
								borderRadius: 999,
								fontWeight: 900,
								height: 22,
								borderColor: alpha(theme.palette.divider, 1),
								color: "text.secondary",
							}}
						/>

						<Chip
							size="small"
							label={doc.uploaded ? "Uploaded" : "Belum"}
							variant="outlined"
							sx={{
								borderRadius: 999,
								fontWeight: 900,
								height: 22,
								borderColor: alpha(badgeColor, 0.28),
								bgcolor: alpha(
									badgeColor,
									theme.palette.mode === "dark" ? 0.16 : 0.08
								),
								color: badgeColor,
							}}
						/>
					</Stack>

					<Typography
						sx={{ fontSize: 12.5, color: "text.secondary" }}
						className="line-clamp-1"
					>
						{doc.uploaded ? (
							<>
								{doc.filename} {doc.updatedAt ? `• ${doc.updatedAt}` : ""}
							</>
						) : (
							doc.help || "—"
						)}
					</Typography>
				</Box>

				{doc.uploaded ? (
					<Stack direction="row" spacing={1}>
						<Button
							variant="outlined"
							startIcon={<VisibilityRoundedIcon />}
							onClick={onPreview}
							disabled={!doc.previewUrl}
							sx={{ borderRadius: 999, fontWeight: 900 }}
						>
							Preview
						</Button>
						<Tooltip title="Hapus dokumen">
							<IconButton
								onClick={onRemove}
								sx={{
									borderRadius: 2,
									// border: "1px solid",
									// borderColor: alpha(theme.palette.divider, 1),
								}}
							>
								<DeleteOutlineRoundedIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</Stack>
				) : (
					<Button
						component="label"
						htmlFor={id}
						variant="outlined"
						startIcon={<UploadFileRoundedIcon />}
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Upload
					</Button>
				)}
			</Stack>
		</Paper>
	);
}

function TimelineRow({ event }: { event: AuditEvent }) {
	const theme = useTheme();

	const tone = event.tone ?? "neutral";
	const c =
		tone === "success"
			? theme.palette.success.main
			: tone === "warning"
			? theme.palette.warning.main
			: tone === "error"
			? theme.palette.error.main
			: tone === "info"
			? theme.palette.info.main
			: theme.palette.text.secondary;

	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 2.5,
				p: 1,
				// borderColor: alpha(theme.palette.divider, 1),
				border: "none",
				bgcolor: alpha(
					theme.palette.background.default,
					theme.palette.mode === "dark" ? 0.2 : 1
				),
			}}
		>
			<Stack direction="row" spacing={1} alignItems="baseline">
				<Typography
					sx={{ fontSize: 12, color: "text.secondary", minWidth: 72 }}
				>
					{event.at}
				</Typography>
				<Box sx={{ flex: 1 }}>
					<Typography sx={{ fontSize: 13, fontWeight: 1000 }}>
						{event.title}
					</Typography>
					{event.meta ? (
						<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
							{event.meta}
						</Typography>
					) : null}
				</Box>
				<Box
					sx={{
						width: 10,
						height: 10,
						borderRadius: 999,
						bgcolor: c,
						boxShadow: `0 0 0 3px ${alpha(
							c,
							theme.palette.mode === "dark" ? 0.18 : 0.12
						)}`,
					}}
				/>
			</Stack>
		</Paper>
	);
}

function TxRowCard({ row }: { row: TxRow }) {
	const theme = useTheme();
	const meta = statusMeta(row.status);

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 2,
				borderRadius: 2.5,
				borderColor: alpha(theme.palette.divider, 1),
				bgcolor: alpha(
					theme.palette.background.default,
					theme.palette.mode === "dark" ? 0.2 : 1
				),
			}}
		>
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="center"
				sx={{ minWidth: 0 }}
			>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: 2.5,
						display: "grid",
						placeItems: "center",
						bgcolor: alpha(
							meta.tone === "success" ? "#22c55e" : "#f97316",
							0.12
						),
						color: meta.tone === "success" ? "#22c55e" : "#f97316",
					}}
				>
					{meta.icon}
				</Box>

				<Box sx={{ flex: 1 }}>
					<Typography sx={{ fontSize: 13, fontWeight: 1000 }}>
						{idr(row.amount)} • {row.donorName}
					</Typography>
					<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
						{row.createdAt} • {methodLabel(row.method)} • {row.refCode}
					</Typography>
				</Box>
			</Stack>
		</Paper>
	);
}
