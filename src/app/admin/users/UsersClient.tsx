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
} from "@mui/material";
import {
  Add,
  MoreVert,
  Search,
  Edit,
  Delete,
  Close,
} from "@mui/icons-material";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import type { UserStats } from "@/actions/user";

interface UsersClientProps {
  initialUsers: User[];
  initialTotal: number;
  stats: UserStats;
}

export default function UsersClient({
  initialUsers,
  initialTotal,
  stats,
}: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
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
    severity: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchUsers = async (
    page: number,
    rowsPerPage: number,
    query: string
  ) => {
    const response = await fetch(
      `/api/users?page=${page}&limit=${rowsPerPage}&search=${query}`
    );
    const data = await response.json();
    setUsers(data.users);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchUsers(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, searchQuery]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleAddUserDialogOpen = () => {
    setAddUserDialogOpen(true);
  };

  const handleAddUserDialogClose = () => {
    setAddUserDialogOpen(false);
  };

  const handleEditUserDialogOpen = (user: User) => {
    setEditUser({ id: user.id, name: user.name ?? "", email: user.email });
    setEditUserDialogOpen(true);
    handleMenuClose();
  };

  const handleEditUserDialogClose = () => {
    setEditUserDialogOpen(false);
  };

  const handleDeleteDialogOpen = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleNewUserChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditUserChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        showSnackbar("Pengguna berhasil ditambahkan", "success");
        fetchUsers(page, rowsPerPage, searchQuery);
        handleAddUserDialogClose();
        router.refresh();
      } else {
        const errorData = await response.json();
        showSnackbar(
          errorData.message || "Gagal menambahkan pengguna",
          "error"
        );
      }
    } catch (error) {
      showSnackbar("Terjadi kesalahan", "error");
    }
  };

  const handleUpdateUser = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editUser.name, email: editUser.email }),
      });
      if (response.ok) {
        showSnackbar("Pengguna berhasil diperbarui", "success");
        fetchUsers(page, rowsPerPage, searchQuery);
        handleEditUserDialogClose();
        router.refresh();
      } else {
        const errorData = await response.json();
        showSnackbar(
          errorData.message || "Gagal memperbarui pengguna",
          "error"
        );
      }
    } catch (error) {
      showSnackbar("Terjadi kesalahan", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          showSnackbar("Pengguna berhasil dihapus", "success");
          fetchUsers(page, rowsPerPage, searchQuery);
          handleDeleteDialogClose();
          router.refresh();
        } else {
          const errorData = await response.json();
          showSnackbar(
            errorData.message || "Gagal menghapus pengguna",
            "error"
          );
        }
      } catch (error) {
        showSnackbar("Terjadi kesalahan", "error");
      }
    }
  };

  return (
    <div>
      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Pengguna</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pengguna Aktif</Typography>
              <Typography variant="h4">{stats.activeUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pengguna Baru (30 Hari)</Typography>
              <Typography variant="h4">{stats.newUsersLast30Days}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(event) => handleMenuClick(event, user)}
                  >
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="flex justify-center mt-4">
        <Pagination
          count={Math.ceil(total / rowsPerPage)}
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
        <DialogTitle>
          Tambah Pengguna Baru
          <IconButton
            aria-label="close"
            onClick={handleAddUserDialogClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleAddUser}>
          <DialogContent>
            <StyledTextField
              autoFocus
              name="name"
              label="Nama Lengkap"
              type="text"
              fullWidth
              value={newUser.name}
              onChange={handleNewUserChange}
              required
            />
            <StyledTextField
              name="email"
              label="Alamat Email"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={handleNewUserChange}
              required
            />
            <StyledTextField
              name="password"
              label="Kata Sandi"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={handleNewUserChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddUserDialogClose}>Batal</Button>
            <Button type="submit" variant="contained">
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
        <DialogTitle>
          Edit Pengguna
          <IconButton
            aria-label="close"
            onClick={handleEditUserDialogClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleUpdateUser}>
          <DialogContent>
            <StyledTextField
              autoFocus
              name="name"
              label="Nama Lengkap"
              type="text"
              fullWidth
              value={editUser.name}
              onChange={handleEditUserChange}
              required
            />
            <StyledTextField
              name="email"
              label="Alamat Email"
              type="email"
              fullWidth
              value={editUser.email}
              onChange={handleEditUserChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditUserDialogClose}>Batal</Button>
            <Button type="submit" variant="contained">
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
          <Button onClick={handleDeleteUser} color="error" variant="contained">
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
