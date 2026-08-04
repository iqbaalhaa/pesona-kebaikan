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
	InputAdornment,
	Avatar,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
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
	deleteCampaign,
	finishCampaign,
	updateCampaignStory,
} from "@/actions/campaign";
import {
	updateCampaignStatus,
	updateCampaignFee,
	addCampaignMedia,
	uploadCampaignDocument,
} from "@/actions/campaign-admin";
import { getCampaignTransactions, getCampaignDonorsExport } from "@/actions/admin";
import { exportDonorsToPDF, exportDonorsToCSV } from "@/lib/export/donationExport";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
	idr as _idr, pct as _pct, statusMeta as _statusMeta, methodLabel as _methodLabel,
	fieldSx as _fieldSx, shellSx as _shellSx,
	SegTab, InfoRow, MiniStat, VerifyItem, FormBlock, DocRow, TimelineRow, TxTableRow,
	type DocItem, type AuditEvent, type TxRow, type TxStatus, type PayMethod,
	type CampaignStatus as CampaignStatusType, type CampaignType, type DocKey,
} from "./_components/shared";

type CampaignStatus = CampaignStatusType;

const QUICK_DONATION_SLUG = "donasi-cepat";
const TX_PAGE_SIZE = 20;

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

const idr = _idr;
const pct = _pct;
const statusMeta = _statusMeta;
const methodLabel = _methodLabel;
const fieldSx = _fieldSx;
const shellSx = _shellSx;

