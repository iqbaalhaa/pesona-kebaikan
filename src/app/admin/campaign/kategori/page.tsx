"use client";

import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  Skeleton,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

import { CATEGORY_ICON_MAP, getCategoryIcon } from "@/lib/categoryIcons";

type Category = {
  id: string;
  name: string;
  slug: string;
  desc: string;
  active: boolean;
  icon?: string;
  updatedAt: string;

  // list "tujuan/jenis" di dalam kategori (yang muncul saat user pilih kategori)
  options: {
    id: string;
    title: string;
    desc: string;
    active: boolean;
  }[];

  // contoh image untuk modal (dummy)
  examples: { id: string; title: string }[];
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function softCardSx(theme: any) {
  const isDark = theme.palette.mode === "dark";
  return {
    borderRadius: 3,
    bgcolor: alpha(theme.palette.background.paper, isDark ? 0.92 : 1),
    boxShadow: isDark
      ? `0 10px 30px ${alpha("#000", 0.35)}`
      : `0 10px 26px ${alpha("#0f172a", 0.08)}`,
    backdropFilter: "blur(10px)",
  };
}

function softInsetSx(theme: any) {
  const isDark = theme.palette.mode === "dark";
  return {
    borderRadius: 2.5,
    bgcolor: alpha(theme.palette.background.default, isDark ? 0.28 : 0.75),
    boxShadow: isDark
      ? `inset 0 0 0 1px ${alpha("#fff", 0.06)}`
      : `inset 0 0 0 1px ${alpha("#0f172a", 0.06)}`,
  };
}

function fieldNoOutlineSx(theme: any) {
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.25,
      bgcolor: alpha(
        theme.palette.background.paper,
        theme.palette.mode === "dark" ? 0.35 : 1
      ),
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: "transparent" },
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    },
  };
}

