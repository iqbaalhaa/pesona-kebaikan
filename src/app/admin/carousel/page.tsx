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
	Autocomplete,
	Avatar,
	Chip,
	Stack,
	CircularProgress,
	Snackbar,
	Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { uploadImage } from "@/actions/upload";
import { useRouter } from "next/navigation";

interface Carousel {
	id: string;
	title?: string;
	image?: string;
	link?: string;
	isActive: boolean;
	order: number;
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
	const router = useRouter();
	const [carousels, setCarousels] = useState<Carousel[]>([]);
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({
		open: false,
		message: "",
		severity: "info",
	});

	const [confirmDialog, setConfirmDialog] = useState<{
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

	// Form State
	const [isCampaign, setIsCampaign] = useState(false);
	const [title, setTitle] = useState("");
	const [link, setLink] = useState("");
	const [image, setImage] = useState("");
	const [selectedCampaign, setSelectedCampaign] =
		useState<CampaignOption | null>(null);
	const [campaignOptions, setCampaignOptions] = useState<CampaignOption[]>([]);
	const [imageFile, setImageFile] = useState<File | null>(null);

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
			if (res.ok) {
				const data = await res.json();
				setCampaignOptions(data);
			}
		} catch (error) {
			console.error("Failed to fetch campaigns", error);
		}
	};

	const handleOpen = (carousel?: Carousel) => {
		if (carousel) {
			setEditingId(carousel.id);
			setIsCampaign(!!carousel.campaignId);
			setTitle(carousel.title || "");
			setLink(carousel.link || "");
			setImage(carousel.image || "");
			if (carousel.campaignId && carousel.campaign) {
				setSelectedCampaign({
					id: carousel.campaignId,
					title: carousel.campaign.title,
					cover: carousel.campaign.media[0]?.url || "",
				});
			} else {
				setSelectedCampaign(null);
			}
		} else {
			setEditingId(null);
			setIsCampaign(false);
			setTitle("");
			setLink("");
			setImage("");
			setSelectedCampaign(null);
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

			const payload = {
				title,
				link: isCampaign ? null : link, // If campaign, link is auto
				image: isCampaign ? null : finalImageUrl, // If campaign, image is auto (or we can override?)
				// The user requirement: "bisa memilih dari sampul campaign".
				// If campaign selected, we store campaignId.
				campaignId: isCampaign ? selectedCampaign?.id : null,
				isActive: true,
			};

			const url = editingId
				? `/api/admin/carousel/${editingId}`
				: "/api/admin/carousel";
			const method = editingId ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				fetchCarousels();
				handleClose();
				showSnackbar("Berhasil disimpan", "success");
			} else {
				const errData = await res.text();
				console.error("Save failed:", errData);
				showSnackbar("Failed to save. Check console for details.", "error");
			}
		} catch (error) {
			console.error(error);
			showSnackbar("Error saving", "error");
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
				} catch (error) {
					console.error(error);
					showSnackbar("Gagal menghapus carousel", "error");
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	// Helper to fetch campaigns inside the component for now
	// I will create the API route separately.

	return (
		<Box p={3}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography variant="h5" fontWeight="bold">
					Carousel
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => handleOpen()}
					sx={{ bgcolor: "#0ba976" }}
				>
					Baru
				</Button>
			</Stack>

			<TableContainer component={Paper} sx={{ overflowX: "auto" }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Gambar</TableCell>
							<TableCell>Judul / Campaign</TableCell>
							<TableCell>Jenis</TableCell>
							<TableCell>Aksi</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{carousels.map((item) => {
							const displayImage =
								item.image ||
								item.campaign?.media[0]?.url ||
								"/defaultimg.webp";
							const displayTitle =
								item.title || item.campaign?.title || "No Title";

							return (
								<TableRow key={item.id}>
									<TableCell>
										<Avatar
											src={displayImage}
											variant="rounded"
											sx={{ width: 80, height: 45 }}
										/>
									</TableCell>
									<TableCell>
										<Typography variant="body2" fontWeight="bold">
											{displayTitle}
										</Typography>
										{item.link && (
											<Typography variant="caption" color="text.secondary">
												{item.link}
											</Typography>
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
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDelete(item.id)}
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle>
					{editingId ? "Edit Carousel" : "Add Carousel"}
				</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3}>
						<FormControlLabel
							control={
								<Switch
									checked={isCampaign}
									onChange={(e) => setIsCampaign(e.target.checked)}
								/>
							}
							label="Ambil dari Campaign"
						/>

						{isCampaign ? (
							<Autocomplete
								options={campaignOptions}
								getOptionLabel={(option) => option.title}
								isOptionEqualToValue={(option, value) => option.id === value.id}
								value={selectedCampaign}
								onChange={(_, newValue) => setSelectedCampaign(newValue)}
								renderInput={(params) => (
									<TextField {...params} label="Pilih Campaign" fullWidth />
								)}
								renderOption={(props, option) => {
									const { key, ...otherProps } = props;
									return (
										<li key={key} {...otherProps}>
											<Box display="flex" alignItems="center" gap={2}>
												<Avatar
													src={option.cover}
													variant="rounded"
													sx={{ width: 40, height: 40 }}
												/>
												<Typography variant="body2">{option.title}</Typography>
											</Box>
										</li>
									);
								}}
							/>
						) : null}

						<TextField
							label="Title (Optional)"
							fullWidth
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							helperText={
								isCampaign
									? "Biarkan kosong untuk menggunakan judul Campaign, atau isi untuk mengganti."
									: "Biarkan kosong untuk menggunakan judul default 'Mau berbuat baik apa hari ini?'."
							}
						/>

						{!isCampaign && (
							<>
								<TextField
									label="Link (Optional)"
									fullWidth
									value={link}
									onChange={(e) => setLink(e.target.value)}
									helperText="Example: /about or https://google.com"
								/>
								<Box>
									<Typography variant="caption" display="block" mb={1}>
										Upload Image
									</Typography>
									<Button
										component="label"
										variant="outlined"
										startIcon={<ImageIcon />}
										fullWidth
									>
										Select Image
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
									{(image || imageFile) && (
										<Box mt={2}>
											<img
												src={image}
												alt="Preview"
												style={{
													width: "100%",
													height: "150px",
													objectFit: "cover",
													borderRadius: 8,
												}}
											/>
										</Box>
									)}
								</Box>
							</>
						)}

						{isCampaign && selectedCampaign && (
							<Box p={2} border={1} borderColor="divider" borderRadius={1}>
								<Typography variant="caption" color="text.secondary">
									Preview from Campaign:
								</Typography>
								<Box display="flex" gap={2} mt={1}>
									<img
										src={selectedCampaign.cover}
										alt="Cover"
										style={{
											width: 80,
											height: 60,
											objectFit: "cover",
											borderRadius: 4,
										}}
									/>
									<Box>
										<Typography variant="body2" fontWeight="bold">
											{selectedCampaign.title}
										</Typography>
										<Typography variant="caption">
											Link will be: /donasi/{selectedCampaign.id}
										</Typography>
									</Box>
								</Box>
							</Box>
						)}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleSave} variant="contained" disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

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
