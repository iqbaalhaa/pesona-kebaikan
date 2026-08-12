"use client";

import { StyledTextField } from "@/components/ui/StyledTextField";
import {
	Box,
	Button,
	Paper,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	IconButton,
	InputAdornment,
	LinearProgress,
	Menu,
	MenuItem,
	Pagination,
	Snackbar,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	Tab,
	Typography,
	Alert,
	Avatar,
	Chip,
	useTheme,
	MenuItem as SelectMenuItem,
	Badge,
	TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Add, MoreVert, Search, Edit, Delete, OpenInNew } from "@mui/icons-material";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
	ChangeEvent,
	FormEvent,
	ReactNode,
	useEffect,
	useState,
	useTransition,
} from "react";
import { useRouter } from "next/navigation";
import type { UserStats } from "@/actions/user";
import {
	getUsers,
	createUser,
	updateUser,
	deleteUser,
	getPendingVerificationCount,
	verifyUser,
	rejectUserVerification,
} from "@/actions/user";
import type { Role, AdminPermission } from "@prisma/client";
import { formatDate } from "@/lib/date";
import PermissionChecklist from "@/components/admin/PermissionChecklist";

function Surface({
	children,
	sx,
}: {
	children: ReactNode;
	sx?: any;
}) {
	const t = useTheme();
	return (
		<Paper
			elevation={0}
			sx={{
				borderRadius: 3,
				border: "1px solid",
				borderColor: alpha(t.palette.divider, 0.08),
				boxShadow: `0 10px 28px ${alpha("#000", 0.05)}`,
				...sx,
			}}
		>
			{children}
		</Paper>
	);
}

function StatCard({
	title,
	value,
	icon,
	tone = "primary",
}: {
	title: string;
	value: ReactNode;
	icon: ReactNode;
	tone?: "primary" | "success" | "warning" | "info" | "error";
}) {
	const t = useTheme();
	const toneColor = t.palette[tone].main;

	return (
		<Surface sx={{ p: 2, height: "100%", position: "relative", overflow: "hidden" }}>
			<Box
				sx={{
					position: "absolute",
					top: -70,
					right: -70,
					width: 160,
					height: 160,
					borderRadius: 999,
					background: `radial-gradient(circle, ${alpha(toneColor, 0.16)} 0%, transparent 70%)`,
					filter: "blur(20px)",
					pointerEvents: "none",
				}}
			/>
			<Stack spacing={1.25} sx={{ position: "relative" }}>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: 2.25,
						display: "grid",
						placeItems: "center",
						bgcolor: alpha(toneColor, 0.12),
						color: toneColor,
					}}
				>
					{icon}
				</Box>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700 }}>
						{title}
					</Typography>
					<Typography
						sx={{ mt: 0.25, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}
					>
						{value}
					</Typography>
				</Box>
			</Stack>
		</Surface>
	);
}

type VerificationRequestRow = {
	id: string;
	status: string;
	type: string;
	ktpNumber: string | null;
	ktpName: string | null;
	ktpPhotoUrl: string | null;
	selfieUrl: string | null;
	organizationName: string | null;
	organizationDocUrl: string | null;
	picPhone: string | null;
	notes: string | null;
	createdAt: string | Date;
};

type UserRow = {
	id: string;
	name: string | null;
	email: string;
	role: string;
	permissions?: AdminPermission[];
	createdAt: string | Date;
	verificationRequests?: VerificationRequestRow[];
};

interface UsersClientProps {
	initialUsers: UserRow[];
	initialTotal: number;
	stats: UserStats;
	initialPendingVerificationCount: number;
}

