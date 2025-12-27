"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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

/* ================= COMPONENT ================= */

export default function BlogCard({
  data,
  onEdit,
  onDelete,
}: {
  data: BlogItem;
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
      {/* ===== IMAGE (DEFAULT ONLY) ===== */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
        <Image
          src="/defaultimg.webp"
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
            label={data.category}
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,.85)",
              backdropFilter: "blur(6px)",
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

          {(onEdit || onDelete) && (
            <Stack direction="row" spacing={0.5}>
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
