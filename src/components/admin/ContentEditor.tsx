"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SaveIcon from "@mui/icons-material/Save";
import { getPageContent, updatePageContent } from "@/actions/cms";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface ContentEditorProps {
  contentKey: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export default function ContentEditor({ contentKey, title, subtitle, icon }: ContentEditorProps) {
  const [pageTitle, setPageTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getPageContent(contentKey);
        if (data) {
          setPageTitle(data.title || "");
          setContent(data.content || "");
        }
      } catch (error) {
        console.error("Failed to load content", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [contentKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePageContent(contentKey, { title: pageTitle, content });
      setSnackbar({ open: true, message: "Konten berhasil disimpan", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Gagal menyimpan konten", severity: "error" });
    } finally {
      setSaving(false);
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
            {icon}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || loading}
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

      <Paper elevation={0} sx={{ p: 4, border: "1px solid #e2e8f0", borderRadius: 3 }}>
        {loading ? (
          <Typography sx={{ color: "#94a3b8", textAlign: "center" }}>Memuat konten...</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Judul Halaman"
              fullWidth
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              helperText="Judul utama yang akan ditampilkan di halaman"
            />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Konten Halaman
              </Typography>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Tulis konten di sini..."
                minHeight={400}
              />
            </Box>
          </Box>
        )}
      </Paper>

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
