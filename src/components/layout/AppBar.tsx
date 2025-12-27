"use client";

import * as React from "react";
import Image from "next/image";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import CampaignIcon from "@mui/icons-material/Campaign";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { alpha, useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getNotifications, markAsRead } from "@/actions/notification";

interface SimpleAppBarProps {
	variant?: "solid" | "overlay";
}

export default function SimpleAppBar({ variant = "solid" }: SimpleAppBarProps) {
	const theme = useTheme();
	const router = useRouter();
	const { data: session } = useSession();
	const [searchValue, setSearchValue] = React.useState("");
	const [logoSrc, setLogoSrc] = React.useState("/brand/logo.png");
	const isOverlay = variant === "overlay";

	// Notification State
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
		null
	);
	const [tabValue, setTabValue] = React.useState(0);
	const [notifications, setNotifications] = React.useState<any[]>([]);
	const [unreadCount, setUnreadCount] = React.useState(0);

	React.useEffect(() => {
		if (session?.user?.id) {
			fetchNotifications();
		}
	}, [session?.user?.id]);

	const fetchNotifications = async () => {
		if (!session?.user?.id) return;
		const { notifications, unreadCount } = await getNotifications(
			session.user.id
		);
		setNotifications(notifications);
		setUnreadCount(unreadCount);
	};

	const handleOpenNotifications = (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		setAnchorEl(event.currentTarget);
		// Optionally refresh notifications on open
		fetchNotifications();
	};

	const handleCloseNotifications = () => {
		setAnchorEl(null);
	};

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const open = Boolean(anchorEl);
	const id = open ? "notification-popover" : undefined;

	// Filter notifications based on tab
	const displayedNotifications = notifications.filter((n) =>
		tabValue === 0 ? n.type === "KABAR" : n.type === "PESAN"
	);

	// Colors depend on variant
	const textColor = isOverlay ? "#ffffff" : theme.palette.text.primary;
	const iconBg = isOverlay
		? "rgba(255,255,255,0.10)"
		: alpha(theme.palette.text.primary, 0.05);
	const iconBorder = isOverlay
		? "rgba(255,255,255,0.18)"
		: alpha(theme.palette.divider, 0.5);

	return (
		<AppBar
			position="absolute"
			elevation={0}
			color="transparent"
			sx={{
				top: 0,
				left: 0,
				right: 0,
				zIndex: 50,
				bgcolor: isOverlay ? "rgba(255,255,255,0.06)" : "background.paper",
				backdropFilter: isOverlay ? "blur(12px)" : "none",
				borderBottom: isOverlay ? "none" : `1px solid ${theme.palette.divider}`,
				transition: "all 300ms ease",
			}}
		>
			<Toolbar sx={{ px: 2, minHeight: 64, gap: 1.25 }}>
				<Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
					<Image
						src={logoSrc}
						alt="Pesona Kebaikan"
						width={140}
						height={32}
						priority
						style={{
							height: 32,
							width: "auto",
							objectFit: "contain",
							display: "block",
							filter: isOverlay
								? "drop-shadow(0 10px 18px rgba(0,0,0,.45))"
								: "none",
						}}
						onError={() => setLogoSrc("/defaultimg.webp")}
					/>
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<TextField
						size="small"
						placeholder="Cari donasi…"
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						fullWidth
						sx={{
							minWidth: 0,
							"& .MuiOutlinedInput-root": {
								height: 40,
								borderRadius: 3,
								bgcolor: isOverlay
									? "rgba(255,255,255,0.14)"
									: alpha(theme.palette.text.primary, 0.04),
								backdropFilter: "blur(10px)",
								"& fieldset": {
									borderWidth: 1,
									borderColor: isOverlay
										? "rgba(255,255,255,0.28)"
										: "transparent",
									transition: "all 0.2s ease",
								},
								"&:hover fieldset": {
									borderColor: isOverlay
										? "rgba(255,255,255,0.45)"
										: theme.palette.primary.main,
								},
								"&.Mui-focused fieldset": {
									borderColor: theme.palette.primary.main,
								},
							},
							"& input": {
								fontSize: 13,
								color: isOverlay ? "#fff" : theme.palette.text.primary,
							},
							"& .MuiInputBase-input::placeholder": {
								color: isOverlay
									? "rgba(255,255,255,0.72)"
									: theme.palette.text.secondary,
								opacity: 1,
							},
						}}
						InputProps={{
							startAdornment: (
								<Box
									sx={{
										pl: 1.25,
										pr: 0.75,
										color: isOverlay
											? "rgba(255,255,255,0.9)"
											: theme.palette.text.secondary,
										display: "flex",
									}}
								>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<circle cx="11" cy="11" r="8" />
										<path d="m21 21-4.35-4.35" />
									</svg>
								</Box>
							),
						}}
					/>
				</Box>

				<IconButton
					onClick={handleOpenNotifications}
					sx={{
						width: 40,
						height: 40,
						flexShrink: 0,
						borderRadius: 3,
						border: `1px solid ${iconBorder}`,
						bgcolor: iconBg,
						backdropFilter: "blur(10px)",
						color: textColor,
					}}
				>
					<Badge badgeContent={unreadCount} color="error">
						<NotificationsIcon color="inherit" />
					</Badge>
				</IconButton>

				<Popover
					id={id}
					open={open}
					anchorEl={anchorEl}
					onClose={handleCloseNotifications}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "right",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					PaperProps={{
						sx: {
							width: 320,
							maxHeight: 480,
							mt: 1.5,
							borderRadius: 3,
							overflow: "hidden",
							boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
						},
					}}
				>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							variant="fullWidth"
							sx={{
								"& .MuiTab-root": {
									textTransform: "none",
									fontWeight: 700,
									fontSize: 14,
									minHeight: 48,
								},
								"& .Mui-selected": { color: "#61ce70" },
								"& .MuiTabs-indicator": { bgcolor: "#61ce70" },
							}}
						>
							<Tab label="Kabar" />
							<Tab label="Pesan" />
						</Tabs>
					</Box>

					<Box sx={{ p: 0, overflowY: "auto", maxHeight: 400 }}>
						<List disablePadding>
							{displayedNotifications.length === 0 ? (
								<Box sx={{ p: 3, textAlign: "center" }}>
									<Typography variant="body2" color="text.secondary">
										Tidak ada notifikasi
									</Typography>
								</Box>
							) : (
								displayedNotifications.map((item) => (
									<React.Fragment key={item.id}>
										<ListItemButton
											alignItems="flex-start"
											sx={{
												bgcolor: item.isRead
													? "transparent"
													: alpha(theme.palette.primary.main, 0.05),
											}}
											onClick={() => {
												if (!item.isRead) {
													markAsRead(item.id);
													setNotifications((prev) =>
														prev.map((n) =>
															n.id === item.id ? { ...n, isRead: true } : n
														)
													);
													setUnreadCount((prev) => Math.max(0, prev - 1));
												}
											}}
										>
											<ListItemAvatar>
												<Avatar
													sx={{
														bgcolor:
															item.type === "KABAR" ? "#f0fdf4" : "#eff6ff",
														color:
															item.type === "KABAR" ? "#16a34a" : "#2563eb",
													}}
												>
													{item.type === "KABAR" ? (
														<CampaignIcon />
													) : (
														<AdminPanelSettingsIcon />
													)}
												</Avatar>
											</ListItemAvatar>
											<ListItemText
												primary={
													<Typography
														sx={{
															fontSize: 14,
															fontWeight: 700,
															color: "#0f172a",
														}}
													>
														{item.title}
													</Typography>
												}
												secondary={
													<React.Fragment>
														<Typography
															component="span"
															variant="body2"
															sx={{
																display: "block",
																fontSize: 12,
																color: "#64748b",
																mt: 0.5,
																mb: 0.5,
																lineHeight: 1.4,
															}}
														>
															{item.message}
														</Typography>
														<Typography
															component="span"
															variant="caption"
															sx={{ fontSize: 11, color: "#94a3b8" }}
														>
															{new Date(item.createdAt).toLocaleDateString(
																"id-ID",
																{
																	day: "numeric",
																	month: "short",
																	hour: "2-digit",
																	minute: "2-digit",
																}
															)}
														</Typography>
													</React.Fragment>
												}
											/>
										</ListItemButton>
										<Divider component="li" />
									</React.Fragment>
								))
							)}
						</List>
					</Box>
					<Box
						sx={{
							p: 1.5,
							textAlign: "center",
							borderTop: "1px solid",
							borderColor: "divider",
							bgcolor: "#f8fafc",
						}}
					>
						<Typography
							onClick={() => {
								handleCloseNotifications();
								router.push("/notifikasi");
							}}
							sx={{
								fontSize: 12,
								fontWeight: 600,
								color: "#61ce70",
								cursor: "pointer",
								"&:hover": { textDecoration: "underline" },
							}}
						>
							Lihat Semua Notifikasi
						</Typography>
					</Box>
				</Popover>
			</Toolbar>
		</AppBar>
	);
}
