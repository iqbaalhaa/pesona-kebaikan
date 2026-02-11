"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";

// Icons
import LockIcon from "@mui/icons-material/Lock";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import HistoryIcon from "@mui/icons-material/History";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyIcon from "@mui/icons-material/Key";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import { changePassword, getLoginActivities } from "@/actions/security";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import LaptopIcon from "@mui/icons-material/Laptop";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PageContainer from "@/components/profile/PageContainer";

export default function SecurityPage() {

	// State for Change Password Modal
	const [openPassword, setOpenPassword] = React.useState(false);
	const [showPassword, setShowPassword] = React.useState({
		current: false,
		new: false,
		confirm: false,
	});

	// Password Change Logic
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [snackbar, setSnackbar] = React.useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({ open: false, message: "", severity: "success" });

	const handleCloseSnackbar = () =>
		setSnackbar((prev) => ({ ...prev, open: false }));

	const handleSubmitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		const formData = new FormData(event.currentTarget);
		
		try {
			const result = await changePassword(null, formData);
			if (result?.error) {
				setSnackbar({ open: true, message: result.error, severity: "error" });
			} else if (result?.success) {
				setSnackbar({
					open: true,
					message: result.success || "Password berhasil diubah",
					severity: "success",
				});
				setOpenPassword(false);
			}
		} catch (e) {
			setSnackbar({
				open: true,
				message: "Terjadi kesalahan, coba lagi nanti",
				severity: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Login Activity Logic
	const [activities, setActivities] = React.useState<any[]>([]);
	const [loadingActivities, setLoadingActivities] = React.useState(true);

	React.useEffect(() => {
		getLoginActivities()
			.then((data) => {
				setActivities(data);
			})
			.finally(() => {
				setLoadingActivities(false);
			});
	}, []);

	// Helper to parse UA (Basic)
	const parseUA = (ua: string | null) => {
		if (!ua) return { device: "Unknown Device", icon: <SmartphoneIcon /> };
		let device = "Unknown Device";
		let icon = <SmartphoneIcon />;

		if (ua.includes("Windows")) {
			device = "Windows PC";
			icon = <LaptopIcon />;
		} else if (ua.includes("Macintosh")) {
			device = "Mac";
			icon = <LaptopIcon />;
		} else if (ua.includes("Android")) {
			device = "Android";
			icon = <SmartphoneIcon />;
		} else if (ua.includes("iPhone") || ua.includes("iPad")) {
			device = "iOS Device";
			icon = <SmartphoneIcon />;
		} else if (ua.includes("Linux")) {
			device = "Linux";
			icon = <LaptopIcon />;
		}

		if (ua.includes("Chrome")) device += " (Chrome)";
		else if (ua.includes("Firefox")) device += " (Firefox)";
		else if (ua.includes("Safari") && !ua.includes("Chrome"))
			device += " (Safari)";
		else if (ua.includes("Edge")) device += " (Edge)";

		return { device, icon };
	};

	// State for 2FA
	const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);

	const handleTogglePassword = (field: "current" | "new" | "confirm") => {
		setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	return (
		<PageContainer>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
			<ProfileHeader title="Keamanan & Password" />

			{/* Security Status Banner */}
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 3,
					borderRadius: 4,
					bgcolor: "#ecfdf5",
					border: "1px solid #bbf7d0",
					display: "flex",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: "50%",
						bgcolor: "#ffffff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#166534",
					}}
				>
					<LockIcon />
				</Box>
				<Box>
					<Typography sx={{ fontWeight: 800, fontSize: 14, color: "#166534" }}>
						Akun Anda Aman
					</Typography>
					<Typography sx={{ fontSize: 12, color: "#15803d" }}>
						Tidak ada aktivitas mencurigakan terdeteksi
					</Typography>
				</Box>
			</Paper>

			{/* Main Options */}
			<Paper
				elevation={0}
				variant="outlined"
				sx={{
					mb: 3,
					borderRadius: 4,
					bgcolor: "#fff",
					borderColor: "rgba(0,0,0,0.08)",
					overflow: "hidden",
				}}
			>
				<List disablePadding>
					{/* Ganti Password */}
					<ListItemButton
						onClick={() => setOpenPassword(true)}
						sx={{ py: 2 }}
					>
						<ListItemIcon sx={{ minWidth: 40, color: "#0ba976" }}>
							<KeyIcon />
						</ListItemIcon>
						<ListItemText
							primary="Ganti Password"
							secondary="Perbarui password anda secara berkala"
							primaryTypographyProps={{
								fontSize: 14,
								fontWeight: 700,
								color: "#0f172a",
								mb: 0.5,
							}}
							secondaryTypographyProps={{ fontSize: 12 }}
						/>
						<ChevronRightIcon sx={{ color: "rgba(15,23,42,0.3)" }} />
					</ListItemButton>

					<Divider />

					{/* 2FA */}
					{/* <ListItemButton sx={{ py: 2 }}>
						<ListItemIcon sx={{ minWidth: 40, color: "#0ba976" }}>
							<SmartphoneIcon />
						</ListItemIcon>
						<ListItemText
							primary="Autentikasi Dua Faktor"
							secondary="Tambahkan lapisan keamanan ekstra"
							primaryTypographyProps={{
								fontSize: 14,
								fontWeight: 700,
								color: "#0f172a",
								mb: 0.5,
							}}
							secondaryTypographyProps={{ fontSize: 12 }}
						/>
						<Switch
							checked={twoFactorEnabled}
							onChange={(e) => setTwoFactorEnabled(e.target.checked)}
							color="success"
						/>
					</ListItemButton>*/}
				</List>
			</Paper>

			{/* Login Activity */}
			<Typography
				sx={{
					fontSize: 13,
					fontWeight: 800,
					color: "rgba(15,23,42,0.5)",
					mb: 1.5,
					ml: 1,
					textTransform: "uppercase",
					letterSpacing: 0.5,
				}}
			>
				Aktivitas Login
			</Typography>
			<Paper
				elevation={0}
				variant="outlined"
				sx={{
					borderRadius: 4,
					bgcolor: "#fff",
					borderColor: "rgba(0,0,0,0.08)",
					overflow: "hidden",
				}}
			>
				{loadingActivities ? (
					<Box sx={{ p: 3, textAlign: "center" }}>
						<CircularProgress size={24} sx={{ color: "#0ba976" }} />
					</Box>
				) : activities.length === 0 ? (
					<Box sx={{ p: 3, textAlign: "center" }}>
						<Typography sx={{ fontSize: 14, color: "text.secondary" }}>
							Belum ada data aktivitas login.
						</Typography>
					</Box>
				) : (
					<List disablePadding>
						{activities.map((activity, index) => {
							const { device, icon } = parseUA(activity.userAgent);
							const date = new Date(activity.createdAt).toLocaleDateString(
								"id-ID",
								{
									day: "numeric",
									month: "short",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								}
							);
							return (
								<React.Fragment key={activity.id}>
									<ListItemButton sx={{ py: 2 }}>
										<ListItemIcon
											sx={{ minWidth: 40, color: "rgba(15,23,42,0.6)" }}
										>
											{icon}
										</ListItemIcon>
										<ListItemText
											primary={device}
											secondary={`${activity.ipAddress || "IP Unknown"} • ${date}`}
											primaryTypographyProps={{
												fontSize: 14,
												fontWeight: 600,
												color: "#0f172a",
											}}
											secondaryTypographyProps={{
												fontSize: 12,
												color: index === 0 ? "#166534" : "text.secondary",
											}}
										/>
									</ListItemButton>
									{index < activities.length - 1 && <Divider component="li" />}
								</React.Fragment>
							);
						})}
					</List>
				)}
			</Paper>

			{/* Change Password Dialog */}
			<Dialog
				open={openPassword}
				onClose={() => setOpenPassword(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<form onSubmit={handleSubmitPassword}>
					<DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}>
						Ganti Password
					</DialogTitle>
					<DialogContent>
						<Stack spacing={2} sx={{ mt: 1 }}>
							<TextField
								name="currentPassword"
								label="Password Saat Ini"
								type={showPassword.current ? "text" : "password"}
								fullWidth
								required
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={() => handleTogglePassword("current")}
												edge="end"
											>
												{showPassword.current ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							<TextField
								name="newPassword"
								label="Password Baru"
								type={showPassword.new ? "text" : "password"}
								fullWidth
								required
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={() => handleTogglePassword("new")}
												edge="end"
											>
												{showPassword.new ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							<TextField
								name="confirmPassword"
								label="Konfirmasi Password Baru"
								type={showPassword.confirm ? "text" : "password"}
								fullWidth
								required
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={() => handleTogglePassword("confirm")}
												edge="end"
											>
												{showPassword.confirm ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							<Alert severity="info" sx={{ fontSize: 12 }}>
								Password harus terdiri dari minimal 8 karakter.
							</Alert>
						</Stack>
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 3 }}>
						<Button
							onClick={() => setOpenPassword(false)}
							sx={{ color: "rgba(15,23,42,0.6)", fontWeight: 600 }}
							disabled={isSubmitting}
						>
							Batal
						</Button>
						<Button
							type="submit"
							variant="contained"
							disabled={isSubmitting}
							sx={{
								bgcolor: "#0ba976",
								color: "white",
								fontWeight: 700,
								boxShadow: "none",
								"&:hover": { bgcolor: "#16a34a", boxShadow: "none" },
							}}
						>
							{isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Simpan Password"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</PageContainer>
	);
}
