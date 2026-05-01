"use client";

import * as React from "react";
import {
	Box,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
} from "@mui/material";
import { Input } from "@/components/ui/Input";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Link from "next/link";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LoginIcon from "@mui/icons-material/Login";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LaunchIcon from "@mui/icons-material/Launch";
import { createFundraiser, checkFundraiserSlug } from "@/actions/fundraiser";

interface CreateFundraiserDialogProps {
	open: boolean;
	onClose: () => void;
	campaignSlug: string;
	campaignTitle?: string;
	campaignTarget?: number;
	userName?: string;
	userLoggedIn?: boolean;
}

function formatIDR(numStr: string) {
	const n = numStr.replace(/\D/g, "");
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function localSlugify(v: string) {
	return v
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export default function CreateFundraiserDialog({
	open,
	onClose,
	campaignSlug,
	campaignTitle = "",
	campaignTarget,
	userName = "",
	userLoggedIn = false,
}: CreateFundraiserDialogProps) {
	const [loading, setLoading] = React.useState(false);
	const [title, setTitle] = React.useState("");
	const [target, setTarget] = React.useState<number | "">("");
	const [targetStr, setTargetStr] = React.useState("");
	const [targetError, setTargetError] = React.useState("");

	const [slug, setSlug] = React.useState("");
	const [slugChecking, setSlugChecking] = React.useState(false);
	const [slugAvailable, setSlugAvailable] = React.useState<boolean | null>(null);
	const [slugNormalized, setSlugNormalized] = React.useState("");

	const slugCheckRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	const [createdSlug, setCreatedSlug] = React.useState<string | null>(null);

	const [snack, setSnack] = React.useState<{
		open: boolean;
		msg: string;
		type: "success" | "error";
	}>({ open: false, msg: "", type: "success" });

	React.useEffect(() => {
		return () => {
			if (slugCheckRef.current) clearTimeout(slugCheckRef.current);
		};
	}, []);

	React.useEffect(() => {
		if (open) {
			const name = userName || "Aku";
			const defaultTitle = campaignTitle
				? `${name} Bantu ${campaignTitle}`
				: `${name} Galang Dana`;
			setTitle(defaultTitle);
			const defaultSlug = userName
				? localSlugify(`${userName}-${campaignSlug}`)
				: localSlugify(defaultTitle);
			setSlug(defaultSlug);
			setSlugNormalized(defaultSlug);
		} else {
			setTitle("");
			setTarget("");
			setTargetStr("");
			setTargetError("");
			setSlug("");
			setSlugAvailable(null);
			setSlugNormalized("");
			setCreatedSlug(null);
		}
	}, [open, campaignTitle]);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setSnack({ open: true, msg: "Tautan disalin", type: "success" });
		} catch {
			setSnack({ open: true, msg: "Gagal menyalin tautan", type: "error" });
		}
	};

	const handleSlugChange = (val: string) => {
		setSlug(val);
		setSlugAvailable(null);
		setSlugNormalized("");

		if (slugCheckRef.current) clearTimeout(slugCheckRef.current);

		const raw = val.trim();
		if (!raw) {
			setSlugChecking(false);
			return;
		}

		const normalized = localSlugify(raw);
		setSlugNormalized(normalized);

		slugCheckRef.current = setTimeout(async () => {
			setSlugChecking(true);
			try {
				const res = await checkFundraiserSlug(normalized);
				if (res.success) {
					setSlugAvailable(res.available);
					setSlugNormalized(res.slug || normalized);
				} else {
					setSlugAvailable(false);
				}
			} catch {
				setSlugAvailable(false);
			} finally {
				setSlugChecking(false);
			}
		}, 400);
	};

	const liveSlug = React.useMemo(() => {
		if (slug.trim()) return slugNormalized || localSlugify(slug);
		if (title.trim()) return localSlugify(title);
		return "";
	}, [slug, slugNormalized, title]);

	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
	const liveUrl = liveSlug
		? baseUrl
			? `${baseUrl}/donasi/fundraiser/${liveSlug}`
			: `/donasi/fundraiser/${liveSlug}`
		: "";

	const previewUrl =
		createdSlug && baseUrl
			? `${baseUrl}/donasi/fundraiser/${createdSlug}`
			: createdSlug
				? `/donasi/fundraiser/${createdSlug}`
				: "";

	const shareText = createdSlug
		? `Yuk bantu donasi untuk "${campaignTitle}"! Setiap kontribusi sangat berarti.\n\n${previewUrl}`
		: "";

	const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.replace(/\D/g, "");
		if (!raw) {
			setTarget("");
			setTargetStr("");
			setTargetError("");
			return;
		}
		const val = parseInt(raw, 10);
		setTarget(val);
		setTargetStr(formatIDR(raw));
		if (campaignTarget && val > campaignTarget) {
			setTargetError(`Target tidak boleh melebihi Rp ${formatIDR(campaignTarget.toString())}`);
		} else {
			setTargetError("");
		}
	};

	const canSubmit =
		!loading &&
		!slugChecking &&
		!!title.trim() &&
		Number(target) > 0 &&
		!targetError &&
		(!slug.trim() || slugAvailable !== false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) {
			if (slug.trim() && slugAvailable === false) {
				setSnack({ open: true, msg: "Slug tidak tersedia", type: "error" });
			}
			return;
		}

		setLoading(true);
		try {
			const res = await createFundraiser({
				campaignSlug,
				title: title.trim(),
				target: Number(target || 0),
				slug: slug.trim() ? slugNormalized || localSlugify(slug) : "",
			});

			if (!res.success) {
				setSnack({ open: true, msg: res.error || "Gagal membuat fundraising", type: "error" });
				return;
			}
			setCreatedSlug(res.data?.slug ?? null);
		} catch {
			setSnack({ open: true, msg: "Gagal membuat fundraising", type: "error" });
		} finally {
			setLoading(false);
		}
	};

	if (createdSlug) {
		const handleNativeShare = async () => {
			if (navigator.share) {
				try {
					await navigator.share({
						title: `Bantu donasi: ${campaignTitle}`,
						text: `Yuk bantu donasi untuk "${campaignTitle}"! Setiap kontribusi sangat berarti.`,
						url: previewUrl,
					});
				} catch {}
			}
		};

		const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

		return (
			<>
				<Dialog open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
					<DialogContent sx={{ pt: 4, pb: 3 }}>
						<div className="text-center mb-4">
							<CheckCircleIcon sx={{ fontSize: 56, color: "#22c55e", mb: 1.5 }} />
							<Typography sx={{ fontWeight: 800, fontSize: 18, mb: 0.5 }}>
								Fundraising Berhasil Dibuat!
							</Typography>
							<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
								Sebarkan ke teman dan keluarga untuk mengumpulkan lebih banyak donasi.
							</Typography>
						</div>

						<div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-4">
							<p className="text-[11px] text-slate-400 mb-1">Link fundraising kamu:</p>
							<p className="text-[13px] text-slate-700 font-medium break-all mb-2">{previewUrl}</p>
							<div className="flex gap-2">
								<button
									onClick={() => copyToClipboard(previewUrl)}
									className="flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline"
								>
									<ContentCopyIcon sx={{ fontSize: 16 }} />
									Salin Link
								</button>
							</div>
						</div>

						{hasNativeShare && (
							<Button
								variant="outlined"
								fullWidth
								onClick={handleNativeShare}
								sx={{ borderRadius: 3, fontWeight: 700, mb: 2, textTransform: "none" }}
								startIcon={<LaunchIcon />}
							>
								Bagikan
							</Button>
						)}
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}>
						<Button
							variant="contained"
							fullWidth
							onClick={() => { if (previewUrl) window.location.href = previewUrl; }}
							sx={{ borderRadius: 3, fontWeight: 700, textTransform: "none" }}
						>
							Lihat Halaman Fundraising
						</Button>
						<Button
							fullWidth
							onClick={onClose}
							sx={{ color: "text.secondary", fontWeight: 600, textTransform: "none" }}
						>
							Tutup
						</Button>
					</DialogActions>
				</Dialog>
				<Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
					<MuiAlert severity={snack.type} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">{snack.msg}</MuiAlert>
				</Snackbar>
			</>
		);
	}

	if (!userLoggedIn) {
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogContent sx={{ pt: 4, pb: 2, textAlign: "center" }}>
					<LoginIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
					<Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1 }}>
						Masuk untuk Membuat Fundraising
					</Typography>
					<Typography sx={{ fontSize: 13, color: "text.secondary", mb: 3 }}>
						Kamu perlu masuk terlebih dahulu agar bisa membuat halaman fundraising dengan link unikmu.
					</Typography>
					<Button
						component={Link}
						href={`/auth/login?callbackUrl=/donasi/${campaignSlug}`}
						variant="contained"
						fullWidth
						sx={{ borderRadius: 2, fontWeight: 700, mb: 1 }}
					>
						Masuk Sekarang
					</Button>
					<Button onClick={onClose} fullWidth sx={{ color: "text.secondary" }}>
						Nanti Saja
					</Button>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<>
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogTitle sx={{ fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					Buat Fundraising
					<IconButton onClick={onClose} aria-label="Tutup" size="small">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Box sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
						<Typography sx={{ fontWeight: 700, fontSize: 13, color: "#166534", mb: 0.5 }}>
							Apa itu Fundraising?
						</Typography>
						<Typography sx={{ fontSize: 12, color: "#15803d", lineHeight: 1.7 }}>
							Fundraising memungkinkan kamu membantu menyebarkan campaign ini dengan halaman penggalangan dana milikmu sendiri.
						</Typography>
						<Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2, fontSize: 12, color: "#15803d", lineHeight: 1.8 }}>
							<li>Halaman fundraising dengan link unik milikmu</li>
							<li>Pantau donasi yang terkumpul dari kontribusimu</li>
							<li>Bantu campaign menjangkau lebih banyak donatur</li>
						</Box>
					</Box>

					<form id="create-fundraiser-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
						<Input
							label="Judul Fundraising"
							placeholder="Contoh: Aku Bantu Kampanye Ini"
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
								setSlug(localSlugify(e.target.value));
								setSlugNormalized(localSlugify(e.target.value));
								setSlugAvailable(null);
							}}
							required
						/>

						<Input
							label="Target Dana"
							placeholder="Nominal target"
							value={targetStr}
							onChange={handleTargetChange}
							required
							startAdornment={<span>Rp</span>}
							error={targetError || undefined}
							helperText={
								!targetError
									? campaignTarget
										? `Maksimal: Rp ${formatIDR(campaignTarget.toString())}`
										: "Minimal Rp 10.000"
									: undefined
							}
						/>

						{liveUrl && (
							<div className="rounded-lg bg-slate-50 px-3 py-2">
								<p className="text-[11px] text-slate-400 mb-0.5">Link fundraising kamu:</p>
								<p className="text-[12px] text-slate-600 break-all">{liveUrl}</p>
							</div>
						)}
					</form>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button onClick={onClose} sx={{ color: "text.secondary", fontWeight: 600 }} disabled={loading}>
						Batal
					</Button>
					<Button
						type="submit"
						form="create-fundraiser-form"
						variant="contained"
						disabled={!canSubmit}
						sx={{ borderRadius: 2, fontWeight: 800 }}
					>
						{loading ? "Membuat..." : slugChecking ? "Memeriksa..." : "Buat Fundraising"}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
				<MuiAlert severity={snack.type} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">{snack.msg}</MuiAlert>
			</Snackbar>
		</>
	);
}
