'use client';

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

type Status = "Verified" | "Pending" | "Ended";

export type Campaign = {
  id: number;
  title: string;
  creator: string;
  target: string;
  collected: string;
  status: Status;
  date: string;
  description?: string;
  contactPhone?: string;
  images?: string[];
};

export default function CampaignFormDialog({
  open,
  mode,
  data,
  onClose,
  onSubmit,
  onChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  data: Campaign;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof Campaign, value: string | Status) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="font-bold">{mode === "create" ? "Buat Campaign" : "Edit Campaign"}</DialogTitle>
      <DialogContent className="space-y-3 pt-2">
        <TextField label="Judul" fullWidth value={data.title} onChange={(e) => onChange("title", e.target.value)} />
        <TextField label="Penggalang" fullWidth value={data.creator} onChange={(e) => onChange("creator", e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField label="Target" fullWidth value={data.target} onChange={(e) => onChange("target", e.target.value)} />
          <TextField label="Terkumpul" fullWidth value={data.collected} onChange={(e) => onChange("collected", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormControl fullWidth>
            <InputLabel id="status-form-label">Status</InputLabel>
            <Select
              labelId="status-form-label"
              value={data.status}
              label="Status"
              onChange={(e) => onChange("status", e.target.value as Status)}
            >
              <MenuItem value="Verified">Verified</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Ended">Ended</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Tanggal"
            type="date"
            fullWidth
            value={data.date}
            onChange={(e) => onChange("date", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button variant="contained" onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
