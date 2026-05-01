"use client";

import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
	TextField,
	FormControlLabel,
	Switch,
	Stack,
	CircularProgress,
	Snackbar,
	Alert,
	Avatar,
	Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { uploadImage } from "@/actions/upload";

interface Banner {
	id: string;
	title?: string;
	image: string;
	link?: string;
	isActive: boolean;
	order: number;
}

export default function AdminBannerPage() {
	const [banners, setBanners] = useState<Banner[]>([]);
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({ open: false, message: "", severity: "success" });

	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({ open: false, title: "", message: "", onConfirm: () => {} });

	const [title, setTitle] = useState("");
	const [link, setLink] = useState("");
	const [image, setImage] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [imageFile, setImageFile] = useState<File | null>(null);

	useEffect(() => {
		fetchBanners();
	}, []);

	const fetchBanners = async () => {
		const res = await fetch("/api/admin/banner");
		const data = await res.json();
		setBanners(data);
	};

	const handleOpen = (banner?: Banner) => {
		if (banner) {
			setEditingId(banner.id);
			setTitle(banner.title || "");
			setLink(banner.link || "");
			setImage(banner.image || "");
			setIsActive(banner.isActive);
		} else {
			setEditingId(null);
			setTitle("");
			setLink("");
			setImage("");
			setIsActive(true);
		}
		setImageFile(null);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setEditingId(null);
	};

	const handleSave = async () => {
		setLoading(true);
		try {
			let finalImageUrl = image;

			if (imageFile) {
				const formData = new FormData();
				formData.append("file", imageFile);
				const uploadRes = await uploadImage(formData);
				if (uploadRes.success && uploadRes.url) {
					finalImageUrl = uploadRes.url;
				}
			}

			if (!finalImageUrl) {
				setSnackbar({ open: true, message: "Gambar wajib diisi", severity: "error" });
				setLoading(false);
				return;
			}

			const payload = { title, image: finalImageUrl, link, isActive };

			const url = editingId
				? `/api/admin/banner/${editingId}`
				: "/api/admin/banner";
			const method = editingId ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				fetchBanners();
				handleClose();
				setSnackbar({ open: true, message: "Berhasil disimpan", severity: "success" });
			} else {
				setSnackbar({ open: true, message: "Gagal menyimpan", severity: "error" });
			}
		} catch {
			setSnackbar({ open: true, message: "Error", severity: "error" });
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (id: string) => {
		setConfirmDialog({
			open: true,
			title: "Hapus Banner",
			message: "Apakah Anda yakin ingin menghapus banner ini?",
			onConfirm: async () => {
				try {
					await fetch(`/api/admin/banner/${id}`, { method: "DELETE" });
					fetchBanners();
					setSnackbar({ open: true, message: "Banner dihapus", severity: "success" });
				} catch {
					setSnackbar({ open: true, message: "Gagal menghapus", severity: "error" });
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	return (
		<Box p={3}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
				<Typography variant="h5" fontWeight="bold">
					Banner Promo
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => handleOpen()}
					sx={{ bgcolor: "#0ba976" }}
				>
					Tambah Banner
				</Button>
			</Stack>

			<TableContainer component={Paper} sx={{ overflowX: "auto" }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Gambar</TableCell>
							<TableCell>Judul</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Aksi</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{banners.map((item) => (
							<TableRow key={item.id}>
								<TableCell>
									<Avatar
										src={item.image}
										variant="rounded"
										sx={{ width: 120, height: 60 }}
									/>
								</TableCell>
								<TableCell>
									<Typography variant="body2" fontWeight="bold">
										{item.title || "—"}
									</Typography>
									{item.link && (
										<Typography variant="caption" color="text.secondary">
											{item.link}
										</Typography>
									)}
								</TableCell>
								<TableCell>
									<Chip
										label={item.isActive ? "Aktif" : "Nonaktif"}
										color={item.isActive ? "success" : "default"}
										size="small"
									/>
								</TableCell>
								<TableCell>
									<IconButton size="small" onClick={() => handleOpen(item)}>
										<EditIcon />
									</IconButton>
									<IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle>{editingId ? "Edit Banner" : "Tambah Banner"}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3}>
						<TextField
							label="Judul (Opsional)"
							fullWidth
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
						<TextField
							label="Link (Opsional)"
							fullWidth
							value={link}
							onChange={(e) => setLink(e.target.value)}
							helperText="Contoh: /donasi/slug atau https://example.com"
						/>
						<FormControlLabel
							control={
								<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
							}
							label="Aktif"
						/>
						<Box>
							<Typography variant="caption" display="block" mb={1}>
								Upload Gambar Banner (rasio 2:1 disarankan)
							</Typography>
							<Button component="label" variant="outlined" startIcon={<ImageIcon />} fullWidth>
								Pilih Gambar
								<input
									type="file"
									hidden
									accept="image/*"
									onChange={(e) => {
										if (e.target.files?.[0]) {
											setImageFile(e.target.files[0]);
											setImage(URL.createObjectURL(e.target.files[0]));
										}
									}}
								/>
							</Button>
							{image && (
								<Box mt={2}>
									<img
										src={image}
										alt="Preview"
										style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8 }}
									/>
								</Box>
							)}
						</Box>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Batal</Button>
					<Button onClick={handleSave} variant="contained" disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Simpan"}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={confirmDialog.open}
				onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
				<DialogContent>
					<DialogContentText>{confirmDialog.message}</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>
						Batal
					</Button>
					<Button onClick={confirmDialog.onConfirm} variant="contained" color="error">
						Ya, Hapus
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
					severity={snackbar.severity}
					variant="filled"
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
