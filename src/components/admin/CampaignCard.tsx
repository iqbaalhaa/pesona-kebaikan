'use client';

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VerifiedIcon from "@mui/icons-material/Verified";
import Image from "next/image";

type Status = "Verified" | "Pending" | "Ended";

export type Campaign = {
  id: number;
  title: string;
  creator: string;
  target: string;
  collected: string;
  status: Status;
  date: string;
  image?: string;
};

export default function CampaignCard({
  data,
  onEdit,
  onDelete,
  onVerify,
}: {
  data: Campaign;
  onEdit: (c: Campaign) => void;
  onDelete: (c: Campaign) => void;
  onVerify?: (c: Campaign) => void;
}) {
  return (
    <Card className="h-full border border-gray-200 dark:border-gray-800 dark:bg-[#0f172a]">
      <CardContent className="p-3">
        <div className="relative mb-3">
          <div className="relative h-28 w-full rounded-lg overflow-hidden">
            <Image
              src={data.image || "/defaultimg.webp"}
              alt={data.title}
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <Typography variant="subtitle2" className="font-semibold text-sm">{data.title}</Typography>
            <div className="text-[11px] text-gray-500 mt-1">{data.date}</div>
          </div>
          <Chip
            label={data.status}
            size="small"
            sx={{ fontSize: 11, height: 20 }}
            className={`${
              data.status === "Verified" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""
            } ${
              data.status === "Pending" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : ""
            } ${
              data.status === "Ended" ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" : ""
            } font-semibold border-none`}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-gray-50 dark:bg-[#0b1324] p-2">
            <div className="text-[11px] text-gray-500">Target</div>
            <div className="text-xs font-semibold">{data.target}</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-[#0b1324] p-2">
            <div className="text-[11px] text-gray-500">Terkumpul</div>
            <div className="text-xs font-semibold">{data.collected}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-600 dark:text-gray-300">Oleh {data.creator}</div>
          <div className="flex gap-1">
            {data.status === "Pending" && onVerify ? (
              <Button
                size="small"
                variant="contained"
                className="bg-green-600 hover:bg-green-700 text-white normal-case px-2 py-1"
                startIcon={<VerifiedIcon fontSize="small" />}
                onClick={() => onVerify(data)}
              >
                Verifikasi
              </Button>
            ) : null}
            <IconButton
              size="small"
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => onEdit(data)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => onDelete(data)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
