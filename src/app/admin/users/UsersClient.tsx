'use client';

import React, { useState, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
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
  TableView as ExcelIcon
} from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser, resetPassword, verifyUser } from '@/actions/user';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Menu, MenuItem } from '@mui/material';

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  image?: string | null;
  emailVerified: Date | null;
}

interface UsersClientProps {
  initialUsers: any[];
  initialTotal: number;
  stats: { total: number; admins: number; users: number };
}

export default function UsersClient({ initialUsers, initialTotal, stats }: UsersClientProps) {
  const router = useRouter();
  const theme = useTheme();
  
  // Data States
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // Filter & Search States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openVerificationDialog, setOpenVerificationDialog] = useState(false);
  const [openConfirmVerifyDialog, setOpenConfirmVerifyDialog] = useState(false);
  const [selectedUserForVerification, setSelectedUserForVerification] = useState<User | null>(null);
  
  // Export Menu State
  const [anchorElExport, setAnchorElExport] = useState<null | HTMLElement>(null);
  const openExportMenu = Boolean(anchorElExport);

  // Form States
  const [currentUser, setCurrentUser] = useState<Partial<User & { password?: string }>>({});
  const [newPassword, setNewPassword] = useState('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Feedback State
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filterRole, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(search, filterRole, page);
      setUsers(res.users as any);
      setTotal(res.total);
    } catch (error) {
      console.error(error);
      showToast('Gagal mengambil User', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleOpenCreate = () => {
    setCurrentUser({ name: '', email: '', phone: '', role: 'USER', password: '' });
    setDialogMode('create');
    setOpenDialog(true);
  };

  const handleOpenEdit = (user: User) => {
    setCurrentUser({ ...user }); // Copy object to avoid reference issues
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleOpenResetPassword = (user: User) => {
    setCurrentUser({ ...user });
    setNewPassword('');
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
      showToast('User berhasil dihapus', 'success');
      fetchUsers();
      router.refresh();
    } else {
      showToast(res.error || 'Gagal menghapus User', 'error');
    }
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleOpenVerification = (user: User) => {
    setSelectedUserForVerification(user);
    setOpenVerificationDialog(true);
  };

  const handleOpenConfirmVerify = () => {
      setOpenConfirmVerifyDialog(true);
  };

  const handleConfirmVerify = async () => {
      if (!selectedUserForVerification) return;
      
      const res = await verifyUser(selectedUserForVerification.id);
      if (res.success) {
          showToast('User verified successfully', 'success');
          setOpenConfirmVerifyDialog(false);
          setOpenVerificationDialog(false);
          fetchUsers(); // Refresh list
          router.refresh();
      } else {
          showToast(res.error || 'Gagal memverifikasi User', 'error');
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
    doc.setFont('helvetica', 'bold');
    doc.text('PESONA KEBAIKAN', pageWidth / 2, 15, { align: 'center' });
    
    // Motto
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('"Menebar Kebaikan, Menuai Keberkahan"', pageWidth / 2, 22, { align: 'center' });
    
    // Horizontal Line
    doc.setLineWidth(0.5);
    doc.line(15, 25, pageWidth - 15, 25);
    
    // Report Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan User Pesona Kebaikan', pageWidth / 2, 35, { align: 'center' });
    
    // 2. Table
    const tableData = users.map(user => [
        user.name || '-',
        user.email,
        user.phone || '-',
        user.role,
        user.emailVerified ? 'Verified' : 'Unverified',
        new Date(user.createdAt).toLocaleDateString('id-ID')
    ]);

    autoTable(doc, {
        head: [['Nama', 'Email', 'No. Telepon', 'Role', 'Status', 'Tanggal Bergabung']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185], halign: 'center' },
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
    
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Right aligned signature block
    const rightMargin = pageWidth - 20;
    
    doc.text(`Jakarta, ${date}`, rightMargin, signatureY, { align: 'right' });
    doc.text('Tertanda,', rightMargin, signatureY + 6, { align: 'right' });
    
    // Space for signature
    doc.text('( Admin Pesona Kebaikan )', rightMargin, signatureY + 35, { align: 'right' });

    doc.save('laporan_User_pesona_kebaikan.pdf');
    handleExportClose();
  };

  const handleExportExcel = () => {
    const workSheet = XLSX.utils.json_to_sheet(users.map(user => ({
        Nama: user.name || '-',
        Email: user.email,
        'No. Telepon': user.phone || '-',
        Peran: user.role,
        Status: user.emailVerified ? 'Terverifikasi' : 'Belum terverifikasi',
        Bergabung: new Date(user.createdAt).toLocaleDateString('id-ID')
    })));
    
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "User");
    
    XLSX.writeFile(workBook, "data_User.xlsx");
    handleExportClose();
  };

  const handleSave = async () => {
    if (!currentUser.name) {
      showToast('Nama wajib diisi', 'error');
      return;
    }
    if (!currentUser.email) {
      showToast('Email wajib diisi', 'error');
      return;
    }

    if (dialogMode === 'create' && !currentUser.password) {
      showToast('Kata sandi wajib untuk User baru', 'error');
      return;
    }

    try {
      let res;
      if (dialogMode === 'create') {
        res = await createUser({
          name: String(currentUser.name).trim(),
          email: String(currentUser.email).trim(),
          phone: currentUser.phone ? String(currentUser.phone).trim() : undefined,
          role: (currentUser.role as any) || 'USER',
          password: String(currentUser.password),
        });
      } else {
        res = await updateUser(currentUser.id!, {
          name: currentUser.name ? String(currentUser.name).trim() : undefined,
          email: currentUser.email ? String(currentUser.email).trim() : undefined,
          phone: currentUser.phone ? String(currentUser.phone).trim() : undefined,
          role: currentUser.role as any,
          password: currentUser.password ? String(currentUser.password) : undefined,
        });
      }

      if (res.success) {
        showToast(dialogMode === 'create' ? 'User berhasil dibuat' : 'User berhasil diperbarui', 'success');
        setOpenDialog(false);
        fetchUsers();
        router.refresh();
      } else {
        showToast(res.error || (dialogMode === 'create' ? 'Gagal membuat User' : 'Gagal memperbarui User'), 'error');
      }
    } catch (error) {
        showToast('Terjadi kesalahan', 'error');
    }
  };

  const handleResetPasswordSubmit = async () => {
      if (!newPassword) {
          showToast('Kata sandi baru wajib diisi', 'error');
          return;
      }
      
      const res = await resetPassword(currentUser.id!, newPassword);
      if (res.success) {
          showToast('Kata sandi berhasil diatur ulang', 'success');
          setOpenResetDialog(false);
      } else {
          showToast(res.error || 'Gagal mengatur ulang kata sandi', 'error');
      }
  };

  const showToast = (msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  };

  // Improved Stats Card
  const StatCard = ({ title, value, icon, color, gradient }: { title: string, value: string | number, icon: React.ReactNode, color: string, gradient: string }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        borderRadius: 3,
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
        <Box 
            sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: '100px', 
                height: '100%', 
                background: gradient, 
                opacity: 0.1,
                transform: 'skewX(-20deg) translateX(20px)' 
            }} 
        />
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>
                        {value}
                    </Typography>
                </Box>
                <Box 
                    sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        background: gradient,
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        display: 'flex'
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
  );

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1e293b', mb: 1 }}>
              Manajemen User
          </Typography>
          <Typography variant="body1" color="text.secondary">
              Kelola akses sistem, peran, dan akun User.
          </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
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
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider', 
            overflow: 'hidden' 
        }}
      >
        {/* Toolbar */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: { xs: 'col', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Tabs
                value={filterRole}
                onChange={(_, v) => { setFilterRole(v); setPage(1); }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    '& .MuiTab-root': {
                        minHeight: 40,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        mr: 1
                    },
                    '& .Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                    '& .MuiTabs-indicator': { display: 'none' }
                }}
            >
                <Tab label="Semua User" value="all" />
                <Tab label="Admin" value="admin" />
                <Tab label="User" value="user" />
            </Tabs>

            <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Box component="form" noValidate autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                    <TextField
                        id="search-users-input-unique"
                        name="search_query_users_v1"
                        placeholder="Cari User..."
                        size="small"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        autoComplete="off"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ 
                            width: { xs: '100%', md: 250 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'background.paper'
                            }
                        }}
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ 
                        borderRadius: 3, 
                        textTransform: 'none', 
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                        px: 3
                    }}
                >
                    Tambah User
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportClick}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, px: 3 }}
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
                        <Typography variant="body2" fontWeight={500}>Ekspor sebagai PDF</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleExportExcel} sx={{ gap: 1.5, py: 1.5 }}>
                        <ExcelIcon color="success" fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>Ekspor sebagai Excel</Typography>
                    </MenuItem>
                </Menu>
            </Stack>
        </Box>

        {/* Table */}
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell sx={{ py: 2, pl: 3, width: 60 }}></TableCell>
                        <TableCell sx={{ py: 2, fontWeight: 600, color: 'text.secondary' }}>User</TableCell>
                        <TableCell sx={{ py: 2, fontWeight: 600, color: 'text.secondary' }}>Peran</TableCell>
                        <TableCell sx={{ py: 2, fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                        <TableCell sx={{ py: 2, fontWeight: 600, color: 'text.secondary' }}>Kontak</TableCell>
                        <TableCell sx={{ py: 2, fontWeight: 600, color: 'text.secondary' }}>Tanggal Bergabung</TableCell>
                        <TableCell align="right" sx={{ py: 2, pr: 3, fontWeight: 600, color: 'text.secondary' }}>Tindakan</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                <Typography color="text.secondary">Memuat User...</Typography>
                            </TableCell>
                        </TableRow>
                    ) : users.length > 0 ? (
                        users.map((user) => (
                            <TableRow 
                                key={user.id} 
                                hover 
                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell sx={{ pl: 3 }}>
                                    <Avatar 
                                        src={user.image || undefined} 
                                        sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            bgcolor: user.role === 'ADMIN' ? 'primary.main' : 'secondary.main',
                                            fontSize: 16,
                                            fontWeight: 700
                                        }}
                                    >
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0f172a' }}>
                                        {user.name || 'No Name'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: 12 }} /> {user.email}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={user.role} 
                                        size="small" 
                                        color={user.role === 'ADMIN' ? 'primary' : 'default'}
                                        sx={{ fontWeight: 600, borderRadius: 2, height: 24 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {user.emailVerified ? (
                                        <Tooltip title={`Terverifikasi pada ${new Date(user.emailVerified).toLocaleDateString('id-ID')}`}>
                                            <Chip
                                                onClick={(e) => { e.stopPropagation(); handleOpenVerification(user); }}
                                                icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                                                label="Terverifikasi"
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ 
                                                    fontWeight: 600, 
                                                    borderRadius: 2, 
                                                    height: 24,
                                                    border: '1px solid',
                                                    borderColor: 'success.main',
                                                    bgcolor: alpha(theme.palette.success.main, 0.05),
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Klik untuk verifikasi">
                                            <Chip
                                                onClick={(e) => { e.stopPropagation(); handleOpenVerification(user); }}
                                                icon={<CancelIcon sx={{ fontSize: '16px !important' }} />}
                                                label="Belum terverifikasi"
                                                size="small"
                                                color="default"
                                                variant="outlined"
                                                sx={{ 
                                                    fontWeight: 600, 
                                                    borderRadius: 2, 
                                                    height: 24,
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.phone || '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ pr: 3 }}>
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Atur Ulang Kata Sandi">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleOpenResetPassword(user)}
                                                sx={{ color: 'warning.main', bgcolor: alpha(theme.palette.warning.main, 0.1) }}
                                            >
                                                <LockResetIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleOpenEdit(user)}
                                                sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Hapus">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleOpenDelete(user)}
                                                sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) }}
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                                    <GroupIcon sx={{ fontSize: 48, mb: 1 }} />
                                    <Typography>Tidak ada User</Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
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
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider' }}>
          {dialogMode === 'create' ? 'Tambah User Baru' : 'Edit User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
          <Box component="form" autoComplete="off">
            <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
                label="Nama Lengkap"
                fullWidth
                value={currentUser.name || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                variant="outlined"
                InputProps={{ sx: { borderRadius: 3 } }}
            />
            <TextField
                label="Alamat Email"
                fullWidth
                type="email"
                value={currentUser.email || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                variant="outlined"
                InputProps={{ sx: { borderRadius: 3 } }}
            />
             {dialogMode === 'create' && (
                <TextField
                    label="Kata Sandi"
                    fullWidth
                    type="password"
                    value={currentUser.password || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 3 } }}
                />
            )}
            <TextField
                label="Nomor Telepon"
                fullWidth
                value={currentUser.phone || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                variant="outlined"
                InputProps={{ sx: { borderRadius: 3 } }}
            />
            <TextField
                select
                label="Peran"
                fullWidth
                value={currentUser.role || 'USER'}
                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                SelectProps={{ native: true }}
                InputProps={{ sx: { borderRadius: 3 } }}
            >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
            </TextField>
          </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
            Batal
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4, boxShadow: 'none' }}>
            {dialogMode === 'create' ? 'Buat User' : 'Simpan Perubahan'}
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
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                    Ini akan segera mengubah kata sandi untuk <strong>{currentUser.name}</strong>.
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
          <Button onClick={() => setOpenResetDialog(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Batal
          </Button>
          <Button variant="contained" color="warning" onClick={handleResetPasswordSubmit} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>
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
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider' }}>
          Status Verifikasi
        </DialogTitle>
        <DialogContent sx={{ pt: 4 }}>
             {selectedUserForVerification && (
                 <Stack spacing={3}>
                    {/* Identity Verification */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                                <AdminIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>Verifikasi Identitas (KTP)</Typography>
                                <Typography variant="caption" color="text.secondary">Unggah KTP & Verifikasi NIK</Typography>
                            </Box>
                            <Chip 
                                label="Belum Diunggah" 
                                size="small" 
                                color="default" 
                                sx={{ ml: 'auto !important', borderRadius: 2, fontWeight: 600 }} 
                            />
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary"><strong>NIK:</strong> -</Typography>
                            <Typography variant="body2" color="text.secondary"><strong>Foto KTP:</strong> -</Typography>
                        </Stack>
                    </Paper>

                    {/* Email Verification */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: selectedUserForVerification.emailVerified ? 'success.lighter' : 'warning.lighter', color: selectedUserForVerification.emailVerified ? 'success.main' : 'warning.main' }}>
                                <EmailIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>Verifikasi Email</Typography>
                                <Typography variant="caption" color="text.secondary">{selectedUserForVerification.email}</Typography>
                            </Box>
                            <Chip 
                                label={selectedUserForVerification.emailVerified ? "Terverifikasi" : "Belum terverifikasi"} 
                                size="small" 
                                color={selectedUserForVerification.emailVerified ? "success" : "warning"}
                                sx={{ ml: 'auto !important', borderRadius: 2, fontWeight: 600 }} 
                            />
                        </Stack>
                    </Paper>

                    {/* WhatsApp Verification */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                             <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.lighter', color: '#25D366' }}>
                                <PhoneIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>Verifikasi WhatsApp</Typography>
                                <Typography variant="caption" color="text.secondary">{selectedUserForVerification.phone || '-'}</Typography>
                            </Box>
                            <Chip 
                                label="Unverified" 
                                size="small" 
                                color="default"
                                sx={{ ml: 'auto !important', borderRadius: 2, fontWeight: 600 }} 
                            />
                        </Stack>
                    </Paper>
                 </Stack>
             )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenVerificationDialog(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Tutup
          </Button>
          {!selectedUserForVerification?.emailVerified && (
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleOpenConfirmVerify}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
                Verifikasi User
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
         <DialogTitle sx={{ fontWeight: 700 }}>Konfirmasi Verifikasi</DialogTitle>
         <DialogContent>
             {selectedUserForVerification && (
                 <>
                      {/* Check for missing requirements */}
                      <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                              Verification Requirements Check:
                          </Typography>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                              <li>
                                  Identity (KTP): <strong>Not Uploaded</strong>
                              </li>
                              <li>
                                  Verifikasi Email: {selectedUserForVerification.emailVerified ? <strong style={{color: 'green'}}>Terverifikasi</strong> : <strong>Menunggu</strong>}
                              </li>
                              <li>
                                  Verifikasi WhatsApp: {selectedUserForVerification.phone ? <strong style={{color: 'green'}}>Terverifikasi</strong> : <strong>Belum Terverifikasi</strong>}
                              </li>
                          </ul>
                          {(!selectedUserForVerification.phone || !selectedUserForVerification.emailVerified) && (
                          <Typography variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                                  Peringatan: User memiliki langkah verifikasi yang belum lengkap.
                              </Typography>
                          )}
                      </Alert>
                      
                      <Typography>
                         Anda yakin ingin memverifikasi <strong>{selectedUserForVerification.name}</strong>?
                         Ini akan menandai User sebagai terverifikasi penuh di sistem.
                      </Typography>
                 </>
             )}
          </DialogContent>
         <DialogActions sx={{ p: 2 }}>
             <Button onClick={() => setOpenConfirmVerifyDialog(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Batal</Button>
             <Button 
                onClick={handleConfirmVerify} 
                variant="contained" 
                color="success"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
                 Konfirmasi Verifikasi
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
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pt: 4 }}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: '50%', color: 'error.main' }}>
                <DeleteIcon fontSize="large" />
            </Box>
            <Typography variant="h6" fontWeight={800}>Hapus User?</Typography>
        </DialogTitle>
        <DialogContent>
            <Typography align="center" color="text.secondary">
                Anda yakin ingin menghapus <strong>{userToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
            <Button 
                onClick={() => setOpenDeleteDialog(false)}
                variant="outlined"
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3, borderColor: 'divider', color: 'text.primary' }}
            >
                Batal
            </Button>
            <Button 
                onClick={handleDeleteConfirm}
                variant="contained" 
                color="error"
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none' }}
            >
                Ya, Hapus
            </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
