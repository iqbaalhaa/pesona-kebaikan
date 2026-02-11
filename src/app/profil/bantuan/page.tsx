"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";

// Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// Actions
import { getFaqs } from "@/actions/cms";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PageContainer from "@/components/profile/PageContainer";

export default function HelpCenterPage() {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [faqs, setFaqs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await getFaqs();
        setFaqs(data);
      } catch (error) {
        console.error("Failed to load FAQs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <ProfileHeader title="Pusat Bantuan" />

      {/* Search */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 4,
          bgcolor: "#0ba976",
          color: "white",
          textAlign: "center",
        }}
      >
        <HelpOutlineIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
        <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 0.5 }}>
          Halo, ada yang bisa kami bantu?
        </Typography>
        <Typography sx={{ fontSize: 13, mb: 2, opacity: 0.9 }}>
          Temukan jawaban untuk pertanyaan Anda disini
        </Typography>
        <TextField
          fullWidth
          placeholder="Cari topik bantuan..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": { border: "none" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "rgba(0,0,0,0.4)" }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* FAQ List */}
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 800,
          color: "#0f172a",
          mb: 2,
        }}
      >
        Pertanyaan Sering Diajukan
      </Typography>

      <Box>
        {loading ? (
          // Loading skeletons
          Array.from(new Array(3)).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={56}
              sx={{ mb: 1, borderRadius: 3 }}
            />
          ))
        ) : filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expanded === faq.id}
              onChange={handleChange(faq.id)}
              elevation={0}
              sx={{
                mb: 1,
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "12px !important",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${faq.id}-content`}
                id={`${faq.id}-header`}
              >
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ fontSize: 13, color: "rgba(15,23,42,0.7)" }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography
            sx={{
              textAlign: "center",
              py: 4,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            {search
              ? "Tidak ada pertanyaan yang cocok dengan pencarian Anda"
              : "Belum ada FAQ yang ditambahkan"}
          </Typography>
        )}
      </Box>
    </PageContainer>
  );
}
