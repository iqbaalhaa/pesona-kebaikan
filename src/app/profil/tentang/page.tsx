"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from "@mui/icons-material/Article";
import DownloadIcon from "@mui/icons-material/Download";

import { getPageContent } from "@/actions/cms";

interface OrgMember {
  name: string;
  position: string;
  image: string;
}

interface Socials {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
}

interface Legality {
  title: string;
  url: string;
}

interface AboutData {
  banner: string;
  vision: string;
  mission: string;
  goals: string;
  achievements: string;
  socials: Socials;
  organization: OrgMember[];
  legality: Legality[];
}

export default function AboutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Tentang Kami");
  const [content, setContent] = useState("");
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const page = await getPageContent("about");
        if (page) {
          setTitle(page.title);
          setContent(page.content);
          if (page.data) {
            setAboutData(page.data as any);
          }
        }
      } catch (error) {
        console.error("Failed to load about data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const SocialLink = ({ icon, url }: { icon: React.ReactNode; url: string }) => {
    if (!url) return null;
    return (
      <IconButton
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: "primary.main", bgcolor: "primary.light", "&:hover": { bgcolor: "primary.main", color: "white" } }}
      >
        {icon}
      </IconButton>
    );
  };

  const HtmlContent = ({ content }: { content: string }) => {
    if (!content) return null;
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: content }} 
        style={{ lineHeight: 1.8, color: "#334155" }}
        className="prose max-w-none"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ px: 2, pt: 2.5, pb: 6 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, mb: 4 }} />
        <Skeleton variant="text" height={40} width="60%" sx={{ mb: 2 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} width="80%" />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header */}
      <Container maxWidth="md" sx={{ pt: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => router.back()} edge="start" sx={{ color: "#0f172a" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
            {title}
          </Typography>
        </Box>
      </Container>

      {/* Banner */}
      {aboutData?.banner ? (
        <Box
          sx={{
            width: "100%",
            height: { xs: 200, md: 350 },
            backgroundImage: `url(${aboutData.banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            mb: 4,
          }}
        />
      ) : (
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background: "linear-gradient(135deg, #61ce70 0%, #16a34a 100%)",
              color: "white",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
              }}
            >
              <FavoriteIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {title}
            </Typography>
          </Paper>
        </Container>
      )}

      <Container maxWidth="md">
        {/* Main Content (About Us) */}
        {content && (
          <Box sx={{ mb: 6 }}>
            <HtmlContent content={content} />
          </Box>
        )}

        {/* Visi Misi Goals */}
        {aboutData && (
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {aboutData.vision && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 3, height: "100%", borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom color="primary">Visi</Typography>
                  <HtmlContent content={aboutData.vision} />
                </Paper>
              </Grid>
            )}
            {aboutData.mission && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 3, height: "100%", borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom color="primary">Misi</Typography>
                  <HtmlContent content={aboutData.mission} />
                </Paper>
              </Grid>
            )}
            {aboutData.goals && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 3, height: "100%", borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom color="primary">Tujuan</Typography>
                  <HtmlContent content={aboutData.goals} />
                </Paper>
              </Grid>
            )}
            {aboutData.achievements && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 3, height: "100%", borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom color="primary">Capaian & Prestasi</Typography>
                  <HtmlContent content={aboutData.achievements} />
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Organization Structure */}
        {aboutData?.organization && aboutData.organization.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={800} align="center" sx={{ mb: 4, color: "#0f172a" }}>
              Tim Kami
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {aboutData.organization.map((member, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: "center", height: "100%", border: "1px solid #e2e8f0", borderRadius: 3 }}>
                    <Avatar
                      src={member.image}
                      sx={{ width: 100, height: 100, mx: "auto", mb: 2, bgcolor: "#f1f5f9" }}
                    >
                      <PersonIcon sx={{ fontSize: 50, color: "#94a3b8" }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0f172a", mb: 0.5 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", display: "block", lineHeight: 1.2 }}>
                      {member.position}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Legality */}
        {aboutData?.legality && aboutData.legality.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: "#0f172a" }}>
              Legalitas & Dokumen
            </Typography>
            <Stack spacing={2}>
              {aboutData.legality.map((doc, index) => (
                <Paper 
                  key={index} 
                  elevation={0} 
                  component="a"
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    p: 2, 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 2, 
                    border: "1px solid #e2e8f0", 
                    borderRadius: 2,
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" }
                  }}
                >
                  <Box sx={{ p: 1, bgcolor: "#e0f2fe", borderRadius: 1, color: "#0284c7" }}>
                    <ArticleIcon />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {doc.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Klik untuk melihat dokumen
                    </Typography>
                  </Box>
                  <DownloadIcon color="action" />
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Social Media */}
        {aboutData?.socials && (
          <Box sx={{ textAlign: "center", pt: 4, borderTop: "1px solid #e2e8f0" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "#0f172a" }}>
              Ikuti Kami
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <SocialLink icon={<FacebookIcon />} url={aboutData.socials.facebook} />
              <SocialLink icon={<InstagramIcon />} url={aboutData.socials.instagram} />
              <SocialLink icon={<TwitterIcon />} url={aboutData.socials.twitter} />
              <SocialLink icon={<LinkedInIcon />} url={aboutData.socials.linkedin} />
              <SocialLink icon={<YouTubeIcon />} url={aboutData.socials.youtube} />
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
