"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createFundraiser, checkFundraiserSlug } from "@/actions/fundraiser";

export default function CreateFundraiserPage({
  params,
}: {
  // ✅ Next.js App Router: params itu object, bukan Promise
  params: { slug: string };
}) {
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [target, setTarget] = React.useState<number>(0);

  const [slug, setSlug] = React.useState("");
  const [slugChecking, setSlugChecking] = React.useState(false);
  const [slugAvailable, setSlugAvailable] = React.useState<boolean | null>(
    null
  );
  const [slugNormalized, setSlugNormalized] = React.useState("");

  // ✅ browser-safe timeout type
  const slugCheckRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [createdSlug, setCreatedSlug] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "error";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  // ✅ cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (slugCheckRef.current) clearTimeout(slugCheckRef.current);
    };
  }, []);

  const localSlugify = (v: string) =>
    v
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnack({ open: true, msg: "Tautan disalin", type: "success" });
    } catch {
      setSnack({ open: true, msg: "Gagal menyalin tautan", type: "error" });
    }
  };

  const openInNewTab = (url: string) => {
    // ✅ safer: noopener,noreferrer
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugAvailable(null);
    setSlugNormalized("");

    if (slugCheckRef.current) clearTimeout(slugCheckRef.current);

    const raw = val.trim();
    if (!raw) {
      setSlugChecking(false);
      return;
    }

    // ✅ normalize first, so check is consistent
    const normalized = localSlugify(raw);
    setSlugNormalized(normalized);

    slugCheckRef.current = setTimeout(async () => {
      setSlugChecking(true);
      try {
        // ✅ check normalized slug (recommended)
        const res = await checkFundraiserSlug(normalized);
        if (res.success) {
          setSlugAvailable(res.available);
          setSlugNormalized(res.slug || normalized);
        } else {
          setSlugAvailable(false);
        }
      } catch {
        setSlugAvailable(false);
      } finally {
        setSlugChecking(false);
      }
    }, 400);
  };

  const liveSlug = React.useMemo(() => {
    if (slug.trim()) return slugNormalized || localSlugify(slug);
    if (title.trim()) return localSlugify(title);
    return "";
  }, [slug, slugNormalized, title]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const liveUrl = liveSlug
    ? baseUrl
      ? `${baseUrl}/donasi/fundraiser/${liveSlug}`
      : `/donasi/fundraiser/${liveSlug}`
    : "";

  const previewUrl =
    createdSlug && baseUrl
      ? `${baseUrl}/donasi/fundraiser/${createdSlug}`
      : createdSlug
      ? `/donasi/fundraiser/${createdSlug}`
      : "";

  const canSubmit =
    !loading &&
    !slugChecking &&
    !!title.trim() &&
    Number(target) > 0 &&
    // kalau user isi slug, harus available true (atau minimal bukan false)
    (!slug.trim() || slugAvailable !== false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      // optional: feedback kecil
      if (slug.trim() && slugAvailable === false) {
        setSnack({ open: true, msg: "Slug tidak tersedia", type: "error" });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await createFundraiser({
        campaignSlug: params.slug,
        title: title.trim(),
        target: Number(target || 0),
        // kalau user kosongkan slug, biarkan backend yang generate
        slug: slug.trim() ? slugNormalized || localSlugify(slug) : "",
      });

      if (!res.success) {
        setSnack({
          open: true,
          msg: res.error || "Gagal membuat fundraiser",
          type: "error",
        });
        return;
      }

      setSnack({
        open: true,
        msg: "Fundraiser berhasil dibuat",
        type: "success",
      });
      setCreatedSlug(res.data?.slug ?? null);
    } catch {
      setSnack({ open: true, msg: "Gagal membuat fundraiser", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            onClick={() => router.back()}
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "white",
              color: "text.primary",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              position: "absolute",
              left: 16,
              top: 24,
              zIndex: 10,
              "&:hover": { bgcolor: "#f8fafc" },
            }}
            aria-label="Kembali"
          >
            <ArrowBackIcon />
          </Button>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              width: "100%",
              textAlign: "center",
            }}
          >
            Buat Fundraiser
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              label="Judul Fundraiser"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Slug Kustom"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="contoh: bantu-siwa-rt-03"
              fullWidth
              helperText={
                slug.trim()
                  ? slugChecking
                    ? "Memeriksa ketersediaan slug…"
                    : slugAvailable === true
                    ? `Slug tersedia: ${slugNormalized}`
                    : slugAvailable === false
                    ? `Slug tidak tersedia: ${slugNormalized}`
                    : ""
                  : "Kosongkan jika ingin otomatis dari judul"
              }
              color={
                slugAvailable === true
                  ? "success"
                  : slugAvailable === false
                  ? "error"
                  : "primary"
              }
            />

            {liveUrl ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  p: 1.25,
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: 14,
                    color: "#334155",
                    wordBreak: "break-all",
                  }}
                >
                  {liveUrl}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => copyToClipboard(liveUrl)}
                >
                  Salin
                </Button>

                <Button
                  variant="contained"
                  onClick={() => openInNewTab(liveUrl)}
                >
                  Buka
                </Button>
              </Box>
            ) : null}

            <TextField
              label="Target Dana (Rp)"
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!canSubmit}
              sx={{ borderRadius: 2, fontWeight: 800, py: 1.25 }}
            >
              {loading
                ? "Membuat..."
                : slugChecking
                ? "Memeriksa slug..."
                : "Buat Fundraiser"}
            </Button>
          </Box>
        </Paper>

        {createdSlug && (
          <Paper elevation={0} sx={{ p: 3, mt: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={800}>
              Link Fundraiser
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                p: 1.25,
                mt: 1.5,
              }}
            >
              <Typography
                sx={{
                  flex: 1,
                  fontSize: 14,
                  color: "#334155",
                  wordBreak: "break-all",
                }}
              >
                {previewUrl}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => copyToClipboard(previewUrl)}
              >
                Salin
              </Button>

              <Button
                variant="contained"
                onClick={() => openInNewTab(previewUrl)}
              >
                Buka
              </Button>
            </Box>
          </Paper>
        )}
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <MuiAlert
          severity={snack.type}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
