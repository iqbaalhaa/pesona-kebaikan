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
	TextField,
	InputAdornment,
	Chip,
	Snackbar,
	Alert,
	Tooltip,
	Avatar,
	Tabs,
	Tab,
	Pagination,
	Grid,
	Card,
	CardContent,
	Stack,
	alpha,
	useTheme,
	FormControl,
	Select,
	Checkbox, // Add Checkbox
} from "@mui/material";
import {
	Add as AddIcon,
	Search as SearchIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Person as PersonIcon,
	Group as GroupIcon,
	AdminPanelSettings as AdminIcon,
	FilterList as FilterListIcon,
	Phone as PhoneIcon,
	CalendarToday as CalendarIcon,
	MoreVert as MoreVertIcon,
	LockReset as LockResetIcon,
	Warning as WarningIcon,
	Email as EmailIcon,
	Visibility as VisibilityIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	Download as DownloadIcon,
	PictureAsPdf as PdfIcon,
	TableView as ExcelIcon,
	PlaylistAddCheck as BulkIcon, // Add Bulk Icon
} from "@mui/icons-material";
import {
	getUsers,
	createUser,
	updateUser,
	deleteUser,
	resetPassword,
	verifyUser,
	unverifyUser,
	rejectUserVerification,
	bulkVerifyUsers, // Add bulkVerifyUsers
	bulkUnverifyUsers, // Add bulkUnverifyUsers
	bulkDeleteUsers, // Add bulkDeleteUsers
	getAllUserIds,
} from "@/actions/user";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Menu, MenuItem } from "@mui/material";

interface User {
	id: string;
	name: string | null;
	email: string;
	phone: string | null;
	phoneVerified: Date | null;
	role: string;
	createdAt: Date;
	image?: string | null;
	emailVerified: Date | null;
	verifiedAt: Date | null;
	verifiedAs: "personal" | "organization" | null;
	verificationRequests?: {
		status: string;
		ktpNumber?: string | null;
		ktpPhotoUrl?: string | null;
		type: string;
		createdAt: Date;
	}[];
}

interface UsersClientProps {
	initialUsers: any[];
	initialTotal: number;
	stats: { total: number; admins: number; users: number };
}

