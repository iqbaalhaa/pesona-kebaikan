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
import { blogService } from "@/services/blogService";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const blog = await blogService.getBlogById(resolvedParams.id);

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
  const contentImageMatch = blog.content.match(/<img[^>]+src=["']([^"']+)["']/i);
  const contentImage = contentImageMatch ? contentImageMatch[1] : null;

  const hasHeroImage = blog.heroImage && blog.heroImage.trim().length > 0;

  const cover =
    (hasHeroImage ? blog.heroImage : null) ||
    contentImage ||
    blog.gallery.find((m) => m.type === "image")?.url ||
    "/defaultimg.webp";

  const video = blog.gallery.find((m) => m.type === "video")?.url;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pesonakebaikan.id";
  const postUrl = `${baseUrl}/blog/${blog.id}`;

  return (
    <Box sx={{ px: 2, pt: 2.5, pb: 4, maxWidth: 800, mx: "auto" }}>
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

      <Box sx={{ mt: 4 }}>
        {/* CONTENT */}
        <Box
          sx={{
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 2,
              my: 2,
            },
            "& p": {
              fontSize: 16,
              lineHeight: 1.8,
              color: "rgba(15,23,42,.80)",
              mb: 2,
            },
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              color: "#0f172a",
              fontWeight: 800,
              mt: 3,
              mb: 1,
            },
            "& ul, & ol": {
              pl: 3,
              mb: 2,
              color: "rgba(15,23,42,.80)",
            },
            "& li": {
              mb: 0.5,
            },
            "& a": {
              color: "primary.main",
              textDecoration: "underline",
            },
          }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

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

      <Divider sx={{ my: 4 }} />

      {/* SHARE BUTTONS */}
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0f172a", mb: 1.5 }}>
          Bagikan Artikel
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <IconButton
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
              "&:hover": { bgcolor: "rgba(15,23,42,.05)" },
            }}
          >
            <TwitterIcon fontSize="small" />
          </IconButton>
          <IconButton
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
              "&:hover": { bgcolor: "rgba(15,23,42,.05)" },
            }}
          >
            <FacebookIcon fontSize="small" />
          </IconButton>
          <IconButton
            href="https://www.instagram.com/"
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 2,
              color: "rgba(15,23,42,.7)",
              "&:hover": { bgcolor: "rgba(15,23,42,.05)" },
            }}
          >
            <InstagramIcon fontSize="small" />
          </IconButton>
          <IconButton
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
              "&:hover": { bgcolor: "rgba(15,23,42,.05)" },
            }}
          >
            <WhatsAppIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
