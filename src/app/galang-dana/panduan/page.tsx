"use server";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { getPageContent } from "@/actions/cms";

export default async function FundraiseGuidePage() {
  const content = await getPageContent("fundraise_guide");

  const title = content?.title || "Panduan Galang Dana";
  const html = content?.content || `
    <h2>Mulai Dengan Cerita Yang Kuat</h2>
    <p>Ceritakan siapa yang dibantu, kenapa butuh bantuan, dan bagaimana dampaknya. Gunakan bahasa yang jujur dan menyentuh.</p>
    <h2>Tambahkan Bukti Yang Relevan</h2>
    <p>Sertakan foto, dokumen pendukung, dan update berkala untuk menjaga kepercayaan donatur.</p>
    <h2>Bagikan Ke Komunitas</h2>
    <p>Bagikan campaign ke WhatsApp, media sosial, dan komunitas untuk menjangkau lebih banyak orang baik.</p>
  `;

  const tips: { icon: JSX.Element; title: string; desc: string; color: string }[] = [
    {
      icon: <LightbulbOutlinedIcon />,
      title: "Tulis judul yang spesifik",
      desc: "Judul yang jelas memudahkan orang memahami tujuan galang dana.",
      color: "#10b981",
    },
    {
      icon: <CampaignOutlinedIcon />,
      title: "Gunakan visual yang kuat",
      desc: "Foto/Video yang relevan meningkatkan kepercayaan dan empati.",
      color: "#0ea5e9",
    },
    {
      icon: <FavoriteBorderOutlinedIcon />,
      title: "Update secara berkala",
      desc: "Cerita perkembangan membuat donatur merasa terlibat.",
      color: "#f59e0b",
    },
    {
      icon: <SecurityOutlinedIcon />,
      title: "Transparansi penggunaan dana",
      desc: "Jelaskan rencana penggunaan dana dan bukti penyaluran.",
      color: "#8b5cf6",
    },
  ];

  const steps = [
    "Tentukan tujuan dan target dana yang realistis",
    "Siapkan cerita dan bukti pendukung",
    "Pilih kategori yang sesuai",
    "Bagikan campaign secara konsisten",
    "Berikan update dan ucapan terima kasih",
  ];

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Container maxWidth="md" sx={{ px: 2, pt: 3, pb: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label="Panduan"
              size="small"
              sx={{ borderRadius: 1, fontWeight: 700 }}
              color="success"
              variant="outlined"
            />
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: 22, mt: 1, color: "text.primary" }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
            Tips agar campaign kamu lebih sukses, informatif, dan dipercaya
          </Typography>
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Stack spacing={2}>
            {tips.map((t, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: `${t.color}20`,
                    color: t.color,
                    flexShrink: 0,
                  }}
                >
                  {t.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 14, color: "text.primary" }}>
                    {t.title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.3 }}>
                    {t.desc}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 16, mb: 1 }}>Langkah-langkah</Typography>
          <Stack spacing={1.2}>
            {steps.map((s, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{s}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              "& img": { maxWidth: "100%", height: "auto", borderRadius: 2, my: 1.5 },
              "& p": { fontSize: 15, lineHeight: 1.8, color: "text.secondary", mb: 2 },
              "& h1, & h2, & h3": { color: "text.primary", fontWeight: 800, mt: 2, mb: 1 },
              "& ul, & ol": { pl: 3, mb: 2 },
              "& li": { mb: 0.5 },
              "& a": { color: "primary.main", textDecoration: "underline" },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Paper>
      </Container>
    </Box>
  );
}