export default function UsersClient({
	initialUsers,
	initialTotal,
	stats,
}: UsersClientProps) {
	const router = useRouter();
	const theme = useTheme();

	// Data States
	const [users, setUsers] = useState<User[]>(initialUsers);
	const [total, setTotal] = useState(initialTotal);
	const [loading, setLoading] = useState(false);

	// Filter & Search States
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [filterRole, setFilterRole] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");

	// Bulk Action States
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [openBulkDialog, setOpenBulkDialog] = useState(false);
	const [bulkActionType, setBulkActionType] = useState<
		"verify" | "unverify" | "delete" | null
	>(null);

	// Dialog States
	const [openDialog, setOpenDialog] = useState(false);
	const [openResetDialog, setOpenResetDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [openVerificationDialog, setOpenVerificationDialog] = useState(false);
	const [openConfirmVerifyDialog, setOpenConfirmVerifyDialog] = useState(false);
	const [selectedUserForVerification, setSelectedUserForVerification] =
		useState<User | null>(null);
	const [verificationAction, setVerificationAction] = useState<
		"verify" | "unverify" | "reject"
	>("verify");
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	// Export Menu State
	const [anchorElExport, setAnchorElExport] = useState<null | HTMLElement>(
		null,
	);
	const openExportMenu = Boolean(anchorElExport);

	// Form States
	const [currentUser, setCurrentUser] = useState<
		Partial<User & { password?: string }>
	>({});
	const [newPassword, setNewPassword] = useState("");
	const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	// Feedback State
	const [toast, setToast] = useState<{
		open: boolean;
		msg: string;
		severity: "success" | "error";
	}>({ open: false, msg: "", severity: "success" });

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchUsers();
		}, 500);
		return () => clearTimeout(timer);
	}, [search, filterRole, filterStatus, page]);

	const handleSelectAll = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		if (event.target.checked) {
			// Select all users across all pages matching current filter
			setLoading(true);
			try {
				const result = await getAllUserIds(search, filterRole, filterStatus);
				if (result.success && result.ids) {
					setSelectedIds(result.ids);
					showToast(
						`Berhasil memilih semua ${result.ids.length} user`,
						"success",
					);
				} else {
					showToast("Gagal memilih semua user", "error");
				}
			} catch (error) {
				showToast("Terjadi kesalahan saat memilih semua user", "error");
			} finally {
				setLoading(false);
			}
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectOne = (
		event: React.ChangeEvent<HTMLInputElement>,
		id: string,
	) => {
		const selectedIndex = selectedIds.indexOf(id);
		let newSelected: string[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selectedIds, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selectedIds.slice(1));
		} else if (selectedIndex === selectedIds.length - 1) {
			newSelected = newSelected.concat(selectedIds.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selectedIds.slice(0, selectedIndex),
				selectedIds.slice(selectedIndex + 1),
			);
		}
		setSelectedIds(newSelected);
	};

	const handleBulkAction = async () => {
		if (selectedIds.length === 0 || !bulkActionType) return;
		setLoading(true);
		try {
			let result;
			if (bulkActionType === "verify") {
				result = await bulkVerifyUsers(selectedIds);
			} else if (bulkActionType === "unverify") {
				result = await bulkUnverifyUsers(selectedIds);
			} else if (bulkActionType === "delete") {
				result = await bulkDeleteUsers(selectedIds);
			}

			if (result?.success) {
				let actionText = "memverifikasi";
				if (bulkActionType === "unverify") actionText = "menonaktifkan";
				else if (bulkActionType === "delete") actionText = "menghapus";

				showToast(
					`Berhasil ${actionText} ${result.count} user. ${result.error || ""}`,
					result.error ? "warning" : "success",
				);
				fetchUsers();
				setSelectedIds([]); // Clear selection
			} else {
				showToast(result?.error || "Gagal melakukan aksi massal", "error");
			}
		} catch (error) {
			showToast("Terjadi kesalahan saat aksi massal", "error");
		} finally {
			setLoading(false);
			setOpenBulkDialog(false);
			setBulkActionType(null);
		}
	};

	const handleOpenBulkDialog = (type: "verify" | "unverify" | "delete") => {
		setBulkActionType(type);
		setOpenBulkDialog(true);
	};

	// Handlers for fetching data
	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await getUsers(search, filterRole, filterStatus, page);
			setUsers(res.users as any);
			setTotal(res.total);
		} catch (error) {
			console.error(error);
			showToast("Gagal mengambil User", "error");
		} finally {
			setLoading(false);
		}
	};

	// Handlers
	const handleOpenCreate = () => {
		setCurrentUser({
			name: "",
			email: "",
			phone: "",
			role: "USER",
			password: "",
		});
		setDialogMode("create");
		setOpenDialog(true);
	};

	const handleOpenEdit = (user: User) => {
		setCurrentUser({ ...user }); // Copy object to avoid reference issues
		setDialogMode("edit");
		setOpenDialog(true);
	};

	const handleOpenResetPassword = (user: User) => {
		setCurrentUser({ ...user });
		setNewPassword("");
		setOpenResetDialog(true);
	};

	const handleOpenDelete = (user: User) => {
		setUserToDelete(user);
		setOpenDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		if (!userToDelete) return;

		const res = await deleteUser(userToDelete.id);
		if (res.success) {
			showToast("User berhasil dihapus", "success");
			fetchUsers();
			router.refresh();
		} else {
			showToast(res.error || "Gagal menghapus User", "error");
		}
		setOpenDeleteDialog(false);
		setUserToDelete(null);
	};

	const handleOpenVerification = (user: User) => {
		setSelectedUserForVerification(user);
		setOpenVerificationDialog(true);
	};

	const handleOpenConfirmVerify = () => {
		if (selectedUserForVerification?.verifiedAt) {
			setVerificationAction("unverify");
		} else {
			setVerificationAction("verify");
		}
		setOpenConfirmVerifyDialog(true);
	};

	const handleConfirmVerify = async () => {
		if (!selectedUserForVerification) return;

		let res;
		if (verificationAction === "verify") {
			res = await verifyUser(selectedUserForVerification.id);
		} else if (verificationAction === "reject") {
			res = await rejectUserVerification(selectedUserForVerification.id);
		} else {
			res = await unverifyUser(selectedUserForVerification.id);
		}

		if (res.success) {
			let successMsg = "";
			if (verificationAction === "verify")
				successMsg = "User berhasil diverifikasi";
			else if (verificationAction === "reject")
				successMsg = "Verifikasi user ditolak dan data dihapus";
			else successMsg = "User berhasil dibatalkan verifikasinya";

			showToast(successMsg, "success");
			setOpenConfirmVerifyDialog(false);
			setOpenVerificationDialog(false);
			fetchUsers(); // Refresh list
			router.refresh();
		} else {
			showToast(res.error || "Gagal memproses User", "error");
		}
	};

	const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElExport(event.currentTarget);
	};

	const handleExportClose = () => {
		setAnchorElExport(null);
	};

	const handleExportPDF = () => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.width;

		// 1. Header
		// Title
		doc.setFontSize(18);
		doc.setFont("helvetica", "bold");
		doc.text("PESONA KEBAIKAN", pageWidth / 2, 15, { align: "center" });

		// Motto
		doc.setFontSize(10);
		doc.setFont("helvetica", "italic");
		doc.text('"Menebar Kebaikan, Menuai Keberkahan"', pageWidth / 2, 22, {
			align: "center",
		});

		// Horizontal Line
		doc.setLineWidth(0.5);
		doc.line(15, 25, pageWidth - 15, 25);

		// Report Title
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("Laporan User Pesona Kebaikan", pageWidth / 2, 35, {
			align: "center",
		});

		// 2. Table
		const tableData = users.map((user) => [
			user.name || "-",
			user.email,
			user.phone || "-",
			user.role,
			user.emailVerified ? "Verified" : "Unverified",
			new Date(user.createdAt).toLocaleDateString("id-ID"),
		]);

		autoTable(doc, {
			head: [
				["Nama", "Email", "No. Telepon", "Role", "Status", "Tanggal Bergabung"],
			],
			body: tableData,
			startY: 40,
			styles: { fontSize: 9 },
			headStyles: { fillColor: [41, 128, 185], halign: "center" },
		});

		// 3. Signature (Tertanda)
		// Get final Y position of table
		const finalY = (doc as any).lastAutoTable.finalY || 40;

		// Check if we need a new page for signature
		let signatureY = finalY + 20;
		if (signatureY > 270) {
			doc.addPage();
			signatureY = 20;
		}

		const date = new Date().toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});

		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");

		// Right aligned signature block
		const rightMargin = pageWidth - 20;

		doc.text(`Jakarta, ${date}`, rightMargin, signatureY, { align: "right" });
		doc.text("Tertanda,", rightMargin, signatureY + 6, { align: "right" });

		// Space for signature
		doc.text("( Admin Pesona Kebaikan )", rightMargin, signatureY + 35, {
			align: "right",
		});

		doc.save("laporan_User_pesona_kebaikan.pdf");
		handleExportClose();
	};

	const handleExportExcel = () => {
		const workSheet = XLSX.utils.json_to_sheet(
			users.map((user) => ({
				Nama: user.name || "-",
				Email: user.email,
				"No. Telepon": user.phone || "-",
				Peran: user.role,
				Status: user.verifiedAt
					? `Terverifikasi (${user.verifiedAs})`
					: "Belum terverifikasi",
				Bergabung: new Date(user.createdAt).toLocaleDateString("id-ID"),
			})),
		);

		const workBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workBook, workSheet, "User");

		XLSX.writeFile(workBook, "data_User.xlsx");
		handleExportClose();
	};

	const handleSave = async () => {
		if (!currentUser.name) {
			showToast("Nama wajib diisi", "error");
			return;
		}
		if (!currentUser.email) {
			showToast("Email wajib diisi", "error");
			return;
		}

		if (dialogMode === "create" && !currentUser.password) {
			showToast("Kata sandi wajib untuk User baru", "error");
			return;
		}

		try {
			let res;
			if (dialogMode === "create") {
				res = await createUser({
					name: String(currentUser.name).trim(),
					email: String(currentUser.email).trim(),
					phone: currentUser.phone
						? String(currentUser.phone).trim()
						: undefined,
					role: (currentUser.role as any) || "USER",
					password: String(currentUser.password),
				});
			} else {
				res = await updateUser(currentUser.id!, {
					name: currentUser.name ? String(currentUser.name).trim() : undefined,
					email: currentUser.email
						? String(currentUser.email).trim()
						: undefined,
					phone: currentUser.phone
						? String(currentUser.phone).trim()
						: undefined,
					role: currentUser.role as any,
					password: currentUser.password
						? String(currentUser.password)
						: undefined,
				});
			}

			if (res.success) {
				showToast(
					dialogMode === "create"
						? "User berhasil dibuat"
						: "User berhasil diperbarui",
					"success",
				);
				setOpenDialog(false);
				fetchUsers();
				router.refresh();
			} else {
				showToast(
					res.error ||
						(dialogMode === "create"
							? "Gagal membuat User"
							: "Gagal memperbarui User"),
					"error",
				);
			}
		} catch (error) {
			showToast("Terjadi kesalahan", "error");
		}
	};

	const handleResetPasswordSubmit = async () => {
		if (!newPassword) {
			showToast("Kata sandi baru wajib diisi", "error");
			return;
		}

		const res = await resetPassword(currentUser.id!, newPassword);
		if (res.success) {
			showToast("Kata sandi berhasil diatur ulang", "success");
			setOpenResetDialog(false);
		} else {
			showToast(res.error || "Gagal mengatur ulang kata sandi", "error");
		}
	};

	const showToast = (msg: string, severity: "success" | "error") => {
		setToast({ open: true, msg, severity });
	};

	// Improved Stats Card
	const StatCard = ({
		title,
		value,
		icon,
		color,
		gradient,
	}: {
		title: string;
		value: string | number;
		icon: React.ReactNode;
		color: string;
		gradient: string;
	}) => (
		<Card
			elevation={0}
			sx={{
				height: "100%",
				borderRadius: 3,
				bgcolor: "white",
				border: "1px solid",
				borderColor: "divider",
				position: "relative",
				overflow: "hidden",
				transition: "transform 0.2s, box-shadow 0.2s",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.1)",
				},
			}}
		>
			<Box
				sx={{
					position: "absolute",
					top: 0,
					right: 0,
					width: "100px",
					height: "100%",
					background: gradient,
					opacity: 0.1,
					transform: "skewX(-20deg) translateX(20px)",
				}}
			/>
			<CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
					}}
				>
					<Box>
						<Typography
							variant="body2"
							fontWeight={600}
							color="text.secondary"
							sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}
						>
							{title}
						</Typography>
						<Typography variant="h4" fontWeight={800} sx={{ color: "#0f172a" }}>
							{value}
						</Typography>
					</Box>
					<Box
						sx={{
							p: 1.5,
							borderRadius: 2,
							background: gradient,
							color: "white",
							boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
							display: "flex",
						}}
					>
						{icon}
					</Box>
				</Box>
			</CardContent>
		</Card>
	);

	return (
		<Box sx={{ pb: 4, maxWidth: 1040, mx: "auto", px: { xs: 3, lg: 0 } }}>
			{/* Header Section */}
			<Box sx={{ mb: 5 }}>
				<Typography
					variant="h4"
					fontWeight={800}
					sx={{ color: "#1e293b", mb: 1 }}
				>
					Manajemen User
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Kelola akses sistem, peran, dan akun User.
				</Typography>
			</Box>

			{/* Stats Cards */}
			<Box
				sx={{
					display: "grid",
					gap: 3,
					gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
					mb: 5,
				}}
			>
				<Box>
					<StatCard
						title="Total User"
						value={stats.total}
						icon={<GroupIcon fontSize="large" />}
						color="#3b82f6"
						gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
					/>
				</Box>
				<Box>
					<StatCard
						title="Administrator"
						value={stats.admins}
						icon={<AdminIcon fontSize="large" />}
						color="#10b981"
						gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
					/>
				</Box>
				<Box>
					<StatCard
						title="User Standar"
						value={stats.users}
						icon={<PersonIcon fontSize="large" />}
						color="#8b5cf6"
						gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
					/>
				</Box>
			</Box>

			{/* Controls & Table */}
			<Paper
				elevation={0}
				sx={{
					borderRadius: 3,
					border: "1px solid rgba(15,23,42,.10)",
					overflow: "hidden",
					width: "100%", // Changed from maxWidth: 1040 to width: 100%
					mx: "auto",
				}}
			>
				{/* Toolbar */}
				{selectedIds.length > 0 ? (
					<Box
						sx={{
							px: 3,
							py: 2,
							borderBottom: "1px solid rgba(15,23,42,.08)",
							bgcolor: alpha(theme.palette.primary.main, 0.08),
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 2,
						}}
					>
						<Typography variant="subtitle1" fontWeight={600} color="primary">
							{selectedIds.length} user terpilih
						</Typography>
						<Stack direction="row" spacing={2}>
							<Button
								variant="contained"
								startIcon={<DeleteIcon />}
								onClick={() => handleOpenBulkDialog("delete")}
								sx={{
									borderRadius: 2,
									textTransform: "none",
									fontWeight: 600,
									bgcolor: "white",
									color: "error.main",
									"&:hover": {
										bgcolor: "error.50",
									},
								}}
							>
								Hapus Massal
							</Button>
							<Button
								variant="contained"
								startIcon={<CancelIcon />}
								onClick={() => handleOpenBulkDialog("unverify")}
								sx={{
									borderRadius: 2,
									textTransform: "none",
									fontWeight: 600,
									bgcolor: "black",
									color: "white",
									"&:hover": {
										bgcolor: "#333",
									},
								}}
							>
								Nonaktifkan Massal
							</Button>
							<Button
								variant="contained"
								color="primary"
								startIcon={<BulkIcon />}
								onClick={() => handleOpenBulkDialog("verify")}
								sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
							>
								Verifikasi Massal
							</Button>
						</Stack>
					</Box>
				) : (
					<Box
						sx={{
							px: 3,
							py: 2,
							borderBottom: "1px solid rgba(15,23,42,.08)",
							bgcolor: "rgba(255,255,255,.66)",
							display: "flex",
							flexWrap: "wrap", // Allow wrapping
							alignItems: "center",
							justifyContent: "space-between",
							gap: 2,
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								flexWrap: "wrap",
							}}
						>
							<Tabs
								value={filterRole}
								onChange={(_, v) => {
									setFilterRole(v);
									setPage(1);
								}}
								variant="scrollable"
								scrollButtons="auto"
								sx={{
									"& .MuiTab-root": {
										minHeight: 38, // Reduced height
										textTransform: "none",
										fontWeight: 600,
										borderRadius: 2,
										mr: 1,
										fontSize: 13, // Reduced font size
									},
									"& .Mui-selected": {
										bgcolor: alpha(theme.palette.primary.main, 0.1),
									},
									"& .MuiTabs-indicator": { display: "none" },
								}}
							>
								<Tab label="Semua User" value="all" />
								<Tab label="Admin" value="admin" />
								<Tab label="User" value="user" />
							</Tabs>

							{/* Status Filter */}
							<FormControl size="small" sx={{ minWidth: 150 }}>
								<Select
									value={filterStatus}
									onChange={(e) => {
										setFilterStatus(e.target.value);
										setPage(1);
									}}
									displayEmpty
									sx={{
										height: 38, // Match Tab height
										borderRadius: 2,
										bgcolor: "background.paper",
										fontSize: 13,
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "rgba(15,23,42,.2)",
										},
									}}
								>
									<MenuItem value="all" sx={{ fontSize: 13 }}>
										Semua Status
									</MenuItem>
									<MenuItem value="pending" sx={{ fontSize: 13 }}>
										Menunggu Verifikasi
									</MenuItem>
									<MenuItem value="verified" sx={{ fontSize: 13 }}>
										Terverifikasi
									</MenuItem>
									<MenuItem value="unverified" sx={{ fontSize: 13 }}>
										Belum Terverifikasi
									</MenuItem>
								</Select>
							</FormControl>
						</Box>

						<Stack
							direction="row"
							spacing={1.5} // Reduced spacing
							sx={{
								width: { xs: "100%", md: "auto" },
								flexWrap: "wrap",
								gap: 1,
							}} // Wrap buttons if needed
						>
							<Box
								component="form"
								noValidate
								autoComplete="off"
								onSubmit={(e) => e.preventDefault()}
							>
								<TextField
									id="search-users-input-unique"
									name="search_query_users_v1"
									placeholder="Cari User..."
									size="small"
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
										setPage(1);
									}}
									autoComplete="off"
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon
													fontSize="small"
													sx={{ color: "text.secondary" }}
												/>
											</InputAdornment>
										),
									}}
									sx={{
										width: { xs: "100%", md: 250 },
										"& .MuiOutlinedInput-root": {
											borderRadius: 3,
											bgcolor: "background.paper",
										},
									}}
								/>
							</Box>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={handleOpenCreate}
								sx={{
									borderRadius: 3,
									textTransform: "none",
									fontWeight: 700,
									boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
									px: 3,
								}}
							>
								Tambah User
							</Button>
							<Button
								variant="outlined"
								startIcon={<DownloadIcon />}
								onClick={handleExportClick}
								sx={{
									borderRadius: 3,
									textTransform: "none",
									fontWeight: 700,
									px: 3,
								}}
							>
								Ekspor
							</Button>
							<Menu
								anchorEl={anchorElExport}
								open={openExportMenu}
								onClose={handleExportClose}
								PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 150 } }}
							>
								<MenuItem onClick={handleExportPDF} sx={{ gap: 1.5, py: 1.5 }}>
									<PdfIcon color="error" fontSize="small" />
									<Typography variant="body2" fontWeight={500}>
										Ekspor sebagai PDF
									</Typography>
								</MenuItem>
								<MenuItem
									onClick={handleExportExcel}
									sx={{ gap: 1.5, py: 1.5 }}
								>
									<ExcelIcon color="success" fontSize="small" />
									<Typography variant="body2" fontWeight={500}>
										Ekspor sebagai Excel
									</Typography>
								</MenuItem>
							</Menu>
						</Stack>
					</Box>
				)}

				{/* Table */}
				<TableContainer sx={{ overflowX: "auto" }}>
					<Table>
						<TableHead sx={{ bgcolor: "grey.50" }}>
							<TableRow>
								<TableCell sx={{ py: 1.5, pl: 3, width: 60 }}>
									<Checkbox
										indeterminate={
											selectedIds.length > 0 && selectedIds.length < total
										}
										checked={total > 0 && selectedIds.length === total}
										onChange={handleSelectAll}
										inputProps={{ "aria-label": "select all users" }}
									/>
								</TableCell>
								<TableCell
									sx={{
										py: 1.5,
										fontWeight: 700,
										color: "text.secondary",
										fontSize: 12.5,
									}}
								>
									User
								</TableCell>
								<TableCell
									sx={{
										py: 1.5,
										fontWeight: 700,
										color: "text.secondary",
										fontSize: 12.5,
									}}
								>
									Peran
								</TableCell>
								<TableCell
									sx={{
										py: 1.5,
										fontWeight: 700,
										color: "text.secondary",
										fontSize: 12.5,
									}}
								>
									Status
								</TableCell>
								<TableCell
									sx={{
										py: 1.5,
										fontWeight: 700,
										color: "text.secondary",
										fontSize: 12.5,
									}}
								>
									Kontak
								</TableCell>
								<TableCell
									sx={{
										py: 1.5,
										fontWeight: 700,
										color: "text.secondary",
										fontSize: 12.5,
									}}
								>
									Tanggal Bergabung
								</TableCell>
								<TableCell
									align="right"
									sx={{
										py: 1.5,
										pr: 3,
										fontWeight: 700,
										color: "text.secondary",
										fontSize: 12.5,
									}}
								>
									Tindakan
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 10 }}>
										<Typography color="text.secondary" sx={{ fontSize: 13 }}>
											Memuat User...
										</Typography>
									</TableCell>
								</TableRow>
							) : users.length > 0 ? (
								users.map((user) => (
									<TableRow
										key={user.id}
										hover
										onClick={() => router.push(`/admin/users/${user.id}`)}
										sx={{ cursor: "pointer" }}
									>
										<TableCell
											sx={{ pl: 3 }}
											onClick={(e) => e.stopPropagation()}
										>
											<Checkbox
												checked={selectedIds.indexOf(user.id) !== -1}
												onChange={(event) => handleSelectOne(event, user.id)}
												inputProps={{ "aria-label": "select user" }}
											/>
										</TableCell>
										<TableCell>
											<Stack direction="row" spacing={2} alignItems="center">
												<Avatar
													src={user.image || undefined}
													sx={{
														width: 40,
														height: 40,
														bgcolor:
															user.role === "ADMIN"
																? "primary.main"
																: "secondary.main",
														fontSize: 16,
														fontWeight: 700,
													}}
												>
													{user.name?.charAt(0).toUpperCase() || "U"}
												</Avatar>
												<Box>
													<Typography
														variant="subtitle2"
														fontWeight={700}
														sx={{ color: "#0f172a", fontSize: 13 }}
													>
														{user.name || "No Name"}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 0.5,
															fontSize: 11.5,
														}}
													>
														<EmailIcon sx={{ fontSize: 12 }} /> {user.email}
													</Typography>
												</Box>
											</Stack>
										</TableCell>
										<TableCell>
											<Chip
												label={user.role}
												size="small"
												color={user.role === "ADMIN" ? "primary" : "default"}
												sx={{
													fontWeight: 600,
													borderRadius: 2,
													height: 24,
													fontSize: 11.5,
												}}
											/>
										</TableCell>
										<TableCell>
											{user.verifiedAt ? (
												<Tooltip
													title={`Terverifikasi pada ${new Date(user.verifiedAt).toLocaleDateString("id-ID")} sebagai ${user.verifiedAs}`}
												>
													<Chip
														onClick={(e) => {
															e.stopPropagation();
															handleOpenVerification(user);
														}}
														icon={
															<CheckCircleIcon
																sx={{ fontSize: "14px !important" }}
															/>
														}
														label={`Terverifikasi (${user.verifiedAs})`}
														size="small"
														color="success"
														variant="outlined"
														sx={{
															fontWeight: 600,
															borderRadius: 2,
															height: 24,
															fontSize: 11.5,
															border: "1px solid",
															borderColor: "success.main",
															bgcolor: alpha(theme.palette.success.main, 0.05),
															cursor: "pointer",
														}}
													/>
												</Tooltip>
											) : user.verificationRequests?.[0]?.status ===
											  "PENDING" ? (
												<Tooltip title="Menunggu verifikasi admin">
													<Chip
														onClick={(e) => {
															e.stopPropagation();
															handleOpenVerification(user);
														}}
														icon={
															<WarningIcon
																sx={{ fontSize: "14px !important" }}
															/>
														}
														label="Menunggu Verifikasi"
														size="small"
														color="warning"
														variant="outlined"
														sx={{
															fontWeight: 600,
															borderRadius: 2,
															height: 24,
															fontSize: 11.5,
															border: "1px solid",
															borderColor: "warning.main",
															bgcolor: alpha(theme.palette.warning.main, 0.05),
															cursor: "pointer",
														}}
													/>
												</Tooltip>
											) : (
												<Tooltip title="Klik untuk verifikasi">
													<Chip
														onClick={(e) => {
															e.stopPropagation();
															handleOpenVerification(user);
														}}
														icon={
															<CancelIcon
																sx={{ fontSize: "14px !important" }}
															/>
														}
														label="Belum terverifikasi"
														size="small"
														color="default"
														variant="outlined"
														sx={{
															fontWeight: 600,
															borderRadius: 2,
															height: 24,
															fontSize: 11.5,
															cursor: "pointer",
														}}
													/>
												</Tooltip>
											)}
										</TableCell>
										<TableCell>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ fontSize: 12.5 }}
											>
												{user.phone || "-"}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ fontSize: 12.5 }}
											>
												{new Date(user.createdAt).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "short",
													year: "numeric",
												})}
											</Typography>
										</TableCell>
										<TableCell align="right" sx={{ pr: 3 }}>
											<Stack
												direction="row"
												spacing={1}
												justifyContent="flex-end"
											>
												<Tooltip title="Atur Ulang Kata Sandi">
													<IconButton
														size="small"
														onClick={(e) => {
															e.stopPropagation();
															handleOpenResetPassword(user);
														}}
														sx={{
															color: "warning.main",
															bgcolor: alpha(theme.palette.warning.main, 0.1),
														}}
													>
														<LockResetIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Edit">
													<IconButton
														size="small"
														onClick={(e) => {
															e.stopPropagation();
															handleOpenEdit(user);
														}}
														sx={{
															color: "primary.main",
															bgcolor: alpha(theme.palette.primary.main, 0.1),
														}}
													>
														<EditIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Hapus">
													<IconButton
														size="small"
														onClick={(e) => {
															e.stopPropagation();
															handleOpenDelete(user);
														}}
														sx={{
															color: "error.main",
															bgcolor: alpha(theme.palette.error.main, 0.1),
														}}
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 8 }}>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												opacity: 0.5,
											}}
										>
											<GroupIcon sx={{ fontSize: 40, mb: 1 }} />
											<Typography sx={{ fontSize: 13 }}>
												Tidak ada User
											</Typography>
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>

				{/* Pagination */}
				<Box
					sx={{
						p: 2,
						borderTop: "1px solid",
						borderColor: "divider",
						display: "flex",
						justifyContent: "center",
					}}
				>
					<Pagination
						count={Math.ceil(total / 10)}
						page={page}
						onChange={(_, p) => setPage(p)}
						color="primary"
						shape="rounded"
					/>
				</Box>
			</Paper>

			{/* Create/Edit Dialog */}
			<Dialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: 4 } }}
			>
				<DialogTitle
					sx={{
						fontWeight: 800,
						borderBottom: "1px solid",
						borderColor: "divider",
					}}
				>
					{dialogMode === "create" ? "Tambah User Baru" : "Edit User"}
				</DialogTitle>
				<DialogContent sx={{ pt: 4 }}>
					<Box component="form" autoComplete="off">
						<Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
							<Avatar
								src={currentUser.image || undefined}
								sx={{
									width: 80,
									height: 80,
									bgcolor: "primary.main",
									fontSize: 32,
									fontWeight: 700,
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								}}
							>
								{currentUser.name?.charAt(0).toUpperCase() || "U"}
							</Avatar>
						</Box>
						<Stack spacing={3} sx={{ mt: 2 }}>
							<TextField
								label="Nama Lengkap"
								fullWidth
								value={currentUser.name || ""}
								onChange={(e) =>
									setCurrentUser({ ...currentUser, name: e.target.value })
								}
								variant="outlined"
								InputProps={{ sx: { borderRadius: 3 } }}
							/>
							<TextField
								label="Alamat Email"
								fullWidth
								type="email"
								value={currentUser.email || ""}
								onChange={(e) =>
									setCurrentUser({ ...currentUser, email: e.target.value })
								}
								variant="outlined"
								InputProps={{ sx: { borderRadius: 3 } }}
							/>
							{dialogMode === "create" && (
								<TextField
									label="Kata Sandi"
									fullWidth
									type="password"
									value={currentUser.password || ""}
									onChange={(e) =>
										setCurrentUser({ ...currentUser, password: e.target.value })
									}
									variant="outlined"
									InputProps={{ sx: { borderRadius: 3 } }}
								/>
							)}
							<TextField
								label="Nomor Telepon"
								fullWidth
								value={currentUser.phone || ""}
								onChange={(e) =>
									setCurrentUser({ ...currentUser, phone: e.target.value })
								}
								variant="outlined"
								InputProps={{ sx: { borderRadius: 3 } }}
							/>
							<TextField
								select
								label="Peran"
								fullWidth
								value={currentUser.role || "USER"}
								onChange={(e) =>
									setCurrentUser({ ...currentUser, role: e.target.value })
								}
								SelectProps={{ native: true }}
								InputProps={{ sx: { borderRadius: 3 } }}
							>
								<option value="USER">User</option>
								<option value="ADMIN">Admin</option>
							</TextField>
						</Stack>
					</Box>
				</DialogContent>
				<DialogActions
					sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
				>
					<Button
						onClick={() => setOpenDialog(false)}
						sx={{
							borderRadius: 2,
							textTransform: "none",
							fontWeight: 600,
							color: "text.secondary",
						}}
					>
						Batal
					</Button>
					<Button
						variant="contained"
						onClick={handleSave}
						sx={{
							borderRadius: 2,
							textTransform: "none",
							fontWeight: 700,
							px: 4,
							boxShadow: "none",
						}}
					>
						{dialogMode === "create" ? "Buat User" : "Simpan Perubahan"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Reset Password Dialog */}
			<Dialog
				open={openResetDialog}
				onClose={() => setOpenResetDialog(false)}
				fullWidth
				maxWidth="xs"
				PaperProps={{ sx: { borderRadius: 4 } }}
			>
				<DialogTitle sx={{ fontWeight: 800 }}>
					Atur Ulang Kata Sandi
				</DialogTitle>
				<DialogContent>
					<Box component="form" autoComplete="off">
						<Alert
							severity="warning"
							icon={<WarningIcon />}
							sx={{ mb: 3, borderRadius: 2 }}
						>
							Ini akan segera mengubah kata sandi untuk{" "}
							<strong>{currentUser.name}</strong>.
						</Alert>
						<TextField
							label="Kata Sandi Baru"
							fullWidth
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							variant="outlined"
							InputProps={{ sx: { borderRadius: 3 } }}
							autoComplete="new-password"
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button
						onClick={() => setOpenResetDialog(false)}
						sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
					>
						Batal
					</Button>
					<Button
						variant="contained"
						color="warning"
						onClick={handleResetPasswordSubmit}
						sx={{
							borderRadius: 2,
							textTransform: "none",
							fontWeight: 700,
							boxShadow: "none",
						}}
					>
						Atur Ulang Kata Sandi
					</Button>
				</DialogActions>
			</Dialog>

			{/* Verification Details Dialog */}
			<Dialog
				open={openVerificationDialog}
				onClose={() => setOpenVerificationDialog(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: 4 } }}
			>
				<DialogTitle
					sx={{
						fontWeight: 800,
						borderBottom: "1px solid",
						borderColor: "divider",
					}}
				>
					Status Verifikasi
				</DialogTitle>
				<DialogContent sx={{ pt: 4 }}>
					{selectedUserForVerification && (
						<Stack spacing={3}>
							{/* Identity Verification */}
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
								<Stack direction="row" alignItems="center" spacing={2} mb={2}>
									<Box
										sx={{
											p: 1,
											borderRadius: 2,
											bgcolor: "primary.lighter",
											color: "primary.main",
										}}
									>
										<AdminIcon />
									</Box>
									<Box>
										<Typography variant="subtitle1" fontWeight={700}>
											Verifikasi Identitas (KTP)
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Unggah KTP & Verifikasi NIK
										</Typography>
									</Box>
									<Chip
										label={
											selectedUserForVerification.verificationRequests?.[0]
												? selectedUserForVerification.verificationRequests[0]
														.status === "PENDING"
													? "Menunggu Verifikasi"
													: selectedUserForVerification.verificationRequests[0]
																.status === "APPROVED"
														? "Disetujui"
														: "Ditolak"
												: "Belum Diunggah"
										}
										size="small"
										color={
											selectedUserForVerification.verificationRequests?.[0]
												?.status === "PENDING"
												? "warning"
												: selectedUserForVerification.verificationRequests?.[0]
															?.status === "APPROVED"
													? "success"
													: "default"
										}
										sx={{
											ml: "auto !important",
											borderRadius: 2,
											fontWeight: 600,
										}}
									/>
								</Stack>
								<Stack spacing={1}>
									<Typography variant="body2" color="text.secondary">
										<strong>NIK:</strong>{" "}
										{selectedUserForVerification.verificationRequests?.[0]
											?.ktpNumber || "-"}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										<strong>Foto KTP:</strong>{" "}
										{selectedUserForVerification.verificationRequests?.[0]
											?.ktpPhotoUrl ? (
											<Typography
												component="span"
												onClick={() =>
													setPreviewImage(
														selectedUserForVerification.verificationRequests![0]
															.ktpPhotoUrl!,
													)
												}
												sx={{
													color: "primary.main",
													textDecoration: "underline",
													cursor: "pointer",
													fontSize: "inherit",
												}}
											>
												Lihat Foto
											</Typography>
										) : (
											"-"
										)}
									</Typography>
								</Stack>
							</Paper>

							{/* Email Verification */}
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Box
										sx={{
											p: 1,
											borderRadius: 2,
											bgcolor: selectedUserForVerification.emailVerified
												? "success.lighter"
												: "warning.lighter",
											color: selectedUserForVerification.emailVerified
												? "success.main"
												: "warning.main",
										}}
									>
										<EmailIcon />
									</Box>
									<Box>
										<Typography variant="subtitle1" fontWeight={700}>
											Verifikasi Email
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{selectedUserForVerification.email}
										</Typography>
									</Box>
									<Chip
										label={
											selectedUserForVerification.emailVerified
												? "Terverifikasi"
												: "Belum terverifikasi"
										}
										size="small"
										color={
											selectedUserForVerification.emailVerified
												? "success"
												: "warning"
										}
										sx={{
											ml: "auto !important",
											borderRadius: 2,
											fontWeight: 600,
										}}
									/>
								</Stack>
							</Paper>

							{/* WhatsApp Verification */}
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Box
										sx={{
											p: 1,
											borderRadius: 2,
											bgcolor: selectedUserForVerification.phoneVerified
												? "success.lighter"
												: "warning.lighter",
											color: selectedUserForVerification.phoneVerified
												? "#25D366"
												: "warning.main",
										}}
									>
										<PhoneIcon />
									</Box>
									<Box>
										<Typography variant="subtitle1" fontWeight={700}>
											Verifikasi WhatsApp
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{selectedUserForVerification.phone || "-"}
										</Typography>
									</Box>
									<Chip
										label={
											selectedUserForVerification.phoneVerified
												? "Terverifikasi"
												: "Belum Verifikasi"
										}
										size="small"
										color={
											selectedUserForVerification.phoneVerified
												? "success"
												: "default"
										}
										sx={{
											ml: "auto !important",
											borderRadius: 2,
											fontWeight: 600,
										}}
									/>
								</Stack>
							</Paper>
						</Stack>
					)}
				</DialogContent>
				<DialogActions
					sx={{
						p: 3,
						borderTop: "1px solid",
						borderColor: "divider",
						justifyContent: "space-between",
					}}
				>
					<Button
						onClick={() => setOpenVerificationDialog(false)}
						sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
					>
						Tutup
					</Button>
					{!selectedUserForVerification?.verifiedAt ? (
						<Stack direction="row" spacing={2}>
							{selectedUserForVerification?.verificationRequests?.[0]
								?.status === "PENDING" && (
								<Button
									variant="contained"
									color="error"
									onClick={() => {
										setVerificationAction("reject");
										setOpenConfirmVerifyDialog(true);
									}}
									sx={{
										borderRadius: 2,
										textTransform: "none",
										fontWeight: 600,
									}}
								>
									Tolak
								</Button>
							)}
							<Button
								variant="contained"
								color="primary"
								onClick={handleOpenConfirmVerify}
								sx={{
									borderRadius: 2,
									textTransform: "none",
									fontWeight: 600,
								}}
							>
								Verifikasi User
							</Button>
						</Stack>
					) : (
						<Button
							variant="contained"
							color="error"
							onClick={handleOpenConfirmVerify}
							sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
						>
							Batalkan Verifikasi
						</Button>
					)}
				</DialogActions>
			</Dialog>

			{/* Confirm Verify Dialog */}
			<Dialog
				open={openConfirmVerifyDialog}
				onClose={() => setOpenConfirmVerifyDialog(false)}
				maxWidth="xs"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>
					{verificationAction === "verify"
						? "Konfirmasi Verifikasi"
						: verificationAction === "reject"
							? "Tolak Verifikasi"
							: "Konfirmasi Batalkan Verifikasi"}
				</DialogTitle>
				<DialogContent>
					{selectedUserForVerification && (
						<>
							{verificationAction === "verify" ? (
								<>
									{/* Check for missing requirements */}
									<Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
										<Typography
											variant="subtitle2"
											fontWeight={700}
											gutterBottom
										>
											Pemeriksaan Syarat Verifikasi:
										</Typography>
										<ul style={{ margin: 0, paddingLeft: 20 }}>
											<li>
												Identitas (KTP):{" "}
												{selectedUserForVerification.verificationRequests?.[0]
													?.ktpPhotoUrl ? (
													<strong style={{ color: "green" }}>Diunggah</strong>
												) : (
													<strong>Belum Diunggah</strong>
												)}
											</li>
											<li>
												Verifikasi Email:{" "}
												{selectedUserForVerification.emailVerified ? (
													<strong style={{ color: "green" }}>
														Terverifikasi
													</strong>
												) : (
													<strong>Menunggu</strong>
												)}
											</li>
											<li>
												Verifikasi WhatsApp:{" "}
												{selectedUserForVerification.phoneVerified ? (
													<strong style={{ color: "green" }}>
														Terverifikasi
													</strong>
												) : (
													<strong>Belum Terverifikasi</strong>
												)}
											</li>
										</ul>
										{(!selectedUserForVerification.phoneVerified ||
											!selectedUserForVerification.emailVerified) && (
											<Typography
												variant="caption"
												sx={{ mt: 1, display: "block", fontWeight: 600 }}
											>
												Peringatan: User memiliki langkah verifikasi yang belum
												lengkap.
											</Typography>
										)}
									</Alert>

									{!selectedUserForVerification.emailVerified && (
										<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
											<Typography variant="body2" fontWeight={600}>
												Peringatan: Email belum terverifikasi!
											</Typography>
											<Typography variant="caption">
												User harus memverifikasi email terlebih dahulu sebelum
												akun dapat diverifikasi oleh admin.
											</Typography>
										</Alert>
									)}

									<Typography>
										Anda yakin ingin memverifikasi{" "}
										<strong>{selectedUserForVerification.name}</strong>? Ini
										akan menandai User sebagai terverifikasi penuh di sistem.
									</Typography>
								</>
							) : verificationAction === "reject" ? (
								<Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
									<Typography>
										Apakah Anda yakin ingin menolak verifikasi untuk user{" "}
										<strong>{selectedUserForVerification.name}</strong>?
										<br />
										<br />
										Data pengajuan verifikasi akan dihapus permanen.
									</Typography>
								</Alert>
							) : (
								<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
									<Typography>
										Apakah Anda yakin ingin membatalkan status verifikasi untuk
										user <strong>{selectedUserForVerification.name}</strong>?
										<br />
										<br />
										User tidak akan lagi memiliki lencana verifikasi.
									</Typography>
								</Alert>
							)}
						</>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						onClick={() => setOpenConfirmVerifyDialog(false)}
						sx={{ textTransform: "none", fontWeight: 600 }}
					>
						Batal
					</Button>
					<Button
						onClick={handleConfirmVerify}
						variant="contained"
						color={verificationAction === "verify" ? "success" : "error"}
						disabled={
							verificationAction === "verify" &&
							!selectedUserForVerification?.emailVerified
						}
						sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
					>
						{verificationAction === "verify"
							? "Konfirmasi Verifikasi"
							: verificationAction === "reject"
								? "Ya, Tolak"
								: "Ya, Batalkan"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={openDeleteDialog}
				onClose={() => setOpenDeleteDialog(false)}
				maxWidth="xs"
				fullWidth
				PaperProps={{ sx: { borderRadius: 4 } }}
			>
				<DialogTitle
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 1,
						pt: 4,
					}}
				>
					<Box
						sx={{
							p: 2,
							bgcolor: alpha(theme.palette.error.main, 0.1),
							borderRadius: "50%",
							color: "error.main",
						}}
					>
						<DeleteIcon fontSize="large" />
					</Box>
					<Typography component="span" variant="h6" fontWeight={800}>
						Hapus User?
					</Typography>
				</DialogTitle>
				<DialogContent>
					<Typography align="center" color="text.secondary">
						Anda yakin ingin menghapus <strong>{userToDelete?.name}</strong>?
						Tindakan ini tidak dapat dibatalkan.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
					<Button
						onClick={() => setOpenDeleteDialog(false)}
						variant="outlined"
						sx={{
							borderRadius: 3,
							textTransform: "none",
							fontWeight: 600,
							px: 3,
							borderColor: "divider",
							color: "text.primary",
						}}
					>
						Batal
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						variant="contained"
						color="error"
						sx={{
							borderRadius: 3,
							textTransform: "none",
							fontWeight: 600,
							px: 3,
							boxShadow: "none",
						}}
					>
						Ya, Hapus
					</Button>
				</DialogActions>
			</Dialog>

			{/* Bulk Action Dialog */}
			<Dialog
				open={openBulkDialog}
				onClose={() => setOpenBulkDialog(false)}
				PaperProps={{ sx: { borderRadius: 3, width: "100%", maxWidth: 400 } }}
			>
				<Box sx={{ textAlign: "center", p: 3 }}>
					<Avatar
						sx={{
							bgcolor:
								bulkActionType === "delete"
									? alpha(theme.palette.error.main, 0.1)
									: bulkActionType === "unverify"
										? alpha(theme.palette.warning.main, 0.1)
										: alpha(theme.palette.primary.main, 0.1),
							color:
								bulkActionType === "delete"
									? "error.main"
									: bulkActionType === "unverify"
										? "warning.main"
										: "primary.main",
							width: 60,
							height: 60,
							mx: "auto",
							mb: 2,
						}}
					>
						{bulkActionType === "delete" ? (
							<DeleteIcon fontSize="large" />
						) : bulkActionType === "unverify" ? (
							<CancelIcon fontSize="large" />
						) : (
							<BulkIcon fontSize="large" />
						)}
					</Avatar>
					<Typography variant="h6" fontWeight={700} gutterBottom>
						{bulkActionType === "delete"
							? `Hapus ${selectedIds.length} User?`
							: bulkActionType === "unverify"
								? `Nonaktifkan ${selectedIds.length} User?`
								: `Verifikasi ${selectedIds.length} User?`}
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						{bulkActionType === "delete"
							? "Tindakan ini tidak dapat dibatalkan. Semua data user yang dipilih akan dihapus permanen."
							: bulkActionType === "unverify"
								? "User yang dipilih akan kehilangan status verifikasi."
								: "Pastikan user yang dipilih sudah memenuhi syarat verifikasi (email terverifikasi)."}
					</Typography>
					<Stack direction="row" spacing={2} justifyContent="center">
						<Button
							variant="outlined"
							onClick={() => setOpenBulkDialog(false)}
							sx={{ borderRadius: 2, textTransform: "none" }}
						>
							Batal
						</Button>
						<Button
							variant="contained"
							onClick={handleBulkAction}
							color={
								bulkActionType === "delete"
									? "error"
									: bulkActionType === "unverify"
										? "warning"
										: "primary"
							}
							disabled={loading}
							sx={{ borderRadius: 2, textTransform: "none" }}
						>
							{loading
								? "Memproses..."
								: bulkActionType === "delete"
									? "Ya, Hapus"
									: bulkActionType === "unverify"
										? "Ya, Nonaktifkan"
										: "Ya, Verifikasi"}
						</Button>
					</Stack>
				</Box>
			</Dialog>

			{/* Toast Notification */}
			<Snackbar
				open={toast.open}
				autoHideDuration={3000}
				onClose={() => setToast({ ...toast, open: false })}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					onClose={() => setToast({ ...toast, open: false })}
					severity={toast.severity}
					variant="filled"
					sx={{ borderRadius: 3, fontWeight: 600 }}
				>
					{toast.msg}
				</Alert>
			</Snackbar>
			{/* Image Preview Dialog */}
			<Dialog
				open={!!previewImage}
				onClose={() => setPreviewImage(null)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
					>
						<Typography component="span" variant="h6">
							Pratinjau Foto
						</Typography>
						<IconButton onClick={() => setPreviewImage(null)} size="small">
							<CancelIcon />
						</IconButton>
					</Stack>
				</DialogTitle>
				<DialogContent dividers sx={{ p: 0, textAlign: "center" }}>
					{previewImage && (
						<img
							src={previewImage}
							alt="Preview"
							style={{
								maxWidth: "100%",
								maxHeight: "80vh",
								objectFit: "contain",
							}}
						/>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setPreviewImage(null)}>Tutup</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
