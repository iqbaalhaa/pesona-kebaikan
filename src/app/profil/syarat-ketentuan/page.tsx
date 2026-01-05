"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";

import { getPageContent } from "@/actions/cms";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PageContainer from "@/components/profile/PageContainer";

export default function TermsPage() {
  const [content, setContent] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const page = await getPageContent("terms");
        if (page?.content) {
          setContent(page.content);
        }
      } catch (e) {
        console.error("Failed to load terms", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PageContainer>
      <ProfileHeader title="Syarat & Ketentuan" />

      {/* Intro Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <GavelIcon sx={{ color: "#64748b" }} />
        <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
          Harap membaca syarat dan ketentuan ini dengan saksama sebelum
          menggunakan platform Pesona Kebaikan.
        </Typography>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : content ? (
        <Box
          className="sun-editor-editable" 
          sx={{
            "& h3": { fontSize: 16, fontWeight: 800, color: "#0f172a", mb: 1, mt: 2 },
            "& p": { fontSize: 14, color: "rgba(15,23,42,0.7)", lineHeight: 1.8, mb: 1.5 },
            "& ul, & ol": { pl: 3, mb: 1.5 },
            "& li": { fontSize: 14, color: "rgba(15,23,42,0.7)", lineHeight: 1.8, mb: 0.5 },
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <Typography sx={{ color: "text.secondary", textAlign: "center" }}>
          Belum ada konten syarat & ketentuan.
        </Typography>
      )}

      <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
        <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.5)" }}>
          Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </Typography>
      </Box>
    </PageContainer>
  );
}