export default function UsersClient({
	initialUsers,
	initialTotal,
	stats,
	initialPendingVerificationCount,
}: UsersClientProps) {
	const [users, setUsers] = useState<UserRow[]>(initialUsers);
	const [total, setTotal] = useState(initialTotal);
	const [tableLoading, setTableLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [rowsPerPage] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
	// Donatur/pemilik campaign vs. pengguna lingkup administrator vs. antrian
	// verifikasi — default "donor" supaya pengguna biasa (mayoritas) yang
	// muncul duluan, bukan admin/staff.
	const [scope, setScope] = useState<"donor" | "administrator" | "verification">("donor");
	const [pendingVerificationCount, setPendingVerificationCount] = useState(
		initialPendingVerificationCount,
	);
	const [reviewUser, setReviewUser] = useState<UserRow | null>(null);
	const [rejectReason, setRejectReason] = useState("");
	const [rejectMode, setRejectMode] = useState(false);
	const [reviewSubmitting, setReviewSubmitting] = useState(false);
	const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
	const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
	const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [newUser, setNewUser] = useState({
		name: "",
		email: "",
		password: "",
		role: "USER" as Role,
		permissions: [] as AdminPermission[],
	});
	const [editUser, setEditUser] = useState({
		id: "",
		name: "",
		email: "",
		role: "USER" as Role,
		permissions: [] as AdminPermission[],
	});

	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	const router = useRouter();

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "info" | "warning" = "info",
	) => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	const loadUsers = async (page: number, query: string, currentScope: typeof scope) => {
		setTableLoading(true);
		try {
			const data =
				currentScope === "verification"
					? await getUsers(query, "all", "pending", page, rowsPerPage, "all")
					: await getUsers(query, "all", "all", page, rowsPerPage, currentScope);
			setUsers(data.users as UserRow[]);
			setTotal(data.total);
		} catch {
			showSnackbar("Gagal memuat pengguna", "error");
		} finally {
			setTableLoading(false);
		}
	};

	const refreshPendingVerificationCount = async () => {
		try {
			setPendingVerificationCount(await getPendingVerificationCount());
		} catch {
			// ignore — badge just stays stale until next successful refresh
		}
	};

	useEffect(() => {
		const t = setTimeout(() => {
			loadUsers(page, searchQuery, scope);
		}, 300);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, searchQuery, scope]);

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPage(1);
		setSearchQuery(event.target.value);
	};

	const handleScopeChange = (
		_event: React.SyntheticEvent,
		value: "donor" | "administrator" | "verification",
	) => {
		setScope(value);
		setPage(1);
	};

	const openReview = (user: UserRow) => {
		setReviewUser(user);
		setRejectMode(false);
		setRejectReason("");
	};

	const closeReview = () => {
		setReviewUser(null);
		setRejectMode(false);
		setRejectReason("");
	};

	const handleApprove = async () => {
		if (!reviewUser) return;
		setReviewSubmitting(true);
		try {
			const res = await verifyUser(reviewUser.id);
			if (res.success) {
				showSnackbar("Verifikasi disetujui", "success");
				closeReview();
				await loadUsers(page, searchQuery, scope);
				await refreshPendingVerificationCount();
			} else {
				showSnackbar(res.error || "Gagal menyetujui verifikasi", "error");
			}
		} finally {
			setReviewSubmitting(false);
		}
	};

	const handleReject = async () => {
		if (!reviewUser) return;
		setReviewSubmitting(true);
		try {
			const res = await rejectUserVerification(reviewUser.id, rejectReason.trim() || undefined);
			if (res.success) {
				showSnackbar("Verifikasi ditolak", "success");
				closeReview();
				await loadUsers(page, searchQuery, scope);
				await refreshPendingVerificationCount();
			} else {
				showSnackbar(res.error || "Gagal menolak verifikasi", "error");
			}
		} finally {
			setReviewSubmitting(false);
		}
	};

	const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
		setPage(value);
	};

	const handleMenuClick = (
		event: React.MouseEvent<HTMLButtonElement>,
		user: UserRow,
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedUser(user);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedUser(null);
	};

	const handleAddUserDialogOpen = () => {
		// Default role follows the active tab: donor tab -> plain USER,
		// administrator tab -> STAFF (the safest non-full-admin starting point).
		setNewUser({
			name: "",
			email: "",
			password: "",
			role: (scope === "administrator" ? "STAFF" : "USER") as Role,
			permissions: [],
		});
		setAddUserDialogOpen(true);
	};

	const handleAddUserDialogClose = () => {
		setAddUserDialogOpen(false);
	};

	const handleEditUserDialogOpen = (user: UserRow) => {
		setEditUser({
			id: user.id,
			name: user.name ?? "",
			email: user.email,
			role: (user.role as Role) ?? ("USER" as Role),
			permissions: user.permissions || [],
		});
		setEditUserDialogOpen(true);
		handleMenuClose();
	};

	const handleEditUserDialogClose = () => {
		setEditUserDialogOpen(false);
	};

	const handleDeleteDialogOpen = (user: UserRow) => {
		setSelectedUser(user);
		setDeleteDialogOpen(true);
		setAnchorEl(null);
	};

	const handleDeleteDialogClose = () => {
		setDeleteDialogOpen(false);
	};

	const handleAddUser = (event: FormEvent) => {
		event.preventDefault();
		startTransition(async () => {
			const res = await createUser({
				name: newUser.name,
				email: newUser.email,
				password: newUser.password,
				role: newUser.role,
				permissions: newUser.permissions,
			});
			if (res.success) {
				showSnackbar("Pengguna berhasil ditambahkan", "success");
				handleAddUserDialogClose();
				await loadUsers(page, searchQuery, scope);
				router.refresh();
			} else {
				showSnackbar(res.error || "Gagal menambahkan pengguna", "error");
			}
		});
	};

	const handleUpdateUser = (event: FormEvent) => {
		event.preventDefault();
		startTransition(async () => {
			const res = await updateUser(editUser.id, {
				name: editUser.name,
				email: editUser.email,
				role: editUser.role,
				permissions: editUser.permissions,
			});
			if (res.success) {
				showSnackbar("Pengguna berhasil diperbarui", "success");
				handleEditUserDialogClose();
				await loadUsers(page, searchQuery, scope);
				router.refresh();
			} else {
				showSnackbar(res.error || "Gagal memperbarui pengguna", "error");
			}
		});
	};

	const handleDeleteUser = () => {
		if (!selectedUser) return;
		const id = selectedUser.id;
		startTransition(async () => {
			const res = await deleteUser(id);
			if (res.success) {
				showSnackbar("Pengguna berhasil dihapus", "success");
				handleDeleteDialogClose();
				await loadUsers(page, searchQuery, scope);
				router.refresh();
			} else {
				showSnackbar(res.error || "Gagal menghapus pengguna", "error");
			}
		});
	};

	return (
		<div>
			<Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
				Manajemen Pengguna
			</Typography>

			<Grid container spacing={2.5} className="mb-4">
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Total Pengguna"
						value={stats.totalUsers}
						tone="primary"
						icon={<PeopleAltRoundedIcon fontSize="small" />}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Pengguna Aktif"
						value={stats.activeUsers}
						tone="success"
						icon={<HowToRegRoundedIcon fontSize="small" />}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Pengguna Baru (30 Hari)"
						value={stats.newUsersLast30Days}
						tone="info"
						icon={<PersonAddAlt1RoundedIcon fontSize="small" />}
					/>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<StatCard
						title="Tingkat Pertumbuhan"
						value={`${stats.growthRate >= 0 ? "+" : ""}${stats.growthRate.toFixed(2)}%`}
						tone={stats.growthRate >= 0 ? "success" : "error"}
						icon={
							stats.growthRate >= 0 ? (
								<TrendingUpRoundedIcon fontSize="small" />
							) : (
								<TrendingDownRoundedIcon fontSize="small" />
							)
						}
					/>
				</Grid>
			</Grid>

			<Tabs
				value={scope}
				onChange={handleScopeChange}
				sx={{
					mb: 2,
					minHeight: 40,
					overflow: "visible",
					"& .MuiTabs-scroller": { overflow: "visible !important" },
					"& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 700, overflow: "visible" },
				}}
			>
				<Tab label="Donatur & Pemilik Campaign" value="donor" />
				<Tab label="Administrator" value="administrator" />
				<Tab
					value="verification"
					label={
						<Badge
							badgeContent={pendingVerificationCount}
							color="error"
							sx={{ "& .MuiBadge-badge": { right: -8, top: -2 } }}
						>
							<Box component="span" sx={{ pr: pendingVerificationCount > 0 ? 1.25 : 0 }}>
								Verifikasi
							</Box>
						</Badge>
					}
				/>
			</Tabs>

			<Stack
				direction={{ xs: "column", sm: "row" }}
				justifyContent="space-between"
				alignItems={{ xs: "stretch", sm: "center" }}
				spacing={1.5}
				sx={{ mb: 2.5 }}
			>
				<StyledTextField
					id="search-users-input-unique"
					name="search_query_users_v1"
					placeholder="Cari nama atau email..."
					value={searchQuery}
					onChange={handleSearchChange}
					sx={{ maxWidth: { sm: 320 } }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
				{scope !== "verification" && (
					<Button
						variant="contained"
						color="primary"
						startIcon={<Add />}
						onClick={handleAddUserDialogOpen}
						sx={{ borderRadius: 999, fontWeight: 700, boxShadow: "none", px: 2.5 }}
					>
						{scope === "administrator" ? "Tambah Administrator" : "Tambah Pengguna"}
					</Button>
				)}
			</Stack>

			<Surface sx={{ overflow: "hidden" }}>
				<Box sx={{ height: 3 }}>
					{tableLoading && <LinearProgress sx={{ height: 3 }} />}
				</Box>
				{scope === "verification" ? (
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "action.hover" } }}>
									<TableCell>Nama</TableCell>
									<TableCell>Email</TableCell>
									<TableCell>Jenis</TableCell>
									<TableCell>Diajukan</TableCell>
									<TableCell align="right">Aksi</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{users.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} align="center" sx={{ py: 6 }}>
											<Stack spacing={1} alignItems="center">
												<VerifiedUserRoundedIcon
													sx={{ fontSize: 36, color: "text.disabled" }}
												/>
												<Typography color="text.secondary">
													Tidak ada pengajuan verifikasi yang menunggu.
												</Typography>
											</Stack>
										</TableCell>
									</TableRow>
								) : (
									users.map((user) => {
										const request = user.verificationRequests?.[0];
										const initial = (user.name || user.email || "?")
											.trim()
											.charAt(0)
											.toUpperCase();
										return (
											<TableRow key={user.id} hover>
												<TableCell>
													<Stack direction="row" spacing={1.5} alignItems="center">
														<Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>
															{initial}
														</Avatar>
														<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
															{user.name || "-"}
														</Typography>
													</Stack>
												</TableCell>
												<TableCell>
													<Typography sx={{ fontSize: 14, color: "text.secondary" }}>
														{user.email}
													</Typography>
												</TableCell>
												<TableCell>
													<Chip
														size="small"
														label={request?.type === "organization" ? "Organisasi" : "Individu"}
														color={request?.type === "organization" ? "secondary" : "default"}
														variant="outlined"
														sx={{ fontWeight: 700, fontSize: 11 }}
													/>
												</TableCell>
												<TableCell>
													<Typography sx={{ fontSize: 14, color: "text.secondary" }}>
														{request ? formatDate(request.createdAt) : "-"}
													</Typography>
												</TableCell>
												<TableCell align="right">
													<Button
														size="small"
														variant="outlined"
														onClick={() => openReview(user)}
														sx={{ borderRadius: 999, fontWeight: 700, textTransform: "none" }}
													>
														Tinjau
													</Button>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</TableContainer>
				) : (
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "action.hover" } }}>
									<TableCell>Nama</TableCell>
									<TableCell>Email</TableCell>
									<TableCell>Role</TableCell>
									<TableCell>Tanggal Bergabung</TableCell>
									<TableCell align="right">Aksi</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{users.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} align="center" sx={{ py: 6 }}>
											<Stack spacing={1} alignItems="center">
												<PersonOutlineRoundedIcon
													sx={{ fontSize: 36, color: "text.disabled" }}
												/>
												<Typography color="text.secondary">
													{searchQuery
														? `Tidak ada pengguna yang cocok dengan "${searchQuery}"`
														: "Belum ada pengguna"}
												</Typography>
											</Stack>
										</TableCell>
									</TableRow>
								) : (
									users.map((user) => {
										const initial = (user.name || user.email || "?")
											.trim()
											.charAt(0)
											.toUpperCase();
										const isAdminRole = user.role === "ADMIN";
										const isStaffRole = user.role === "STAFF";
										return (
											<TableRow
												key={user.id}
												hover
												onClick={() => router.push(`/admin/users/${user.id}`)}
												sx={{ cursor: "pointer" }}
											>
												<TableCell>
													<Stack direction="row" spacing={1.5} alignItems="center">
														<Avatar
															sx={{
																width: 32,
																height: 32,
																fontSize: 13,
																fontWeight: 700,
																bgcolor: isAdminRole
																	? "warning.light"
																	: isStaffRole
																		? "secondary.light"
																		: "primary.light",
															}}
														>
															{initial}
														</Avatar>
														<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
															{user.name || "-"}
														</Typography>
													</Stack>
												</TableCell>
												<TableCell>
													<Typography sx={{ fontSize: 14, color: "text.secondary" }}>
														{user.email}
													</Typography>
												</TableCell>
												<TableCell>
													<Chip
														size="small"
														icon={
															isAdminRole ? (
																<AdminPanelSettingsRoundedIcon fontSize="small" />
															) : isStaffRole ? (
																<BadgeRoundedIcon fontSize="small" />
															) : undefined
														}
														label={
															isStaffRole && user.permissions && user.permissions.length > 0 ? ("STAFF (" + user.permissions.length + ")") : user.role
														}
														color={
															isAdminRole
																? "warning"
																: isStaffRole
																	? "secondary"
																	: "default"
														}
														variant={isAdminRole || isStaffRole ? "filled" : "outlined"}
														sx={{ fontWeight: 700, fontSize: 11 }}
													/>
												</TableCell>
												<TableCell>
													<Typography sx={{ fontSize: 14, color: "text.secondary" }}>
														{formatDate(user.createdAt)}
													</Typography>
												</TableCell>
												<TableCell align="right">
													<IconButton
														onClick={(event) => {
															event.stopPropagation();
															handleMenuClick(event, user);
														}}
													>
														<MoreVert />
													</IconButton>
													<Menu
														anchorEl={anchorEl}
														open={Boolean(anchorEl) && selectedUser?.id === user.id}
														onClose={handleMenuClose}
														onClick={(e) => e.stopPropagation()}
													>
														<MenuItem onClick={() => handleEditUserDialogOpen(user)}>
															<Edit fontSize="small" className="mr-2" />
															Edit
														</MenuItem>
														<MenuItem
															onClick={() => handleDeleteDialogOpen(user)}
															sx={{ color: "error.main" }}
														>
															<Delete fontSize="small" className="mr-2" />
															Hapus
														</MenuItem>
													</Menu>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</Surface>

			<Stack
				direction={{ xs: "column", sm: "row" }}
				justifyContent="space-between"
				alignItems="center"
				spacing={1.5}
				sx={{ mt: 2.5 }}
			>
				<Typography variant="body2" color="text.secondary">
					{total === 0
						? "Tidak ada pengguna"
						: `Menampilkan ${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, total)} dari ${total} pengguna`}
				</Typography>
				<Pagination
					count={Math.max(1, Math.ceil(total / rowsPerPage))}
					page={page}
					onChange={handlePageChange}
					color="primary"
					shape="rounded"
				/>
			</Stack>

			{/* Add User Dialog */}
			<Dialog
				open={isAddUserDialogOpen}
				onClose={handleAddUserDialogClose}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<form onSubmit={handleAddUser}>
					<DialogTitle>Tambah Pengguna</DialogTitle>
					<DialogContent className="flex flex-col gap-4 pt-2">
						<StyledTextField
							label="Nama"
							value={newUser.name}
							onChange={(e) =>
								setNewUser((p) => ({ ...p, name: e.target.value }))
							}
							required
							fullWidth
						/>
						<StyledTextField
							label="Email"
							type="email"
							value={newUser.email}
							onChange={(e) =>
								setNewUser((p) => ({ ...p, email: e.target.value }))
							}
							required
							fullWidth
						/>
						<StyledTextField
							label="Password"
							type="password"
							value={newUser.password}
							onChange={(e) =>
								setNewUser((p) => ({ ...p, password: e.target.value }))
							}
							required
							fullWidth
						/>
						<StyledTextField
							select
							label="Role"
							value={newUser.role}
							onChange={(e) =>
								setNewUser((p) => ({ ...p, role: e.target.value as Role }))
							}
							fullWidth
						>
							<SelectMenuItem value="USER">USER (Donatur)</SelectMenuItem>
							<SelectMenuItem value="STAFF">STAFF (izin custom)</SelectMenuItem>
							<SelectMenuItem value="ADMIN">ADMIN (akses penuh)</SelectMenuItem>
						</StyledTextField>
						{newUser.role === "STAFF" && (
							<PermissionChecklist
								value={newUser.permissions}
								onChange={(next) => setNewUser((p) => ({ ...p, permissions: next }))}
							/>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={handleAddUserDialogClose}>Batal</Button>
						<Button type="submit" variant="contained" disabled={isPending}>
							Simpan
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			{/* Edit User Dialog */}
			<Dialog
				open={isEditUserDialogOpen}
				onClose={handleEditUserDialogClose}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<form onSubmit={handleUpdateUser}>
					<DialogTitle>Edit Pengguna</DialogTitle>
					<DialogContent className="flex flex-col gap-4 pt-2">
						<StyledTextField
							label="Nama"
							value={editUser.name}
							onChange={(e) =>
								setEditUser((p) => ({ ...p, name: e.target.value }))
							}
							required
							fullWidth
						/>
						<StyledTextField
							label="Email"
							type="email"
							value={editUser.email}
							onChange={(e) =>
								setEditUser((p) => ({ ...p, email: e.target.value }))
							}
							required
							fullWidth
						/>
						<StyledTextField
							select
							label="Role"
							value={editUser.role}
							onChange={(e) =>
								setEditUser((p) => ({ ...p, role: e.target.value as Role }))
							}
							fullWidth
						>
							<SelectMenuItem value="USER">USER (Donatur)</SelectMenuItem>
							<SelectMenuItem value="STAFF">STAFF (izin custom)</SelectMenuItem>
							<SelectMenuItem value="ADMIN">ADMIN (akses penuh)</SelectMenuItem>
						</StyledTextField>
						{editUser.role === "STAFF" && (
							<PermissionChecklist
								value={editUser.permissions}
								onChange={(next) => setEditUser((p) => ({ ...p, permissions: next }))}
							/>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={handleEditUserDialogClose}>Batal</Button>
						<Button type="submit" variant="contained" disabled={isPending}>
							Simpan
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={isDeleteDialogOpen}
				onClose={handleDeleteDialogClose}
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle>Konfirmasi Hapus</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Apakah Anda yakin ingin menghapus pengguna{" "}
						<strong>{selectedUser?.name}</strong>?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteDialogClose}>Batal</Button>
					<Button
						onClick={handleDeleteUser}
						color="error"
						variant="contained"
						disabled={isPending}
					>
						Hapus
					</Button>
				</DialogActions>
			</Dialog>

			{/* Verification Review Dialog */}
			<Dialog
				open={!!reviewUser}
				onClose={reviewSubmitting ? undefined : closeReview}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				{reviewUser &&
					(() => {
						const request = reviewUser.verificationRequests?.[0];
						const isOrg = request?.type === "organization";
						return (
							<>
								<DialogTitle>Tinjau Verifikasi</DialogTitle>
								<DialogContent className="flex flex-col gap-3 pt-2">
									<Stack spacing={0.5}>
										<Typography sx={{ fontWeight: 700 }}>{reviewUser.name || "-"}</Typography>
										<Typography variant="body2" color="text.secondary">
											{reviewUser.email}
										</Typography>
									</Stack>
									<Chip
										size="small"
										label={isOrg ? "Organisasi" : "Individu"}
										color={isOrg ? "secondary" : "default"}
										variant="outlined"
										sx={{ alignSelf: "flex-start", fontWeight: 700 }}
									/>
									{request?.ktpNumber && (
										<Typography variant="body2">
											{isOrg ? "Nomor SK Kemenkumham" : "Nomor NIK"}:{" "}
											<strong>{request.ktpNumber}</strong>
										</Typography>
									)}
									{isOrg && request?.ktpName && (
										<Typography variant="body2">
											Penanggung Jawab: <strong>{request.ktpName}</strong>
										</Typography>
									)}
									{isOrg && request?.picPhone && (
										<Typography variant="body2">
											No. HP Penanggung Jawab: <strong>{request.picPhone}</strong>
										</Typography>
									)}
									<Stack direction="row" spacing={1} flexWrap="wrap">
										{isOrg ? (
											<>
												{request?.organizationDocUrl && (
													<Button
														variant="outlined"
														size="small"
														startIcon={<OpenInNew />}
														onClick={() =>
															setPreviewDoc({ url: request.organizationDocUrl!, title: "Dokumen SK Kemenkumham" })
														}
														sx={{ textTransform: "none", borderRadius: 2 }}
													>
														Lihat Dokumen SK
													</Button>
												)}
												{request?.ktpPhotoUrl && (
													<Button
														variant="outlined"
														size="small"
														startIcon={<OpenInNew />}
														onClick={() =>
															setPreviewDoc({ url: request.ktpPhotoUrl!, title: "KTP Penanggung Jawab" })
														}
														sx={{ textTransform: "none", borderRadius: 2 }}
													>
														Lihat KTP Penanggung Jawab
													</Button>
												)}
											</>
										) : (
											<>
												{request?.ktpPhotoUrl && (
													<Button
														variant="outlined"
														size="small"
														startIcon={<OpenInNew />}
														onClick={() =>
															setPreviewDoc({ url: request.ktpPhotoUrl!, title: "Foto KTP" })
														}
														sx={{ textTransform: "none", borderRadius: 2 }}
													>
														Lihat KTP
													</Button>
												)}
												{request?.selfieUrl && (
													<Button
														variant="outlined"
														size="small"
														startIcon={<OpenInNew />}
														onClick={() =>
															setPreviewDoc({ url: request.selfieUrl!, title: "Foto Selfie" })
														}
														sx={{ textTransform: "none", borderRadius: 2 }}
													>
														Lihat Selfie
													</Button>
												)}
											</>
										)}
									</Stack>
									{!request?.ktpPhotoUrl && !request?.organizationDocUrl && (
										<Alert severity="warning" sx={{ borderRadius: 2 }}>
											Tidak ada dokumen yang diupload untuk pengajuan ini.
										</Alert>
									)}
									{rejectMode && (
										<TextField
											label="Alasan penolakan (opsional)"
											multiline
											rows={3}
											fullWidth
											value={rejectReason}
											onChange={(e) => setRejectReason(e.target.value)}
											placeholder="Contoh: Foto KTP buram, data tidak sesuai..."
										/>
									)}
								</DialogContent>
								<DialogActions sx={{ p: 2.5 }}>
									{rejectMode ? (
										<>
											<Button onClick={() => setRejectMode(false)} disabled={reviewSubmitting}>
												Batal
											</Button>
											<Button
												variant="contained"
												color="error"
												startIcon={<CancelRoundedIcon />}
												onClick={handleReject}
												disabled={reviewSubmitting}
												sx={{ borderRadius: 999 }}
											>
												{reviewSubmitting ? "Memproses..." : "Tolak Verifikasi"}
											</Button>
										</>
									) : (
										<>
											<Button onClick={closeReview} disabled={reviewSubmitting}>
												Tutup
											</Button>
											<Button
												color="error"
												onClick={() => setRejectMode(true)}
												disabled={reviewSubmitting}
											>
												Tolak
											</Button>
											<Button
												variant="contained"
												color="success"
												startIcon={<CheckCircleRoundedIcon />}
												onClick={handleApprove}
												disabled={reviewSubmitting}
												sx={{ borderRadius: 999 }}
											>
												{reviewSubmitting ? "Memproses..." : "Setujui"}
											</Button>
										</>
									)}
								</DialogActions>
							</>
						);
					})()}
			</Dialog>

			{/* Document Preview Dialog */}
			<Dialog
				open={!!previewDoc}
				onClose={() => setPreviewDoc(null)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					{previewDoc?.title}
					<Button
						size="small"
						startIcon={<OpenInNew />}
						href={previewDoc?.url}
						target="_blank"
						sx={{ textTransform: "none" }}
					>
						Buka di tab baru
					</Button>
				</DialogTitle>
				<DialogContent
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						bgcolor: "action.hover",
						p: 2,
					}}
				>
					{previewDoc?.url.toLowerCase().endsWith(".pdf") ? (
						<Box
							component="iframe"
							src={previewDoc.url}
							sx={{ width: "100%", height: "70vh", border: "none", borderRadius: 1 }}
						/>
					) : (
						<Box
							component="img"
							src={previewDoc?.url}
							alt={previewDoc?.title}
							sx={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 1, objectFit: "contain" }}
						/>
					)}
				</DialogContent>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					variant="filled"
					sx={{ borderRadius: 999, fontWeight: 700 }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</div>
	);
}
