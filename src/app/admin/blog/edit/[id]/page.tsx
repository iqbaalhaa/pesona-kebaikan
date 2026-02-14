"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import {
	Box,
	Stack,
	Typography,
	TextField,
	Button,
	Paper,
	RadioGroup,
	FormControlLabel,
	Radio,
	Snackbar,
	CircularProgress,
	Alert,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";

const RichTextEditor = dynamic(
	() => import("@/components/admin/RichTextEditor"),
	{ ssr: false },
);

export default function EditBlogPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;

	const [loading, setLoading] = React.useState(true);
	const [form, setForm] = React.useState({
		title: "",
		categoryId: "general", // Default fallback
		heroImage: "",
		content: "",
	});

	const [preview, setPreview] = React.useState<string | null>(null);
	const [drag, setDrag] = React.useState(false);
	const [toast, setToast] = React.useState<{
		open: boolean;
		msg: string;
		severity?: "success" | "error";
	}>({
		open: false,
		msg: "",
	});

	const [categories, setCategories] = React.useState<
		{ id: string; name: string }[]
	>([]);

	/* ---------- fetch data ---------- */
	React.useEffect(() => {
		// Fetch Categories
		fetch("/api/admin/blog-categories")
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data)) setCategories(data);
			})
			.catch((err) => console.error("Failed to fetch categories", err));

		if (!id) return;
		const fetchBlog = async () => {
			try {
				const res = await fetch(`/api/admin/blogs/${id}`);
				const data = await res.json();

				if (data.error) throw new Error(data.error);

				setForm({
					title: data.title || "",
					categoryId: data.categoryId || data.category?.id || "",
					heroImage: data.heroImage || "",
					content: data.content || "",
				});
				if (data.heroImage) {
					setPreview(data.heroImage);
				}
			} catch (e: any) {
				setToast({
					open: true,
					msg: "Failed to load blog: " + e.message,
					severity: "error",
				});
			} finally {
				setLoading(false);
			}
		};
		fetchBlog();
	}, [id]);

	/* ---------- drag & drop ---------- */
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDrag(false);

		const file = e.dataTransfer.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (ev) => setPreview(ev.target?.result as string);
		reader.readAsDataURL(file);

		// TODO: Implement real file upload
		setForm((f) => ({ ...f, heroImage: `uploads/blog/${file.name}` }));
	};

	/* ---------- submit ---------- */
	const handleSubmit = async () => {
		try {
			const res = await fetch(`/api/admin/blogs/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});

			const data = await res.json();
			if (data.error) throw new Error(data.error);

			setToast({ open: true, msg: "Article updated 🎉", severity: "success" });
			setTimeout(() => router.push("/admin/blog"), 1200);
		} catch (e: any) {
			setToast({ open: true, msg: e.message, severity: "error" });
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box
			sx={{
				minHeight: "100vh",
				py: 8,
				position: "relative",
			}}
		>
			{/* BACK BUTTON */}
			<Button
				component={Link}
				href="/admin/blog"
				startIcon={<ArrowBackIcon />}
				sx={{
					position: "absolute",
					top: 24,
					left: 24,
					textTransform: "none",
					fontWeight: 700,
					color: "rgba(15,23,42,.6)",
					"&:hover": { color: "#0f172a", bgcolor: "transparent" },
				}}
			>
				Kembali
			</Button>

			<Box sx={{ maxWidth: 900, mx: "auto", px: 2 }}>
				<Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>
					Edit Article ✏️
				</Typography>

				<Stack spacing={4}>
					{/* 1. TITLE & IMAGE */}
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: 4,
							border: "1px solid rgba(15,23,42,.08)",
						}}
					>
						<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
							Utama
						</Typography>

						<Stack spacing={3}>
							<TextField
								label="Judul Artikel"
								fullWidth
								variant="outlined"
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								sx={{
									"& .MuiOutlinedInput-root": { borderRadius: 3 },
								}}
							/>

							{/* IMAGE UPLOAD AREA */}
							<Box
								onDragOver={(e) => {
									e.preventDefault();
									setDrag(true);
								}}
								onDragLeave={() => setDrag(false)}
								onDrop={handleDrop}
								sx={{
									border: "2px dashed",
									borderColor: drag ? "primary.main" : "rgba(15,23,42,.15)",
									borderRadius: 3,
									p: 4,
									bgcolor: drag ? "rgba(59,130,246,.04)" : "transparent",
									textAlign: "center",
									transition: "all 0.2s",
									cursor: "pointer",
									position: "relative",
									overflow: "hidden",
									minHeight: 200,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								{preview ? (
									<img
										src={preview}
										alt="Preview"
										style={{
											position: "absolute",
											inset: 0,
											width: "100%",
											height: "100%",
											objectFit: "cover",
										}}
									/>
								) : (
									<>
										<ImageIcon
											sx={{ fontSize: 48, color: "rgba(15,23,42,.2)" }}
										/>
										<Typography
											sx={{ mt: 1, fontWeight: 600, color: "text.secondary" }}
										>
											Drag & Drop gambar di sini
										</Typography>
										<Typography variant="caption" color="text.disabled">
											atau paste URL gambar (sementara)
										</Typography>
									</>
								)}
							</Box>

							{/* URL INPUT FALLBACK */}
							<TextField
								label="URL Gambar Header"
								fullWidth
								size="small"
								value={form.heroImage}
								onChange={(e) => {
									setForm({ ...form, heroImage: e.target.value });
									setPreview(e.target.value);
								}}
							/>
						</Stack>
					</Paper>

					{/* 2. CATEGORY */}
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: 4,
							border: "1px solid rgba(15,23,42,.08)",
						}}
					>
						<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
							Kategori
						</Typography>
						<RadioGroup
							row
							value={form.categoryId}
							onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
						>
							<Stack direction="row" spacing={2} flexWrap="wrap">
								{categories.map((cat) => (
									<FormControlLabel
										key={cat.id}
										value={cat.id}
										control={<Radio sx={{ display: "none" }} />}
										label={
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 1,
													px: 2,
													py: 1,
													borderRadius: 999,
													border: "1px solid",
													borderColor:
														form.categoryId === cat.id
															? "primary.main"
															: "rgba(15,23,42,.15)",
													bgcolor:
														form.categoryId === cat.id
															? "primary.light"
															: "transparent",
													color:
														form.categoryId === cat.id
															? "primary.main"
															: "text.secondary",
													transition: "all 0.2s",
													"&:hover": {
														borderColor: "primary.main",
														bgcolor: "rgba(59,130,246,.04)",
													},
												}}
											>
												<ArticleIcon fontSize="small" />
												<Typography variant="body2" fontWeight={600}>
													{cat.name}
												</Typography>
											</Box>
										}
									/>
								))}
							</Stack>
						</RadioGroup>
					</Paper>

					{/* 3. CONTENT */}
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: 4,
							border: "1px solid rgba(15,23,42,.08)",
							minHeight: 400,
						}}
					>
						<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
							Konten
						</Typography>
						<RichTextEditor
							value={form.content}
							onChange={(val) => setForm({ ...form, content: val })}
						/>
					</Paper>

					{/* ACTION */}
					<Stack direction="row" justifyContent="flex-end" spacing={2}>
						<Button
							variant="outlined"
							size="large"
							sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
							component={Link}
							href="/admin/blog"
						>
							Batal
						</Button>
						<Button
							variant="contained"
							size="large"
							disableElevation
							onClick={handleSubmit}
							sx={{
								borderRadius: 999,
								textTransform: "none",
								fontWeight: 800,
								px: 4,
							}}
						>
							Simpan Perubahan
						</Button>
					</Stack>
				</Stack>
			</Box>

			{/* TOAST */}
			<Snackbar
				open={toast.open}
				autoHideDuration={4000}
				onClose={() => setToast({ ...toast, open: false })}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					severity={toast.severity || "success"}
					variant="filled"
					sx={{ borderRadius: 999, fontWeight: 700 }}
				>
					{toast.msg}
				</Alert>
			</Snackbar>
		</Box>
	);
}
