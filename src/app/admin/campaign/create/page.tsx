"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { createCampaign } from "@/actions/campaign";

export default function AdminCreateCampaignPage() {
	const router = useRouter();
	const [categories, setCategories] = React.useState<any[]>([]);
	const [submitting, setSubmitting] = React.useState(false);
	const [coverPreview, setCoverPreview] = React.useState<string>("");

	React.useEffect(() => {
		fetch("/api/campaigns/categories")
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data)) {
					// Filter active categories
					setCategories(data.filter((c) => c.isActive));
				}
			})
			.catch((err) => console.error(err));
	}, []);

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

		// category Select will send the value (slug)
		
		const res = await createCampaign(formData);
		if (res.success) {
			router.push("/admin/campaign");
		} else {
			alert(res.error || "Gagal membuat campaign");
		}
		setSubmitting(false);
	}

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
					Buat Campaign Baru
				</Typography>

				<Stack spacing={3}>
					<TextField
						name="title"
						label="Judul Campaign"
						required
						fullWidth
						placeholder="Contoh: Bantuan untuk Korban Banjir"
					/>

					<TextField
						select
						name="category"
						label="Kategori"
						required
						fullWidth
						defaultValue=""
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
						type="number"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">Rp</InputAdornment>
							),
						}}
					/>

					<TextField
						name="duration"
						label="Durasi (Hari)"
						required
						fullWidth
						type="number"
						defaultValue={30}
					/>
                    
                    <TextField
						name="phone"
						label="Nomor Telepon Penggalang"
						required
						fullWidth
						placeholder="0812..."
					/>

					<TextField
						name="story"
						label="Cerita Lengkap"
						required
						fullWidth
						multiline
						rows={6}
						placeholder="Ceritakan detail campaign..."
					/>

					<Box>
						<Typography sx={{ mb: 1, fontWeight: 500 }}>Cover Image</Typography>
						<Button
							component="label"
							variant="outlined"
							startIcon={<CloudUploadIcon />}
							sx={{ width: "100%", height: 100, borderStyle: "dashed" }}
						>
							Upload Foto
							<input
								type="file"
								name="cover"
								hidden
								accept="image/*"
								onChange={handleFileChange}
								required
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

					<Button
						type="submit"
						variant="contained"
						size="large"
						disabled={submitting}
						sx={{
							mt: 2,
							bgcolor: "#61ce70",
							"&:hover": { bgcolor: "#55bf64" },
							fontWeight: 700,
						}}
					>
						{submitting ? <CircularProgress size={24} /> : "Buat Campaign"}
					</Button>
				</Stack>
			</Paper>
		</Box>
	);
}
