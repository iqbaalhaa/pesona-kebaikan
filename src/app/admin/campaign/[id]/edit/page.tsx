"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
	Box,
	Paper,
	Typography,
	TextField,
	Button,
	MenuItem,
	Stack,
	CircularProgress,
	InputAdornment,
	Snackbar,
	Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { updateCampaign, getCampaignById } from "@/actions/campaign";

function formatIDR(numStr: string) {
	const n = numStr.toString().replace(/\D/g, "");
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function AdminEditCampaignPage() {
	const router = useRouter();
	const params = useParams();
	const id = params.id as string;

	const [categories, setCategories] = React.useState<any[]>([]);
	const [submitting, setSubmitting] = React.useState(false);
	const [loading, setLoading] = React.useState(true);
	const [coverPreview, setCoverPreview] = React.useState<string>("");
	const [target, setTarget] = React.useState<string>("");
	const [campaign, setCampaign] = React.useState<any>(null);
	const [featured, setFeatured] = React.useState<boolean>(false);

	const [snackbar, setSnackbar] = React.useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({
		open: false,
		message: "",
		severity: "info",
	});

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "info" | "warning" = "info",
	) => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	React.useEffect(() => {
		// Fetch categories
		fetch("/api/campaigns/categories")
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data)) {
					setCategories(data);
				}
			})
			.catch((err) => console.error(err));

		// Fetch campaign
		if (id) {
			getCampaignById(id).then((res) => {
				if (res.success && res.data) {
					setCampaign(res.data);
					setTarget(formatIDR(res.data.target.toString()));
					setCoverPreview(res.data.thumbnail);
				} else {
					showSnackbar("Campaign tidak ditemukan", "error");
					router.push("/admin/campaign");
				}
				setLoading(false);
			});
		}
	}, [id, router]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setCoverPreview(URL.createObjectURL(file));
		}
	};

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitting(true);
		const formData = new FormData(e.currentTarget);
		formData.set("target", target.replace(/\D/g, ""));
		if (featured) {
			formData.set("metadata", JSON.stringify({ featured: true }));
		}

		const res = await updateCampaign(id, formData);
		if (res.success) {
			router.push("/admin/campaign");
		} else {
			showSnackbar(res.error || "Gagal mengupdate campaign", "error");
		}
		setSubmitting(false);
	}

	if (loading)
		return (
			<Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
				<CircularProgress />
			</Box>
		);
	if (!campaign) return null;

	return (
		<Box>
			<Button
				startIcon={<ArrowBackIosNewRoundedIcon />}
				onClick={() => router.back()}
				sx={{ mb: 2, color: "text.secondary" }}
			>
				Kembali
			</Button>

			<Paper
				elevation={0}
				component="form"
				onSubmit={handleSubmit}
				sx={{
					p: 4,
					borderRadius: 3,
					border: "1px solid rgba(15,23,42,.10)",
				}}
			>
				<Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
					Edit Campaign
				</Typography>

				<Stack spacing={3}>
					<TextField
						name="title"
						label="Judul Campaign"
						required
						fullWidth
						defaultValue={campaign.title}
					/>

					<TextField
						name="slug"
						label="Slug (URL)"
						required
						fullWidth
						defaultValue={campaign.slug}
						helperText="Hati-hati mengubah slug, link lama akan tidak bisa diakses"
					/>

					<TextField
						select
						name="category"
						label="Kategori"
						required
						fullWidth
						defaultValue={campaign.categorySlug || campaign.category}
					>
						{categories.map((c) => (
							<MenuItem key={c.id} value={c.slug || c.name}>
								{c.name}
							</MenuItem>
						))}
					</TextField>

					<TextField
						name="target"
						label="Target Donasi (Rp)"
						required
						fullWidth
						value={target}
						onChange={(e) => setTarget(formatIDR(e.target.value))}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">Rp</InputAdornment>
							),
						}}
					/>

					<TextField
						name="phone"
						label="Nomor Telepon Penggalang"
						required
						fullWidth
						defaultValue={campaign.phone}
					/>

					<TextField
						name="story"
						label="Cerita Lengkap"
						required
						fullWidth
						multiline
						rows={6}
						defaultValue={campaign.description}
					/>

					<Box>
						<Typography sx={{ mb: 1, fontWeight: 500 }}>Cover Image</Typography>
						<Button
							component="label"
							variant="outlined"
							startIcon={<CloudUploadIcon />}
							sx={{ width: "100%", height: 100, borderStyle: "dashed" }}
						>
							Ganti Foto (Opsional)
							<input
								type="file"
								name="cover"
								hidden
								accept="image/*"
								onChange={handleFileChange}
							/>
						</Button>
						{coverPreview && (
							<Box
								component="img"
								src={coverPreview}
								sx={{
									mt: 2,
									width: "100%",
									maxHeight: 300,
									objectFit: "cover",
									borderRadius: 2,
								}}
							/>
						)}
					</Box>

					<Box sx={{ display: "flex", alignItems: "center" }}>
						<input
							type="checkbox"
							id="featured"
							checked={featured}
							onChange={(e) => setFeatured(e.target.checked)}
							style={{ marginRight: 8 }}
						/>
						<label htmlFor="featured">Jadikan Pilihan Pesona</label>
					</Box>

					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={submitting}
						sx={{
							mt: 2,
							bgcolor: "#0ba976",
							"&:hover": { bgcolor: "#55bf64" },
							fontWeight: 700,
						}}
					>
						{submitting ? "Menyimpan..." : "Simpan Perubahan"}
					</Button>
				</Stack>
			</Paper>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				sx={{ zIndex: 99999 }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					variant="filled"
					sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
