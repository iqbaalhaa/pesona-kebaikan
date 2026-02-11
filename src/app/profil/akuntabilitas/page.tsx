"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

// Icons
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DownloadIcon from "@mui/icons-material/Download";

import { getPageContent } from "@/actions/cms";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PageContainer from "@/components/profile/PageContainer";

interface AccountabilityData {
  hero: {
    title: string;
    description: string;
  };
  cards: {
    icon: string;
    title: string;
    description: string;
  }[];
  reports: {
    year: string;
    title: string;
    size: string;
    url: string;
  }[];
}

export default function AccountabilityPage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<AccountabilityData | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const page = await getPageContent("accountability");
        if (page?.data) {
          setData(page.data as any);
        }
      } catch (e) {
        console.error("Failed to load accountability data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) return null;

  return (
    <PageContainer>
      <ProfileHeader title="Akuntabilitas" />

      {/* Trust Badge */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <VerifiedUserIcon sx={{ fontSize: 48, mb: 2, color: "#0ba976" }} />
        <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 1 }}>
          {data.hero.title}
        </Typography>
        <Typography sx={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>
          {data.hero.description}
        </Typography>
      </Paper>

      {/* Pillars */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {data.cards.map((card, idx) => (
          <Grid size={{ xs: 6 }} key={idx}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                height: "100%",
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {card.icon === "audit" ? (
                <AssessmentIcon sx={{ fontSize: 32, color: "#0ba976", mb: 1 }} />
              ) : (
                <AccountBalanceIcon sx={{ fontSize: 32, color: "#0ba976", mb: 1 }} />
              )}
              <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>
                {card.title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
                {card.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Annual Reports */}
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 800,
          color: "#0f172a",
          mb: 2,
        }}
      >
        Laporan Tahunan
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {data.reports.map((report, idx) => (
          <Paper
            key={idx}
            elevation={0}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {report.title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
                PDF • {report.size}
              </Typography>
            </Box>
            <IconButton sx={{ color: "#0ba976" }} component="a" href={report.url} target="_blank">
              <DownloadIcon />
            </IconButton>
          </Paper>
        ))}
      </Box>
    </PageContainer>
  );
}
