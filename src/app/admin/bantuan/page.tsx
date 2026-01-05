"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Actions
import { getFaqs, createFaq, updateFaq, deleteFaq } from "@/actions/cms";

const DEFAULT_FAQS = [
  {
    question: "Bagaimana cara berdonasi di Pesona Kebaikan?",
    answer: "1. Pilih campaign penggalangan dana yang ingin Anda bantu.\n2. Klik tombol 'Donasi Sekarang'.\n3. Masukkan nominal donasi yang diinginkan.\n4. Pilih metode pembayaran (Transfer Bank, E-Wallet, atau QRIS).\n5. Selesaikan pembayaran sesuai instruksi. Anda akan mendapatkan notifikasi via email/WhatsApp setelah donasi berhasil.",
    category: "Donasi"
  },
  {
    question: "Apa saja metode pembayaran yang tersedia?",
    answer: "Kami menyediakan berbagai metode pembayaran untuk kemudahan Anda:\n\n- Transfer Bank (BCA, Mandiri, BRI, BNI)\n- E-Wallet (GoPay, OVO, DANA, ShopeePay)\n- QRIS (Scan QR Code)\n- Kartu Kredit (Visa/Mastercard)",
    category: "Pembayaran"
  },
  {
    question: "Apakah ada potongan biaya administrasi?",
    answer: "Untuk menjaga keberlangsungan operasional platform dan biaya verifikasi campaign, kami mengenakan biaya administrasi sebesar 5% dari total donasi. \n\nKhusus untuk kategori Zakat dan Bencana Alam, biaya administrasi adalah 0% (Gratis).",
    category: "Biaya"
  },
  {
    question: "Apakah saya perlu mendaftar akun untuk berdonasi?",
    answer: "Tidak, Anda dapat berdonasi sebagai donatur tamu (anonim) tanpa perlu mendaftar. Namun, kami menyarankan Anda untuk mendaftar agar dapat memantau riwayat donasi dan mendapatkan update perkembangan dari campaign yang Anda bantu.",
    category: "Akun"
  },
  {
    question: "Bagaimana jika saya salah mentransfer nominal donasi?",
    answer: "Jangan khawatir. Silakan hubungi tim Customer Success kami melalui WhatsApp atau Email dengan melampirkan bukti transfer. Kami akan membantu memverifikasi dan menyesuaikan donasi Anda secara manual dalam waktu 1x24 jam kerja.",
    category: "Kendala"
  },
  {
    question: "Bagaimana prosedur pencairan dana oleh penggalang dana?",
    answer: "Pencairan dana dilakukan secara transparan dan akuntabel. Penggalang dana harus mengajukan permohonan pencairan dengan melampirkan rencana Useran dana dan bukti pendukung. Tim verifikasi kami akan mereview dalam 1-3 hari kerja sebelum dana disalurkan.",
    category: "Pencairan"
  }
];

export default function AdminBantuanPage() {
  const [faqs, setFaqs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  // Form State
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchFaqs = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFaqs();
      setFaqs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setOpenDialog(true);
  };

  const handleOpenEdit = (faq: any) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!question || !answer) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateFaq(editingId, { question, answer });
      } else {
        await createFaq({ question, answer });
      }
      setOpenDialog(false);
      fetchFaqs();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus FAQ ini?")) return;
    try {
      await deleteFaq(id);
      fetchFaqs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Ini akan menambahkan data FAQ default. Lanjutkan?")) return;
    setLoading(true);
    try {
      await Promise.all(DEFAULT_FAQS.map((faq) => createFaq(faq)));
      fetchFaqs();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0284c7",
            }}
          >
            <HelpOutlineIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Pusat Bantuan (FAQ)
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Kelola pertanyaan yang sering diajukan
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {faqs.length === 0 && (
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleSeed}
              disabled={loading}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              Import Default
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: "#61ce70",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": { bgcolor: "#16a34a", boxShadow: "none" },
            }}
          >
            Tambah FAQ
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Pertanyaan</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Jawaban</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569", width: 120, textAlign: "center" }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>Loading...</TableCell>
              </TableRow>
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: "#94a3b8" }}>Belum ada data FAQ</TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: "#1e293b", verticalAlign: "top" }}>{faq.question}</TableCell>
                  <TableCell sx={{ color: "#64748b", verticalAlign: "top", maxWidth: 400 }}>
                    <Typography variant="body2" sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {faq.answer}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ verticalAlign: "top" }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(faq)} sx={{ color: "#3b82f6" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(faq.id)} sx={{ color: "#ef4444" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "Edit FAQ" : "Tambah FAQ Baru"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Pertanyaan"
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <TextField
              label="Jawaban"
              fullWidth
              multiline
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: "#64748b" }}>Batal</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              bgcolor: "#61ce70",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: "#16a34a", boxShadow: "none" },
            }}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
