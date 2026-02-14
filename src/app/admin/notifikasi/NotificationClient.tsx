"use client";

import React, { useState } from "react";
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
	MenuItem,
	Pagination,
	Stack,
	Chip,
	FormControl,
	InputLabel,
	Select,
	Autocomplete,
	Alert,
	CircularProgress,
	Snackbar,
} from "@mui/material";
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Notifications as NotificationsIcon,
	Send as SendIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
	createNotification,
	deleteNotification,
	broadcastNotification,
} from "@/actions/notification";
import { getUsers } from "@/actions/user";
import { NotificationType } from "@/generated/prisma";

interface NotificationClientProps {
	initialNotifications: any[];
	totalPages: number;
	currentPage: number;
}

export default function NotificationClient({
	initialNotifications,
	totalPages,
	currentPage,
}: NotificationClientProps) {
	const router = useRouter();
	const [openDialog, setOpenDialog] = useState(false);
	const [loading, setLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

	// Form State
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [type, setType] = useState<NotificationType>("KABAR");
	const [targetMode, setTargetMode] = useState<"BROADCAST" | "SINGLE">(
		"BROADCAST",
	);
	const [selectedUser, setSelectedUser] = useState<any>(null);

	// User Search State
	const [userOptions, setUserOptions] = useState<any[]>([]);
	const [userSearchLoading, setUserSearchLoading] = useState(false);

	// Snackbar
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success" as "success" | "error",
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

	const handleUserSearch = async (query: string) => {
		if (!query) return;
		setUserSearchLoading(true);
		try {
			const res = await getUsers(query, "all", 1, 10);
			setUserOptions(res.users);
		} catch (error) {
			console.error(error);
		} finally {
			setUserSearchLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (!title || !message) {
			setSnackbar({
				open: true,
				message: "Harap isi semua bidang",
				severity: "error",
			});
			return;
		}

		if (targetMode === "SINGLE" && !selectedUser) {
			setSnackbar({
				open: true,
				message: "Harap pilih User",
				severity: "error",
			});
			return;
		}

		setLoading(true);
		try {
			let result;
			if (targetMode === "BROADCAST") {
				result = await broadcastNotification(title, message, type);
			} else {
				result = await createNotification(
					selectedUser.id,
					title,
					message,
					type,
				);
			}

			if (result.success) {
				setSnackbar({
					open: true,
					message: "Notifikasi berhasil dikirim",
					severity: "success",
				});
				setOpenDialog(false);
				setTitle("");
				setMessage("");
				setSelectedUser(null);
				router.refresh();
			} else {
				setSnackbar({
					open: true,
					message: result.error || "Gagal mengirim",
					severity: "error",
				});
			}
		} catch (error) {
			setSnackbar({
				open: true,
				message: "Terjadi kesalahan",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (id: string) => {
		setConfirmDialog({
			open: true,
			title: "Hapus Notifikasi",
			message: "Anda yakin ingin menghapus notifikasi ini?",
			onConfirm: async () => {
				setDeleteLoading(id);
				try {
					const result = await deleteNotification(id);
					if (result.success) {
						setSnackbar({
							open: true,
							message: "Notifikasi dihapus",
							severity: "success",
						});
						router.refresh();
					} else {
						setSnackbar({
							open: true,
							message: "Gagal menghapus",
							severity: "error",
						});
					}
				} catch (error) {
					setSnackbar({
						open: true,
						message: "Terjadi kesalahan",
						severity: "error",
					});
				} finally {
					setDeleteLoading(null);
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	return (
		<Box sx={{ p: 3 }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: 3 }}
			>
				<Typography variant="h5" fontWeight={700}>
					Manajer Notifikasi
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setOpenDialog(true)}
					sx={{ borderRadius: 2, textTransform: "none" }}
				>
					Notifikasi Baru
				</Button>
			</Stack>

			<TableContainer
				component={Paper}
				elevation={0}
				sx={{
					borderRadius: 2,
					border: "1px solid",
					borderColor: "divider",
					overflowX: "auto",
				}}
			>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: "grey.50" }}>
							<TableCell sx={{ fontWeight: 600 }}>Judul</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Pesan</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Tipe</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Penerima</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Dikirim</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
							<TableCell align="right" sx={{ fontWeight: 600 }}>
								Tindakan
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{initialNotifications.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} align="center" sx={{ py: 3 }}>
									<Typography color="text.secondary">
										Tidak ada notifikasi
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							initialNotifications.map((notif) => (
								<TableRow key={notif.id} hover>
									<TableCell>{notif.title}</TableCell>
									<TableCell
										sx={{
											maxWidth: 300,
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
										}}
									>
										{notif.message}
									</TableCell>
									<TableCell>
										<Chip
											label={notif.type}
											size="small"
											color={notif.type === "KABAR" ? "primary" : "secondary"}
											variant="outlined"
										/>
									</TableCell>
									<TableCell>
										{notif.user
											? notif.user.name || notif.user.email
											: "Tidak diketahui"}
									</TableCell>
									<TableCell>
										{new Date(notif.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "short",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</TableCell>
									<TableCell>
										<Chip
											label={notif.isRead ? "Terbaca" : "Belum terbaca"}
											size="small"
											color={notif.isRead ? "success" : "default"}
										/>
									</TableCell>
									<TableCell align="right">
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDelete(notif.id)}
											disabled={deleteLoading === notif.id}
										>
											{deleteLoading === notif.id ? (
												<CircularProgress size={20} />
											) : (
												<DeleteIcon fontSize="small" />
											)}
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
				<Pagination
					count={totalPages}
					page={currentPage}
					onChange={(_, p) => router.push(`/admin/notifikasi?page=${p}`)}
					color="primary"
				/>
			</Box>

			{/* Create Dialog */}
			<Dialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Kirim Notifikasi Baru</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3} sx={{ pt: 1 }}>
						<TextField
							label="Judul"
							fullWidth
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>

						<TextField
							label="Pesan"
							fullWidth
							multiline
							rows={3}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>

						<FormControl fullWidth>
							<InputLabel>Tipe</InputLabel>
							<Select
								value={type}
								label="Tipe"
								onChange={(e) => setType(e.target.value as NotificationType)}
							>
								<MenuItem value="KABAR">Kabar (Pembaharuan Umum)</MenuItem>
								<MenuItem value="PESAN">Pesan (Pesan Langsung)</MenuItem>
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Audiens Target</InputLabel>
							<Select
								value={targetMode}
								label="Audiens Target"
								onChange={(e) => setTargetMode(e.target.value as any)}
							>
								<MenuItem value="BROADCAST">Siarkan (Semua User)</MenuItem>
								<MenuItem value="SINGLE">User Tertentu</MenuItem>
							</Select>
						</FormControl>

						{targetMode === "SINGLE" && (
							<Autocomplete
								options={userOptions}
								getOptionLabel={(option) =>
									`${option.name || "No Name"} (${option.email})`
								}
								loading={userSearchLoading}
								onInputChange={(_, value) => handleUserSearch(value)}
								onChange={(_, value) => setSelectedUser(value)}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Cari User"
										placeholder="Ketik nama atau email..."
										InputProps={{
											...params.InputProps,
											endAdornment: (
												<>
													{userSearchLoading ? (
														<CircularProgress color="inherit" size={20} />
													) : null}
													{params.InputProps.endAdornment}
												</>
											),
										}}
									/>
								)}
							/>
						)}

						{targetMode === "BROADCAST" && (
							<Alert severity="info">
								Notifikasi ini akan dikirim ke SEMUA User terdaftar. Gunakan
								dengan hati-hati.
							</Alert>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setOpenDialog(false)}>Batal</Button>
					<Button
						variant="contained"
						onClick={handleSubmit}
						disabled={loading}
						endIcon={
							loading ? (
								<CircularProgress size={20} color="inherit" />
							) : (
								<SendIcon />
							)
						}
					>
						Kirim Notifikasi
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirmation Dialog */}
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
				autoHideDuration={6000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
			>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
