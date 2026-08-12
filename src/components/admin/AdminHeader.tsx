"use client";

import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import ButtonBase from "@mui/material/ButtonBase";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsOffRoundedIcon from "@mui/icons-material/NotificationsOffRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notification";
import { ADMIN_NOTIFICATION_TYPES } from "@/lib/constants";

/** Where clicking a given admin-alert notification should take the reviewer. */
function resolveNotificationHref(n: { type?: string; message?: string }) {
	switch (n.type) {
		case "NEW_CAMPAIGN":
			return "/admin/campaign/verifikasi";
		case "WITHDRAWAL_REQUEST":
			return "/admin/pencairan";
		case "VERIFICATION_REQUEST":
			return "/admin/users?tab=verification";
		case "CAMPAIGN_CHANGE_REQUEST": {
			const match = /CAMPAIGN_CHANGE_REQUEST:([a-zA-Z0-9-_]+)/.exec(n.message || "");
			return match?.[1] ? `/admin/campaign/${match[1]}` : "/admin/pengajuan-campaign";
		}
		default:
			return undefined;
	}
}

/** Icon + color per notification type, so the dropdown reads at a glance. */
const NOTIF_TYPE_STYLE: Record<
	string,
	{ icon: React.ElementType; bg: string; color: string }
> = {
	NEW_CAMPAIGN: { icon: CampaignRoundedIcon, bg: "#e0f2fe", color: "#0284c7" },
	WITHDRAWAL_REQUEST: { icon: AccountBalanceWalletRoundedIcon, bg: "#fef3c7", color: "#d97706" },
	VERIFICATION_REQUEST: { icon: VerifiedUserRoundedIcon, bg: "#ede9fe", color: "#7c3aed" },
	CAMPAIGN_CHANGE_REQUEST: { icon: EditNoteRoundedIcon, bg: "#d1fae5", color: "#059669" },
};
const DEFAULT_NOTIF_STYLE = { icon: NotificationsNoneIcon, bg: "#f1f5f9", color: "#64748b" };

/** Compact "5 menit lalu" style relative time for the dropdown list. */
function formatRelativeTime(date: string | Date) {
	const diffMs = Date.now() - new Date(date).getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return "Baru saja";
	if (diffMin < 60) return `${diffMin} menit lalu`;
	const diffHour = Math.floor(diffMin / 60);
	if (diffHour < 24) return `${diffHour} jam lalu`;
	const diffDay = Math.floor(diffHour / 24);
	if (diffDay < 7) return `${diffDay} hari lalu`;
	// Pinned to WIB — see the comment in src/lib/date.ts's TIME_ZONE constant.
	return new Date(date).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		timeZone: "Asia/Jakarta",
	});
}

