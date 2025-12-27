"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SchoolIcon from "@mui/icons-material/School";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import UpdateIcon from "@mui/icons-material/Update";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArticleIcon from "@mui/icons-material/Article";
import Image from "next/image";

/* ================= TYPES ================= */

export type BlogItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image?: string | null; // tetap ada, tapi tidak dipakai
  author?: string;
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("cerita")) return <AutoStoriesIcon sx={{ fontSize: 14 }} />;
  if (cat.includes("edukasi")) return <SchoolIcon sx={{ fontSize: 14 }} />;
  if (cat.includes("transparansi")) return <VerifiedUserIcon sx={{ fontSize: 14 }} />;
  if (cat.includes("update")) return <UpdateIcon sx={{ fontSize: 14 }} />;
  if (cat.includes("panduan")) return <MenuBookIcon sx={{ fontSize: 14 }} />;
  return <ArticleIcon sx={{ fontSize: 14 }} />;
};

/* ================= COMPONENT ================= */

export default function BlogCard({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: BlogItem;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid rgba(15,23,42,.10)",
        overflow: "hidden",
        transition:
          "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 18px 42px rgba(15,23,42,.12)",
          borderColor: "rgba(15,23,42,.18)",
        },
      }}
    >
      {/* ===== IMAGE ===== */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
        <Image
          src={data.image || "/defaultimg.webp"}
          alt={data.title}
          fill
          sizes="400px"
          className="object-cover"
          priority={false}
        />

        {/* category badge */}
        <div className="absolute left-2 top-2">
          <Chip
            size="small"
            icon={getCategoryIcon(data.category)}
            label={data.category}
            sx={{
              height: 24,
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,.90)",
              backdropFilter: "blur(6px)",
              "& .MuiChip-icon": {
                fontSize: 14,
                color: "rgba(15,23,42,.7)",
                ml: 0.5,
              },
            }}
          />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 1.75,
        }}
      >
        <Typography
          sx={{
            fontSize: 13.5,
            fontWeight: 800,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {data.title}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "rgba(15,23,42,.55)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {data.excerpt}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: "auto" }}
        >
          <Typography sx={{ fontSize: 11, color: "rgba(15,23,42,.45)" }}>
            {data.date}
            {data.author ? ` • ${data.author}` : ""}
          </Typography>

          {(onView || onEdit || onDelete) && (
            <Stack direction="row" spacing={0.5}>
              {onView && (
                <IconButton
                  size="small"
                  onClick={() => onView(data.id)}
                  sx={{
                    color: "rgba(15,23,42,.7)",
                    "&:hover": { bgcolor: "rgba(15,23,42,.08)" },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(data.id)}
                  sx={{
                    color: "rgba(59,130,246,.9)",
                    "&:hover": { bgcolor: "rgba(59,130,246,.08)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(data.id)}
                  sx={{
                    color: "rgba(239,68,68,.9)",
                    "&:hover": { bgcolor: "rgba(239,68,68,.08)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