function nowLabel() {
	const d = new Date();
	const pad = (x: number) => String(x).padStart(2, "0");
	return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCampaignDetailPage(props: {
	params: Promise<{ id: string }>;
}) {
	const theme = useTheme();
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const id = params?.id ?? "";

	const [loading, setLoading] = React.useState(true);
	const [data, setData] = React.useState<any>(null);

	const [tab, setTab] = React.useState<
		| "overview"
		| "story"
		| "docs"
		| "fee"
		| "verify"
		| "timeline"
		| "transactions"
	>("overview");

	const isReviewStatus = ["pending", "review", "draft"].includes(data?.status || "");

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
	const [txPage, setTxPage] = React.useState(1);
	const [txTotalPages, setTxTotalPages] = React.useState(1);
	const [txTotal, setTxTotal] = React.useState(0);
	const [txExporting, setTxExporting] = React.useState<"pdf" | "csv" | null>(null);

	const [feeValue, setFeeValue] = React.useState<string>("0");
	const [feeLoading, setFeeLoading] = React.useState(false);

	const restartInitialDays =
		data &&
		data.restartInfo &&
		typeof data.restartInfo.initialDurationDays === "number"
			? data.restartInfo.initialDurationDays
			: null;

	const restartExtensionDays =
		data &&
		data.restartInfo &&
		typeof data.restartInfo.extensionDays === "number"
			? data.restartInfo.extensionDays
			: null;

	const effectiveInitialDays =
		restartInitialDays &&
		restartExtensionDays &&
		restartInitialDays > restartExtensionDays
			? restartExtensionDays
			: restartInitialDays;

	const fetchTransactions = React.useCallback(async () => {
		setTxLoading(true);
		try {
			const res = await getCampaignTransactions(id, txPage, TX_PAGE_SIZE);
			if (res.success && res.data) {
				// @ts-expect-error — mapped `method` is widened to `string` in admin.ts, not narrowed to PayMethod
				setTxRows(res.data);
				setTxTotalPages(res.totalPages || 1);
				setTxTotal(res.total || 0);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setTxLoading(false);
		}
	}, [id, txPage]);

	React.useEffect(() => {
		if (tab === "transactions") {
			fetchTransactions();
		}
	}, [tab, fetchTransactions]);

	const handleExportTransactions = async (format: "pdf" | "csv") => {
		setTxExporting(format);
		try {
			const res = await getCampaignDonorsExport(id);
			if (!res.success || !res.data) {
				setSnack({ open: true, msg: res.error || "Gagal mengambil data export", type: "error" });
				return;
			}
			const title = data?.title || "campaign";
			if (format === "pdf") await exportDonorsToPDF(res.data as any, title);
			else await exportDonorsToCSV(res.data as any, title);
		} catch (e) {
			console.error(e);
			setSnack({ open: true, msg: "Gagal mengekspor data donatur", type: "error" });
		} finally {
			setTxExporting(null);
		}
	};

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

				const plainStory = cleanStory
					.replace(/<[^>]+>/g, " ")
					.replace(/\s+/g, " ")
					.trim();

				const campaignMeta = (c as any).metadata || {};
				const type: CampaignType =
					c.type === "sakit" || c.category === "Bantuan Medis & Kesehatan"
						? "sakit"
						: "lainnya";

				const sakitMeta =
					type === "sakit"
						? {
								who: campaignMeta.who || "",
								whoOther: campaignMeta.whoOther || "",
								whoLabel:
									campaignMeta.who === "self"
										? "Saya sendiri"
										: campaignMeta.who === "kk"
											? "Keluarga satu KK"
											: campaignMeta.who === "beda_kk"
												? "Keluarga inti berbeda KK"
												: campaignMeta.who === "other"
													? campaignMeta.whoOther || "Lainnya"
													: "-",
								bank: campaignMeta.bank || "",
								bankLabel:
									campaignMeta.bank === "pasien"
										? "Pasien langsung"
										: campaignMeta.bank === "kk"
											? "Keluarga satu KK"
											: campaignMeta.bank === "beda_kk"
												? "Keluarga inti berbeda KK"
												: campaignMeta.bank === "rs"
													? "Rumah sakit"
													: campaignMeta.bank === "yayasan"
														? "Rekening Pesona Kebaikan"
														: "-",
								patientName: campaignMeta.patientName || "-",
								patientAge: campaignMeta.patientAge || "-",
								patientGender: campaignMeta.patientGender || "",
								patientGenderLabel:
									campaignMeta.patientGender === "L"
										? "Laki-laki"
										: campaignMeta.patientGender === "P"
											? "Perempuan"
											: "-",
								patientCity: campaignMeta.patientCity || "-",
								inpatient: campaignMeta.inpatient || "",
								inpatientLabel:
									campaignMeta.inpatient === "ya"
										? "Sedang rawat inap"
										: campaignMeta.inpatient === "tidak"
											? "Tidak rawat inap"
											: "-",
								treatment: campaignMeta.treatment || "-",
								hospital: campaignMeta.hospital || "-",
								bpjs: campaignMeta.bpjs || "",
								bpjsLabel:
									campaignMeta.bpjs === "ya"
										? "Terdaftar BPJS"
										: campaignMeta.bpjs === "tidak"
											? "Tidak BPJS"
											: "-",
								prevCost: campaignMeta.prevCost || "",
								prevCostLabel:
									campaignMeta.prevCost === "mandiri"
										? "Biaya mandiri/pribadi"
										: campaignMeta.prevCost === "asuransi"
											? "Asuransi/BPJS"
											: "-",
								usage: campaignMeta.usage || "-",
								cta: campaignMeta.cta || "-",
							}
						: null;

				const lainnyaMeta =
					type === "lainnya"
						? {
								purposeKey: campaignMeta.purposeKey || "-",
								ktpName: campaignMeta.ktpName || "-",
								receiverName: campaignMeta.receiverName || "-",
								goal: campaignMeta.goal || "-",
								location: campaignMeta.location || "-",
								usageOther: campaignMeta.usageOther || "-",
								ctaOther: campaignMeta.ctaOther || "-",
								job: campaignMeta.job || "-",
								workplace: campaignMeta.workplace || "-",
								soc: campaignMeta.soc || "-",
								socHandle: campaignMeta.socHandle || "-",
								beneficiaries:
									typeof campaignMeta.beneficiaries === "number"
										? String(campaignMeta.beneficiaries)
										: campaignMeta.beneficiaries || "-",
							}
						: null;

				const daysLeft = c.end
					? Math.ceil(
							(new Date(c.end).getTime() - new Date().getTime()) /
								(1000 * 60 * 60 * 24),
						)
					: 0;

				const mappedData = {
					id: c.id,
					title: c.title,
					type,
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
					slug: c.slug || null,
					restartInfo:
						((c as any).metadata && (c as any).metadata.restartInfo) || null,
					daysLeft: daysLeft > 0 ? daysLeft : 0,
					isUnlimited: !c.end,
					foundationFee: (c as any).foundationFee ?? 0,
					shortInvite: (type === "sakit" ? campaignMeta.cta : campaignMeta.ctaOther) || "",
					story: c.description,
					meta: {
						sakit: sakitMeta,
						lainnya: lainnyaMeta,
					},
				};
				setData(mappedData);
				const loadedFee = Number((c as any).foundationFee ?? 0);
				setFeeValue(String(loadedFee));
				if (loadedFee > 0) {
					setCheck((prev) => ({ ...prev, feeOk: true }));
				}

				const medicalDocs = (campaignMeta as any).medicalDocs || {};
				const privateDocs = (campaignMeta as any).docs || {};

				const ktpUrl: string = privateDocs.ktp || "";
				const base: DocItem[] = [
					{
						key: "cover",
						title: "Foto Sampul",
						required: false,
						help: "Foto utama yang tampil di campaign. Disarankan ukuran 664 x 357 piksel.",
						uploaded: !!c.thumbnail,
						previewUrl: c.thumbnail,
					},
					{
						key: "ktp",
						title: "Identitas / KTP Penggalang",
						required: false,
						help: "KTP pemilik akun/penggalang.",
						uploaded: !!ktpUrl,
						previewUrl: ktpUrl || undefined,
						filename: ktpUrl ? ktpUrl.split("/").pop() : undefined,
					},
				];

				if (mappedData.type === "sakit") {
					// Baca dari docs (baru) atau medicalDocs (lama) untuk backward compat
					const resumeUrl: string = privateDocs.resume_medis || medicalDocs.resume_medis || "";
					const suratUrl: string = privateDocs.surat_rs || medicalDocs.surat_rs || "";
					base.push(
						{
							key: "resume_medis",
							title: "Surat / Resume Medis",
							required: false,
							help: "Dokumen diagnosis/riwayat medis.",
							uploaded: !!resumeUrl,
							filename: resumeUrl ? resumeUrl.split("/").pop() : undefined,
							previewUrl: resumeUrl || undefined,
						},
						{
							key: "surat_rs",
							title: "Dokumen Rumah Sakit",
							required: false,
							help: "Surat rujukan, rincian biaya, dll (opsional).",
							uploaded: !!suratUrl,
							filename: suratUrl ? suratUrl.split("/").pop() : undefined,
							previewUrl: suratUrl || undefined,
						},
					);
				} else {
					const pendukungUrl: string = privateDocs.pendukung || "";
					base.push({
						key: "pendukung",
						title: "Dokumen Pendukung",
						required: false,
						help: "Surat izin, proposal, foto kondisi, dll.",
						uploaded: !!pendukungUrl,
						previewUrl: pendukungUrl || undefined,
						filename: pendukungUrl ? pendukungUrl.split("/").pop() : undefined,
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
		categoryOk: false,
		phoneOk: false,
		feeOk: false,
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
					label:
						data?.category && data.category !== "-" ? data.category : "Lainnya",
					icon: <CategoryRoundedIcon fontSize="small" />,
					color: theme.palette.success.main,
				};

	const metaSakit = (data as any)?.meta?.sakit;
	const metaLainnya = (data as any)?.meta?.lainnya;

	const shellSx = {
		borderRadius: 3,
		border: "1px solid",
		borderColor: alpha(
			theme.palette.divider,
			theme.palette.mode === "dark" ? 0.9 : 1,
		),
		bgcolor: alpha(
			theme.palette.background.paper,
			theme.palette.mode === "dark" ? 0.92 : 1,
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

	const isQuickDonation =
		data?.slug === QUICK_DONATION_SLUG ||
		(typeof data?.title === "string" &&
			data.title.toLowerCase() === "donasi cepat");

	const canVerify = data?.status === "review" || data?.status === "pending";
	const canEnd =
		!isQuickDonation &&
		(data?.status === "active" || data?.status === "paused");
	const canPause = data?.status === "active";
	const canResume =
		!isQuickDonation && (data?.status === "paused" || data?.status === "ended");


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
		check.phoneOk &&
		check.feeOk;

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
					: d,
			),
		);

		const formData = new FormData();
		formData.append("file", file);

		try {
			let res: { success: boolean; url?: string; error?: string };

			if (key === "cover") {
				// Cover → masuk ke CampaignMedia dengan isThumbnail: true
				formData.append("isThumbnail", "true");
				const r = await addCampaignMedia(id, formData);
				res = { success: r.success, url: (r as any).url, error: r.error };
			} else {
				// Dokumen private → disimpan di metadata, TIDAK di CampaignMedia
				const r = await uploadCampaignDocument(id, key, formData);
				res = r;
			}

			if (res.success) {
				const finalUrl = res.url;
				if (finalUrl) {
					setDocs((prev) =>
						prev.map((d) =>
							d.key === key
								? {
										...d,
										previewUrl: finalUrl,
										filename: finalUrl.split("/").pop() || file.name,
									}
								: d,
						),
					);
				}

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
						: d,
				),
			);
			setSnack({ open: true, msg: "Gagal upload dokumen.", type: "error" });
		}
	};

	const handleRemoveDoc = async (key: DocKey) => {
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
					: d,
			),
		);
		// Hapus referensi URL dari metadata melalui uploadCampaignDocument dengan file kosong tidak didukung.
		// Saat ini hanya clear dari UI; untuk hapus permanen perlu action terpisah.
		// (Tidak ada delete dari S3 — URL masih valid tapi tidak lagi direferensikan.)

		pushAudit({
			title: "Dokumen dihapus",
			meta: `(${key})`,
			tone: "warning",
		});
	};

	const onApprove = async () => {
		if (feeLoading) return;
		setConfirmApprove(false);

		const parsedFee = Number(feeValue || "0");
		if (Number.isNaN(parsedFee) || parsedFee < 0 || parsedFee > 100) {
			setSnack({
				open: true,
				msg: "Fee yayasan harus antara 0% dan 100%.",
				type: "error",
			});
			return;
		}

		setFeeLoading(true);
		try {
			const feeRes = await updateCampaignFee(id, parsedFee);
			if (!feeRes.success) {
				setSnack({
					open: true,
					msg: feeRes.error || "Gagal mengupdate fee yayasan.",
					type: "error",
				});
				return;
			}

			const res = await updateCampaignStatus(id, "ACTIVE");
			if (res.success) {
				setData((d: any) => ({
					...d,
					status: "active",
					updatedAt: "Hari ini",
					foundationFee: parsedFee,
				}));
				pushAudit({
					title: "Campaign disetujui",
					meta: `Status berubah menjadi Aktif. Fee yayasan: ${parsedFee}%`,
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
					msg: res.error || "Gagal approve campaign.",
					type: "error",
				});
			}
		} catch (e) {
			console.error(e);
			setSnack({
				open: true,
				msg: "Terjadi kesalahan saat approve campaign.",
				type: "error",
			});
		} finally {
			setFeeLoading(false);
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

	const onSaveFee = async () => {
		if (feeLoading) return;

		const parsedFee = Number(feeValue || "0");
		if (Number.isNaN(parsedFee) || parsedFee < 0 || parsedFee > 100) {
			setSnack({
				open: true,
				msg: "Fee yayasan harus antara 0% dan 100%.",
				type: "error",
			});
			return;
		}

		setFeeLoading(true);
		try {
			const res = await updateCampaignFee(id, parsedFee);
			if (res.success) {
				setData((d: any) => ({
					...d,
					foundationFee: parsedFee,
					updatedAt: "Hari ini",
				}));
				setCheck((c) => ({ ...c, feeOk: true }));
				pushAudit({
					title: "Fee yayasan diupdate",
					meta: `Fee yayasan: ${parsedFee}%`,
					tone: "info",
				});
				setSnack({
					open: true,
					msg: "Fee yayasan berhasil diperbarui.",
					type: "success",
				});
			} else {
				setSnack({
					open: true,
					msg: res.error || "Gagal mengupdate fee yayasan.",
					type: "error",
				});
			}
		} catch (e) {
			console.error(e);
			setSnack({
				open: true,
				msg: "Terjadi kesalahan saat mengupdate fee yayasan.",
				type: "error",
			});
		} finally {
			setFeeLoading(false);
		}
	};

	const onSaveStory = async () => {
		const res = await updateCampaignStory(
			id,
			data.title,
			data.story,
			data.shortInvite,
		);
		if (res.success) {
			pushAudit({
				title: "Konten campaign disimpan",
				meta: "Judul/Cerita/Ajakan diperbarui.",
				tone: "info",
			});
			setSnack({ open: true, msg: "Disimpan.", type: "success" });
		} else {
			setSnack({ open: true, msg: "Gagal menyimpan.", type: "error" });
		}
	};

	const requiredMissing = docs.filter((d) => d.required && !d.uploaded).length;

	if (loading || !data) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "50vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	const isReviewMode = ["pending", "review", "draft"].includes(data.status);

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
									theme.palette.mode === "dark" ? 0.25 : 1,
								),
							}}
						>
							<ArrowBackIosNewRoundedIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							sx={{ fontWeight: 1000, fontSize: 16 }}
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
									theme.palette.mode === "dark" ? 0.16 : 0.1,
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

						{data.status === "active" && (
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

						{data.status === "paused" && (
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
						)}

						{data.status === "ended" && !isQuickDonation && (
							<Button
								onClick={() => setConfirmResume(true)}
								variant="outlined"
								color="success"
								startIcon={<PlayCircleFilledRoundedIcon />}
								disabled={!canResume}
								sx={{ borderRadius: 999, fontWeight: 900 }}
							>
								Mulai
							</Button>
						)}

						{!isQuickDonation && (
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
						)}
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

			{isReviewMode ? (
				/* ===== REVIEW MODE: single column, top-to-bottom checklist ===== */
				<Stack spacing={2}>
					{/* Owner info inline */}
					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Stack direction="row" spacing={1.5} alignItems="center">
							<Avatar
								src={data.ownerAvatar}
								sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}
							>
								{!data.ownerAvatar && data.ownerName ? data.ownerName.charAt(0).toUpperCase() : ""}
							</Avatar>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>{data.ownerName}</Typography>
								<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
									{data.ownerEmail} {data.phone ? `· ${data.phone}` : ""}
								</Typography>
							</Box>
							<Chip
								label={data.ownerVerifiedAs === "organization" ? "Organisasi" : data.ownerVerifiedAs === "personal" ? "Personal" : "Belum Verifikasi"}
								size="small"
								variant="outlined"
								sx={{ borderRadius: 999, fontWeight: 900 }}
							/>
						</Stack>
					</Paper>

					{/* Document checklist */}
					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>Kelengkapan Dokumen</Typography>
						<Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
							{docs.map((d) => (
								<Chip
									key={d.key}
									size="small"
									label={d.title}
									variant="outlined"
									sx={(t) => ({
										borderRadius: 999,
										fontWeight: 900,
										borderColor: alpha(d.uploaded ? t.palette.success.main : t.palette.warning.main, 0.25),
										bgcolor: alpha(d.uploaded ? t.palette.success.main : t.palette.warning.main, t.palette.mode === "dark" ? 0.16 : 0.08),
										color: d.uploaded ? t.palette.success.main : t.palette.warning.main,
									})}
								/>
							))}
						</Stack>
						<Button size="small" onClick={() => setTab("docs")} sx={{ mt: 1, fontWeight: 700, textTransform: "none" }}>
							Lihat & upload dokumen →
						</Button>
					</Paper>

					{/* Story preview */}
					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>Cerita Campaign</Typography>
						<Box
							sx={{
								mt: 1,
								fontSize: 13,
								color: "text.secondary",
								lineHeight: 1.8,
								maxHeight: 200,
								overflow: "hidden",
								position: "relative",
								"& img": { maxWidth: "100%", borderRadius: 2 },
								"&::after": {
									content: '""',
									position: "absolute",
									bottom: 0,
									left: 0,
									right: 0,
									height: 60,
									background: "linear-gradient(transparent, white)",
								},
							}}
							dangerouslySetInnerHTML={{ __html: data.story || "<p>Belum ada cerita.</p>" }}
						/>
						<Button size="small" onClick={() => setTab("story")} sx={{ mt: 0.5, fontWeight: 700, textTransform: "none" }}>
							Baca selengkapnya →
						</Button>
					</Paper>

					{/* Dana & Target */}
					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Stack direction="row" justifyContent="space-between" alignItems="baseline">
							<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
								{idr(data.collected)} <Typography component="span" sx={{ fontWeight: 800, color: "text.secondary" }}>/ {idr(data.target)}</Typography>
							</Typography>
							<Typography sx={{ fontSize: 13, fontWeight: 900, color: "text.secondary" }}>
								{pct(data.collected, data.target)}%
							</Typography>
						</Stack>
						<LinearProgress
							variant="determinate"
							value={pct(data.collected, data.target)}
							sx={{ mt: 1, height: 6, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1), "& .MuiLinearProgress-bar": { borderRadius: 4 } }}
						/>
						<Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary" }}>
							{data.donors} donatur · {data.category} ·{" "}
							{data.isUnlimited
								? "Tidak terbatas"
								: data.daysLeft > 0
									? `${data.daysLeft} hari lagi`
									: "Berakhir"}
						</Typography>
					</Paper>

					{/* Verification checklist */}
					{tab === "verify" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 1, flexWrap: "wrap" }}>
								<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>Checklist Verifikasi</Typography>
								<Chip
									label={verifyReady ? "Siap Approve" : "Belum lengkap"}
									variant="outlined"
									sx={{
										borderRadius: 999, fontWeight: 900,
										borderColor: alpha(verifyReady ? theme.palette.success.main : theme.palette.warning.main, 0.3),
										bgcolor: alpha(verifyReady ? theme.palette.success.main : theme.palette.warning.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
										color: verifyReady ? theme.palette.success.main : theme.palette.warning.main,
									}}
								/>
							</Stack>
							<Divider sx={{ my: 1.25 }} />
							<Stack spacing={0.5}>
								<VerifyItem label="Fee Yayasan sudah diatur" checked={check.feeOk} onChange={() => {}} readOnly hint={check.feeOk ? `Fee: ${feeValue}% (sudah disimpan)` : "Simpan fee terlebih dahulu di bagian atas"} />
								<VerifyItem label="Identitas/KTP valid" checked={check.identityOk} onChange={(v) => setCheck((c) => ({ ...c, identityOk: v }))} hint="Pastikan KTP jelas dan sesuai." />
								<VerifyItem label="Foto sampul sesuai" checked={check.coverOk} onChange={(v) => setCheck((c) => ({ ...c, coverOk: v }))} hint="Tidak mengandung konten sensitif." />
								<VerifyItem label="Cerita memadai" checked={check.storyOk} onChange={(v) => setCheck((c) => ({ ...c, storyOk: v }))} hint="Kronologi & penggunaan dana jelas." />
								<VerifyItem label="Target biaya wajar" checked={check.targetOk} onChange={(v) => setCheck((c) => ({ ...c, targetOk: v }))} hint="Nominal tidak nol, masuk akal." />
								<VerifyItem label="Kategori sesuai" checked={check.categoryOk} onChange={(v) => setCheck((c) => ({ ...c, categoryOk: v }))} hint="Kategori yang benar." />
								<VerifyItem label="Nomor HP dapat dihubungi" checked={check.phoneOk} onChange={(v) => setCheck((c) => ({ ...c, phoneOk: v }))} hint="WA/telepon aktif." />
							</Stack>
							<Divider sx={{ my: 1.25 }} />
							<TextField size="small" label="Catatan / Alasan penolakan (opsional)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} fullWidth multiline minRows={2} sx={fieldSx(theme)} />
							<Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
								<Button variant="contained" fullWidth startIcon={<ThumbUpAltRoundedIcon />} onClick={() => setConfirmApprove(true)} disabled={!check.feeOk} sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}>
									Approve
								</Button>
								<Button variant="outlined" fullWidth color="error" startIcon={<ThumbDownAltRoundedIcon />} onClick={() => setConfirmReject(true)} sx={{ borderRadius: 999, fontWeight: 900 }}>
									Reject
								</Button>
							</Stack>
						</Paper>
					)}

					{/* Docs tab content */}
					{tab === "docs" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>Dokumen</Typography>
							<Typography sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}>
								Upload dokumen untuk verifikasi. Required missing: <b>{requiredMissing}</b>
							</Typography>
							<Divider sx={{ my: 1.25 }} />
							<Stack spacing={1}>
								{docs.map((d) => (
									<DocRow
										key={d.key}
										doc={d}
										onUpload={(file) => handleUpload(d.key, file)}
										onPreview={() => setPreview({ open: true, title: d.title, url: d.previewUrl })}
										onRemove={() => handleRemoveDoc(d.key)}
									/>
								))}
							</Stack>
						</Paper>
					)}

					{/* Story tab content */}
					{tab === "story" && (
						<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
							<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>Cerita Lengkap</Typography>
							<Divider sx={{ my: 1.25 }} />
							<Box sx={{ fontSize: 14, lineHeight: 1.8, color: "text.secondary", "& img": { maxWidth: "100%", borderRadius: 2, my: 1 } }} dangerouslySetInnerHTML={{ __html: data.story || "<p>Belum ada cerita.</p>" }} />
						</Paper>
					)}

					{/* Default: show verify tab for review mode */}
					{tab !== "verify" && tab !== "docs" && tab !== "story" && (
						<Box sx={{ textAlign: "center", py: 2 }}>
							<Button variant="contained" onClick={() => setTab("verify")} startIcon={<VerifiedRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}>
								Mulai Verifikasi
							</Button>
						</Box>
					)}
				</Stack>
			) : (
			/* ===== MONITOR MODE: existing grid layout ===== */
			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: {
						xs: "minmax(0, 1fr)",
						lg: "minmax(0, 1.6fr) minmax(0, 1fr)",
					},
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
												theme.palette.mode === "dark" ? 0.1 : 0.06,
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
						</Stack>
					</Paper>

					{/* Fee Yayasan - Prominent Section */}
					<Paper
						elevation={0}
						sx={{
							...shellSx,
							p: 2,
							border: "2px solid",
							borderColor: theme.palette.warning.main,
							position: "relative",
							overflow: "hidden",
						}}
					>
						<Box
							sx={{
								position: "absolute",
								top: 0,
								right: 0,
								px: 1.5,
								py: 0.5,
								bgcolor: theme.palette.warning.main,
								borderBottomLeftRadius: 12,
								color: theme.palette.warning.contrastText,
								fontWeight: "bold",
								fontSize: 12,
							}}
						>
							Wajib Diisi
						</Box>

						<Stack spacing={2}>
							<Box sx={{ pr: 10 }}>
								<Typography sx={{ fontWeight: 1000, fontSize: 15 }}>
									Fee Yayasan
								</Typography>
								<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
									Tentukan persentase potongan donasi untuk operasional yayasan.
								</Typography>
							</Box>

							<Stack direction="row" spacing={2} alignItems="center">
								<TextField
									label="Persentase Fee (%)"
									type="number"
									value={feeValue}
									onChange={(e) => {
										const val = e.target.value;
										const num = Number(val);
										if (Number.isNaN(num)) {
											setFeeValue(val);
											return;
										}
										if (num > 100 || num < 0) return;
										setFeeValue(val);
									}}
									inputProps={{ step: 0.1 }}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">%</InputAdornment>
										),
									}}
									sx={{ flex: 1, ...fieldSx(theme) }}
									error={!feeValue}
								/>
								<Button
									variant="contained"
									onClick={onSaveFee}
									disabled={feeLoading}
									sx={{
										height: 40,
										borderRadius: 999,
										fontWeight: 900,
										boxShadow: "none",
										whiteSpace: "nowrap",
									}}
								>
									{feeLoading ? "..." : "Simpan"}
								</Button>
							</Stack>
						</Stack>
					</Paper>

					{/* Tabs + Content */}
					<Paper elevation={0} sx={{ ...shellSx, overflow: "hidden" }}>
						<Box sx={{ px: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
							<Stack
								direction="row"
								spacing={0}
								sx={{
									overflowX: "auto",
									"&::-webkit-scrollbar": { display: "none" },
								}}
							>
								<SegTab
									label="Ringkasan"
									active={tab === "overview"}
									onClick={() => setTab("overview")}
								/>
								<SegTab
									label="Donasi"
									active={tab === "transactions"}
									onClick={() => setTab("transactions")}
								/>
								<SegTab
									label="Timeline"
									active={tab === "timeline"}
									onClick={() => setTab("timeline")}
								/>
							</Stack>
						</Box>

					{tab === "overview" && (
						<Box sx={{ p: 1.5 }}>
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
								{data.status === "active" && data.isUnlimited && (
									<InfoRow k="Sisa Hari" v="Tidak terbatas (hentikan manual)" />
								)}
								{data.status === "active" && !data.isUnlimited && data.daysLeft > 0 && (
									<InfoRow
										k="Sisa Hari"
										v={
											effectiveInitialDays
												? `${effectiveInitialDays} hari (berakhir) + ${data.daysLeft} hari lagi`
												: `${data.daysLeft} hari`
										}
									/>
								)}
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
								<InfoRow k="No. HP" v={data.phone} />
							</Stack>

							{data.type === "sakit" && metaSakit && (
								<>
									<Divider sx={{ my: 1.25 }} />
									<Typography
										sx={{
											fontWeight: 1000,
											fontSize: 13.5,
											color: "text.primary",
										}}
									>
										Data Pasien
									</Typography>
									<Stack spacing={1} sx={{ mt: 1 }}>
										<InfoRow k="Siapa yang sakit" v={metaSakit.whoLabel} />
										<InfoRow k="Nama Pasien" v={metaSakit.patientName} />
										<InfoRow k="Usia" v={metaSakit.patientAge} />
										<InfoRow
											k="Jenis Kelamin"
											v={metaSakit.patientGenderLabel}
										/>
										<InfoRow k="Kota/Kabupaten" v={metaSakit.patientCity} />
									</Stack>

									<Divider sx={{ my: 1.25 }} />
									<Typography
										sx={{
											fontWeight: 1000,
											fontSize: 13.5,
											color: "text.primary",
										}}
									>
										Riwayat Pengobatan & Biaya
									</Typography>
									<Stack spacing={1} sx={{ mt: 1 }}>
										<InfoRow
											k="Status Rawat Inap"
											v={metaSakit.inpatientLabel}
										/>
										<InfoRow k="Rumah Sakit" v={metaSakit.hospital} />
										<InfoRow k="Riwayat pengobatan" v={metaSakit.treatment} />
										<InfoRow k="Status BPJS" v={metaSakit.bpjsLabel} />
										<InfoRow
											k="Sumber biaya sebelumnya"
											v={metaSakit.prevCostLabel}
										/>
										<InfoRow
											k="Rencana penggunaan dana"
											v={metaSakit.usage || "-"}
										/>
										<InfoRow k="Ajakan singkat" v={metaSakit.cta || "-"} />
									</Stack>

									<Divider sx={{ my: 1.25 }} />
									<Typography
										sx={{
											fontWeight: 1000,
											fontSize: 13.5,
											color: "text.primary",
										}}
									>
										Rekening Tujuan
									</Typography>
									<Stack spacing={1} sx={{ mt: 1 }}>
										<InfoRow
											k="Jenis rekening"
											v={metaSakit.bankLabel || "-"}
										/>
									</Stack>
								</>
							)}

							{data.type === "lainnya" && metaLainnya && (
								<>
									<Divider sx={{ my: 1.25 }} />
									<Typography
										sx={{
											fontWeight: 1000,
											fontSize: 13.5,
											color: "text.primary",
										}}
									>
										Tujuan Donasi
									</Typography>
									<Stack spacing={1} sx={{ mt: 1 }}>
										<InfoRow k="Segmen Tujuan" v={metaLainnya.purposeKey} />
										<InfoRow k="Penerima" v={metaLainnya.receiverName} />
										<InfoRow k="Tujuan galang dana" v={metaLainnya.goal} />
										<InfoRow k="Lokasi" v={metaLainnya.location} />
										<InfoRow
											k="Perkiraan penerima manfaat"
											v={metaLainnya.beneficiaries}
										/>
									</Stack>

									<Divider sx={{ my: 1.25 }} />
									<Typography
										sx={{
											fontWeight: 1000,
											fontSize: 13.5,
											color: "text.primary",
										}}
									>
										Penggalang Dana (Detail)
									</Typography>
									<Stack spacing={1} sx={{ mt: 1 }}>
										<InfoRow k="Nama KTP" v={metaLainnya.ktpName} />
										<InfoRow k="Pekerjaan" v={metaLainnya.job} />
										<InfoRow
											k="Sekolah/Tempat kerja"
											v={metaLainnya.workplace}
										/>
										<InfoRow k="Media sosial" v={metaLainnya.soc} />
										<InfoRow k="Handle/Link" v={metaLainnya.socHandle || "-"} />
									</Stack>

									<Divider sx={{ my: 1.25 }} />
									<Typography
										sx={{
											fontWeight: 1000,
											fontSize: 13.5,
											color: "text.primary",
										}}
									>
										Rencana Penggunaan Dana
									</Typography>
									<Stack spacing={1} sx={{ mt: 1 }}>
										<InfoRow
											k="Rencana penggunaan"
											v={metaLainnya.usageOther || "-"}
										/>
										<InfoRow
											k="Ajakan singkat"
											v={metaLainnya.ctaOther || "-"}
										/>
									</Stack>
								</>
							)}
						</Box>
					)}

					{tab === "story" && (
						<Box sx={{ p: 1.5 }}>
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
								<Typography
									sx={{ mt: 0.75, fontSize: 12, color: "text.secondary" }}
								>
									Berguna untuk share (link preview) dan tidak tampil pada
									konten cerita utama.
								</Typography>
							</FormBlock>
						</Box>
					)}

					{tab === "docs" && (
						<Box sx={{ p: 1.5 }}>
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
						</Box>
					)}

					{tab === "verify" && (
						<Box sx={{ p: 1.5 }}>
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
											0.3,
										),
										bgcolor: alpha(
											verifyReady
												? theme.palette.success.main
												: theme.palette.warning.main,
											theme.palette.mode === "dark" ? 0.18 : 0.1,
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
									label="Fee Yayasan sudah diatur"
									checked={check.feeOk}
									onChange={() => {}}
									readOnly
									hint={check.feeOk ? `Fee: ${feeValue}% (sudah disimpan)` : "Simpan fee terlebih dahulu di bagian atas"}
								/>
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
									hint="Kronologi, kebutuhan biaya, penggunaan dana jelas."
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
									disabled={!check.feeOk}
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
											theme.palette.mode === "dark" ? 0.12 : 0.06,
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
						</Box>
					)}

					{tab === "timeline" && (
						<Box sx={{ p: 1.5 }}>
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
						</Box>
					)}

					{tab === "transactions" && (
						<Box sx={{ p: 1.5 }}>
							<Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
								<Box>
									<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
										Transaksi
									</Typography>
									<Typography
										sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
									>
										Daftar donasi yang masuk ke campaign ini.
									</Typography>

									<Typography sx={{ mt: 0.5, fontSize: 11.5, color: "text.secondary", fontStyle: "italic" }}>
										Klik baris untuk lihat detail donatur.
									</Typography>
								</Box>

								<Stack direction="row" spacing={1}>
									<Button
										size="small"
										variant="outlined"
										startIcon={<PictureAsPdfRoundedIcon fontSize="small" />}
										disabled={!!txExporting || txTotal === 0}
										onClick={() => handleExportTransactions("pdf")}
										sx={{ fontWeight: 700, textTransform: "none", whiteSpace: "nowrap" }}
									>
										{txExporting === "pdf" ? "Memproses..." : "PDF"}
									</Button>
									<Button
										size="small"
										variant="outlined"
										startIcon={<FileDownloadRoundedIcon fontSize="small" />}
										disabled={!!txExporting || txTotal === 0}
										onClick={() => handleExportTransactions("csv")}
										sx={{ fontWeight: 700, textTransform: "none", whiteSpace: "nowrap" }}
									>
										{txExporting === "csv" ? "Memproses..." : "CSV"}
									</Button>
								</Stack>
							</Stack>

							<Divider sx={{ my: 1.25 }} />

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
								<TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Donatur</TableCell>
												<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Jumlah</TableCell>
												<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Tanggal</TableCell>
												<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Metode</TableCell>
												<TableCell sx={{ fontWeight: 800, fontSize: 12 }} align="right">Status</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{txRows.map((row) => (
												<TxTableRow key={row.id} row={row} />
											))}
										</TableBody>
									</Table>
								</TableContainer>
							)}

							{!txLoading && txRows.length > 0 && (
								<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
									<Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
										Menampilkan {(txPage - 1) * TX_PAGE_SIZE + 1}–
										{(txPage - 1) * TX_PAGE_SIZE + txRows.length} dari {txTotal} donasi
									</Typography>
									{txTotalPages > 1 && (
										<Pagination
											count={txTotalPages}
											page={txPage}
											onChange={(_, p) => setTxPage(p)}
											color="primary"
											shape="rounded"
											size="small"
										/>
									)}
								</Stack>
							)}
						</Box>
					)}
				</Paper>
				</Stack>

				{/* RIGHT SIDEBAR */}
				<Stack spacing={2}>
					<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
							Informasi User
						</Typography>
						<Typography
							sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
						>
							Data ringkas untuk pengecekan cepat.
						</Typography>

						<Divider sx={{ my: 1.25 }} />

						<Stack spacing={1}>
							<Stack alignItems="center" spacing={1} sx={{ mb: 1, mt: 1 }}>
								<Avatar
									src={data.ownerAvatar}
									sx={{
										width: 64,
										height: 64,
										fontSize: 24,
										fontWeight: "bold",
										bgcolor: theme.palette.primary.main,
									}}
								>
									{!data.ownerAvatar && data.ownerName
										? data.ownerName.charAt(0).toUpperCase()
										: ""}
								</Avatar>
								<Box sx={{ textAlign: "center" }}>
									<Typography
										sx={{
											fontWeight: 1000,
											fontSize: 15,
											color: "text.primary",
										}}
									>
										{data.ownerName}
									</Typography>
										</Box>
							</Stack>

							<Divider sx={{ my: 1 }} />

							<MiniStat label="Email" value={data.ownerEmail} />
							<MiniStat
								label="No. HP"
								value={
									data.ownerPhone && data.ownerPhone !== "-"
										? data.ownerPhone
										: data.phone
								}
							/>
							{/* <MiniStat label="Kategori" value={data.category} /> */}
							{/* <MiniStat label="Status" value={statusMeta.label} /> */}
							<MiniStat
								label="Verifikasi Akun"
								value={
									data.ownerVerifiedAs === "organization"
										? "Organisasi"
										: data.ownerVerifiedAs === "personal"
											? "Personal"
											: "Belum Terverifikasi"
								}
							/>
						</Stack>
					</Paper>


				</Stack>
			</Box>
			)}

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
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 1000 }}>Approve Campaign</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Status akan menjadi <b>Aktif</b>. Review ringkasan dan atur fee sebelum approve.
					</DialogContentText>

					<Stack spacing={1.5} sx={{ mb: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
						<InfoRow k="Judul" v={data.title} />
						<InfoRow k="Kategori" v={data.category} />
						<InfoRow k="Target" v={idr(data.target)} />
						<InfoRow k="Penggalang" v={data.ownerName} />
						<InfoRow k="Donatur" v={`${data.donors}`} />
					</Stack>

					<Typography sx={{ fontSize: 13, fontWeight: 900, mb: 1 }}>Fee Yayasan</Typography>
					<TextField
						size="small"
						type="number"
						value={feeValue}
						onChange={(e) => {
							const num = Number(e.target.value);
							if (!Number.isNaN(num) && num >= 0 && num <= 100) setFeeValue(e.target.value);
						}}
						inputProps={{ step: 0.1 }}
						InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
						fullWidth
						sx={fieldSx(theme)}
					/>
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
						disabled={feeLoading}
						sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
					>
						{feeLoading ? "Menyimpan..." : "Approve & Aktifkan"}
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

/* ---------- UI bits (imported from ./_components/shared) ---------- */
// QuickPill kept locally as it's only used here
function QuickPill({ label, value }: { label: string; value: string }) {
	const theme = useTheme();
	return (
		<Box sx={{ px: 1.25, py: 0.75, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.18 : 1), minWidth: 180 }}>
			<Typography sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 900 }}>{label}</Typography>
			<Typography sx={{ mt: 0.2, fontSize: 12.5, fontWeight: 1000 }} className="line-clamp-1">{value}</Typography>
		</Box>
	);
}

/* Remaining inline components removed — now in _components/shared.tsx */

