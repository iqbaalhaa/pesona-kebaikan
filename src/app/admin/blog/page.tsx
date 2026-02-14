"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
	Box,
	Paper,
	Typography,
	Stack,
	Chip,
	TextField,
	InputAdornment,
	IconButton,
	Divider,
	Button,
	CircularProgress,
	Select,
	MenuItem,
	FormControl,
	Snackbar,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

import BlogCard, { BlogItem } from "@/components/admin/BlogCard";
import { stripHtml } from "@/utils/striphtml";

/* ================= TYPES ================= */

type ApiBlog = {
	id: string;
	title: string;
	content: string;
	heroImage?: string | null;
	createdAt: string;
	category?: {
		id: string;
		name: string;
	} | null;
	createdBy: {
		id: string;
		name: string | null;
	};
};

type Category = {
	id: string;
	name: string;
};

export default function AdminBlogPage() {
	const router = useRouter();
	const [items, setItems] = React.useState<BlogItem[]>([]);
	const [q, setQ] = React.useState("");
	const [categoryId, setCategoryId] = React.useState("all");
	const [categories, setCategories] = React.useState<Category[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [snackbar, setSnackbar] = React.useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({
		open: false,
		message: "",
		severity: "info",
	});

	const [confirmDialog, setConfirmDialog] = React.useState<{
		open: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({
		open: false,
		title: "",
		message: "",
		onConfirm: () => {},
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

	/* ================= FETCH ================= */

	const fetchCategories = React.useCallback(async () => {
		try {
			const res = await fetch("/api/admin/blog-categories");
			const json = await res.json();
			if (Array.isArray(json)) {
				setCategories(json);
			}
		} catch (err) {
			console.error("Failed to fetch categories", err);
		}
	}, []);

	const fetchBlogs = React.useCallback(async (keyword = "", catId = "all") => {
		try {
			setLoading(true);
			let url = `/api/admin/blogs?search=${encodeURIComponent(keyword)}`;
			if (catId !== "all") {
				url += `&categoryId=${catId}`;
			}

			const res = await fetch(url);
			const json = await res.json();

			const mapped: BlogItem[] = json.data.map((b: ApiBlog) => ({
				id: b.id,
				title: b.title,
				excerpt: stripHtml(b.content, 150),
				image: b.heroImage || null,
				category: b.category?.name || "Uncategorized",
				date: new Date(b.createdAt).toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				}),
				author: b.createdBy?.name || "Admin",
			}));

			setItems(mapped);
		} catch (err) {
			console.error("Failed to fetch blogs", err);
		} finally {
			setLoading(false);
		}
	}, []);

	/* ================= HANDLERS ================= */

	const handleView = (id: string) => {
		window.open(`/blog/${id}`, "_blank");
	};

	const handleEdit = (id: string) => {
		router.push(`/admin/blog/edit/${id}`);
	};

	const handleDelete = (id: string) => {
		setConfirmDialog({
			open: true,
			title: "Hapus Artikel",
			message: "Apakah Anda yakin ingin menghapus artikel ini?",
			onConfirm: async () => {
				try {
					const res = await fetch(`/api/admin/blogs/${id}`, {
						method: "DELETE",
					});
					if (res.ok) {
						fetchBlogs(q);
						showSnackbar("Artikel berhasil dihapus", "success");
					} else {
						const json = await res.json();
						showSnackbar(json.error || "Gagal menghapus artikel", "error");
					}
				} catch (err) {
					console.error("Failed to delete blog", err);
					showSnackbar("Terjadi kesalahan saat menghapus artikel", "error");
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	/* ================= INIT ================= */
	React.useEffect(() => {
		fetchCategories();
		fetchBlogs();
	}, [fetchCategories, fetchBlogs]);

	/* ================= SEARCH (DEBOUNCE) ================= */
	React.useEffect(() => {
		const t = setTimeout(() => fetchBlogs(q, categoryId), 350);
		return () => clearTimeout(t);
	}, [q, categoryId, fetchBlogs]);

	/* ================= UI ================= */
	return (
		<Box>
			{/* ===== TOP PANEL ===== */}
			<Paper
				elevation={0}
				sx={{
					borderRadius: 3,
					border: "1px solid rgba(15,23,42,.10)",
					bgcolor: "#fff",
					overflow: "hidden",
				}}
			>
				<Box
					sx={{
						p: 2,
						background:
							"radial-gradient(900px 380px at 0% 0%, rgba(11,169,118,.18), transparent 55%), radial-gradient(900px 380px at 100% 0%, rgba(59,130,246,.12), transparent 55%)",
					}}
				>
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={1.5}
						alignItems={{ xs: "stretch", md: "center" }}
						justifyContent="space-between"
					>
						{/* LEFT */}
						<Box>
							<Typography sx={{ fontWeight: 1000, fontSize: 20 }}>
								Blog
							</Typography>
							<Typography
								sx={{ mt: 0.25, fontSize: 12.5, color: "rgba(15,23,42,.62)" }}
							>
								Kelola artikel & konten edukasi.
							</Typography>

							<Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
								<Chip
									label={`${items.length} artikel`}
									variant="outlined"
									sx={{
										borderRadius: 999,
										fontWeight: 900,
										bgcolor: "rgba(255,255,255,.55)",
									}}
								/>
							</Stack>
						</Box>

						{/* RIGHT */}
						<Stack direction="row" spacing={1} alignItems="center">
							<FormControl size="small" sx={{ minWidth: 140 }}>
								<Select
									value={categoryId}
									onChange={(e) => setCategoryId(e.target.value)}
									displayEmpty
									sx={{
										borderRadius: 999,
										bgcolor: "rgba(255,255,255,.70)",
										"& .MuiOutlinedInput-notchedOutline": { border: "none" },
										boxShadow: "0 0 0 1px rgba(15,23,42,.10)",
									}}
									startAdornment={
										<InputAdornment position="start" sx={{ ml: 1 }}>
											<FilterListRoundedIcon fontSize="small" />
										</InputAdornment>
									}
								>
									<MenuItem value="all">Semua Kategori</MenuItem>
									{categories.map((c) => (
										<MenuItem key={c.id} value={c.id}>
											{c.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<TextField
								size="small"
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Cari judul…"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchRoundedIcon fontSize="small" />
										</InputAdornment>
									),
								}}
								sx={{
									width: { xs: "100%", md: 240 },
									"& .MuiOutlinedInput-root": {
										borderRadius: 999,
										bgcolor: "rgba(255,255,255,.70)",
										border: "1px solid rgba(15,23,42,.10)",
										"& fieldset": { border: "none" },
									},
								}}
							/>

							<IconButton
								onClick={() => fetchBlogs(q, categoryId)}
								sx={{
									width: 40,
									height: 40,
									borderRadius: 999,
									bgcolor: "rgba(255,255,255,.70)",
									border: "1px solid rgba(15,23,42,.10)",
								}}
							>
								<RefreshRoundedIcon fontSize="small" />
							</IconButton>

							<Button
								component={Link}
								href="/admin/blog/create"
								variant="contained"
								startIcon={<AddRoundedIcon />}
								sx={{
									borderRadius: 999,
									fontWeight: 1000,
									textTransform: "none",
									px: 2,
									bgcolor: "#0ba976",
									"&:hover": { bgcolor: "#55bf64" },
								}}
							>
								Tulis
							</Button>
						</Stack>
					</Stack>

					<Divider sx={{ mt: 2 }} />
				</Box>
			</Paper>

			{/* ===== CONTENT ===== */}
			{loading ? (
				<Stack alignItems="center" mt={6}>
					<CircularProgress />
				</Stack>
			) : items.length === 0 ? (
				<Stack alignItems="center" mt={6}>
					<Typography color="text.secondary">Belum ada blog 😴</Typography>
				</Stack>
			) : (
				<Box
					sx={{
						mt: 2,
						display: "grid",
						gap: 2,
						gridTemplateColumns: {
							xs: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						},
					}}
				>
					{items.map((b) => (
						<Box
							key={b.id}
							sx={{
								transition: "transform 160ms ease",
								"&:hover": { transform: "translateY(-3px)" },
							}}
						>
							<BlogCard
								data={b}
								onView={handleView}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						</Box>
					))}
				</Box>
			)}
			<Dialog
				open={confirmDialog.open}
				onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>
					{confirmDialog.title}
				</DialogTitle>
				<DialogContent>
					<DialogContentText>{confirmDialog.message}</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						onClick={() =>
							setConfirmDialog((prev) => ({ ...prev, open: false }))
						}
						sx={{ color: "text.secondary" }}
					>
						Batal
					</Button>
					<Button
						onClick={confirmDialog.onConfirm}
						variant="contained"
						color="error"
						sx={{ fontWeight: 700, boxShadow: "none" }}
					>
						Ya, Hapus
					</Button>
				</DialogActions>
			</Dialog>

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
