"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Box,
	Typography,
	Button,
	Stack,
	Paper,
	Avatar,
	IconButton,
	Divider,
	Snackbar,
	Alert,
	CircularProgress,
	TextField,
	Chip,
	Tab,
	Tabs,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { updateNotifyKey } from "@/actions/settings";
import { setEmergencyStatus } from "@/actions/campaign-admin";

type CampaignOption = {
	id: string;
	title: string;
	slug: string;
	cover: string;
};

type FeaturedItem = CampaignOption & { order: number };
type PinnedItem = CampaignOption & { daysLeft: number | null };

// ── shared snackbar type ───────────────────────────────────────────────────
type SnackState = { open: boolean; message: string; severity: "success" | "error" | "info" | "warning" };
const closedSnack: SnackState = { open: false, message: "", severity: "info" };

// ══════════════════════════════════════════════════════════════════════════════
// Tab 1 — Pilihan Pesona
// ══════════════════════════════════════════════════════════════════════════════
function FeaturedPanel() {
	const [allCampaigns, setAllCampaigns] = useState<CampaignOption[]>([]);
	const [featured, setFeatured] = useState<FeaturedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [snackbar, setSnackbar] = useState<SnackState>(closedSnack);
	const [search, setSearch] = useState("");
	const [featuredTitle, setFeaturedTitle] = useState("");
	const originalRef = useRef<FeaturedItem[]>([]);
	const dragFromRef = useRef<number | null>(null);
	const [dragOverId, setDragOverId] = useState<string | null>(null);

	const show = (message: string, severity: SnackState["severity"] = "info") =>
		setSnackbar({ open: true, message, severity });

	useEffect(() => {
		Promise.all([
			fetch("/api/admin/campaign-list").then((r) => (r.ok ? r.json() : [])),
			fetch("/api/admin/featured-campaigns").then((r) => (r.ok ? r.json() : [])),
			fetch("/api/admin/featured-title").then((r) => (r.ok ? r.json() : { title: "Pilihan Pesona Kebaikan" })),
		])
			.then(([list, featRaw, titleJson]) => {
				setAllCampaigns(list);
				const mapped: FeaturedItem[] = featRaw.map((f: any, idx: number) => ({
					id: f.id, title: f.title, slug: f.slug, cover: f.cover,
					order: typeof f.order === "number" ? f.order : idx + 1,
				}));
				setFeatured(mapped);
				originalRef.current = mapped;
				setFeaturedTitle(titleJson.title || "Pilihan Pesona Kebaikan");
			})
			.catch(() => show("Gagal memuat data", "error"))
			.finally(() => setLoading(false));
	}, []);

	const filteredAll = useMemo(() => {
		const q = search.trim().toLowerCase();
		const picked = new Set(featured.map((f) => f.id));
		return allCampaigns
			.filter((c) => !picked.has(c.id))
			.filter((c) => (q ? c.title.toLowerCase().includes(q) : true));
	}, [allCampaigns, featured, search]);

	const dirty = useMemo(() => {
		const a = featured, b = originalRef.current;
		if (a.length !== b.length) return true;
		return a.some((x, i) => x.id !== b[i].id || x.order !== b[i].order);
	}, [featured]);

	const add = (c: CampaignOption) =>
		setFeatured((p) => [...p, { ...c, order: p.length + 1 }]);
	const remove = (id: string) =>
		setFeatured((p) => p.filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i + 1 })));
	const move = (id: string, dir: "up" | "down") =>
		setFeatured((prev) => {
			const idx = prev.findIndex((x) => x.id === id);
			const j = dir === "up" ? idx - 1 : idx + 1;
			if (idx < 0 || j < 0 || j >= prev.length) return prev;
			const next = [...prev];
			[next[idx], next[j]] = [next[j], next[idx]];
			return next.map((x, i) => ({ ...x, order: i + 1 }));
		});

	const onDragStart = (i: number) => { dragFromRef.current = i; };
	const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
	const onDrop = (toIdx: number) => {
		const from = dragFromRef.current;
		setDragOverId(null); dragFromRef.current = null;
		if (from === null || from === toIdx) return;
		setFeatured((prev) => {
			const arr = [...prev];
			const [item] = arr.splice(from, 1);
			arr.splice(toIdx, 0, item);
			return arr.map((x, i) => ({ ...x, order: i + 1 }));
		});
	};
	const onDragEnd = () => { setDragOverId(null); dragFromRef.current = null; };

	const save = async () => {
		setSaving(true);
		try {
			await updateNotifyKey("home_featured_title", featuredTitle, "Featured Section Title");
			const resp = await fetch("/api/admin/featured-campaigns", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ items: featured.map((f) => ({ id: f.id, order: f.order })) }),
			});
			if (!resp.ok) throw new Error();
			show("Campaign Pilihan berhasil disimpan", "success");
			originalRef.current = featured;
		} catch {
			show("Gagal menyimpan", "error");
		} finally {
			setSaving(false);
		}
	};

	const resetOrder = async () => {
		setSaving(true);
		try {
			const resp = await fetch("/api/admin/featured-campaigns", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ items: [] }),
			});
			if (!resp.ok) throw new Error();
			setFeatured([]); originalRef.current = [];
			show("Urutan dikembalikan ke default", "success");
		} catch {
			show("Gagal reset", "error");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <Box py={6} display="flex" justifyContent="center"><CircularProgress /></Box>;

	return (
		<>
			<Stack direction="row" justifyContent="flex-end" gap={1} mb={3}>
				<Button variant="outlined" color="warning" onClick={resetOrder} disabled={saving}>
					Reset ke default
				</Button>
				{dirty ? (
					<Button variant="contained" onClick={save} disabled={saving} sx={{ bgcolor: "#0ba976" }}>
						{saving ? <CircularProgress size={22} /> : "Simpan Urutan"}
					</Button>
				) : (
					<Button variant="outlined" onClick={() => { setFeatured(originalRef.current); show("Perubahan dibatalkan", "info"); }} disabled={saving}>
						Batal Simpan
					</Button>
				)}
			</Stack>

			<Paper sx={{ p: 2, mb: 3 }}>
				<Typography fontWeight={800} mb={1}>Judul Section</Typography>
				<TextField
					fullWidth
					label="Judul di beranda"
					value={featuredTitle}
					onChange={(e) => setFeaturedTitle(e.target.value)}
					placeholder="Contoh: Pilihan Pesona Kebaikan"
				/>
			</Paper>

			<Paper sx={{ p: 2, mb: 3 }}>
				<Typography fontWeight={800} mb={1}>Urutan Tampil</Typography>
				{featured.length === 0 ? (
					<Typography variant="body2" color="text.secondary">Belum ada campaign pilihan</Typography>
				) : (
					<Stack divider={<Divider />} spacing={1}>
						{featured.map((f, idx) => (
							<Box
								key={f.id}
								display="flex" alignItems="center" gap={2} py={1}
								draggable
								onDragStart={() => onDragStart(idx)}
								onDragOver={(e) => onDragOver(e, f.id)}
								onDrop={() => onDrop(idx)}
								onDragEnd={onDragEnd}
								sx={{ bgcolor: dragOverId === f.id ? "rgba(11,169,118,0.08)" : "transparent", transition: "background-color 120ms ease" }}
							>
								<Typography sx={{ width: 24, fontWeight: 800 }}>{idx + 1}</Typography>
								<Avatar src={f.cover} variant="rounded" sx={{ width: 80, height: 48 }} />
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography fontWeight={800} noWrap>{f.title}</Typography>
									<Typography variant="caption" color="text.secondary" noWrap>/donasi/{f.slug || f.id}</Typography>
								</Box>
								<Stack direction="row" gap={1}>
									<IconButton size="small"><DragIndicatorIcon /></IconButton>
									<IconButton size="small" onClick={() => move(f.id, "up")} disabled={idx === 0}><ArrowUpwardIcon /></IconButton>
									<IconButton size="small" onClick={() => move(f.id, "down")} disabled={idx === featured.length - 1}><ArrowDownwardIcon /></IconButton>
									<IconButton size="small" color="error" onClick={() => remove(f.id)}><DeleteIcon /></IconButton>
								</Stack>
							</Box>
						))}
					</Stack>
				)}
			</Paper>

			<Paper sx={{ p: 2 }}>
				<Stack direction="row" alignItems="center" gap={1} mb={2}>
					<SearchIcon fontSize="small" />
					<TextField size="small" placeholder="Cari campaign..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ maxWidth: 320 }} />
				</Stack>
				<Typography fontWeight={800} mb={1}>Tambah dari daftar</Typography>
				<Stack divider={<Divider />} spacing={1}>
					{filteredAll.map((c) => (
						<Box key={c.id} display="flex" alignItems="center" gap={2} py={1}>
							<Avatar src={c.cover} variant="rounded" sx={{ width: 64, height: 40 }} />
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography fontWeight={700} noWrap>{c.title}</Typography>
								<Typography variant="caption" color="text.secondary" noWrap>/donasi/{c.slug || c.id}</Typography>
							</Box>
							<Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => add(c)}>Tambah</Button>
						</Box>
					))}
				</Stack>
			</Paper>

			<Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(closedSnack)} anchorOrigin={{ vertical: "top", horizontal: "center" }} sx={{ zIndex: 99999 }}>
				<Alert onClose={() => setSnackbar(closedSnack)} severity={snackbar.severity} variant="filled" sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}

