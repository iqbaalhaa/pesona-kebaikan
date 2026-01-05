"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Paper,
	Typography,
	TextField,
	Button,
	Stack,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
	InputAdornment,
	FormHelperText,
	CircularProgress,
	Alert,
	Snackbar,
} from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import { CATEGORY_TITLE } from "@/lib/constants";
import RichTextEditor from "@/components/admin/RichTextEditor";

type AdminCampaignFormProps = {
	mode: "create" | "edit";
	initialData?: any; // Replace with proper type if available
	onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
};

export default function AdminCampaignForm({
	mode,
	initialData,
	onSubmit,
}: AdminCampaignFormProps) {
	const router = useRouter();
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");

	// Form State
	const [title, setTitle] = React.useState(initialData?.title || "");
	const [slug, setSlug] = React.useState(initialData?.slug || "");
	const [category, setCategory] = React.useState(
		initialData?.category
			? Object.keys(CATEGORY_TITLE).find(
					(k) => CATEGORY_TITLE[k] === initialData.category
			  ) || "lainnya"
			: "lainnya"
	);
	const [target, setTarget] = React.useState(
		initialData?.target?.toString() || ""
	);
	const [duration, setDuration] = React.useState("30"); // Default 30
	const [phone, setPhone] = React.useState(initialData?.phone || "");
	const [story, setStory] = React.useState(initialData?.description || "");

	// File Upload
	const [coverFile, setCoverFile] = React.useState<File | null>(null);
	const [coverPreview, setCoverPreview] = React.useState<string>(
		initialData?.thumbnail || ""
	);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setCoverFile(file);
			setCoverPreview(URL.createObjectURL(file));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("title", title);
			formData.append("slug", slug);
			formData.append("category", category);
			formData.append("type", category === "medis" ? "sakit" : "lainnya");
			formData.append("target", target.replace(/\D/g, ""));
			formData.append("duration", duration); // logic needs check if edit
			formData.append("phone", phone);
			formData.append("story", story);

			if (coverFile) {
				formData.append("cover", coverFile);
			}

			const res = await onSubmit(formData);
			if (!res.success) {
				setError(res.error || "Gagal menyimpan campaign");
			} else {
				// Success handled by parent usually, but here we can show success
			}
		} catch (err) {
			console.error(err);
			setError("Terjadi kesalahan sistem");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper sx={{ p: 3, borderRadius: 3 }}>
			<Typography variant="h6" fontWeight={700} mb={3}>
				{mode === "create" ? "Buat Campaign Baru" : "Edit Campaign"}
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			<form onSubmit={handleSubmit}>
				<Stack spacing={3}>
					{/* Title & Slug */}
					<Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
						<TextField
							label="Judul Campaign"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							fullWidth
						/>
						<TextField
							label="Slug (URL)"
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
							required
							fullWidth
							helperText="Contoh: bantu-budi-sembuh"
						/>
					</Box>

					{/* Category & Target */}
					<Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
						<FormControl fullWidth>
							<InputLabel>Kategori</InputLabel>
							<Select
								value={category}
								label="Kategori"
								onChange={(e) => setCategory(e.target.value)}
							>
								{Object.entries(CATEGORY_TITLE).map(([key, label]) => (
									<MenuItem key={key} value={key}>
										{label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<TextField
							label="Target Donasi (Rp)"
							value={target}
							onChange={(e) => setTarget(e.target.value)}
							required
							fullWidth
							InputProps={{
								startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
							}}
						/>
					</Box>

					{/* Phone & Duration */}
					<Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
						<TextField
							label="Nomor Telepon / WhatsApp"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							fullWidth
						/>
						{mode === "create" && (
							<TextField
								label="Durasi (Hari)"
								value={duration}
								onChange={(e) => setDuration(e.target.value)}
								fullWidth
								type="number"
							/>
						)}
					</Box>

					{/* Story */}
					<Box>
						<Typography variant="subtitle2" mb={1}>
							Cerita Lengkap
						</Typography>
						<RichTextEditor
							value={story}
							onChange={setStory}
							placeholder="Tulis latar belakang, kondisi, kebutuhan biaya, rencana Useran dana, dan ajakan..."
							minHeight={260}
						/>
					</Box>

					{/* Image Upload */}
					<Box>
						<Typography variant="subtitle2" mb={1}>
							Foto Utama
						</Typography>
						<Box
							sx={{
								border: "2px dashed",
								borderColor: "divider",
								borderRadius: 2,
								p: 3,
								textAlign: "center",
								bgcolor: "background.default",
								cursor: "pointer",
								position: "relative",
								overflow: "hidden",
								minHeight: 200,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
							}}
							component="label"
						>
							<input
								type="file"
								accept="image/*"
								hidden
								onChange={handleFileChange}
							/>
							{coverPreview ? (
								<Box
									component="img"
									src={coverPreview}
									alt="Preview"
									sx={{
										position: "absolute",
										inset: 0,
										width: "100%",
										height: "100%",
										objectFit: "cover",
										opacity: 0.5,
									}}
								/>
							) : null}
							<Box sx={{ position: "relative", zIndex: 1 }}>
								<PhotoCameraRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
								<Typography color="text.secondary">
									Klik untuk upload foto
								</Typography>
							</Box>
						</Box>
					</Box>

					<Box display="flex" justifyContent="flex-end" gap={2}>
						<Button onClick={() => router.back()} disabled={loading}>
							Batal
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={loading}
							startIcon={loading ? <CircularProgress size={20} /> : <SaveRoundedIcon />}
						>
							{loading ? "Menyimpan..." : "Simpan Campaign"}
						</Button>
					</Box>
				</Stack>
			</form>
		</Paper>
	);
}
