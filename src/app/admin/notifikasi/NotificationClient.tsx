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
		"BROADCAST"
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
				message: "Please fill in all fields",
				severity: "error",
			});
			return;
		}

		if (targetMode === "SINGLE" && !selectedUser) {
			setSnackbar({
				open: true,
				message: "Please select a user",
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
					type
				);
			}

			if (result.success) {
				setSnackbar({
					open: true,
					message: "Notification sent successfully",
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
					message: result.error || "Failed to send",
					severity: "error",
				});
			}
		} catch (error) {
			setSnackbar({
				open: true,
				message: "An error occurred",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this notification?")) return;

		setDeleteLoading(id);
		try {
			const result = await deleteNotification(id);
			if (result.success) {
				setSnackbar({
					open: true,
					message: "Notification deleted",
					severity: "success",
				});
				router.refresh();
			} else {
				setSnackbar({
					open: true,
					message: "Failed to delete",
					severity: "error",
				});
			}
		} catch (error) {
			setSnackbar({
				open: true,
				message: "An error occurred",
				severity: "error",
			});
		} finally {
			setDeleteLoading(null);
		}
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
					Notification Manager
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => setOpenDialog(true)}
					sx={{ borderRadius: 2, textTransform: "none" }}
				>
					New Notification
				</Button>
			</Stack>

			<TableContainer
				component={Paper}
				elevation={0}
				sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}
			>
				<Table>
					<TableHead>
						<TableRow sx={{ bgcolor: "grey.50" }}>
							<TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Sent At</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
							<TableCell align="right" sx={{ fontWeight: 600 }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{initialNotifications.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} align="center" sx={{ py: 3 }}>
									<Typography color="text.secondary">
										No notifications found
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
											: "Unknown"}
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
											label={notif.isRead ? "Read" : "Unread"}
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
				<DialogTitle>Send New Notification</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3} sx={{ pt: 1 }}>
						<TextField
							label="Title"
							fullWidth
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>

						<TextField
							label="Message"
							fullWidth
							multiline
							rows={3}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>

						<FormControl fullWidth>
							<InputLabel>Type</InputLabel>
							<Select
								value={type}
								label="Type"
								onChange={(e) => setType(e.target.value as NotificationType)}
							>
								<MenuItem value="KABAR">Kabar (General Update)</MenuItem>
								<MenuItem value="PESAN">Pesan (Direct Message)</MenuItem>
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Target Audience</InputLabel>
							<Select
								value={targetMode}
								label="Target Audience"
								onChange={(e) => setTargetMode(e.target.value as any)}
							>
								<MenuItem value="BROADCAST">Broadcast (All Users)</MenuItem>
								<MenuItem value="SINGLE">Specific User</MenuItem>
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
										label="Search User"
										placeholder="Type name or email..."
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
								This notification will be sent to ALL registered users. Use with
								caution.
							</Alert>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setOpenDialog(false)}>Cancel</Button>
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
						Send Notification
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
