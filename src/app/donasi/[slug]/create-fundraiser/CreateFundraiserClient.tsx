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
	DialogContent,
	DialogActions,
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
		};
	}, []);

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
						onClick={() => router.push(`/donasi/${campaignSlug}`)}
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
						aria-label="Kembali ke campaign"
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
						Buat Fundraising
					</Typography>
				</Box>

				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 2, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
					<Typography sx={{ fontWeight: 800, fontSize: 15, color: "#166534", mb: 1 }}>
						Apa itu Fundraising?
					</Typography>
					<Typography sx={{ fontSize: 13, color: "#15803d", lineHeight: 1.7 }}>
						Fundraising memungkinkan kamu membantu menyebarkan campaign ini dengan halaman penggalangan dana milikmu sendiri. Setiap donasi yang masuk melalui halamanmu akan tercatat sebagai kontribusimu.
					</Typography>
					<Typography sx={{ fontWeight: 700, fontSize: 13, color: "#166534", mt: 1.5, mb: 0.5 }}>
						Keuntungan menjadi Fundraiser:
					</Typography>
					<Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: 13, color: "#15803d", lineHeight: 1.8 }}>
						<li>Dapatkan halaman fundraising dengan link unik milikmu</li>
						<li>Pantau jumlah donasi yang terkumpul dari kontribusimu</li>
						<li>Bantu campaign menjangkau lebih banyak donatur</li>
						<li>Jadilah jembatan kebaikan bagi sesama</li>
					</Box>
				</Paper>

				<Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
					<Box
						component="form"
						onSubmit={handleSubmit}
						sx={{ display: "grid", gap: 2 }}
					>
						<TextField
							label="Judul Fundraising"
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
								if (!slug.trim()) {
									setSlugNormalized(localSlugify(e.target.value));
								}
							}}
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
									: "Buat Fundraising"}
						</Button>
					</Box>
				</Paper>

				<Dialog
					open={!!createdSlug}
					maxWidth="sm"
					fullWidth
					PaperProps={{ sx: { borderRadius: 3 } }}
				>
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
							<button
								onClick={() => copyToClipboard(previewUrl)}
								className="flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline"
							>
								<ContentCopyIcon sx={{ fontSize: 16 }} />
								Salin Link
							</button>
						</div>

						{typeof navigator !== "undefined" && navigator.share && (
							<Button
								variant="outlined"
								fullWidth
								onClick={async () => {
									try {
										await navigator.share({
											title: "Bantu donasi",
											text: `Yuk bantu donasi! Setiap kontribusi sangat berarti.`,
											url: previewUrl,
										});
									} catch {}
								}}
								sx={{ borderRadius: 3, fontWeight: 700, mb: 2, textTransform: "none" }}
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
							onClick={() => router.push(`/donasi/${campaignSlug}`)}
							sx={{ color: "text.secondary", fontWeight: 600, textTransform: "none" }}
						>
							Kembali ke Campaign
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
