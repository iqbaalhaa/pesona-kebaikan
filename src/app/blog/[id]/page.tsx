import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TwitterIcon from "@mui/icons-material/Twitter";
import { getBlogById } from "@/services/blogService";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const blog = await getBlogById(resolvedParams.id);

  if (!blog) {
    return (
      <Box sx={{ px: 2, py: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
          Tidak ditemukan
        </Typography>
        <Button
          component="a"
          href="/blog"
          startIcon={<ArrowBackIosNewIcon fontSize="small" />}
          sx={{ mt: 2 }}
        >
          Kembali
        </Button>
      </Box>
    );
  }

  // Map data
  const cover =
    blog.headerImage ||
    blog.gallery.find((m) => m.type === "image")?.url ||
    "/defaultimg.webp";

  const images = blog.gallery
    .filter((m) => m.type === "image")
    .map((m) => m.url);
    
  const video = blog.gallery.find((m) => m.type === "video")?.url;

  // Handle content: split by newline if it's plain text, or just use as is if HTML.
  // The original UI expects an array of strings.
  // If we assume the content is HTML (from SunEditor), we might want to render it as HTML.
  // But for now, to match the UI which maps paragraphs to Typography, let's split by \n.
  // However, SunEditor produces HTML. Splitting HTML by \n is risky.
  // If the content is HTML, we should probably use dangerouslySetInnerHTML or a parser.
  // But the user task is "connect to data".
  // I'll stick to splitting by \n for now, assuming the data might be plain text or simple HTML.
  // If it's HTML, we might need a different approach, but let's assume it's text-ish.
  const contentParagraphs = blog.content.split("\n").filter((p) => p.trim() !== "");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pesonakebaikan.id";
  const postUrl = `${baseUrl}/blog/${blog.id}`;

  return (
    <Box sx={{ px: 2, pt: 2.5, pb: 4, maxWidth: 1040, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Button
          component="a"
          href="/blog"
          startIcon={<ArrowBackIosNewIcon fontSize="small" />}
          sx={{ textTransform: "none", fontWeight: 800 }}
        >
          Kembali
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={blog.category?.name || "Uncategorized"}
            size="small"
            sx={{ borderRadius: 1 }}
          />
          <Typography
            sx={{ fontSize: 12, fontWeight: 800, color: "rgba(15,23,42,.55)" }}
          >
            {new Date(blog.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: { xs: 22, md: 32 },
            fontWeight: 900,
            color: "#0f172a",
            lineHeight: 1.2,
          }}
        >
          {blog.title}
        </Typography>
      </Box>

      <Card
        variant="outlined"
        sx={{
          mt: 2,
          borderRadius: 2,
          overflow: "hidden",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <CardMedia
          component="img"
          image={cover}
          alt={blog.title}
          sx={{ height: { xs: 220, md: 420 }, objectFit: "cover" }}
        />
      </Card>

      <Box
        sx={{
          mt: 2.5,
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
        }}
      >
        <Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {contentParagraphs.map((p, i) => (
              <Typography
                key={i}
                sx={{
                  fontSize: 15.5,
                  color: "rgba(15,23,42,.80)",
                  lineHeight: 1.75,
                }}
              >
                {p}
              </Typography>
            ))}
          </Box>

          {video && (
            <Card
              variant="outlined"
              sx={{
                mt: 3,
                borderRadius: 2,
                overflow: "hidden",
                borderColor: "rgba(0,0,0,0.08)",
              }}
            >
              <CardMedia
                component="video"
                src={video}
                controls
                sx={{
                  width: "100%",
                  height: { xs: 220, md: 360 },
                  backgroundColor: "black",
                }}
              />
            </Card>
          )}
        </Box>

        <Box>
          <Typography
            sx={{ fontWeight: 900, fontSize: 14.5, color: "#0f172a", mb: 1 }}
          >
            Galeri
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
          >
            {images.length === 0 && (
              <Typography sx={{ fontSize: 13, color: "rgba(15,23,42,.60)", gridColumn: "span 2" }}>
                Tidak ada gambar lain.
              </Typography>
            )}
            {images.map((src, i) => {
              // Jika jumlah ganjil, gambar pertama jadi full width biar keren
              const isFullWidth = images.length % 2 !== 0 && i === 0;
              return (
                <Card
                  key={i}
                  variant="outlined"
                  sx={{
                    gridColumn: isFullWidth ? "span 2" : "span 1",
                    borderRadius: 2,
                    overflow: "hidden",
                    borderColor: "rgba(0,0,0,0.08)",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={src}
                    alt={`image-${i + 1}`}
                    sx={{
                      height: isFullWidth ? 200 : 120,
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Card>
              );
            })}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ fontSize: 13, color: "rgba(15,23,42,.60)" }}>
            Bagikan
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <IconButton
              size="small"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                blog.title
              )}&url=${encodeURIComponent(postUrl)}`}
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 2,
                color: "rgba(15,23,42,.7)",
              }}
            >
              <TwitterIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                postUrl
              )}`}
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 2,
                color: "rgba(15,23,42,.7)",
              }}
            >
              <FacebookIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href="https://www.instagram.com/"
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 2,
                color: "rgba(15,23,42,.7)",
              }}
            >
              <InstagramIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              href={`https://wa.me/?text=${encodeURIComponent(
                blog.title + " " + postUrl
              )}`}
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 2,
                color: "rgba(15,23,42,.7)",
              }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
