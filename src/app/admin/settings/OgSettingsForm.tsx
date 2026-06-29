"use client";

import { useState } from "react";
import { updateNotifyKeys } from "@/actions/settings";
import { Button, TextField, Alert, CircularProgress, Stack, Box } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

interface OgSettingsFormProps {
  initialSettings: {
    og_headline_1: string;
    og_headline_2: string;
    og_subtext: string;
  };
}

export default function OgSettingsForm({ initialSettings }: OgSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (key: keyof typeof settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const updates = [
      { key: "og_headline_1", value: settings.og_headline_1, name: "OG Headline Baris 1" },
      { key: "og_headline_2", value: settings.og_headline_2, name: "OG Headline Baris 2" },
      { key: "og_subtext", value: settings.og_subtext, name: "OG Subtext" },
    ];

    const res = await updateNotifyKeys(updates);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Pengaturan OG berhasil disimpan" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {message && (
          <Alert severity={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Headline Baris 1"
          variant="outlined"
          value={settings.og_headline_1}
          onChange={handleChange("og_headline_1")}
          placeholder="e.g. Berbagi Kebaikan,"
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Headline Baris 2"
          variant="outlined"
          value={settings.og_headline_2}
          onChange={handleChange("og_headline_2")}
          placeholder="e.g. Menguatkan Sesama"
          helperText="Kosongkan untuk headline satu baris."
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Subtext"
          variant="outlined"
          value={settings.og_subtext}
          onChange={handleChange("og_subtext")}
          multiline
          minRows={2}
          placeholder="e.g. Platform donasi & galang dana online — transparan dan terpercaya."
          disabled={loading}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Pengaturan OG"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}
