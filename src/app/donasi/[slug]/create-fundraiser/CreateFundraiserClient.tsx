"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Container,
	Typography,
	Paper,
	TextField,
	Button,
	Snackbar,
	InputAdornment,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	LinearProgress,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LaunchIcon from "@mui/icons-material/Launch";
import { createFundraiser, checkFundraiserSlug } from "@/actions/fundraiser";

interface CreateFundraiserClientProps {
	campaignSlug: string;
	campaignTarget?: number;
}

function formatIDR(numStr: string) {
	const n = numStr.replace(/\D/g, "");
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function CreateFundraiserClient({
	campaignSlug,
	campaignTarget,
}: CreateFundraiserClientProps) {
	const router = useRouter();

	const [loading, setLoading] = React.useState(false);
	const [title, setTitle] = React.useState("");
	const [target, setTarget] = React.useState<number | "">("");
	const [targetStr, setTargetStr] = React.useState("");
	const [targetError, setTargetError] = React.useState("");

	const [slug, setSlug] = React.useState("");
	const [slugChecking, setSlugChecking] = React.useState(false);
	const [slugAvailable, setSlugAvailable] = React.useState<boolean | null>(
		null,
	);
	const [slugNormalized, setSlugNormalized] = React.useState("");

	const slugCheckRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	const [createdSlug, setCreatedSlug] = React.useState<string | null>(null);
	const [countdown, setCountdown] = React.useState<number | null>(null);
	const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	const [snack, setSnack] = React.useState<{
		open: boolean;
		msg: string;
		type: "success" | "error";
	}>({
		open: false,
		msg: "",
		type: "success",
	});

	React.useEffect(() => {
		return () => {
			if (slugCheckRef.current) clearTimeout(slugCheckRef.current);
			if (countdownRef.current) clearInterval(countdownRef.current);
		};
	}, []);

	React.useEffect(() => {
		if (createdSlug) {
			setCountdown(10);
			countdownRef.current = setInterval(() => {
				setCountdown((prev) => {
					if (prev === null || prev <= 1) {
						if (countdownRef.current) clearInterval(countdownRef.current);
						// Redirect
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

	const openInNewTab = (url: string) => {
		window.open(url, "_blank", "noopener,noreferrer");
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
			setTargetError(
				`Target tidak boleh melebihi Rp ${formatIDR(campaignTarget.toString())}`,
			);
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
				campaignSlug: campaignSlug,
				title: title.trim(),
				target: Number(target || 0),
				slug: slug.trim() ? slugNormalized || localSlugify(slug) : "",
			});

			if (!res.success) {
				setSnack({
					open: true,
					msg: res.error || "Gagal membuat fundraiser",
					type: "error",
				});
				return;
			}

			// Clear form (optional but good for UX)
			setTitle("");
			setTarget("");
			setTargetStr("");
			setSlug("");

			setCreatedSlug(res.data?.slug ?? null);
		} catch {
			setSnack({ open: true, msg: "Gagal membuat fundraiser", type: "error" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Container maxWidth="sm" sx={{ py: 4 }}>
				<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
					<Button
						onClick={() => router.back()}
						sx={{
							minWidth: 40,
							width: 40,
							height: 40,
							borderRadius: "50%",
							bgcolor: "white",
							color: "text.primary",
							boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
							position: "absolute",
							left: 16,
							top: 24,
							zIndex: 10,
							"&:hover": { bgcolor: "#f8fafc" },
						}}
						aria-label="Kembali"
					>
						<ArrowBackIcon />
					</Button>

					<Typography
						variant="h6"
						sx={{
							fontWeight: 700,
							lineHeight: 1.2,
							width: "100%",
							textAlign: "center",
						}}
					>
						Buat Fundraiser
					</Typography>
				</Box>

				<Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{ display: "grid", gap: 2 }}
					>
						<TextField
							label="Judul Fundraiser"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							fullWidth
						/>

						<TextField
							label="Slug Kustom"
							value={slug}
							onChange={(e) => handleSlugChange(e.target.value)}
							placeholder="contoh: bantu-siwa-rt-03"
							fullWidth
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
							color={
								slugAvailable === true
									? "success"
									: slugAvailable === false
										? "error"
										: "primary"
							}
						/>

						{liveUrl ? (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									border: "1px solid #e2e8f0",
									borderRadius: 2,
									p: 1.25,
								}}
							>
								<Typography
									sx={{
										flex: 1,
										fontSize: 14,
										color: "#334155",
										wordBreak: "break-all",
									}}
								>
									{liveUrl}
								</Typography>

								<Button
									variant="outlined"
									onClick={() => copyToClipboard(liveUrl)}
								>
									Salin
								</Button>

								<Button
									variant="contained"
									onClick={() => openInNewTab(liveUrl)}
								>
									Buka
								</Button>
							</Box>
						) : null}

						<TextField
							label="Target Dana"
							value={targetStr}
							onChange={handleTargetChange}
							required
							fullWidth
							error={!!targetError}
							helperText={
								targetError ||
								(campaignTarget
									? `Maksimal: Rp ${formatIDR(campaignTarget.toString())}`
									: "Minimal Rp 10.000")
							}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">Rp</InputAdornment>
								),
							}}
						/>

						<Button
							type="submit"
							variant="contained"
							color="primary"
							disabled={!canSubmit}
							sx={{ borderRadius: 2, fontWeight: 800, py: 1.25 }}
						>
							{loading
								? "Membuat..."
								: slugChecking
									? "Memeriksa slug..."
									: "Buat Fundraiser"}
						</Button>
					</Box>
				</Paper>

				<Dialog
					open={!!createdSlug}
					maxWidth="sm"
					fullWidth
					PaperProps={{
						sx: { borderRadius: 3, p: 2, textAlign: "center" },
					}}
				>
					<DialogContent sx={{ pt: 4, pb: 2 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								mb: 2,
							}}
						>
							<CheckCircleIcon sx={{ fontSize: 64, color: "#22c55e" }} />
						</Box>
						<Typography variant="h5" fontWeight={700} gutterBottom>
							Fundraiser Berhasil Dibuat!
						</Typography>
						<Typography color="text.secondary" sx={{ mb: 3 }}>
							Selamat! Halaman penggalangan dana Anda sudah siap. Sebarkan
							kebaikan sekarang juga.
						</Typography>

						<Paper
							elevation={0}
							sx={{
								p: 2,
								bgcolor: "#f8fafc",
								border: "1px solid #e2e8f0",
								borderRadius: 2,
								mb: 3,
							}}
						>
							<Typography
								variant="caption"
								display="block"
								color="text.secondary"
								align="left"
								gutterBottom
							>
								Link Fundraiser Anda:
							</Typography>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
								}}
							>
								<Typography
									sx={{
										flex: 1,
										fontSize: 14,
										fontWeight: 600,
										color: "#334155",
										wordBreak: "break-all",
										textAlign: "left",
									}}
								>
									{previewUrl}
								</Typography>
								<Button
									size="small"
									startIcon={<ContentCopyIcon />}
									onClick={() => copyToClipboard(previewUrl)}
								>
									Salin
								</Button>
							</Box>
						</Paper>

						<Box sx={{ width: "100%", mb: 1 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									mb: 0.5,
								}}
							>
								<Typography variant="caption" color="text.secondary">
									Mengalihkan otomatis...
								</Typography>
								<Typography variant="caption" fontWeight={700}>
									{countdown}s
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={((10 - (countdown || 0)) / 10) * 100}
								sx={{ borderRadius: 4, height: 6 }}
							/>
						</Box>
					</DialogContent>
					<DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
						<Button
							variant="contained"
							color="primary"
							fullWidth
							size="large"
							startIcon={<LaunchIcon />}
							onClick={() => {
								if (previewUrl) window.location.href = previewUrl;
							}}
							sx={{ borderRadius: 2, fontWeight: 700 }}
						>
							Buka Fundraiser Sekarang
						</Button>
					</DialogActions>
				</Dialog>
			</Container>

			<Snackbar
				open={snack.open}
				autoHideDuration={3000}
				onClose={() => setSnack((s) => ({ ...s, open: false }))}
			>
				<MuiAlert
					severity={snack.type}
					onClose={() => setSnack((s) => ({ ...s, open: false }))}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{snack.msg}
				</MuiAlert>
			</Snackbar>
		</>
	);
}
