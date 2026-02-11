"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import { getPageContent, updatePageContent } from "@/actions/cms";
import { uploadFile } from "@/actions/upload";

interface AccountabilityData {
  hero: {
    title: string;
    description: string;
  };
  cards: {
    icon: string;
    title: string;
    description: string;
  }[];
  reports: {
    year: string;
    title: string;
    size: string;
    url: string;
  }[];
}

const DEFAULT_DATA: AccountabilityData = {
  hero: {
    title: "Terpercaya & Transparan",
    description: "Pesona Kebaikan berkomitmen untuk menjaga amanah donatur dengan standar transparansi dan akuntabilitas tertinggi."
  },
  cards: [
    {
      icon: "audit",
      title: "Audit Berkala",
      description: "Laporan keuangan diaudit oleh Kantor Akuntan Publik independen."
    },
    {
      icon: "legal",
      title: "Izin Resmi",
      description: "Berizin resmi dari Kementerian Sosial Republik Indonesia."
    }
  ],
  reports: []
};

const FileUpload = ({ label, value, onChange }: { label: string, value: string, onChange: (url: string, size?: string) => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    // Calculate size (e.g. "2.4 MB")
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadFile(formData);
      if (res.success && res.url) {
        onChange(res.url, sizeInMB);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <input
        type="file"
        id={`upload-${label}`}
        hidden
        accept=".pdf,.doc,.docx"
        onChange={handleUpload}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Button
          variant="outlined"
          component="span"
          size="small"
          startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileIcon />}
          onClick={() => document.getElementById(`upload-${label}`)?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : value ? "Ganti File" : "Upload PDF"}
        </Button>
        {value && (
          <Button 
            size="small" 
            color="inherit" 
            href={value} 
            target="_blank"
            startIcon={<InsertDriveFileIcon />}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Lihat File
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default function AdminAkuntabilitasPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AccountabilityData>(DEFAULT_DATA);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const page = await getPageContent("accountability");
      if (page?.data) {
        setData(page.data as any);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePageContent("accountability", {
        title: "Akuntabilitas",
        content: "",
        data
      });
      setSnackbar({ open: true, message: "Berhasil disimpan", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Gagal menyimpan", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleHeroChange = (field: keyof AccountabilityData['hero'], value: string) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  // Cards Logic
  const handleCardChange = (index: number, field: keyof AccountabilityData['cards'][0], value: string) => {
    const newCards = [...data.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setData(prev => ({ ...prev, cards: newCards }));
  };

  const addCard = () => {
    setData(prev => ({
      ...prev,
      cards: [
        ...prev.cards,
        { icon: "audit", title: "Judul Baru", description: "Deskripsi baru..." }
      ]
    }));
  };

  const removeCard = (index: number) => {
    const newCards = [...data.cards];
    newCards.splice(index, 1);
    setData(prev => ({ ...prev, cards: newCards }));
  };

  // Reports Logic
  const handleReportChange = (index: number, field: keyof AccountabilityData['reports'][0], value: string) => {
    const newReports = [...data.reports];
    newReports[index] = { ...newReports[index], [field]: value };
    setData(prev => ({ ...prev, reports: newReports }));
  };

  const addReport = () => {
    setData(prev => ({
      ...prev,
      reports: [
        { year: new Date().getFullYear().toString(), title: "Laporan Tahunan", size: "-", url: "" },
        ...prev.reports
      ]
    }));
  };

  const removeReport = (index: number) => {
    const newReports = [...data.reports];
    newReports.splice(index, 1);
    setData(prev => ({ ...prev, reports: newReports }));
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: "center" }}>Memuat data...</Box>;
  }

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
            <VerifiedUserIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Akuntabilitas
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Kelola konten halaman Akuntabilitas & Transparansi
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            bgcolor: "#0ba976",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "none",
            "&:hover": { bgcolor: "#16a34a", boxShadow: "none" },
          }}
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Hero Section */}
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Banner Utama</Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Judul"
                value={data.hero.title}
                onChange={(e) => handleHeroChange("title", e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Deskripsi"
                value={data.hero.description}
                onChange={(e) => handleHeroChange("description", e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Cards Section */}
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Pilar Transparansi</Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={addCard}>Tambah</Button>
          </Box>
          <Grid container spacing={2}>
            {data.cards.map((card, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Box sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2, position: "relative" }}>
                  <IconButton 
                    size="small" 
                    color="error" 
                    sx={{ position: "absolute", top: 8, right: 8 }}
                    onClick={() => removeCard(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    {card.icon === "audit" ? <AssessmentIcon color="success" /> : <AccountBalanceIcon color="success" />}
                    <Typography variant="subtitle2">Card #{index + 1}</Typography>
                  </Box>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Icon</InputLabel>
                    <Select
                      value={card.icon}
                      label="Icon"
                      onChange={(e) => handleCardChange(index, "icon", e.target.value)}
                    >
                      <MenuItem value="audit">Audit (Assessment Icon)</MenuItem>
                      <MenuItem value="legal">Legal (Account Balance Icon)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Judul"
                    value={card.title}
                    onChange={(e) => handleCardChange(index, "title", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Deskripsi"
                    value={card.description}
                    onChange={(e) => handleCardChange(index, "description", e.target.value)}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Reports Section */}
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Laporan Tahunan</Typography>
            <Button startIcon={<AddIcon />} onClick={addReport} variant="outlined" size="small">
              Tambah Laporan
            </Button>
          </Box>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {data.reports.map((report, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <TextField
                      fullWidth
                      label="Tahun"
                      value={report.year}
                      onChange={(e) => handleReportChange(index, "year", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField
                      fullWidth
                      label="Judul Laporan"
                      value={report.title}
                      onChange={(e) => handleReportChange(index, "title", e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                     <Box>
                       <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>File Laporan (PDF)</Typography>
                       <FileUpload 
                         label={`report-${index}`}
                         value={report.url}
                         onChange={(url, size) => {
                           handleReportChange(index, "url", url);
                           if (size) handleReportChange(index, "size", size);
                         }}
                       />
                       {report.size && <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>Ukuran: {report.size}</Typography>}
                     </Box>
                  </Grid>
                </Grid>
                <IconButton color="error" onClick={() => removeReport(index)}>
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}
            {data.reports.length === 0 && (
              <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                Belum ada laporan tahunan.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
