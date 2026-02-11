"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CampaignIcon from "@mui/icons-material/Campaign";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notification";
import { alpha } from "@mui/material/styles";

export default function NotificationPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const [tabValue, setTabValue] = React.useState(0);
	const [notifications, setNotifications] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(true);

	const fetchNotifications = async () => {
		if (!session?.user?.id) return;
		try {
			setLoading(true);
			const { notifications } = await getNotifications(session.user.id, undefined, 50);
			setNotifications(notifications);
		} catch (error) {
			console.error("Failed to fetch notifications", error);
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		if (session?.user?.id) {
			fetchNotifications();
		}
	}, [session?.user?.id]);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleMarkAsRead = async (id: string) => {
		await markAsRead(id);
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
		);
		// Optionally trigger a global event or revalidation
	};

	const handleMarkAllAsRead = async () => {
		if (!session?.user?.id) return;
		await markAllAsRead(session.user.id);
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
	};

	const displayedNotifications = notifications.filter((n) =>
		tabValue === 0 ? n.type === "KABAR" : n.type === "PESAN"
	);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		
		// If less than 24 hours
		if (diff < 24 * 60 * 60 * 1000) {
			if (diff < 60 * 60 * 1000) {
				const minutes = Math.floor(diff / (60 * 1000));
				return `${minutes} menit yang lalu`;
			}
			const hours = Math.floor(diff / (60 * 60 * 1000));
			return `${hours} jam yang lalu`;
		}
		
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Box sx={{ pb: 10 }}>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 1,
					p: 2,
					bgcolor: "background.paper",
					borderBottom: "1px solid",
					borderColor: "divider",
					position: "sticky",
					top: 0,
					zIndex: 10,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<IconButton onClick={() => router.back()} edge="start" size="small">
						<ArrowBackIcon />
					</IconButton>
					<Typography variant="h6" fontWeight={700} sx={{ fontSize: 18 }}>
						Notifikasi
					</Typography>
				</Box>
				<IconButton 
					onClick={handleMarkAllAsRead} 
					title="Tandai semua sudah dibaca"
					size="small"
					color="primary"
				>
					<DoneAllIcon />
				</IconButton>
			</Box>

			{/* Tabs */}
			<Box sx={{ bgcolor: "background.paper", position: "sticky", top: 65, zIndex: 10 }}>
				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					variant="fullWidth"
					sx={{
						borderBottom: 1,
						borderColor: "divider",
						"& .MuiTab-root": {
							textTransform: "none",
							fontWeight: 700,
							fontSize: 14,
							minHeight: 48,
						},
						"& .Mui-selected": { color: "#0ba976" },
						"& .MuiTabs-indicator": { bgcolor: "#0ba976" },
					}}
				>
					<Tab label="Kabar" />
					<Tab label="Pesan" />
				</Tabs>
			</Box>

			{/* Content */}
			<Box>
				{loading ? (
					<Box sx={{ p: 3, textAlign: "center" }}>
						<Typography variant="body2" color="text.secondary">
							Memuat notifikasi...
						</Typography>
					</Box>
				) : (
					<List disablePadding>
						{displayedNotifications.length === 0 ? (
							<Box sx={{ p: 3, textAlign: "center" }}>
								<Typography variant="body2" color="text.secondary">
									Belum ada notifikasi
								</Typography>
							</Box>
						) : (
							displayedNotifications.map((item) => (
								<React.Fragment key={item.id}>
									<ListItemButton
										alignItems="flex-start"
										onClick={() => !item.isRead && handleMarkAsRead(item.id)}
										sx={{
											bgcolor: item.isRead
												? "transparent"
												: (theme) => alpha(theme.palette.primary.main, 0.05),
											transition: "background-color 0.2s",
										}}
									>
										<ListItemAvatar>
											<Avatar
												sx={{
													bgcolor: item.type === "KABAR" ? "#f0fdf4" : "#eff6ff",
													color: item.type === "KABAR" ? "#16a34a" : "#2563eb",
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
														fontWeight: item.isRead ? 500 : 700,
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
															fontSize: 13,
															color: "#64748b",
															mt: 0.5,
															mb: 0.5,
															lineHeight: 1.5,
														}}
													>
														{item.message}
													</Typography>
													<Typography
														component="span"
														variant="caption"
														sx={{ fontSize: 11, color: "#94a3b8" }}
													>
														{formatDate(item.createdAt)}
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
				)}
			</Box>
		</Box>
	);
}
