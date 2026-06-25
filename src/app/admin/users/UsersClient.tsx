"use client";

import { StyledTextField } from "@/components/ui/StyledTextField";
import {
	Button,
	Card,
	CardContent,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	IconButton,
	InputAdornment,
	Menu,
	MenuItem,
	Pagination,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Alert,
	MenuItem as SelectMenuItem,
} from "@mui/material";
import { Add, MoreVert, Search, Edit, Delete } from "@mui/icons-material";
import {
	ChangeEvent,
	FormEvent,
	useEffect,
	useState,
	useTransition,
} from "react";
import { useRouter } from "next/navigation";
import type { UserStats } from "@/actions/user";
import { getUsers, createUser, updateUser, deleteUser } from "@/actions/user";
import type { Role } from "@prisma/client";

type UserRow = {
	id: string;
	name: string | null;
	email: string;
	role: string;
	createdAt: string | Date;
};

interface UsersClientProps {
	initialUsers: UserRow[];
	initialTotal: number;
	stats: UserStats;
}

export default function UsersClient({
	initialUsers,
	initialTotal,
	stats,
}: UsersClientProps) {
	const [users, setUsers] = useState<UserRow[]>(initialUsers);
	const [total, setTotal] = useState(initialTotal);
	const [page, setPage] = useState(1);
	const [rowsPerPage] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
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
	});
	const [editUser, setEditUser] = useState({
		id: "",
		name: "",
		email: "",
		role: "USER" as Role,
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

	const loadUsers = async (page: number, query: string) => {
		try {
			const data = await getUsers(query, "all", "all", page, rowsPerPage);
			setUsers(data.users as UserRow[]);
			setTotal(data.total);
		} catch {
			showSnackbar("Gagal memuat pengguna", "error");
		}
	};

	useEffect(() => {
		const t = setTimeout(() => {
			loadUsers(page, searchQuery);
		}, 300);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, searchQuery]);

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPage(1);
		setSearchQuery(event.target.value);
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
		setNewUser({ name: "", email: "", password: "", role: "USER" as Role });
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
			});
			if (res.success) {
				showSnackbar("Pengguna berhasil ditambahkan", "success");
				handleAddUserDialogClose();
				await loadUsers(page, searchQuery);
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
			});
			if (res.success) {
				showSnackbar("Pengguna berhasil diperbarui", "success");
				handleEditUserDialogClose();
				await loadUsers(page, searchQuery);
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
				await loadUsers(page, searchQuery);
				router.refresh();
			} else {
				showSnackbar(res.error || "Gagal menghapus pengguna", "error");
			}
		});
	};

	return (
		<div>
			<Grid container spacing={3} className="mb-4">
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Card>
						<CardContent>
							<Typography variant="h6">Total Pengguna</Typography>
							<Typography variant="h4">{stats.totalUsers}</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Card>
						<CardContent>
							<Typography variant="h6">Pengguna Aktif</Typography>
							<Typography variant="h4">{stats.activeUsers}</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Card>
						<CardContent>
							<Typography variant="h6">Pengguna Baru (30 Hari)</Typography>
							<Typography variant="h4">{stats.newUsersLast30Days}</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, sm: 6, md: 3 }}>
					<Card>
						<CardContent>
							<Typography variant="h6">Tingkat Pertumbuhan</Typography>
							<Typography variant="h4">
								{stats.growthRate.toFixed(2)}%
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			<div className="flex justify-between items-center mb-4">
				<StyledTextField
					id="search-users-input-unique"
					name="search_query_users_v1"
					placeholder="Cari pengguna..."
					value={searchQuery}
					onChange={handleSearchChange}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search />
							</InputAdornment>
						),
					}}
				/>
				<Button
					variant="contained"
					color="primary"
					startIcon={<Add />}
					onClick={handleAddUserDialogOpen}
				>
					Tambah Pengguna
				</Button>
			</div>

			<TableContainer component={Card}>
				<Table>
					<TableHead>
						<TableRow>
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
								<TableCell colSpan={5} align="center">
									Tidak ada pengguna
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.role}</TableCell>
									<TableCell>
										{new Date(user.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell align="right">
										<IconButton onClick={(event) => handleMenuClick(event, user)}>
											<MoreVert />
										</IconButton>
										<Menu
											anchorEl={anchorEl}
											open={Boolean(anchorEl) && selectedUser?.id === user.id}
											onClose={handleMenuClose}
										>
											<MenuItem onClick={() => handleEditUserDialogOpen(user)}>
												<Edit fontSize="small" className="mr-2" />
												Edit
											</MenuItem>
											<MenuItem onClick={() => handleDeleteDialogOpen(user)}>
												<Delete fontSize="small" className="mr-2" />
												Hapus
											</MenuItem>
										</Menu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<div className="flex justify-center mt-4">
				<Pagination
					count={Math.max(1, Math.ceil(total / rowsPerPage))}
					page={page}
					onChange={handlePageChange}
					color="primary"
				/>
			</div>

			{/* Add User Dialog */}
			<Dialog
				open={isAddUserDialogOpen}
				onClose={handleAddUserDialogClose}
				fullWidth
				maxWidth="sm"
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
							<SelectMenuItem value="USER">USER</SelectMenuItem>
							<SelectMenuItem value="ADMIN">ADMIN</SelectMenuItem>
						</StyledTextField>
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
							<SelectMenuItem value="USER">USER</SelectMenuItem>
							<SelectMenuItem value="ADMIN">ADMIN</SelectMenuItem>
						</StyledTextField>
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
			<Dialog open={isDeleteDialogOpen} onClose={handleDeleteDialogClose}>
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
