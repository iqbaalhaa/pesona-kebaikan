"use client";

import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { getNotifications } from "@/actions/notification";

export default function AdminHeader({
	onMobileToggle,
}: {
	onMobileToggle: () => void;
}) {
	const { data: session } = useSession();
	const pathname = usePathname();

	const getBreadcrumbs = () => {
		if (!pathname) return [];
		const segments = pathname.split("/").filter(Boolean);
		return segments.map((segment, index) => {
			let label = segment.replace(/-/g, " ");
			label = label.charAt(0).toUpperCase() + label.slice(1);
			if (segment === "admin" && index === 0) label = "Dashboard";
			return { label, isLast: index === segments.length - 1 };
		});
	};

	const breadcrumbs = getBreadcrumbs();

	const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(
		null,
	);
	const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
	const [notifications, setNotifications] = useState<any[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);

	const openProfile = Boolean(anchorElProfile);
	const openNotif = Boolean(anchorElNotif);

	const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElProfile(event.currentTarget);
	};
	const handleProfileClose = () => {
		setAnchorElProfile(null);
	};

	const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNotif(event.currentTarget);
		fetchNotifications();
	};
	const handleNotifClose = () => {
		setAnchorElNotif(null);
	};

	const fetchNotifications = async () => {
		if (!session?.user?.id) return;
		try {
			const { notifications } = await getNotifications(session.user.id);
			const adminNotifications = notifications.filter(
				(n: any) =>
					n.title === "Pengajuan Perubahan Campaign" ||
					(typeof n.message === "string" &&
						n.message.includes("CAMPAIGN_CHANGE_REQUEST:")),
			);
			setNotifications(adminNotifications);
			setUnreadCount(adminNotifications.filter((n: any) => !n.isRead).length);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className="sticky top-0 z-10 mb-6">
			<div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm flex items-center gap-3">
				{/* Mobile Hamburger */}
				<IconButton
					onClick={onMobileToggle}
					className="lg:hidden text-gray-500"
				>
					<MenuIcon />
				</IconButton>

				{/* Breadcrumbs */}
				<div className="flex-1 flex items-center gap-1 overflow-hidden">
					{breadcrumbs.map((crumb, i) => (
						<React.Fragment key={i}>
							<Typography
								variant="body2"
								sx={{
									fontSize: 14,
									fontWeight: crumb.isLast ? 700 : 500,
									color: crumb.isLast ? "text.primary" : "text.secondary",
									whiteSpace: "nowrap",
								}}
							>
								{crumb.label}
							</Typography>
							{!crumb.isLast && (
								<Typography
									variant="caption"
									sx={{ color: "text.disabled", mx: 0.5, userSelect: "none" }}
								>
									/
								</Typography>
							)}
						</React.Fragment>
					))}
				</div>

				{/* Public Page */}
				<Tooltip title="Lihat halaman publik">
					<IconButton
						component={Link}
						href="/"
						target="_blank"
						size="small"
						className="!h-9 !w-9 !rounded-lg !border !border-gray-200 hover:!bg-gray-50"
					>
						<OpenInNewIcon fontSize="small" className="text-gray-700" />
					</IconButton>
				</Tooltip>

				{/* Notifications */}
				<Tooltip title="Notifikasi">
					<IconButton
						onClick={handleNotifClick}
						size="small"
						aria-controls={openNotif ? "notifications-menu" : undefined}
						aria-haspopup="true"
						aria-expanded={openNotif ? "true" : undefined}
						className="!h-9 !w-9 !rounded-lg !border !border-gray-200 hover:!bg-gray-50"
					>
						<Badge
							color="error"
							variant={unreadCount > 0 ? "standard" : "dot"}
							badgeContent={unreadCount > 0 ? unreadCount : undefined}
						>
							<NotificationsNoneIcon
								fontSize="small"
								className="text-gray-700"
							/>
						</Badge>
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={anchorElNotif}
					id="notifications-menu"
					open={openNotif}
					onClose={handleNotifClose}
					onClick={handleNotifClose}
					slotProps={{
						paper: {
							elevation: 0,
							sx: {
								overflow: "visible",
								mt: 1.5,
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
								minWidth: 320,
								maxWidth: 380,
								background:
									"linear-gradient(135deg, #ffffff 0%, #f8fafc 40%, #eef2ff 100%)",
							},
						},
					}}
					transformOrigin={{ horizontal: "right", vertical: "top" }}
					anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				>
					{notifications.length === 0
						? [
								<MenuItem
									key="empty"
									onClick={handleNotifClose}
									sx={{
										py: 1.75,
										px: 2,
										color: "text.secondary",
										fontSize: 13,
									}}
								>
									Tidak ada notifikasi
								</MenuItem>,
							]
						: [
								...notifications.slice(0, 5).map((n) => (
									<MenuItem
										key={n.id}
										onClick={handleNotifClose}
										sx={{
											width: "100%",
											alignItems: "flex-start",
											py: 1.5,
											px: 2,
											gap: 0.75,
											borderLeft: "3px solid",
											borderLeftColor: n.isRead ? "transparent" : "#0ba976",
											bgcolor: n.isRead
												? "transparent"
												: "rgba(11,169,118,0.06)",
											"&:hover": {
												bgcolor: n.isRead
													? "rgba(148,163,184,0.12)"
													: "rgba(11,169,118,0.12)",
											},
										}}
									>
										<div className="flex flex-col gap-0.5 w-full">
											<Typography
												variant="body2"
												sx={{
													fontWeight: n.isRead ? 600 : 700,
													letterSpacing: 0.1,
													color: "#0f172a",
													overflowWrap: "break-word",
													wordBreak: "break-word",
												}}
											>
												{n.title}
											</Typography>
											<Typography
												variant="caption"
												sx={{
													color: "#64748b",
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
													overflowWrap: "break-word",
													wordBreak: "break-word",
													fontSize: 12,
												}}
											>
												{n.message}
											</Typography>
											<Typography
												variant="caption"
												sx={{ color: "#94a3b8", fontSize: 11, mt: 0.25 }}
											>
												{new Date(n.createdAt).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "short",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</Typography>
										</div>
									</MenuItem>
								)),
								<Divider key="divider" />,
								<MenuItem
									key="see-all"
									onClick={handleNotifClose}
									sx={{ py: 1.25, justifyContent: "center" }}
								>
									<Link
										href="/notifikasi"
										className="text-sm font-semibold text-emerald-600"
									>
										Lihat semua notifikasi
									</Link>
								</MenuItem>,
							]}
				</Menu>

				{/* Profile */}
				<Tooltip title="Pengaturan akun">
					<IconButton
						onClick={handleProfileClick}
						size="small"
						sx={{ ml: 0.5 }}
						aria-controls={openProfile ? "account-menu" : undefined}
						aria-haspopup="true"
						aria-expanded={openProfile ? "true" : undefined}
					>
						<Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={anchorElProfile}
					id="account-menu"
					open={openProfile}
					onClose={handleProfileClose}
					onClick={handleProfileClose}
					slotProps={{
						paper: {
							elevation: 0,
							sx: {
								overflow: "visible",
								filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
								mt: 1.5,
								"& .MuiAvatar-root": {
									width: 32,
									height: 32,
									ml: -0.5,
									mr: 1,
								},
								"&::before": {
									content: '""',
									display: "block",
									position: "absolute",
									top: 0,
									right: 14,
									width: 10,
									height: 10,
									bgcolor: "background.paper",
									transform: "translateY(-50%) rotate(45deg)",
									zIndex: 0,
								},
							},
						},
					}}
					transformOrigin={{ horizontal: "right", vertical: "top" }}
					anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				>
					<MenuItem onClick={handleProfileClose}>
						<Avatar /> Profil
					</MenuItem>
					<MenuItem onClick={handleProfileClose}>
						<Avatar /> Akun saya
					</MenuItem>
					<Divider />
					<MenuItem onClick={handleProfileClose}>
						<ListItemIcon>
							<PersonIcon fontSize="small" />
						</ListItemIcon>
						Tambah akun lain
					</MenuItem>
					<MenuItem onClick={handleProfileClose}>
						<ListItemIcon>
							<SettingsIcon fontSize="small" />
						</ListItemIcon>
						Pengaturan
					</MenuItem>
					<MenuItem
						onClick={() => {
							handleProfileClose();
							signOut();
						}}
					>
						<ListItemIcon>
							<LogoutIcon fontSize="small" />
						</ListItemIcon>
						Keluar
					</MenuItem>
				</Menu>
			</div>
		</div>
	);
}
