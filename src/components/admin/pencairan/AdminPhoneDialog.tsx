"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { updateCurrentUserPhone } from "@/actions/user";

interface AdminPhoneDialogProps {
  open: boolean;
  onClose: () => void;
  currentPhone: string;
  onSuccess: (newPhone: string) => void;
}

export default function AdminPhoneDialog({
  open,
  onClose,
  currentPhone,
  onSuccess,
}: AdminPhoneDialogProps) {
  const [phone, setPhone] = useState(currentPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPhone(currentPhone);
      setError("");
    }
  }, [open, currentPhone]);

  const handleSubmit = async () => {
    if (!phone) {
      setError("Nomor WhatsApp tidak boleh kosong");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await updateCurrentUserPhone(phone);
      if (res.success) {
        onSuccess(phone);
        onClose();
      } else {
        setError(res.error || "Gagal mengupdate nomor WhatsApp");
      }
    } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Pengaturan WhatsApp Admin</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Nomor WhatsApp ini akan digunakan untuk menerima OTP persetujuan pencairan dana.
        </Typography>
        <TextField
          label="Nomor WhatsApp"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={!!error}
          helperText={error}
          InputProps={{
            startAdornment: <InputAdornment position="start">+62</InputAdornment>,
          }}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
