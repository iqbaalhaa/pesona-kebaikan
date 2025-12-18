'use client';

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Image from "next/image";

export type BlogItem = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image?: string | null;
  author?: string;
};

export default function BlogCard({
  data,
  onEdit,
  onDelete,
}: {
  data: BlogItem;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}) {
  return (
    <Card className="h-full border border-gray-200 dark:border-gray-800 dark:bg-[#0f172a]">
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={data.image || "/defaultimg.webp"}
          alt={data.title}
          fill
          className="object-cover"
          sizes="400px"
        />
      </div>
      <CardContent className="flex-1 flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Typography variant="subtitle2" className="font-semibold text-sm line-clamp-2">
            {data.title}
          </Typography>
          <Chip size="small" label={data.category} className="text-[10px] h-5" />
        </div>
        <Typography variant="body2" className="text-xs text-gray-500 line-clamp-3">
          {data.excerpt}
        </Typography>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-[11px] text-gray-400">{data.date}</div>
          <div className="flex gap-1">
            {onEdit ? (
              <IconButton size="small" className="text-blue-600 dark:text-blue-400" onClick={() => onEdit(data.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
            ) : null}
            {onDelete ? (
              <IconButton size="small" className="text-red-600 dark:text-red-400" onClick={() => onDelete(data.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
