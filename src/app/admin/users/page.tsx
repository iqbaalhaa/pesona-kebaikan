'use client';

import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  VerifiedUser as VerifiedUserIcon,
  FilterList as FilterListIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Badge as BadgeIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Mock User Interface matching Prisma schema (mostly)
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Added for UI completeness, though not in schema yet
  createdAt: string;
  status: 'active' | 'inactive'; // Mock status
}

// Dummy Data
const initialUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@pesonakebaikan.id', phone: '081234567890', role: 'admin', createdAt: '2024-01-01', status: 'active' },
  { id: '2', name: 'John Doe', email: 'john@example.com', phone: '081298765432', role: 'user', createdAt: '2024-02-15', status: 'active' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', phone: '081355556666', role: 'user', createdAt: '2024-03-10', status: 'inactive' },
  { id: '4', name: 'Michael Brown', email: 'michael.b@example.com', phone: '081222333444', role: 'user', createdAt: '2024-03-22', status: 'active' },
  { id: '5', name: 'Sarah Wilson', email: 'sarah.w@example.com', phone: '081999888777', role: 'user', createdAt: '2024-04-05', status: 'active' },
];

// Stats Component
const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
  <Paper className="p-4 flex items-center justify-between rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-[#0f172a]">
    <div>
      <Typography variant="body2" className="text-gray-500 dark:text-gray-400 font-medium">{title}</Typography>
      <Typography variant="h4" className="font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</Typography>
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
      {icon}
    </div>
  </Paper>
);

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const newUsers = users.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleOpenCreate = () => {
    setCurrentUser({ name: '', email: '', phone: '', role: 'user', status: 'active' });
    setDialogMode('create');
    setOpenDialog(true);
  };

  const handleOpenEdit = (user: User) => {
    setCurrentUser(user);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('User deleted successfully', 'success');
    }
  };

  const handleSave = () => {
    if (!currentUser.name || !currentUser.email) {
      showToast('Name and Email are required', 'error');
      return;
    }

    if (dialogMode === 'create') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        role: currentUser.role || 'user',
        createdAt: new Date().toISOString().split('T')[0],
        status: (currentUser.status as 'active' | 'inactive') || 'active',
      };
      setUsers(prev => [newUser, ...prev]);
      showToast('User created successfully', 'success');
    } else {
      setUsers(prev => prev.map(u => (u.id === currentUser.id ? { ...u, ...currentUser } as User : u)));
      showToast('User updated successfully', 'success');
    }
    setOpenDialog(false);
  };

  const showToast = (msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  };

  return (
    <Box>
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <Typography variant="h5" className="font-bold text-gray-900 dark:text-gray-50">User Management</Typography>
        <div className="flex gap-2">
           <Tooltip title="Filter">
             <IconButton className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-lg">
                <FilterListIcon />
             </IconButton>
           </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-none capitalize rounded-lg px-4"
            onClick={handleOpenCreate}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-8">
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<GroupIcon className="text-blue-600" fontSize="large" />}
            color="bg-blue-500"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={<VerifiedUserIcon className="text-green-600" fontSize="large" />}
            color="bg-green-500"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="New This Month"
            value={newUsers}
            icon={<PersonIcon className="text-purple-600" fontSize="large" />}
            color="bg-purple-500"
          />
        </Grid>
      </Grid>

      {/* Filters & Search */}
      <Paper className="p-1 mb-6 dark:bg-[#0f172a] dark:border-gray-800 border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 p-3 items-center justify-between">
            <Tabs
                value={filterRole}
                onChange={(_, v) => setFilterRole(v)}
                textColor="primary"
                indicatorColor="primary"
                variant="standard"
                sx={{
                    minHeight: 'unset',
                    '& .MuiTab-root': {
                        minHeight: 'unset',
                        minWidth: 'unset',
                        py: 1,
                        px: 2,
                    }
                }}
            >
                <Tab icon={<GroupIcon />} value="all" aria-label="All Users" />
                <Tab icon={<AdminIcon />} value="admin" aria-label="Admins" />
                <Tab icon={<PersonIcon />} value="user" aria-label="Users" />
            </Tabs>
            <TextField
              placeholder="Search users..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-gray-400" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              className="w-full md:w-64"
              sx={{
                '& .MuiOutlinedInput-root': {
                   borderRadius: '8px',
                   backgroundColor: 'background.paper',
                }
              }}
            />
        </div>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper} className="shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden dark:bg-[#0f172a]">
        <Table sx={{ minWidth: 700 }} aria-label="user table">
          <TableHead className="bg-gray-50/50 dark:bg-[#1e293b]/50">
            <TableRow>
              <TableCell className="py-4 w-[60px]"></TableCell>
              <TableCell className="py-4 text-gray-500 dark:text-gray-400 font-semibold text-sm">
                 <Tooltip title="User Info"><PersonIcon fontSize="small" /></Tooltip>
              </TableCell>
              <TableCell align="center" className="py-4 text-gray-500 dark:text-gray-400"><Tooltip title="Status"><CheckCircleIcon fontSize="small" /></Tooltip></TableCell>
              <TableCell align="center" className="py-4 text-gray-500 dark:text-gray-400"><Tooltip title="Role"><BadgeIcon fontSize="small" /></Tooltip></TableCell>
              <TableCell align="center" className="py-4 text-gray-500 dark:text-gray-400"><Tooltip title="Phone"><PhoneIcon fontSize="small" /></Tooltip></TableCell>
              <TableCell align="center" className="py-4 text-gray-500 dark:text-gray-400"><Tooltip title="Joined Date"><CalendarIcon fontSize="small" /></Tooltip></TableCell>
              <TableCell align="right" className="py-4 text-gray-500 dark:text-gray-400"><MoreVertIcon fontSize="small" /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover className="transition-colors hover:bg-gray-50/50 dark:hover:bg-[#1e293b]/30">
                  <TableCell className="py-3 pr-0">
                     <Avatar className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold w-10 h-10 text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                  </TableCell>
                  <TableCell className="py-3 pl-2">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  </TableCell>
                   <TableCell align="center">
                    <Tooltip title={user.status === 'active' ? 'Active' : 'Inactive'}>
                        {user.status === 'active' ? 
                            <CheckCircleIcon className="text-green-500" fontSize="small" /> : 
                            <CancelIcon className="text-gray-400" fontSize="small" />
                        }
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={user.role === 'admin' ? 'Administrator' : 'Standard User'}>
                        {user.role === 'admin' ? (
                            <AdminIcon fontSize="small" className="text-purple-500" />
                        ) : (
                            <PersonIcon fontSize="small" className="text-gray-400" />
                        )}
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" className="text-gray-600 dark:text-gray-300 text-sm">{user.phone || '-'}</TableCell>
                  <TableCell align="center" className="text-gray-600 dark:text-gray-300 text-sm">{user.createdAt}</TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end">
                        <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(user)} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                            <EditIcon fontSize="small" />
                        </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(user.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                        </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <PersonIcon sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
                    <Typography variant="h6" className="font-medium">No users found</Typography>
                    <Typography variant="body2">Try adjusting your search or filters</Typography>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Mock Pagination */}
        <div className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1e293b]/30">
            <Pagination count={Math.ceil(totalUsers / 5)} color="primary" size="small" shape="rounded" />
        </div>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
            className: "rounded-xl dark:bg-[#1e293b]"
        }}
      >
        <DialogTitle className="font-bold border-b border-gray-100 dark:border-gray-700 pb-4">
          {dialogMode === 'create' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent className="pt-6 space-y-5 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
                label="Full Name"
                fullWidth
                value={currentUser.name || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                variant="outlined"
                className="md:col-span-2"
            />
            <TextField
                label="Email Address"
                fullWidth
                type="email"
                value={currentUser.email || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                variant="outlined"
                className="md:col-span-2"
            />
            <TextField
                label="Phone Number"
                fullWidth
                value={currentUser.phone || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                variant="outlined"
            />
            <TextField
                select
                label="Role"
                fullWidth
                value={currentUser.role || 'user'}
                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                SelectProps={{ native: true }}
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </TextField>
            <TextField
                select
                label="Status"
                fullWidth
                value={currentUser.status || 'active'}
                onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value as any })}
                SelectProps={{ native: true }}
                className="md:col-span-2"
            >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </TextField>
          </div>
        </DialogContent>
        <DialogActions className="p-5 border-t border-gray-100 dark:border-gray-700 gap-2">
          <Button onClick={() => setOpenDialog(false)} className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-4">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-none px-6 rounded-lg">
            {dialogMode === 'create' ? 'Create User' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" className="rounded-lg shadow-lg">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
