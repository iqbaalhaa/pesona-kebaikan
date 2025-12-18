'use client';

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  onCancel,
  onConfirm,
  confirmColor = "primary",
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmColor?: "primary" | "error" | "success" | "info" | "warning";
}) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle className="font-bold">{title}</DialogTitle>
      {description ? (
        <DialogContent>
          <Typography variant="body2">{description}</Typography>
        </DialogContent>
      ) : null}
      <DialogActions>
        <Button onClick={onCancel}>Batal</Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