export default function AdminHeader({
	onMobileToggle,
}: {
	onMobileToggle: () => void;
}) {
	const { data: session } = useSession();
	const pathname = usePathname();
	const router = useRouter();

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

	const displayName = session?.user?.name || session?.user?.email || "Admin";
	const avatarInitial = displayName.charAt(0).toUpperCase();
	const isAdmin = session?.user?.role === "ADMIN";

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
			const { notifications, unreadCount } = await getNotifications(
				session.user.id,
				ADMIN_NOTIFICATION_TYPES,
			);
			setNotifications(notifications);
			setUnreadCount(unreadCount);
		} catch (e) {
			console.error(e);
		}
	};

	// Fetch on mount (and whenever the session settles) so the badge reflects
	// reality immediately — previously it only fetched once the bell was
	// clicked, so the count shown before that was never real data.
	useEffect(() => {
		fetchNotifications();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session?.user?.id]);

	const handleNotifItemClick = (n: any) => {
		if (!n.isRead) {
			markAsRead(n.id);
			setNotifications((prev) =>
				prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		}
		const href = resolveNotificationHref(n);
		if (href) router.push(href);
		handleNotifClose();
	};

	const handleMarkAllRead = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!session?.user?.id || unreadCount === 0) return;
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		setUnreadCount(0);
		await markAllAsRead(session.user.id, ADMIN_NOTIFICATION_TYPES);
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
						aria-controls={openNotif ? "notifications-popover" : undefined}
						aria-haspopup="true"
						aria-expanded={openNotif ? "true" : undefined}
						className="!h-9 !w-9 !rounded-lg !border !border-gray-200 hover:!bg-gray-50"
					>
						<Badge
							color="error"
							badgeContent={unreadCount}
							invisible={unreadCount === 0}
							max={9}
						>
							<NotificationsNoneIcon
								fontSize="small"
								className="text-gray-700"
							/>
						</Badge>
					</IconButton>
				</Tooltip>
				<Popover
					anchorEl={anchorElNotif}
					id="notifications-popover"
					open={openNotif}
					onClose={handleNotifClose}
					slotProps={{
						paper: {
							elevation: 0,
							sx: {
								mt: 1.5,
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
								width: 360,
								maxWidth: "calc(100vw - 24px)",
								overflow: "hidden",
								background: "#ffffff",
							},
						},
					}}
					transformOrigin={{ horizontal: "right", vertical: "top" }}
					anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				>
					{/* Header */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							px: 2,
							py: 1.5,
							background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
							borderBottom: "1px solid",
							borderColor: "divider",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Typography sx={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
								Notifikasi
							</Typography>
							{unreadCount > 0 && (
								<Box
									sx={{
										bgcolor: "#0ba976",
										color: "#fff",
										fontSize: 11,
										fontWeight: 700,
										borderRadius: 5,
										px: 0.9,
										py: 0.15,
										lineHeight: 1.5,
									}}
								>
									{unreadCount} baru
								</Box>
							)}
						</Box>
						{unreadCount > 0 && (
							<ButtonBase
								onClick={handleMarkAllRead}
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 0.4,
									px: 1,
									py: 0.4,
									borderRadius: 1.5,
									fontSize: 12,
									fontWeight: 600,
									color: "#0ba976",
									"&:hover": { bgcolor: "rgba(11,169,118,0.1)" },
								}}
							>
								<DoneAllRoundedIcon sx={{ fontSize: 15 }} />
								Tandai semua dibaca
							</ButtonBase>
						)}
					</Box>

					{/* List */}
					{notifications.length === 0 ? (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								gap: 1,
								px: 3,
								py: 5,
							}}
						>
							<Box
								sx={{
									width: 48,
									height: 48,
									borderRadius: "50%",
									bgcolor: "#f1f5f9",
									display: "grid",
									placeItems: "center",
								}}
							>
								<NotificationsOffRoundedIcon sx={{ fontSize: 24, color: "#94a3b8" }} />
							</Box>
							<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
								Tidak ada notifikasi
							</Typography>
							<Typography sx={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
								Pengajuan campaign, pencairan, dan verifikasi baru akan muncul di sini
							</Typography>
						</Box>
					) : (
						<Box sx={{ maxHeight: 380, overflowY: "auto" }}>
							{notifications.slice(0, 8).map((n, i) => {
								const style = NOTIF_TYPE_STYLE[n.type] || DEFAULT_NOTIF_STYLE;
								const Icon = style.icon;
								return (
									<ButtonBase
										key={n.id}
										onClick={() => handleNotifItemClick(n)}
										sx={{
											display: "flex",
											width: "100%",
											textAlign: "left",
											alignItems: "flex-start",
											gap: 1.25,
											py: 1.5,
											px: 2,
											borderTop: i === 0 ? "none" : "1px solid",
											borderColor: "divider",
											bgcolor: n.isRead ? "transparent" : "rgba(11,169,118,0.05)",
											"&:hover": {
												bgcolor: n.isRead
													? "rgba(148,163,184,0.1)"
													: "rgba(11,169,118,0.1)",
											},
										}}
									>
										<Box
											sx={{
												width: 36,
												height: 36,
												borderRadius: "50%",
												bgcolor: style.bg,
												color: style.color,
												display: "grid",
												placeItems: "center",
												flexShrink: 0,
											}}
										>
											<Icon sx={{ fontSize: 18 }} />
										</Box>
										<div className="flex min-w-0 flex-1 flex-col gap-0.5">
											<Typography
												variant="body2"
												sx={{
													fontWeight: n.isRead ? 600 : 700,
													fontSize: 13,
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
												{formatRelativeTime(n.createdAt)}
											</Typography>
										</div>
										{!n.isRead && (
											<Box
												sx={{
													width: 8,
													height: 8,
													borderRadius: "50%",
													bgcolor: "#0ba976",
													flexShrink: 0,
													mt: 0.6,
												}}
											/>
										)}
									</ButtonBase>
								);
							})}
						</Box>
					)}

					{/* Footer */}
					<Box
						sx={{
							borderTop: "1px solid",
							borderColor: "divider",
							bgcolor: "#f8fafc",
						}}
					>
						<ButtonBase
							component={Link}
							href="/notifikasi"
							onClick={handleNotifClose}
							sx={{
								width: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 0.5,
								py: 1.25,
								fontSize: 13,
								fontWeight: 700,
								color: "#0ba976",
							}}
						>
							Lihat semua notifikasi
							<ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
						</ButtonBase>
					</Box>
				</Popover>

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
						<Avatar sx={{ width: 32, height: 32 }}>{avatarInitial}</Avatar>
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
								minWidth: 220,
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
					<Box sx={{ px: 2, py: 1 }}>
						<Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
							{displayName}
						</Typography>
						{session?.user?.email && (
							<Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
								{session.user.email}
							</Typography>
						)}
					</Box>
					<Divider />
					<MenuItem component={Link} href="/profil/akun" onClick={handleProfileClose}>
						<ListItemIcon>
							<PersonOutlineIcon fontSize="small" />
						</ListItemIcon>
						Profil (ganti nama, foto, dll)
					</MenuItem>
					{isAdmin && (
						<MenuItem component={Link} href="/admin/settings" onClick={handleProfileClose}>
							<ListItemIcon>
								<SettingsIcon fontSize="small" />
							</ListItemIcon>
							Pengaturan
						</MenuItem>
					)}
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
