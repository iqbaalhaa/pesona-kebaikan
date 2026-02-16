"use client";

import * as React from "react";
import { Box, Typography, Chip, Stack, Paper, Avatar } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { formatIDR } from "./utils";
import { useRouter } from "next/navigation";

interface CampaignDonorsProps {
  donorsCount: number;
  latestDonations: any[];
  latestPrayers: any[];
  setOpenDonorsModal: (open: boolean) => void;
  campaignId?: string;
  campaignSlug?: string;
  fundraiserCount?: number;
  setOpenFundraiserModal?: (open: boolean) => void;
  showFundraiserLabel?: boolean;
}

export default function CampaignDonors({
  donorsCount,
  latestDonations,
  latestPrayers,
  setOpenDonorsModal,
  campaignId,
  campaignSlug,
  fundraiserCount = 0,
	setOpenFundraiserModal,
  showFundraiserLabel = true,
}: CampaignDonorsProps) {
  const router = useRouter();
  return (
    <>
      {/* Donasi */}
      <Box sx={{ mb: 4 }}>
        <Box
          onClick={() => setOpenDonorsModal(true)}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
            cursor: "pointer",
            "&:hover .MuiTypography-root": { color: "#0ea5e9" },
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, transition: "color 0.2s" }}
          >
            Donasi
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={donorsCount}
              size="small"
              sx={{
                bgcolor: "#e0f2fe",
                color: "#0284c7",
                fontWeight: 700,
                height: 24,
                borderRadius: 1.5,
              }}
            />
            <NavigateNextIcon sx={{ color: "#94a3b8" }} />
          </Box>
        </Box>
      </Box>

      {/* Fundraiser (label only) */}
      {showFundraiserLabel && (
        <Box sx={{ mb: 4 }}>
          <Box
            onClick={() => {
              if (typeof setOpenFundraiserModal === "function") {
                setOpenFundraiserModal(true);
              } else {
                router.push("/donasi/fundraiser");
              }
            }}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
              cursor: "pointer",
              "&:hover .MuiTypography-root": { color: "#0ea5e9" },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Fundraiser
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={fundraiserCount}
                size="small"
                sx={{
                  bgcolor: "#e0f2fe",
                  color: "#0284c7",
                  fontWeight: 700,
                  height: 24,
                  borderRadius: 1.5,
                }}
              />
              <NavigateNextIcon sx={{ color: "#94a3b8" }} />
            </Box>
          </Box>
        </Box>
      )}

      {/* Doa-doa */}
      <Box sx={{ mb: 1 }}>
        <Box
          onClick={() => setOpenDonorsModal(true)}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
            cursor: "pointer",
            "&:hover .MuiTypography-root": { color: "#0ea5e9" },
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, transition: "color 0.2s" }}
          >
            Doa-doa Orang Baik
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={latestPrayers.length} // Note: This might need to be total prayers if available, but using length for now based on original code logic which used `prayers.length`
              size="small"
              sx={{
                bgcolor: "#e0f2fe",
                color: "#0284c7",
                fontWeight: 700,
                height: 24,
                borderRadius: 1.5,
              }}
            />
            <NavigateNextIcon sx={{ color: "#94a3b8" }} />
          </Box>
        </Box>

        <Stack spacing={2}>
          {latestPrayers.map((d: any) => (
            <Paper
              elevation={0}
              key={d.id}
              sx={{
                display: "flex",
                gap: 2,
                p: 2,
                bgcolor: "#fff",
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "#f1f5f9",
                  color: "#64748b",
                  fontWeight: 700,
                }}
              >
                {d.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#0f172a",
                    }}
                  >
                    {d.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                    {formatDistanceToNow(new Date(d.date), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#334155",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                  }}
                >
                  "{d.comment}"
                </Typography>
              </Box>
            </Paper>
          ))}
          {latestPrayers.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                bgcolor: "#f8fafc",
                borderRadius: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#64748b",
                  fontStyle: "italic",
                }}
              >
                Belum ada doa.
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </>
  );
}
