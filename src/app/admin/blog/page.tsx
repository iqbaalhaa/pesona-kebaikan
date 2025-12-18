'use client';

import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import BlogCard, { BlogItem } from '@/components/admin/BlogCard';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

const categories = ['Umum', 'Tips', 'Kisah', 'Berita'];

export default function AdminBlogPage() {
  const [items, setItems] = React.useState<BlogItem[]>(
    Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      title: `Judul Blog ${i + 1}`,
      excerpt: 'Ini adalah ringkasan singkat konten blog untuk contoh tampilan kartu.',
      image: '/defaultimg.webp',
      category: categories[i % categories.length],
      date: `2024-0${(i % 9) + 1}-1${i % 9}`,
      author: `Author ${i + 1}`,
    }))
  );

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    category: categories[0],
    image: '/defaultimg.webp',
    content: '',
  });
  const [toast, setToast] = React.useState<{open: boolean; msg: string}>({ open: false, msg: '' });

  const createBlog = () => {
    const id = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems(prev => [{
      id,
      title: form.title || 'Tanpa Judul',
      excerpt: 'Konten baru telah dibuat (dummy).',
      image: form.image,
      category: form.category,
      date: new Date().toISOString().slice(0,10),
      author: 'Admin',
    }, ...prev]);
    setOpen(false);
    setToast({ open: true, msg: 'Blog berhasil dibuat (dummy)' });
  };

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h5" className="font-bold">Daftar Blog</Typography>
        <Button variant="contained" startIcon={<AddIcon />} className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpen(true)}>
          Tulis Blog
        </Button>
      </div>

      <Grid container spacing={3}>
        {items.map((b) => (
          <Grid key={b.id} size={{ xs: 12, md: 3 }}>
            <BlogCard data={b} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle className="font-bold">Tulis Blog</DialogTitle>
        <DialogContent className="space-y-3 pt-2">
          <TextField label="Judul" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField select label="Kategori" fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField label="URL Gambar" fullWidth value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <div>
            <div className="text-sm font-semibold mb-2">Konten</div>
            <RichTextEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={createBlog}>Simpan</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={() => setToast({ open: false, msg: '' })}>
        <Alert severity="success" variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
