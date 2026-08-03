"use client";

import React, { useState, useEffect, useRef } from "react";
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
	Autocomplete,
	Avatar,
	Chip,
	Stack,
	CircularProgress,
	Snackbar,
	Alert,
	Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { uploadBannerFile } from "@/actions/upload";

interface Carousel {
	id: string;
	title?: string;
	image?: string;
	link?: string;
	isActive: boolean;
	order: number;
	duration: number;
	campaignId?: string;
	campaign?: {
		title: string;
		slug: string;
		media: { url: string; isThumbnail: boolean }[];
	};
}

interface CampaignOption {
	id: string;
	title: string;
	cover: string;
}

export default function AdminCarouselPage() {
	const [carousels, setCarousels] = useState<Carousel[]>([]);
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });

	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({ open: false, title: "", message: "", onConfirm: () => {} });

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "info" | "warning" = "info",
	) => setSnackbar({ open: true, message, severity });

	// Form State
	const [isCampaign, setIsCampaign] = useState(false);
	const [link, setLink] = useState("");
	const [image, setImage] = useState("");
	const [selectedCampaign, setSelectedCampaign] = useState<CampaignOption | null>(null);
	const [campaignOptions, setCampaignOptions] = useState<CampaignOption[]>([]);
	const [imageFile, setImageFile] = useState<File | null>(null);

	// Drag state
	const dragIndex = useRef<number | null>(null);
	const [dragOver, setDragOver] = useState<number | null>(null);

	// Inline duration edit state
	const [editingDuration, setEditingDuration] = useState<string | null>(null); // id of row being edited
	const [durationInput, setDurationInput] = useState<string>("");

	useEffect(() => {
		fetchCarousels();
		fetchCampaigns();
	}, []);

	const fetchCarousels = async () => {
		const res = await fetch("/api/admin/carousel");
		const data = await res.json();
		setCarousels(data);
	};

	const fetchCampaigns = async () => {
		try {
			const res = await fetch("/api/admin/campaign-list");
			if (res.ok) setCampaignOptions(await res.json());
		} catch {}
	};

	const handleOpen = (carousel?: Carousel) => {
		if (carousel) {
			setEditingId(carousel.id);
			setIsCampaign(!!carousel.campaignId);
			setLink(carousel.link || "");
			setImage(carousel.image || "");
			setSelectedCampaign(
				carousel.campaignId && carousel.campaign
					? { id: carousel.campaignId, title: carousel.campaign.title, cover: carousel.campaign.media[0]?.url || "" }
					: null,
			);
		} else {
			setEditingId(null);
			setIsCampaign(false);
			setLink("");
			setImage("");
			setSelectedCampaign(null);
		}
		setImageFile(null);
		setOpen(true);
	};

	const handleClose = () => { setOpen(false); setEditingId(null); };

	const handleSave = async () => {
		setLoading(true);
		try {
			let finalImageUrl = image;
			if (imageFile) {
				const fd = new FormData();
				fd.append("file", imageFile);
				const uploadRes = await uploadBannerFile(fd);
				if (uploadRes.success && uploadRes.url) finalImageUrl = uploadRes.url;
			}

			const payload = {
				title: null,
				link: isCampaign ? null : link,
				image: isCampaign ? null : finalImageUrl,
				campaignId: isCampaign ? selectedCampaign?.id : null,
				isActive: true,
			};

			const url = editingId ? `/api/admin/carousel/${editingId}` : "/api/admin/carousel";
			const method = editingId ? "PUT" : "POST";
			const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

			if (res.ok) {
				fetchCarousels();
				handleClose();
				showSnackbar("Berhasil disimpan", "success");
			} else {
				showSnackbar("Gagal menyimpan", "error");
			}
		} catch {
			showSnackbar("Terjadi kesalahan", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (id: string) => {
		setConfirmDialog({
			open: true,
			title: "Hapus Carousel",
			message: "Apakah Anda yakin ingin menghapus carousel ini?",
			onConfirm: async () => {
				try {
					await fetch(`/api/admin/carousel/${id}`, { method: "DELETE" });
					fetchCarousels();
					showSnackbar("Carousel berhasil dihapus", "success");
				} catch {
					showSnackbar("Gagal menghapus", "error");
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	// ── Drag-and-drop handlers ──────────────────────────────────────
	const handleDragStart = (index: number) => {
		dragIndex.current = index;
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		setDragOver(index);
	};

	const handleDrop = async (dropIndex: number) => {
		const from = dragIndex.current;
		if (from === null || from === dropIndex) {
			setDragOver(null);
			dragIndex.current = null;
			return;
		}
		const reordered = [...carousels];
		const [moved] = reordered.splice(from, 1);
		reordered.splice(dropIndex, 0, moved);
		const withOrder = reordered.map((c, i) => ({ ...c, order: i + 1 }));
		setCarousels(withOrder);
		setDragOver(null);
		dragIndex.current = null;

		try {
			await fetch("/api/admin/carousel", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(withOrder.map((c) => ({ id: c.id, order: c.order }))),
			});
			showSnackbar("Urutan disimpan", "success");
		} catch {
			showSnackbar("Gagal menyimpan urutan", "error");
			fetchCarousels();
		}
	};

	const handleDragEnd = () => {
		setDragOver(null);
		dragIndex.current = null;
	};

	// ── Inline duration handlers ────────────────────────────────────
	const startEditDuration = (item: Carousel) => {
		setEditingDuration(item.id);
		setDurationInput(String(Math.round(item.duration / 1000)));
	};

	const saveDuration = async (id: string) => {
		const seconds = parseFloat(durationInput);
		if (isNaN(seconds) || seconds < 1 || seconds > 60) {
			showSnackbar("Durasi harus antara 1–60 detik", "error");
			setEditingDuration(null);
			return;
		}
		const ms = Math.round(seconds * 1000);
		setCarousels((prev) => prev.map((c) => c.id === id ? { ...c, duration: ms } : c));
		setEditingDuration(null);
		try {
			await fetch(`/api/admin/carousel/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ duration: ms }),
			});
			showSnackbar("Durasi disimpan", "success");
		} catch {
			showSnackbar("Gagal menyimpan durasi", "error");
			fetchCarousels();
		}
	};

	return (
		<Box p={3}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
				<Typography variant="h5" fontWeight="bold">Carousel</Typography>
				<Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ bgcolor: "#0ba976" }}>
					Baru
				</Button>
			</Stack>

			<TableContainer component={Paper} sx={{ overflowX: "auto" }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell sx={{ width: 40 }} />
							<TableCell>Gambar</TableCell>
							<TableCell>Campaign / Link</TableCell>
							<TableCell>Durasi</TableCell>
							<TableCell>Jenis</TableCell>
							<TableCell>Aksi</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{carousels.map((item, index) => {
							const displayImage = item.image || item.campaign?.media[0]?.url || "/defaultimg.webp";
							const displayLabel = item.campaign?.title || item.link || "—";

							return (
								<TableRow
									key={item.id}
									draggable
									onDragStart={() => handleDragStart(index)}
									onDragOver={(e) => handleDragOver(e, index)}
									onDrop={() => handleDrop(index)}
									onDragEnd={handleDragEnd}
									sx={{
										cursor: "grab",
										bgcolor: dragOver === index ? "action.hover" : "inherit",
										transition: "background-color 0.15s",
										"&:active": { cursor: "grabbing" },
									}}
								>
									<TableCell sx={{ px: 1 }}>
										<Tooltip title="Drag untuk ubah urutan">
											<DragIndicatorIcon sx={{ color: "text.disabled", display: "block" }} />
										</Tooltip>
									</TableCell>
									<TableCell>
										<Avatar src={displayImage} variant="rounded" sx={{ width: 80, height: 45 }} />
									</TableCell>
									<TableCell>
										<Typography variant="body2" color={displayLabel === "—" ? "text.disabled" : "inherit"}>
											{displayLabel}
										</Typography>
									</TableCell>
									<TableCell sx={{ minWidth: 110 }}>
										{editingDuration === item.id ? (
											<Box display="flex" alignItems="center" gap={0.5}>
												<input
													autoFocus
													type="number"
													min={1}
													max={60}
													step={0.5}
													value={durationInput}
													onChange={(e) => setDurationInput(e.target.value)}
													onBlur={() => saveDuration(item.id)}
													onKeyDown={(e) => {
														if (e.key === "Enter") saveDuration(item.id);
														if (e.key === "Escape") setEditingDuration(null);
													}}
													style={{
														width: 56,
														padding: "4px 6px",
														border: "1px solid #0ba976",
														borderRadius: 6,
														fontSize: 13,
														outline: "none",
													}}
												/>
												<Typography variant="caption" color="text.secondary">dtk</Typography>
											</Box>
										) : (
											<Tooltip title="Klik untuk edit durasi">
												<Box
													onClick={() => startEditDuration(item)}
													sx={{
														display: "inline-flex",
														alignItems: "center",
														gap: 0.5,
														cursor: "pointer",
														px: 1,
														py: 0.5,
														borderRadius: 1,
														"&:hover": { bgcolor: "action.hover" },
													}}
												>
													<Typography variant="body2" fontWeight={500}>
														{(item.duration / 1000).toFixed(1)}
													</Typography>
													<Typography variant="caption" color="text.secondary">dtk</Typography>
												</Box>
											</Tooltip>
										)}
									</TableCell>
									<TableCell>
										<Chip
											label={item.campaignId ? "Campaign" : "Custom"}
											color={item.campaignId ? "primary" : "default"}
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
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Add/Edit Dialog */}
			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle>{editingId ? "Edit Carousel" : "Tambah Carousel"}</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3}>
						<FormControlLabel
							control={<Switch checked={isCampaign} onChange={(e) => setIsCampaign(e.target.checked)} />}
							label="Ambil dari Campaign"
						/>

						{isCampaign ? (
							<>
								<Autocomplete
									options={campaignOptions}
									getOptionLabel={(o) => o.title}
									isOptionEqualToValue={(o, v) => o.id === v.id}
									value={selectedCampaign}
									onChange={(_, v) => setSelectedCampaign(v)}
									renderInput={(params) => <TextField {...params} label="Pilih Campaign" fullWidth />}
									renderOption={(props, option) => {
										const { key, ...rest } = props;
										return (
											<li key={key} {...rest}>
												<Box display="flex" alignItems="center" gap={2}>
													<Avatar src={option.cover} variant="rounded" sx={{ width: 40, height: 40 }} />
													<Typography variant="body2">{option.title}</Typography>
												</Box>
											</li>
										);
									}}
								/>
								{selectedCampaign && (
									<Box p={2} border={1} borderColor="divider" borderRadius={1}>
										<Typography variant="caption" color="text.secondary">Preview:</Typography>
										<Box display="flex" gap={2} mt={1} alignItems="center">
											<img src={selectedCampaign.cover} alt="Cover" style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4 }} />
											<Box>
												<Typography variant="body2" fontWeight="bold">{selectedCampaign.title}</Typography>
												<Typography variant="caption" color="text.secondary">Link: /donasi/{selectedCampaign.id}</Typography>
											</Box>
										</Box>
									</Box>
								)}
							</>
						) : (
							<>
								<TextField
									label="Link (Opsional)"
									fullWidth
									value={link}
									onChange={(e) => setLink(e.target.value)}
									helperText="Contoh: /donasi/slug atau https://example.com"
								/>
								<Box>
									<Typography variant="caption" display="block" mb={1}>
										Upload Gambar (maks 1228 × 714 px, tidak dipotong)
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
													// ponytail: reuse `image` as preview src; upload overwrites it on save
													setImage(URL.createObjectURL(e.target.files[0]));
												}
											}}
										/>
									</Button>
									{image && (
										<Box mt={2}>
											<img src={image} alt="Preview" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8 }} />
										</Box>
									)}
								</Box>
							</>
						)}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Batal</Button>
					<Button onClick={handleSave} variant="contained" disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Simpan"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm Delete */}
			<Dialog open={confirmDialog.open} onClose={() => setConfirmDialog((p) => ({ ...p, open: false }))}>
				<DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
				<DialogContent>
					<DialogContentText>{confirmDialog.message}</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setConfirmDialog((p) => ({ ...p, open: false }))} sx={{ color: "text.secondary" }}>
						Batal
					</Button>
					<Button onClick={confirmDialog.onConfirm} variant="contained" color="error" sx={{ fontWeight: 700, boxShadow: "none" }}>
						Ya, Hapus
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }} sx={{ zIndex: 99999 }}>
				<Alert onClose={() => setSnackbar((p) => ({ ...p, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