// ══════════════════════════════════════════════════════════════════════════════
// Tab 2 — Mendesak & Darurat
// ══════════════════════════════════════════════════════════════════════════════
function EmergencyPanel() {
	const [allCampaigns, setAllCampaigns] = useState<CampaignOption[]>([]);
	const [pinned, setPinned] = useState<PinnedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [search, setSearch] = useState("");
	const [snackbar, setSnackbar] = useState<SnackState>(closedSnack);
	const originalRef = useRef<PinnedItem[]>([]);

	const show = (message: string, severity: SnackState["severity"] = "success") =>
		setSnackbar({ open: true, message, severity });

	useEffect(() => {
		Promise.all([
			fetch("/api/admin/campaign-list").then((r) => (r.ok ? r.json() : [])),
			fetch("/api/admin/emergency-campaigns").then((r) => (r.ok ? r.json() : [])),
		])
			.then(([list, pinList]) => {
				setAllCampaigns(list);
				setPinned(pinList);
				originalRef.current = pinList;
			})
			.catch(() => show("Gagal memuat data", "error"))
			.finally(() => setLoading(false));
	}, []);

	const pinnedIds = useMemo(() => new Set(pinned.map((p) => p.id)), [pinned]);

	const dirty = useMemo(() => {
		const a = new Set(pinned.map((p) => p.id));
		const b = new Set(originalRef.current.map((p) => p.id));
		if (a.size !== b.size) return true;
		for (const id of a) if (!b.has(id)) return true;
		return false;
	}, [pinned]);

	const filteredAll = useMemo(() => {
		const q = search.trim().toLowerCase();
		return allCampaigns
			.filter((c) => !pinnedIds.has(c.id))
			.filter((c) => (q ? c.title.toLowerCase().includes(q) : true));
	}, [allCampaigns, pinnedIds, search]);

	const addPin = (c: CampaignOption) =>
		setPinned((p) => [...p, { ...c, daysLeft: null }]);

	const removePin = (id: string) =>
		setPinned((p) => p.filter((x) => x.id !== id));

	const revert = () => {
		setPinned(originalRef.current);
		show("Perubahan dibatalkan", "info");
	};

	const save = async () => {
		setSaving(true);
		try {
			const origIds = new Set(originalRef.current.map((p) => p.id));
			const newIds = new Set(pinned.map((p) => p.id));
			const toAdd = pinned.filter((p) => !origIds.has(p.id));
			const toRemove = originalRef.current.filter((p) => !newIds.has(p.id));
			await Promise.all([
				...toAdd.map((p) => setEmergencyStatus(p.id, true)),
				...toRemove.map((p) => setEmergencyStatus(p.id, false)),
			]);
			originalRef.current = pinned;
			show("Campaign Mendesak berhasil disimpan", "success");
		} catch {
			show("Gagal menyimpan", "error");
		} finally {
			setSaving(false);
		}
	};

	const resetAll = async () => {
		setSaving(true);
		try {
			await Promise.all(originalRef.current.map((p) => setEmergencyStatus(p.id, false)));
			setPinned([]);
			originalRef.current = [];
			show("Semua sematkan dihapus", "success");
		} catch {
			show("Gagal reset", "error");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <Box py={6} display="flex" justifyContent="center"><CircularProgress /></Box>;

	return (
		<>
			<Stack direction="row" justifyContent="flex-end" gap={1} mb={3}>
				<Button variant="outlined" color="warning" onClick={resetAll} disabled={saving}>
					Reset ke default
				</Button>
				{dirty ? (
					<Button variant="contained" onClick={save} disabled={saving} sx={{ bgcolor: "#0ba976" }}>
						{saving ? <CircularProgress size={22} /> : "Simpan"}
					</Button>
				) : (
					<Button variant="outlined" onClick={revert} disabled={saving}>
						Batal Simpan
					</Button>
				)}
			</Stack>

			<Alert icon={<InfoOutlinedIcon fontSize="small" />} severity="info" sx={{ mb: 3, borderRadius: 2 }}>
				Campaign yang disematkan manual <strong>dan</strong> campaign aktif dengan sisa ≤ 14 hari otomatis muncul di section ini. Campaign disematkan tampil lebih dulu.
			</Alert>

			<Paper sx={{ p: 2, mb: 3 }}>
				<Typography fontWeight={800} mb={1} component="div">
					Disematkan Manual
					<Chip label={pinned.length} size="small" sx={{ ml: 1, fontWeight: 700, fontSize: 11 }} />
				</Typography>
				{pinned.length === 0 ? (
					<Typography variant="body2" color="text.secondary">Belum ada campaign yang disematkan manual</Typography>
				) : (
					<Stack divider={<Divider />} spacing={0}>
						{pinned.map((item) => (
							<Box key={item.id} display="flex" alignItems="center" gap={2} py={1.5}>
								<Avatar src={item.cover} variant="rounded" sx={{ width: 80, height: 48, flexShrink: 0 }} />
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography fontWeight={700} noWrap>{item.title}</Typography>
									<Typography variant="caption" color="text.secondary" noWrap>
										/donasi/{item.slug || item.id}
										{item.daysLeft !== null && (
											<span style={{ marginLeft: 8, color: item.daysLeft <= 7 ? "#e53e3e" : "#718096" }}>
												· {item.daysLeft} hari lagi
											</span>
										)}
									</Typography>
								</Box>
								<IconButton size="small" color="error" onClick={() => removePin(item.id)}>
									<DeleteIcon />
								</IconButton>
							</Box>
						))}
					</Stack>
				)}
			</Paper>

			<Paper sx={{ p: 2 }}>
				<Stack direction="row" alignItems="center" gap={1} mb={2}>
					<SearchIcon fontSize="small" />
					<TextField size="small" placeholder="Cari campaign aktif..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ maxWidth: 320 }} />
				</Stack>
				<Typography fontWeight={800} mb={1}>Tambah dari daftar</Typography>
				{filteredAll.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						{search ? "Tidak ada hasil" : "Semua campaign aktif sudah disematkan"}
					</Typography>
				) : (
					<Stack divider={<Divider />} spacing={0}>
						{filteredAll.map((c) => (
							<Box key={c.id} display="flex" alignItems="center" gap={2} py={1.5}>
								<Avatar src={c.cover} variant="rounded" sx={{ width: 64, height: 40, flexShrink: 0 }} />
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography fontWeight={700} noWrap>{c.title}</Typography>
									<Typography variant="caption" color="text.secondary" noWrap>/donasi/{c.slug || c.id}</Typography>
								</Box>
								<Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => addPin(c)}>
									Tambah
								</Button>
							</Box>
						))}
					</Stack>
				)}
			</Paper>

			<Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(closedSnack)} anchorOrigin={{ vertical: "top", horizontal: "center" }} sx={{ zIndex: 99999 }}>
				<Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(closedSnack)} sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}

// ══════════════════════════════════════════════════════════════════════════════
// Main page — tab shell
// ══════════════════════════════════════════════════════════════════════════════
export default function CampaignUnggulanPage() {
	const [tab, setTab] = useState(0);

	return (
		<Box p={3}>
			<Typography variant="h5" fontWeight="bold" mb={3}>
				Campaign Unggulan
			</Typography>

			<Tabs
				value={tab}
				onChange={(_, v) => setTab(v)}
				sx={{
					mb: 3,
					"& .MuiTabs-indicator": { bgcolor: "#0ba976" },
					"& .Mui-selected": { color: "#0ba976 !important" },
				}}
			>
				<Tab label="Pilihan Pesona" />
				<Tab label="Mendesak & Darurat" />
			</Tabs>

			{tab === 0 && <FeaturedPanel />}
			{tab === 1 && <EmergencyPanel />}
		</Box>
	);
}
