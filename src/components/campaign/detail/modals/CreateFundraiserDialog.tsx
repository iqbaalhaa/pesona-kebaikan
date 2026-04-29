"use client";

import * as React from "react";
import {
	Box,
	Typography,
	TextField,
	Button,
	InputAdornment,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	LinearProgress,
	IconButton,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LaunchIcon from "@mui/icons-material/Launch";
import { createFundraiser, checkFundraiserSlug } from "@/actions/fundraiser";

interface CreateFundraiserDialogProps {
	open: boolean;
	onClose: () => void;
	campaignSlug: string;
	campaignTitle?: string;
	campaignTarget?: number;
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
	const [countdown, setCountdown] = React.useState<number | null>(null);
	const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

	const [snack, setSnack] = React.useState<{
		open: boolean;
		msg: string;
		type: "success" | "error";
	}>({ open: false, msg: "", type: "success" });

	React.useEffect(() => {
		return () => {
			if (slugCheckRef.current) clearTimeout(slugCheckRef.current);
			if (countdownRef.current) clearInterval(countdownRef.current);
		};
	}, []);

	React.useEffect(() => {
		if (open) {
			const defaultTitle = campaignTitle ? `Fundraiser ${campaignTitle}` : "";
			setTitle(defaultTitle);
			setSlugNormalized(defaultTitle ? localSlugify(defaultTitle) : "");
		} else {
			setTitle("");
			setTarget("");
			setTargetStr("");
			setTargetError("");
			setSlug("");
			setSlugAvailable(null);
			setSlugNormalized("");
			setCreatedSlug(null);
			setCountdown(null);
			if (countdownRef.current) clearInterval(countdownRef.current);
		}
	}, [open, campaignTitle]);

	React.useEffect(() => {
		if (createdSlug) {
			setCountdown(10);
			countdownRef.current = setInterval(() => {
				setCountdown((prev) => {
					if (prev === null || prev <= 1) {
						if (countdownRef.current) clearInterval(countdownRef.current);
						const url = process.env.NEXT_PUBLIC_APP_URL
							? `${process.env.NEXT_PUBLIC_APP_URL}/donasi/fundraiser/${createdSlug}`
							: `/donasi/fundraiser/${createdSlug}`;
						window.location.href = url;
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
	}, [createdSlug]);

	const localSlugify = (v: string) =>
		v
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");

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
		return (
			<>
				<Dialog open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
					<DialogContent sx={{ pt: 4, pb: 2, textAlign: "center" }}>
						<CheckCircleIcon sx={{ fontSize: 64, color: "#22c55e", mb: 2 }} />
						<Typography variant="h6" fontWeight={700} gutterBottom>
							Fundraising Berhasil Dibuat!
						</Typography>
						<Typography color="text.secondary" sx={{ fontSize: 14, mb: 3 }}>
							Halaman penggalangan dana Anda sudah siap. Sebarkan kebaikan sekarang.
						</Typography>

						<Box sx={{ p: 1.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 2, mb: 3 }}>
							<Typography sx={{ fontSize: 13, color: "#334155", wordBreak: "break-all", mb: 1 }}>
								{previewUrl}
							</Typography>
							<Button size="small" startIcon={<ContentCopyIcon />} onClick={() => copyToClipboard(previewUrl)}>
								Salin Link
							</Button>
						</Box>

						<Box sx={{ mb: 1 }}>
							<Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
								<Typography variant="caption" color="text.secondary">Mengalihkan otomatis...</Typography>
								<Typography variant="caption" fontWeight={700}>{countdown}s</Typography>
							</Box>
							<LinearProgress variant="determinate" value={((10 - (countdown || 0)) / 10) * 100} sx={{ borderRadius: 4, height: 6 }} />
						</Box>
					</DialogContent>
					<DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
						<Button
							variant="contained"
							fullWidth
							startIcon={<LaunchIcon />}
							onClick={() => { if (previewUrl) window.location.href = previewUrl; }}
							sx={{ borderRadius: 2, fontWeight: 700 }}
						>
							Buka Fundraising Sekarang
						</Button>
					</DialogActions>
				</Dialog>
				<Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
					<MuiAlert severity={snack.type} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">{snack.msg}</MuiAlert>
				</Snackbar>
			</>
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

					<Box component="form" id="create-fundraiser-form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
						<TextField
							label="Judul Fundraising"
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
								setSlug(localSlugify(e.target.value));
								setSlugNormalized(localSlugify(e.target.value));
								setSlugAvailable(null);
							}}
							required
							fullWidth
							size="small"
						/>

						<TextField
							label="Slug Kustom"
							value={slug}
							onChange={(e) => handleSlugChange(e.target.value)}
							placeholder="Kosongkan untuk otomatis dari judul"
							fullWidth
							size="small"
							helperText={
								slug.trim()
									? slugChecking
										? "Memeriksa ketersediaan slug…"
										: slugAvailable === true
											? `Slug tersedia: ${slugNormalized}`
											: slugAvailable === false
												? `Slug tidak tersedia: ${slugNormalized}`
												: ""
									: "Kosongkan jika ingin otomatis dari judul"
							}
							color={slugAvailable === true ? "success" : slugAvailable === false ? "error" : "primary"}
						/>

						{liveUrl && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, border: "1px solid #e2e8f0", borderRadius: 2, p: 1, bgcolor: "#f8fafc" }}>
								<Typography sx={{ flex: 1, fontSize: 12, color: "#334155", wordBreak: "break-all" }}>
									{liveUrl}
								</Typography>
								<Button size="small" onClick={() => copyToClipboard(liveUrl)}>Salin</Button>
							</Box>
						)}

						<TextField
							label="Target Dana"
							value={targetStr}
							onChange={handleTargetChange}
							required
							fullWidth
							size="small"
							error={!!targetError}
							helperText={
								targetError ||
								(campaignTarget
									? `Maksimal: Rp ${formatIDR(campaignTarget.toString())}`
									: "Minimal Rp 10.000")
							}
							InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
						/>
					</Box>
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
						{loading ? "Membuat..." : slugChecking ? "Memeriksa slug..." : "Buat Fundraising"}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
				<MuiAlert severity={snack.type} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">{snack.msg}</MuiAlert>
			</Snackbar>
		</>
	);
}