export default function AdminCampaignKategoriPage() {
  const theme = useTheme();

  const [rows, setRows] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [q, setQ] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>("");

  const selected = React.useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  );

  const [menu, setMenu] = React.useState<{
    anchor: HTMLElement | null;
    row?: Category;
  }>({
    anchor: null,
  });

  const [dlg, setDlg] = React.useState<{
    open: boolean;
    mode: "create" | "rename";
    name: string;
  }>({ open: false, mode: "create", name: "" });

  const [saveTick, setSaveTick] = React.useState<0 | 1 | 2>(0); // 0 idle, 1 success, 2 warning

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns/categories", { cache: "no-store" });
      const data: Array<{
        id: string;
        name: string;
        icon?: string;
        isActive: boolean;
        updatedAt: string;
      }> = await res.json();
      
      const mapped: Category[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: slugify(c.name),
        desc: "", // Not in DB yet
        active: c.isActive,
        icon: c.icon || c.name, // Fallback to name if icon not set
        updatedAt: new Date(c.updatedAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        options: [], // Not in DB yet
        examples: [], // Not in DB yet
      }));
      setRows(mapped);
      // If selectedId is invalid, select first
      if (mapped.length > 0 && !mapped.find((r) => r.id === selectedId)) {
        setSelectedId(mapped[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = React.useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (x) =>
        x.name.toLowerCase().includes(s) ||
        x.slug.toLowerCase().includes(s)
    );
  }, [rows, q]);

  const openMenu = (e: React.MouseEvent<HTMLElement>, row: Category) =>
    setMenu({ anchor: e.currentTarget, row });
  const closeMenu = () => setMenu({ anchor: null, row: undefined });

  const updateSelected = (patch: Partial<Category>) => {
    if (!selected) return;
    setRows((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r))
    );
    setSaveTick(0);
  };

  const handleSave = async () => {
    if (!selected) return;

    if (!selected.name.trim()) {
      setSaveTick(2);
      setTimeout(() => setSaveTick(0), 1400);
      return;
    }

    try {
      const res = await fetch("/api/campaigns/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          name: selected.name,
          icon: selected.icon,
          isActive: selected.active,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updated = await res.json();
      setRows((prev) =>
        prev.map((r) =>
          r.id === updated.id
            ? {
                ...r,
                name: updated.name,
                icon: updated.icon,
                active: updated.isActive,
                updatedAt: new Date(updated.updatedAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
              }
            : r
        )
      );
      setSaveTick(1);
      setTimeout(() => setSaveTick(0), 1200);
    } catch (error) {
      console.error(error);
      setSaveTick(2);
      setTimeout(() => setSaveTick(0), 1400);
    }
  };

  const handleCreate = async (name: string) => {
    try {
      const res = await fetch("/api/campaigns/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive: true }),
      });

      if (!res.ok) throw new Error("Failed to create");

      const created = await res.json();
      const newCategory: Category = {
        id: created.id,
        name: created.name,
        slug: slugify(created.name),
        desc: "",
        active: created.isActive,
        icon: created.icon || created.name,
        updatedAt: new Date(created.updatedAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        options: [],
        examples: [],
      };

      setRows((prev) => [newCategory, ...prev]);
      setSelectedId(created.id);
      setDlg({ open: false, mode: "create", name: "" });
    } catch (error) {
      console.error(error);
      alert("Gagal membuat kategori");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      const res = await fetch(`/api/campaigns/categories?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal menghapus");
        return;
      }

      setRows((prev) => prev.filter((x) => x.id !== id));
      if (selectedId === id) setSelectedId("");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus kategori");
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", lg: "1.25fr 1fr" },
        alignItems: "start",
      }}
    >
      {/* LEFT: list */}
      <Paper elevation={0} sx={{ ...softCardSx(theme), p: 1.5 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography sx={{ fontWeight: 1000, fontSize: 16 }}>
              Kategori Campaign
            </Typography>
            <Typography
              sx={{ mt: 0.3, fontSize: 12.5, color: "text.secondary" }}
            >
              Atur kategori & struktur tujuan (opsi) yang muncul di flow “Galang
              Dana”.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchCategories}
                sx={{
                  ...softInsetSx(theme),
                }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>

            <Button
              startIcon={<AddRoundedIcon />}
              variant="contained"
              onClick={() =>
                setDlg({
                  open: true,
                  mode: "create",
                  name: "",
                })
              }
              sx={{
                borderRadius: 999,
                fontWeight: 900,
                boxShadow: "none",
                px: 2,
              }}
            >
              Tambah
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ mt: 1.5, ...softInsetSx(theme), p: 1 }}>
          <TextField
            size="small"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kategori…"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.25,
                bgcolor: alpha(
                  theme.palette.background.paper,
                  theme.palette.mode === "dark" ? 0.35 : 1
                ),
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "transparent" },
              },
              "& .MuiInputBase-input": { fontSize: 13.5 },
            }}
          />
        </Box>

        <Box sx={{ mt: 1.25, display: "grid", gap: 1 }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{ ...softInsetSx(theme), p: 1.25 }}
              >
                <Skeleton width="72%" height={18} />
                <Skeleton width="45%" height={14} sx={{ mt: 0.8 }} />
                <Skeleton width="90%" height={12} sx={{ mt: 1 }} />
              </Paper>
            ))
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography fontSize={14}>Tidak ada kategori ditemukan.</Typography>
            </Box>
          ) : (
            filtered.map((row) => (
              <CategoryRow
                key={row.id}
                row={row}
                active={row.id === selectedId}
                onClick={() => setSelectedId(row.id)}
                onMenu={openMenu}
              />
            ))
          )}
        </Box>
      </Paper>

      {/* RIGHT: editor */}
      <Paper elevation={0} sx={{ ...softCardSx(theme), p: 1.5 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
            Editor Kategori
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            {saveTick === 1 ? (
              <Chip
                icon={<CheckCircleRoundedIcon fontSize="small" />}
                label="Tersimpan"
                size="small"
                sx={(t) => ({
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: alpha(
                    t.palette.success.main,
                    t.palette.mode === "dark" ? 0.18 : 0.1
                  ),
                  color: t.palette.success.main,
                  "& .MuiChip-icon": { color: t.palette.success.main },
                })}
              />
            ) : saveTick === 2 ? (
              <Chip
                icon={<WarningAmberRoundedIcon fontSize="small" />}
                label="Periksa input"
                size="small"
                sx={(t) => ({
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: alpha(
                    t.palette.warning.main,
                    t.palette.mode === "dark" ? 0.18 : 0.1
                  ),
                  color: t.palette.warning.main,
                  "& .MuiChip-icon": { color: t.palette.warning.main },
                })}
              />
            ) : null}

            <Button
              onClick={handleSave}
              startIcon={<SaveRoundedIcon />}
              variant="contained"
              disabled={!selected}
              sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
            >
              Simpan
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.25, opacity: 0.6 }} />

        {!selected ? (
          <Paper elevation={0} sx={{ ...softInsetSx(theme), p: 1.5 }}>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              Pilih kategori di sebelah kiri untuk mengedit.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "grid", gap: 1.25 }}>
            <Paper elevation={0} sx={{ ...softInsetSx(theme), p: 1.25 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
                  Informasi Utama
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={selected.active}
                      onChange={(e) =>
                        updateSelected({ active: e.target.checked })
                      }
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 900,
                        color: "text.secondary",
                      }}
                    >
                      {selected.active ? "Aktif" : "Non-Aktif"}
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Stack>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  size="small"
                  label="Nama kategori"
                  value={selected.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    updateSelected({
                      name,
                      slug: slugify(name),
                    });
                  }}
                  fullWidth
                  sx={fieldNoOutlineSx(theme)}
                />

                <Box>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, mb: 1, color: "text.secondary" }}>
                        Pilih Icon
                    </Typography>
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', 
                        gap: 1,
                        maxHeight: 200,
                        overflowY: 'auto',
                        p: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 2
                    }}>
                        {Object.entries(CATEGORY_ICON_MAP).map(([key, { icon, color }]) => (
                            <Box
                                key={key}
                                onClick={() => updateSelected({ icon: key })}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1.5,
                                    cursor: 'pointer',
                                    border: '2px solid',
                                    borderColor: (selected.icon || selected.name.toLowerCase()) === key ? 'primary.main' : 'transparent',
                                    bgcolor: (selected.icon || selected.name.toLowerCase()) === key ? alpha(color, 0.1) : 'transparent',
                                    color: color,
                                    '&:hover': {
                                        bgcolor: alpha(color, 0.1),
                                    }
                                }}
                            >
                                {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 24 } })}
                            </Box>
                        ))}
                    </Box>
                </Box>

                <TextField
                  size="small"
                  label="Deskripsi"
                  value={selected.desc}
                  onChange={(e) => {
                    updateSelected({
                      desc: e.target.value,
                    });
                  }}
                  fullWidth
                  multiline
                  minRows={3}
                  sx={fieldNoOutlineSx(theme)}
                  placeholder="Deskripsi kategori (opsional)"
                />

                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  Update: <b>{selected.updatedAt}</b>
                </Typography>
              </Stack>
            </Paper>

            {/* Options */}
            <Paper elevation={0} sx={{ ...softInsetSx(theme), p: 1.25 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
                    Opsi Tujuan (Sub-kategori)
                  </Typography>
                  <Typography
                    sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}
                  >
                    Fitur ini belum terhubung ke database.
                  </Typography>
                </Box>

                <Button
                  disabled
                  startIcon={<AddRoundedIcon />}
                  variant="contained"
                  sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
                >
                  Tambah
                </Button>
              </Stack>
            </Paper>

            {/* Example items */}
            <Paper elevation={0} sx={{ ...softInsetSx(theme), p: 1.25 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
                    Contoh Campaign (Modal)
                  </Typography>
                  <Typography
                    sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}
                  >
                     Fitur ini belum terhubung ke database.
                  </Typography>
                </Box>

                <Button
                  disabled
                  startIcon={<ImageRoundedIcon />}
                  variant="contained"
                  sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
                >
                  Tambah
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Row menu */}
      <Menu
        anchorEl={menu.anchor}
        open={!!menu.anchor}
        onClose={closeMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            ...softCardSx(theme),
            p: 0.5,
            minWidth: 190,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const row = menu.row;
            closeMenu();
            if (!row) return;
            setSelectedId(row.id);
            setDlg({ open: true, mode: "rename", name: row.name });
          }}
          sx={{ borderRadius: 2 }}
        >
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            const row = menu.row;
            closeMenu();
            if (!row) return;
            handleDelete(row.id);
          }}
          sx={{ borderRadius: 2, color: "error.main", fontWeight: 900 }}
        >
          <DeleteRoundedIcon fontSize="small" style={{ marginRight: 10 }} />
          Hapus
        </MenuItem>
      </Menu>

      {/* Create/Rename dialog */}
      <Dialog
        open={dlg.open}
        onClose={() => setDlg((d) => ({ ...d, open: false }))}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          elevation: 0,
          sx: {
            ...softCardSx(theme),
            p: 0.25,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 1000 }}>
          {dlg.mode === "create" ? "Tambah kategori" : "Rename kategori"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            size="small"
            label="Nama kategori"
            value={dlg.name}
            onChange={(e) => setDlg((d) => ({ ...d, name: e.target.value }))}
            fullWidth
            sx={fieldNoOutlineSx(theme)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setDlg((d) => ({ ...d, open: false }))}
            variant="text"
            sx={{ borderRadius: 999, fontWeight: 900 }}
          >
            Batal
          </Button>
          <Button
            disabled={!dlg.name.trim()}
            onClick={() => {
              if (!dlg.name.trim()) return;

              if (dlg.mode === "create") {
                handleCreate(dlg.name.trim());
              } else {
                // rename selected (via local state, user must click Save to persist)
                // Actually, for rename, let's just update local and let user save.
                 if (selectedId) {
                     updateSelected({ name: dlg.name.trim() });
                     setDlg({ open: false, mode: "create", name: "" });
                 }
              }
            }}
            variant="contained"
            sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
          >
            {dlg.mode === "create" ? "Buat" : "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function CategoryRow({
  row,
  active,
  onClick,
  onMenu,
}: {
  row: Category;
  active: boolean;
  onClick: () => void;
  onMenu: (e: React.MouseEvent<HTMLElement>, row: Category) => void;
}) {
  const theme = useTheme();
  const { icon, color } = getCategoryIcon(row.icon || row.name);
  
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        ...softInsetSx(theme),
        p: 1.25,
        cursor: "pointer",
        transition: "all 0.2s",
        border: "2px solid transparent",
        ...(active && {
          borderColor: "primary.main",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        }),
        opacity: row.active ? 1 : 0.6,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: alpha(color, 0.1),
            color: color,
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{ fontWeight: 800, fontSize: 13.5, color: "text.primary" }}
          >
            {row.name}
          </Typography>
          <Typography
            noWrap
            sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.2 }}
          >
            {row.slug} • {row.active ? "Aktif" : "Non-Aktif"}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenu(e, row);
          }}
        >
          <MoreHorizRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}
