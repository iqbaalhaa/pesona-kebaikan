'use client';

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CampaignCard from "@/components/admin/CampaignCard";
import CampaignFormDialog, { Campaign as CampaignType } from "@/components/admin/CampaignFormDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SearchFilterBar from "@/components/admin/SearchFilterBar";
import VerifyCampaignDialog from "@/components/admin/VerifyCampaignDialog";

type Status = "Verified" | "Pending" | "Ended";
type Campaign = CampaignType;

export default function CampaignPage() {
  const statuses: Status[] = ["Verified", "Pending", "Ended"];
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(
    Array.from({ length: 20 }, (_, i) => {
      const status = statuses[i % statuses.length];
      const target = 10000000 * ((i % 5) + 1);
      const collected = Math.floor(target * (0.2 + (i % 4) * 0.2));
      return {
        id: i + 1,
        title: `Campaign ${i + 1}`,
        creator: `Penggalang ${i + 1}`,
        target: `Rp ${target.toLocaleString("id-ID")}`,
        collected: `Rp ${collected.toLocaleString("id-ID")}`,
        status,
        date: `2024-0${(i % 9) + 1}-1${i % 9}`,
      };
    })
  );

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<Status | "ALL">("ALL");
  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [formData, setFormData] = React.useState<Campaign>({
    id: 0,
    title: "",
    creator: "",
    target: "",
    collected: "",
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    contactPhone: "",
    images: ["/defaultimg.webp"],
  });
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<Campaign | null>(null);
  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const [toVerify, setToVerify] = React.useState<Campaign | null>(null);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState("");
  const [toastSeverity, setToastSeverity] = React.useState<"success" | "info" | "error">("success");

  const filtered = React.useMemo(
    () =>
      campaigns.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) &&
          (status === "ALL" || c.status === status)
      ),
    [campaigns, query, status]
  );

  const openCreate = () => {
    setFormMode("create");
    setFormData({
      id: 0,
      title: "",
      creator: "",
      target: "",
      collected: "",
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
    });
    setFormOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setFormMode("edit");
    setFormData(c);
    setFormOpen(true);
  };

  const handleFormChange = (field: keyof Campaign, value: string | Status) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = () => {
    if (formMode === "create") {
      const nextId = campaigns.length ? Math.max(...campaigns.map((c) => c.id)) + 1 : 1;
      const newItem = { ...formData, id: nextId };
      setCampaigns((prev) => [newItem, ...prev]);
      setToastSeverity("success");
      setToastMsg("Campaign berhasil dibuat");
    } else {
      setCampaigns((prev) => prev.map((c) => (c.id === formData.id ? formData : c)));
      setToastSeverity("success");
      setToastMsg("Campaign berhasil diperbarui");
    }
    setFormOpen(false);
    setToastOpen(true);
  };

  const openDelete = (c: Campaign) => {
    setToDelete(c);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (toDelete) {
      setCampaigns((prev) => prev.filter((c) => c.id !== toDelete.id));
      setToastSeverity("success");
      setToastMsg("Campaign berhasil dihapus");
      setToastOpen(true);
    }
    setConfirmOpen(false);
    setToDelete(null);
  };

  const openVerify = (c: Campaign) => {
    setToVerify(c);
    setVerifyOpen(true);
  };

  const confirmVerify = () => {
    if (toVerify) {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === toVerify.id ? { ...c, status: "Verified" } : c))
      );
      setToastSeverity("success");
      setToastMsg("Campaign berhasil diverifikasi");
      setToastOpen(true);
    }
    setVerifyOpen(false);
    setToVerify(null);
  };

  return (
    <Box>
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between mb-6">
        <Typography variant="h5" className="font-bold">Daftar Campaign</Typography>
        <SearchFilterBar
          query={query}
          status={status}
          onQueryChange={setQuery}
          onStatusChange={(v) => setStatus(v)}
          onCreate={openCreate}
        />
      </div>

      <Grid container spacing={3}>
        {filtered.map((item) => (
          <Grid key={item.id} size={{ xs: 12, md: 3 }}>
            <CampaignCard data={item} onEdit={openEdit} onDelete={openDelete} onVerify={openVerify} />
          </Grid>
        ))}
      </Grid>

      <CampaignFormDialog
        open={formOpen}
        mode={formMode}
        data={formData}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
        onChange={handleFormChange}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus campaign?"
        description="Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        confirmColor="error"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      <VerifyCampaignDialog
        open={verifyOpen}
        data={toVerify}
        onCancel={() => setVerifyOpen(false)}
        onConfirm={confirmVerify}
      />

      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)}>
        <Alert severity={toastSeverity} onClose={() => setToastOpen(false)} variant="filled">
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
