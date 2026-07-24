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
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { uploadImage } from "@/actions/upload";
import { stripHtml } from "@/utils/striphtml";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  { ssr: false }
);

const MIN_TITLE_LENGTH = 5;
const MIN_CONTENT_LENGTH = 50;

type Category = { id: string; name: string };

function SectionLabel({
  title,
  required,
  hint,
}: {
  title: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
        {title}
        {required && (
          <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>
      {hint && (
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export default function CreateBlogPage() {
  const router = useRouter();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [addingCategory, setAddingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [savingCategory, setSavingCategory] = React.useState(false);

  const [form, setForm] = React.useState({
    title: "",
    category: "",
    headerImage: "",
    content: "",
  });

  const [touched, setTouched] = React.useState({
    title: false,
    category: false,
    content: false,
  });

  const [preview, setPreview] = React.useState<string | null>(null);
  const [drag, setDrag] = React.useState(false);
  const [imageUploading, setImageUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [toast, setToast] = React.useState<{
    open: boolean;
    msg: string;
    severity?: "success" | "error";
  }>({ open: false, msg: "" });

  React.useEffect(() => {
    fetch("/api/admin/blog-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setForm((f) => ({ ...f, category: data[0].id }));
          }
        }
      })
      .catch((err) => console.error("Failed to fetch categories", err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /* ---------- validasi ---------- */
  const titleValid = form.title.trim().length >= MIN_TITLE_LENGTH;
  const categoryValid = !!form.category;
  const contentTextLength = stripHtml(form.content, 100000).trim().length;
  const contentValid = contentTextLength >= MIN_CONTENT_LENGTH;
  const formValid = titleValid && categoryValid && contentValid;

  /* ---------- upload gambar sampul ---------- */
  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setToast({ open: true, msg: "File harus berupa gambar", severity: "error" });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setToast({
        open: true,
        msg: "Ukuran gambar maksimal 3MB",
        severity: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    setImageUploading(true);
    try {
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setForm((f) => ({ ...f, headerImage: res.url }));
        setToast({ open: true, msg: "Gambar sampul berhasil diunggah", severity: "success" });
      } else {
        setPreview(null);
        setToast({ open: true, msg: res.error || "Gagal mengunggah gambar", severity: "error" });
      }
    } catch {
      setPreview(null);
      setToast({ open: true, msg: "Terjadi kesalahan saat mengunggah gambar", severity: "error" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setForm((f) => ({ ...f, headerImage: "" }));
  };

  /* ---------- kategori baru ---------- */
  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name || savingCategory) return;

    setSavingCategory(true);
    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat kategori");

      setCategories((prev) =>
        prev.some((c) => c.id === data.id) ? prev : [...prev, data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm((f) => ({ ...f, category: data.id }));
      setNewCategoryName("");
      setAddingCategory(false);
      setToast({ open: true, msg: `Kategori "${data.name}" siap dipakai`, severity: "success" });
    } catch (e: any) {
      setToast({ open: true, msg: e.message, severity: "error" });
    } finally {
      setSavingCategory(false);
    }
  };

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    setTouched({ title: true, category: true, content: true });
    if (!formValid || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content,
          categoryId: form.category,
          heroImage: form.headerImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menerbitkan artikel");

      setToast({ open: true, msg: "Artikel berhasil diterbitkan 🎉", severity: "success" });
      setTimeout(() => router.push("/admin/blog"), 1000);
    } catch (e: any) {
      setToast({ open: true, msg: e.message, severity: "error" });
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ pb: "calc(6.5rem + env(safe-area-inset-bottom))" }}>
      {/* ===== HEADER ===== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(15,23,42,.10)",
          bgcolor: "#fff",
          overflow: "hidden",
          mb: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            background:
              "radial-gradient(900px 380px at 0% 0%, rgba(11,169,118,.18), transparent 55%), radial-gradient(900px 380px at 100% 0%, rgba(59,130,246,.12), transparent 55%)",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              onClick={() => router.push("/admin/blog")}
              sx={{
                bgcolor: "rgba(255,255,255,.70)",
                border: "1px solid rgba(15,23,42,.10)",
              }}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography sx={{ fontWeight: 1000, fontSize: 20 }}>
                Tulis Artikel Baru
              </Typography>
              <Typography sx={{ mt: 0.25, fontSize: 12.5, color: "rgba(15,23,42,.62)" }}>
                Lengkapi judul, kategori, gambar sampul, dan isi artikel di bawah ini.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 3,
          border: "1px solid rgba(15,23,42,.10)",
        }}
      >
        <Stack spacing={4}>
          {/* JUDUL */}
          <Box>
            <SectionLabel title="Judul Artikel" required />
            <TextField
              placeholder="Contoh: 5 Cara Berdonasi dengan Aman"
              fullWidth
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, title: true }))}
              error={touched.title && !titleValid}
              helperText={
                touched.title && !titleValid
                  ? `Judul minimal ${MIN_TITLE_LENGTH} karakter`
                  : `${form.title.trim().length} karakter`
              }
              InputProps={{ sx: { fontSize: 22, fontWeight: 700 } }}
            />
          </Box>

          {/* KATEGORI */}
          <Box>
            <SectionLabel
              title="Kategori"
              required
              hint="Pilih kategori yang paling sesuai supaya pembaca mudah menemukan artikel ini."
            />

            {categoriesLoading ? (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
                <CircularProgress size={18} />
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  Memuat kategori…
                </Typography>
              </Stack>
            ) : (
              <>
                {categories.length === 0 && !addingCategory && (
                  <Alert severity="info" sx={{ borderRadius: 2, mb: 1.25 }}>
                    Belum ada kategori blog. Buat kategori pertama lewat tombol di bawah.
                  </Alert>
                )}
                <Stack direction="row" flexWrap="wrap" gap={1.25} alignItems="center">
                  {categories.map((c) => {
                    const active = form.category === c.id;
                    return (
                      <Paper
                        key={c.id}
                        variant="outlined"
                        onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 999,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                          userSelect: "none",
                          borderColor: active ? "#0ba976" : "rgba(15,23,42,.15)",
                          bgcolor: active ? "rgba(11,169,118,.08)" : "transparent",
                          transition: "all 120ms ease",
                          "&:hover": { borderColor: "#0ba976" },
                        }}
                      >
                        <ArticleRoundedIcon
                          fontSize="small"
                          sx={{ color: active ? "#0ba976" : "rgba(15,23,42,.4)" }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: active ? 800 : 600,
                            color: active ? "#0ba976" : "text.primary",
                          }}
                        >
                          {c.name}
                        </Typography>
                      </Paper>
                    );
                  })}

                  {addingCategory ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        autoFocus
                        placeholder="Nama kategori baru"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCategory();
                          }
                          if (e.key === "Escape") {
                            setAddingCategory(false);
                            setNewCategoryName("");
                          }
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 999 }, width: 200 }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim() || savingCategory}
                        sx={{
                          borderRadius: 999,
                          textTransform: "none",
                          fontWeight: 800,
                          boxShadow: "none",
                          bgcolor: "#0ba976",
                          "&:hover": { bgcolor: "#089166" },
                        }}
                      >
                        {savingCategory ? <CircularProgress size={16} color="inherit" /> : "Tambah"}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setAddingCategory(false);
                          setNewCategoryName("");
                        }}
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Paper
                      variant="outlined"
                      onClick={() => setAddingCategory(true)}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 999,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        cursor: "pointer",
                        userSelect: "none",
                        borderStyle: "dashed",
                        borderColor: "rgba(15,23,42,.25)",
                        color: "text.secondary",
                        "&:hover": { borderColor: "#0ba976", color: "#0ba976" },
                      }}
                    >
                      <AddRoundedIcon fontSize="small" />
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                        Kategori Baru
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </>
            )}
            {touched.category && !categoryValid && categories.length > 0 && (
              <Typography sx={{ fontSize: 12, color: "error.main", mt: 0.75 }}>
                Pilih salah satu kategori
              </Typography>
            )}
          </Box>

          {/* GAMBAR SAMPUL */}
          <Box>
            <SectionLabel
              title="Gambar Sampul"
              hint="Opsional, tapi sangat disarankan agar artikel lebih menarik di daftar blog. Maks. 3MB."
            />

            <Paper
              onClick={() => !imageUploading && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              sx={{
                position: "relative",
                height: 220,
                borderRadius: 3,
                border: drag ? "2px dashed #0ba976" : "2px dashed rgba(15,23,42,.15)",
                bgcolor: drag ? "rgba(11,169,118,.06)" : "rgba(15,23,42,.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: imageUploading ? "default" : "pointer",
                overflow: "hidden",
              }}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
              />

              {imageUploading ? (
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress size={28} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Mengunggah gambar…
                  </Typography>
                </Stack>
              ) : preview ? (
                <>
                  <Box
                    component="img"
                    src={preview}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <IconButton
                    onClick={removeImage}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(0,0,0,.55)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,.75)" },
                    }}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      bgcolor: "rgba(0,0,0,.55)",
                      color: "#fff",
                      borderRadius: 999,
                      px: 1.25,
                      py: 0.4,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    Klik untuk ganti gambar
                  </Box>
                </>
              ) : (
                <Stack alignItems="center" spacing={1}>
                  <ImageRoundedIcon fontSize="large" sx={{ color: "rgba(15,23,42,.3)" }} />
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                    Klik atau seret gambar ke sini
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                    Format JPG/PNG, maksimal 3MB
                  </Typography>
                </Stack>
              )}
            </Paper>
          </Box>

          {/* KONTEN */}
          <Box>
            <SectionLabel
              title="Isi Artikel"
              required
              hint={`Minimal ${MIN_CONTENT_LENGTH} karakter. Saat ini: ${contentTextLength} karakter.`}
            />

            <Box
              sx={{
                minHeight: 500,
                border: touched.content && !contentValid ? "1px solid" : "none",
                borderColor: "error.main",
                borderRadius: 1,
              }}
            >
              <RichTextEditor
                value={form.content}
                onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                placeholder="Tulis isi artikel di sini…"
              />
            </Box>
            {touched.content && !contentValid && (
              <Typography sx={{ fontSize: 12, color: "error.main", mt: 0.75 }}>
                Isi artikel minimal {MIN_CONTENT_LENGTH} karakter
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* ===== ACTION BAR ===== */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: { xs: 2, md: 4 },
            py: 1.5,
            borderTop: "1px solid rgba(15,23,42,.10)",
            borderRadius: 0,
            bgcolor: "rgba(255,255,255,.92)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1.5,
            pb: "calc(0.75rem + env(safe-area-inset-bottom))",
          }}
        >
          {!formValid && (touched.title || touched.category || touched.content) && (
            <Typography sx={{ fontSize: 12, color: "error.main", mr: "auto" }}>
              Lengkapi semua field wajib sebelum menerbitkan
            </Typography>
          )}
          <Button
            onClick={() => router.push("/admin/blog")}
            sx={{ textTransform: "none", fontWeight: 700, color: "text.secondary" }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || imageUploading}
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleRoundedIcon />
              )
            }
            sx={{
              borderRadius: 999,
              px: 3,
              fontWeight: 800,
              textTransform: "none",
              boxShadow: "none",
              bgcolor: "#0ba976",
              "&:hover": { bgcolor: "#089166" },
            }}
          >
            {submitting ? "Menerbitkan…" : "Terbitkan Artikel"}
          </Button>
        </Paper>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 99999 }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity || "success"}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
