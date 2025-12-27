"use client";

import * as React from "react";
import Link from "next/link";

import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import BlogCard, { BlogItem } from "@/components/admin/BlogCard";
import {stripHtml} from "@/utils/striphtml";

/* ================= TYPES ================= */

type ApiBlog = {
  id: string;
  title: string;
  excerpt: string;
  headerImage?: string | null;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  } | null;
  author: {
    id: string;
    name: string | null;
    image?: string | null;
  };
};

export default function AdminBlogPage() {
  const [items, setItems] = React.useState<BlogItem[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  /* ================= FETCH ================= */

  const fetchBlogs = React.useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/blog?q=${encodeURIComponent(keyword)}`
      );
      const json = await res.json();

      const mapped: BlogItem[] = json.data.map((b: ApiBlog) => ({
  id: b.id,
  title: b.title,
  excerpt: stripHtml(b.excerpt), // 🔥 FIX DI SINI
  image: "/defaultimg.webp",
  category: b.category?.name || "Uncategorized",
  date: new Date(b.createdAt).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  author: b.author?.name || "Admin",
}));


      setItems(mapped);
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= INIT ================= */
  React.useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  /* ================= SEARCH (DEBOUNCE) ================= */
  React.useEffect(() => {
    const t = setTimeout(() => fetchBlogs(q), 350);
    return () => clearTimeout(t);
  }, [q, fetchBlogs]);

  /* ================= UI ================= */
  return (
    <Box>
      {/* ===== TOP PANEL ===== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(15,23,42,.10)",
          bgcolor: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            background:
              "radial-gradient(900px 380px at 0% 0%, rgba(97,206,112,.18), transparent 55%), radial-gradient(900px 380px at 100% 0%, rgba(59,130,246,.12), transparent 55%)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            {/* LEFT */}
            <Box>
              <Typography sx={{ fontWeight: 1000, fontSize: 20 }}>
                Blog
              </Typography>
              <Typography sx={{ mt: 0.25, fontSize: 12.5, color: "rgba(15,23,42,.62)" }}>
                Kelola artikel & konten edukasi.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                <Chip
                  label={`${items.length} artikel`}
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 900,
                    bgcolor: "rgba(255,255,255,.55)",
                  }}
                />
              </Stack>
            </Box>

            {/* RIGHT */}
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul, kategori…"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", md: 320 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,.70)",
                    border: "1px solid rgba(15,23,42,.10)",
                    "& fieldset": { border: "none" },
                  },
                }}
              />

              <IconButton
                onClick={() => fetchBlogs(q)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,.70)",
                  border: "1px solid rgba(15,23,42,.10)",
                }}
              >
                <RefreshRoundedIcon fontSize="small" />
              </IconButton>

              <Button
                component={Link}
                href="/admin/blog/create"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                sx={{
                  borderRadius: 999,
                  fontWeight: 1000,
                  textTransform: "none",
                  px: 2,
                  bgcolor: "#61ce70",
                  "&:hover": { bgcolor: "#55bf64" },
                }}
              >
                Tulis
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mt: 2 }} />
        </Box>
      </Paper>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <Stack alignItems="center" mt={6}>
          <CircularProgress />
        </Stack>
      ) : items.length === 0 ? (
        <Stack alignItems="center" mt={6}>
          <Typography color="text.secondary">
            Belum ada blog 😴
          </Typography>
        </Stack>
      ) : (
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
          }}
        >
          {items.map((b) => (
            <Box
              key={b.id}
              sx={{
                transition: "transform 160ms ease",
                "&:hover": { transform: "translateY(-3px)" },
              }}
            >
              <BlogCard data={b} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
