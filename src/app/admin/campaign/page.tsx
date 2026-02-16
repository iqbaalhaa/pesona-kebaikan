"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Skeleton,
  Tooltip,
  Button,
  Divider,
  Pagination,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import {
  getCampaigns,
  updateCampaignStatus,
  deleteCampaign,
} from "@/actions/campaign";
import AdminCampaignTable from "@/components/admin/AdminCampaignTable";

const PAGE_SIZE = 9;

type CampaignStatus =
  | "draft"
  | "review"
  | "active"
  | "ended"
  | "rejected"
  | "pending";

type CampaignType = "sakit" | "lainnya";

type CampaignRow = {
  id: string;
  title: string;
  category: string;
  type: CampaignType;
  ownerName: string;
  target: number;
  collected: number;
  donors: number;
  status: CampaignStatus;
  updatedAt: string;
  thumbnail?: string;
};

function idr(n: number) {
  const v = Number(n) || 0;
  const s = Math.round(v).toString();
  return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function pct(collected: number, target: number) {
  const c = Number(collected) || 0;
  const t = Number(target) || 0;
  if (!t || t <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((c / t) * 100)));
}

function statusChip(status: CampaignStatus) {
  switch (status) {
    case "draft":
      return {
        label: "Draft",
        sx: {
          bgcolor: "rgba(15,23,42,.06)",
          borderColor: "rgba(15,23,42,.10)",
          color: "rgba(15,23,42,.70)",
        },
      };
    case "pending":
      return {
        label: "Pending",
        sx: {
          bgcolor: "rgba(245,158,11,.12)",
          borderColor: "rgba(245,158,11,.22)",
          color: "rgba(180,83,9,.95)",
        },
      };
    case "review":
      return {
        label: "Review",
        sx: {
          bgcolor: "rgba(245,158,11,.12)",
          borderColor: "rgba(245,158,11,.22)",
          color: "rgba(180,83,9,.95)",
        },
      };
    case "active":
      return {
        label: "Aktif",
        sx: {
          bgcolor: "rgba(34,197,94,.12)",
          borderColor: "rgba(34,197,94,.22)",
          color: "rgba(22,101,52,.95)",
        },
      };
    case "ended":
      return {
        label: "Berakhir",
        sx: {
          bgcolor: "rgba(239,68,68,.12)",
          borderColor: "rgba(239,68,68,.22)",
          color: "rgba(153,27,27,.95)",
        },
      };
    case "rejected":
      return {
        label: "Ditolak",
        sx: {
          bgcolor: "rgba(239,68,68,.12)",
          borderColor: "rgba(239,68,68,.22)",
          color: "rgba(153,27,27,.95)",
        },
      };
    default:
      return {
        label: status || "Unknown",
        sx: {
          bgcolor: "rgba(15,23,42,.06)",
          borderColor: "rgba(15,23,42,.10)",
          color: "rgba(15,23,42,.70)",
        },
      };
  }
}

const FILTERS: { key: "all" | CampaignStatus; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Aktif" },
  { key: "draft", label: "Draft" },
  { key: "ended", label: "Berakhir" },
  { key: "rejected", label: "Ditolak" },
];

