"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import CodeIcon from "@mui/icons-material/Code";
import CampaignIcon from "@mui/icons-material/Campaign";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  { ssr: false }
);

/* ---------- category config ---------- */
const CATEGORIES = [
  { value: "general", label: "General", icon: <ArticleIcon /> },
  { value: "tech", label: "Technology", icon: <CodeIcon /> },
  { value: "marketing", label: "Marketing", icon: <CampaignIcon /> },
];

export default function CreateBlogFancyPage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    title: "",
    subtitle: "",
    category: "general",
    headerImage: "",
    content: "",
  });

  const [preview, setPreview] = React.useState<string | null>(null);
  const [drag, setDrag] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; severity?: "success" | "error" }>({
    open: false,
    msg: "",
  });

  /* ---------- drag & drop ---------- */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setForm((f) => ({ ...f, headerImage: `uploads/blog/${file.name}` }));
  };

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/admin/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setToast({ open: true, msg: "Article published 🎉", severity: "success" });
      setTimeout(() => router.push("/admin/blog"), 1200);
    } catch (e: any) {
      setToast({ open: true, msg: e.message, severity: "error" });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,
        position: "relative",
      }}
    >
      {/* BACK BUTTON */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          textTransform: "none",
          bgcolor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          borderRadius: 999,
        }}
      >
        Back
      </Button>

      <Box maxWidth="md" mx="auto">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
          }}
        >
          <Stack spacing={5}>
            {/* TITLE */}
            <Stack spacing={1}>
              <TextField
                placeholder="Article title..."
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: 32, fontWeight: 700 },
                }}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />

              <TextField
                placeholder="Short description that hooks readers..."
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: 16, color: "text.secondary" },
                }}
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </Stack>

            {/* CATEGORY */}
            <Box>
              <Typography fontSize={14} fontWeight={600} mb={1}>
                Category
              </Typography>

              <RadioGroup
                row
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <FormControlLabel
                    key={c.value}
                    value={c.value}
                    control={<Radio sx={{ display: "none" }} />}
                    label={
                      <Paper
                        sx={{
                          px: 3,
                          py: 2,
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          cursor: "pointer",
                          border:
                            form.category === c.value
                              ? "2px solid #0284c7"
                              : "1px solid #e5e7eb",
                        }}
                      >
                        {c.icon}
                        <Typography fontSize={14}>{c.label}</Typography>
                      </Paper>
                    }
                  />
                ))}
              </RadioGroup>
            </Box>

            {/* HEADER IMAGE */}
            <Box>
              <Typography fontSize={14} fontWeight={600} mb={1}>
                Header Image
              </Typography>

              <Paper
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                sx={{
                  height: 240,
                  borderRadius: 4,
                  border: drag ? "2px dashed #0284c7" : "2px dashed #cbd5f5",
                  bgcolor: drag ? "#f0f9ff" : "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {preview ? (
                  <Box
                    component="img"
                    src={preview}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 3 }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <ImageIcon fontSize="large" />
                    <Typography fontSize={14} color="text.secondary">
                      Drag & drop image here
                    </Typography>
                  </Stack>
                )}
              </Paper>
            </Box>

            {/* CONTENT */}
            <Box>
              <Typography fontSize={14} fontWeight={600} mb={1}>
                Content
              </Typography>

              <Box sx={{ minHeight: 600 }}>
                <RichTextEditor
                  value={form.content}
                  onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                />
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* STICKY ACTION */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          sx={{
            borderRadius: 999,
            px: 4,
            py: 1.5,
            fontWeight: 600,
          }}
        >
          Publish Article
        </Button>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.severity || "success"} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
      {/* Tampilkan hasil GET API untuk debug */}
      {apiTestResult && (
        <Box mt={4} p={2} bgcolor="#f5f5f5" borderRadius={2}>
          <Typography variant="subtitle2" color="primary">
            Hasil GET API:
          </Typography>
          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(apiTestResult, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}
