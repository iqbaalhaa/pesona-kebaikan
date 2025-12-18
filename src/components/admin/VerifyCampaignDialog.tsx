'use client';

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Image from "next/image";
import type { Campaign } from "./CampaignFormDialog";

export default function VerifyCampaignDialog({
  open,
  data,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  data: Campaign | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle className="font-bold">Verifikasi Campaign</DialogTitle>
      <DialogContent className="pt-2">
        {data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={(data.images && data.images[0]) || "/defaultimg.webp"}
                  alt={data.title}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <div>
                <div className="flex items-start justify-between">
                  <Typography variant="h6" className="font-bold">{data.title}</Typography>
                  <Chip
                    label={data.status}
                    size="small"
                    className="font-semibold"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {data.description || "Tidak ada deskripsi"}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 dark:bg-[#0b1324] p-3">
                    <div className="text-xs text-gray-500">Target</div>
                    <div className="text-sm font-semibold">{data.target}</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-[#0b1324] p-3">
                    <div className="text-xs text-gray-500">Terkumpul</div>
                    <div className="text-sm font-semibold">{data.collected}</div>
                  </div>
                </div>
              </div>
            </div>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-xs text-gray-500">Penggalang</div>
                  <div className="text-sm font-semibold">{data.creator}</div>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-xs text-gray-500">Kontak</div>
                  <div className="text-sm font-semibold">{data.contactPhone || "-"}</div>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-xs text-gray-500">Tanggal</div>
                  <div className="text-sm font-semibold">{data.date}</div>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-xs text-gray-500">Status Saat Ini</div>
                  <div className="text-sm font-semibold">{data.status}</div>
                </div>
              </Grid>
            </Grid>
          </div>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Batal</Button>
        <Button variant="contained" color="success" onClick={onConfirm}>
          Verifikasi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
