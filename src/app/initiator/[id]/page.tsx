import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function InitiatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      verifiedAs: true,
      _count: {
        select: {
          campaigns: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      createdById: user.id,
    },
    include: {
      media: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const campaignsWithStats = campaigns.map((c) => {
    const thumbnail =
      c.media.find((m) => m.isThumbnail)?.url ||
      c.media[0]?.url ||
      "/defaultimg.webp";

    return {
      ...c,
      thumbnail,
    };
  });

  const avatarInitial = (user.name?.trim()?.[0] ?? "?").toUpperCase();

  return (
    <Box sx={{ pb: 8, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Profile */}
      <Box
        sx={{
          bgcolor: "white",
          pb: 6,
          pt: 12,
          borderBottom: "1px solid #e2e8f0",
          position: "relative",
        }}
      >
        <Box sx={{ position: "absolute", top: 12, left: 0, right: 0, zIndex: 1 }}>
          <Container maxWidth="md">
            <ProfileHeader title="Profil Penggalang" container={false} />
          </Container>
        </Box>
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Avatar
              src={user.image || undefined}
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                border: "4px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {avatarInitial}
            </Avatar>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="h5" fontWeight="700" color="text.primary">
                {user.name}
              </Typography>
              {user.verifiedAs && <VerifiedUserIcon color="primary" sx={{ fontSize: 20 }} />}
            </Box>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {user.email}
            </Typography>

            <Box
              sx={{
                display: "inline-flex",
                bgcolor: "#f1f5f9",
                px: 3,
                py: 1,
                borderRadius: 4,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography fontWeight="700" fontSize={18} color="text.primary">
                  {user._count.campaigns}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Campaigns
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Campaigns List */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 3, color: "text.primary" }}>
          Campaigns
        </Typography>

        <Grid container spacing={3}>
          {campaignsWithStats.map((campaign) => (
            <Grid key={campaign.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Link
                href={`/donasi/${campaign.slug || campaign.id}`}
                style={{ textDecoration: "none" }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    boxShadow: "none",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px -10px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {/* Image */}
                  <Box sx={{ position: "relative", pt: "56.25%", bgcolor: "#eee" }}>
                    <Image
                      src={campaign.thumbnail}
                      alt={campaign.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="700"
                      color="text.primary"
                      sx={{
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.8em",
                      }}
                    >
                      {campaign.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}

          {campaignsWithStats.length === 0 && (
            <Grid size={12}>
              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                  bgcolor: "white",
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography color="text.secondary">
                  Belum ada campaign aktif yang dibuat.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