export default function AdminCampaignPage() {
  const [rows, setRows] = React.useState<CampaignRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalRows, setTotalRows] = React.useState(0);

  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | CampaignStatus>("all");

  const [provinceId, setProvinceId] = React.useState<string>("all");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [provinces, setProvinces] = React.useState<
    Array<{ id: string; name: string }>
  >([]);

  const [menu, setMenu] = React.useState<{
    anchor: HTMLElement | null;
    row?: CampaignRow;
  }>({ anchor: null });

  const fetchCampaigns = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCampaigns(
        page,
        PAGE_SIZE,
        filter,
        q,
        undefined,
        undefined,
        undefined,
        undefined,
        "newest",
        true,
        startDate || undefined,
        endDate || undefined,
        provinceId !== "all" ? provinceId : undefined
      );

      if (res.success && res.data) {
        setRows(res.data as any);
        setTotalPages(res.totalPages || 1);
        setTotalRows(res.total || 0);
      } else {
        setRows([]);
        setTotalPages(1);
        setTotalRows(0);
      }
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotalPages(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [page, filter, q, startDate, endDate, provinceId]);

  // debounce fetch
  React.useEffect(() => {
    const t = setTimeout(() => fetchCampaigns(), 450);
    return () => clearTimeout(t);
  }, [fetchCampaigns]);

  // load provinces once
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/address?type=province");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setProvinces(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openMenu = (e: React.MouseEvent<HTMLElement>, row: CampaignRow) =>
    setMenu({ anchor: e.currentTarget, row });

  const closeMenu = () => setMenu({ anchor: null, row: undefined });

  const onEnd = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin mengakhiri campaign ini?")) return;
    await updateCampaignStatus(id, "COMPLETED");
    fetchCampaigns();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus campaign ini?")) return;
    const res = await deleteCampaign(id);
    if (res.success) fetchCampaigns();
    else
      alert("Gagal menghapus campaign: " + (res.error || "Terjadi kesalahan"));
  };

  const onVerify = async (id: string) => {
    if (!confirm("Verifikasi campaign ini agar aktif?")) return;
    await updateCampaignStatus(id, "ACTIVE");
    fetchCampaigns();
  };

  const onRefresh = () => fetchCampaigns();

  // kalau filter berubah, balik ke page 1
  React.useEffect(() => {
    setPage(1);
  }, [filter, q, provinceId, startDate, endDate]);

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      {/* Top area */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(15,23,42,.10)",
          bgcolor: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            background:
              "radial-gradient(900px 380px at 0% 0%, rgba(11,169,118,.18), transparent 55%), radial-gradient(900px 380px at 100% 0%, rgba(59,130,246,.12), transparent 55%)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                sx={{ fontWeight: 1000, fontSize: 20, color: "#0f172a" }}
              >
                Campaign
              </Typography>
              <Typography
                sx={{ mt: 0.25, fontSize: 12.5, color: "rgba(15,23,42,.62)" }}
              >
                Monitor & kelola campaign yang terdaftar.
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1.25 }}
                alignItems="center"
              >
                <Chip
                  label={`${rows.length} hasil`}
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 900,
                    bgcolor: "rgba(255,255,255,.55)",
                    borderColor: "rgba(15,23,42,.12)",
                    color: "rgba(15,23,42,.75)",
                  }}
                />
                <Chip
                  label={`Total: ${totalRows}`}
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 900,
                    bgcolor: "rgba(255,255,255,.55)",
                    borderColor: "rgba(15,23,42,.12)",
                    color: "rgba(15,23,42,.75)",
                  }}
                />
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari campaign, user, kategori, ID…"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        fontSize="small"
                        style={{ color: "rgba(15,23,42,.45)" }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", md: 360 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,.70)",
                    border: "1px solid rgba(15,23,42,.10)",
                    boxShadow: "0 12px 30px rgba(15,23,42,.06)",
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiOutlinedInput-input": { fontSize: 13.5 },
                }}
              />

              <Tooltip title="Refresh">
                <IconButton
                  onClick={onRefresh}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,.70)",
                    border: "1px solid rgba(15,23,42,.10)",
                    boxShadow: "0 12px 30px rgba(15,23,42,.06)",
                  }}
                >
                  <RefreshRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Button
                component={Link}
                href="/admin/campaign/create"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                sx={{
                  borderRadius: 999,
                  fontWeight: 1000,
                  textTransform: "none",
                  px: 2,
                  boxShadow: "0 14px 34px rgba(11,169,118,.22)",
                  bgcolor: "#0ba976",
                  "&:hover": { bgcolor: "#55bf64" },
                }}
              >
                Buat
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mt: 2, borderColor: "rgba(15,23,42,.08)" }} />

          {/* Filter chips */}
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Chip
              icon={<CategoryRoundedIcon />}
              label="Filter"
              variant="outlined"
              sx={{
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,.55)",
                borderColor: "rgba(15,23,42,.12)",
                color: "rgba(15,23,42,.70)",
                fontWeight: 900,
              }}
            />
            {FILTERS.map((f) => {
              const selected = filter === f.key;
              return (
                <Chip
                  key={f.key}
                  clickable
                  onClick={() => setFilter(f.key)}
                  label={
                    <Typography sx={{ fontSize: 12.5, fontWeight: 900 }}>
                      {f.label}
                    </Typography>
                  }
                  variant={selected ? "filled" : "outlined"}
                  sx={{
                    borderRadius: 999,
                    fontWeight: 900,
                    borderColor: selected
                      ? "rgba(11,169,118,.60)"
                      : "rgba(15,23,42,.12)",
                    bgcolor: selected ? "#0ba976" : "rgba(255,255,255,.55)",
                    color: selected ? "#fff" : "rgba(15,23,42,.70)",
                    boxShadow: selected
                      ? "0 14px 28px rgba(11,169,118,.20)"
                      : "none",
                    "&:hover": {
                      bgcolor: selected ? "#55bf64" : "rgba(255,255,255,.72)",
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <AdminCampaignTable
          rows={rows}
          loading={loading}
          provinces={provinces}
          provinceId={provinceId}
          onProvinceChange={(v) => setProvinceId(v)}
          startDate={startDate}
          onStartDateChange={(v) => setStartDate(v)}
          endDate={endDate}
          onEndDateChange={(v) => setEndDate(v)}
          onOpenMenu={openMenu}
        />
      </Box>

      {/* Pagination */}
      <Box sx={{ mt: 3.5, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => setPage(p)}
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": {
              borderRadius: 2,
              fontWeight: 900,
              color: "rgba(15,23,42,.70)",
            },
            "& .Mui-selected": {
              bgcolor: "rgba(11,169,118,.20) !important",
              color: "rgba(15,23,42,.90) !important",
              border: "1px solid rgba(11,169,118,.45)",
            },
          }}
        />
      </Box>

      {/* Row menu */}
      <Menu
        anchorEl={menu.anchor}
        open={!!menu.anchor}
        onClose={closeMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: "1px solid rgba(15,23,42,.10)",
            bgcolor: "#fff",
            boxShadow: "0 18px 60px rgba(15,23,42,.18)",
            minWidth: 200,
            overflow: "hidden",
          },
        }}
      >
        <MenuItem
          component={Link}
          href={`/admin/campaign/${menu.row?.id ?? ""}`}
          onClick={closeMenu}
          sx={{ py: 1.2 }}
        >
          <VisibilityRoundedIcon
            fontSize="small"
            style={{ marginRight: 10, opacity: 0.65 }}
          />
          <Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>
            Detail
          </Typography>
        </MenuItem>

        <MenuItem
          component={Link}
          href={`/admin/campaign/${menu.row?.id ?? ""}/edit`}
          onClick={closeMenu}
          sx={{ py: 1.2 }}
        >
          <EditRoundedIcon
            fontSize="small"
            style={{ marginRight: 10, opacity: 0.65 }}
          />
          <Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>Edit</Typography>
        </MenuItem>

        {menu.row?.status === "pending" || menu.row?.status === "review" ? (
          <MenuItem
            onClick={() => {
              const id = menu.row!.id;
              closeMenu();
              onVerify(id);
            }}
            sx={{ py: 1.2 }}
          >
            <VerifiedRoundedIcon
              fontSize="small"
              style={{ marginRight: 10, opacity: 0.65 }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>
              Verifikasi
            </Typography>
          </MenuItem>
        ) : null}

        {menu.row?.status === "active" ? (
          <MenuItem
            onClick={() => {
              const id = menu.row!.id;
              closeMenu();
              onEnd(id);
            }}
            sx={{ py: 1.2, color: "#b91c1c" }}
          >
            <StopCircleRoundedIcon
              fontSize="small"
              style={{ marginRight: 10, opacity: 0.85 }}
            />
            <Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
              Akhiri
            </Typography>
          </MenuItem>
        ) : null}

        <MenuItem
          onClick={() => {
            const id = menu.row!.id;
            closeMenu();
            onDelete(id);
          }}
          sx={{ py: 1.2, color: "#ef4444" }}
        >
          <DeleteRoundedIcon
            fontSize="small"
            style={{ marginRight: 10, opacity: 0.85 }}
          />
          <Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
            Hapus
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
