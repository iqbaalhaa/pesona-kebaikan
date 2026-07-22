"use client";

import React, { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { setEmergencyStatus } from "@/actions/campaign-admin";

type CampaignOption = {
	id: string;
	title: string;
	slug: string;
	cover: string;
};

type PinnedItem = CampaignOption & { daysLeft: number | null };

export default function AdminEmergencyPage() {
	const [allCampaigns, setAllCampaigns] = useState<CampaignOption[]>([]);
	const [pinned, setPinned] = useState<PinnedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({ open: false, message: "", severity: "success" });

	const showSnackbar = (message: string, severity: "success" | "error" = "success") =>
		setSnackbar({ open: true, message, severity });

	useEffect(() => {
		Promise.all([
			fetch("/api/admin/campaign-list").then((r) => (r.ok ? r.json() : [])),
			fetch("/api/admin/emergency-campaigns").then((r) => (r.ok ? r.json() : [])),
		])
			.then(([list, pinList]) => {
				setAllCampaigns(list);
				setPinned(pinList);
			})
			.catch(() => showSnackbar("Gagal memuat data", "error"))
			.finally(() => setLoading(false));
	}, []);

	const pinnedIds = useMemo(() => new Set(pinned.map((p) => p.id)), [pinned]);

	const filteredAll = useMemo(() => {
		const q = search.trim().toLowerCase();
		return allCampaigns
			.filter((c) => !pinnedIds.has(c.id))
			.filter((c) => (q ? c.title.toLowerCase().includes(q) : true));
	}, [allCampaigns, pinnedIds, search]);

	async function addPin(c: CampaignOption) {
		setBusy(c.id);
		const res = await setEmergencyStatus(c.id, true);
		setBusy(null);
		if (res.success) {
			setPinned((prev) => [...prev, { ...c, daysLeft: null }]);
			showSnackbar(`"${c.title}" ditambahkan`);
		} else {
			showSnackbar(res.error || "Gagal menyematkan", "error");
		}
	}

	async function removePin(item: PinnedItem) {
		setBusy(item.id);
		const res = await setEmergencyStatus(item.id, false);
		setBusy(null);
		if (res.success) {
			setPinned((prev) => prev.filter((p) => p.id !== item.id));
			showSnackbar(`"${item.title}" dihapus dari mendesak`);
		} else {
			showSnackbar(res.error || "Gagal menghapus", "error");
		}
	}

	if (loading) {
		return (
			<Box p={3} display="flex" alignItems="center" justifyContent="center" minHeight={200}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box p={3}>
			<Typography variant="h5" fontWeight="bold" mb={1}>
				Campaign Mendesak & Darurat
			</Typography>

			<Alert
				icon={<InfoOutlinedIcon fontSize="small" />}
				severity="info"
				sx={{ mb: 3, borderRadius: 2 }}
			>
				Campaign yang disematkan manual <strong>dan</strong> campaign aktif dengan sisa ≤ 14 hari akan otomatis muncul di section Mendesak & Darurat. Campaign yang disematkan manual tampil lebih dulu.
			</Alert>

			{/* Pinned list */}
			<Paper sx={{ p: 2, mb: 3 }}>
				<Typography fontWeight={800} mb={1}>
					Disematkan Manual
					<Chip
						label={pinned.length}
						size="small"
						sx={{ ml: 1, fontWeight: 700, fontSize: 11 }}
					/>
				</Typography>

				{pinned.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						Belum ada campaign yang disematkan manual
					</Typography>
				) : (
					<Stack divider={<Divider />} spacing={0}>
						{pinned.map((item) => (
							<Box
								key={item.id}
								display="flex"
								alignItems="center"
								gap={2}
								py={1.5}
							>
								<Avatar
									src={item.cover}
									variant="rounded"
									sx={{ width: 80, height: 48, flexShrink: 0 }}
								/>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography fontWeight={700} noWrap>
										{item.title}
									</Typography>
									<Typography variant="caption" color="text.secondary" noWrap>
										/donasi/{item.slug || item.id}
										{item.daysLeft !== null && (
											<span style={{ marginLeft: 8, color: item.daysLeft <= 7 ? "#e53e3e" : "#718096" }}>
												· {item.daysLeft} hari lagi
											</span>
										)}
									</Typography>
								</Box>
								<IconButton
									size="small"
									color="error"
									disabled={busy === item.id}
									onClick={() => removePin(item)}
								>
									{busy === item.id ? <CircularProgress size={18} /> : <DeleteIcon />}
								</IconButton>
							</Box>
						))}
					</Stack>
				)}
			</Paper>

			{/* Search & add */}
			<Paper sx={{ p: 2 }}>
				<Typography fontWeight={800} mb={2}>
					Tambah dari daftar
				</Typography>
				<Stack direction="row" alignItems="center" gap={1} mb={2}>
					<SearchIcon fontSize="small" color="action" />
					<TextField
						size="small"
						placeholder="Cari campaign aktif..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						sx={{ maxWidth: 320 }}
					/>
				</Stack>

				{filteredAll.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						{search ? "Tidak ada hasil" : "Semua campaign aktif sudah disematkan"}
					</Typography>
				) : (
					<Stack divider={<Divider />} spacing={0}>
						{filteredAll.map((c) => (
							<Box key={c.id} display="flex" alignItems="center" gap={2} py={1.5}>
								<Avatar
									src={c.cover}
									variant="rounded"
									sx={{ width: 64, height: 40, flexShrink: 0 }}
								/>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography fontWeight={700} noWrap>
										{c.title}
									</Typography>
									<Typography variant="caption" color="text.secondary" noWrap>
										/donasi/{c.slug || c.id}
									</Typography>
								</Box>
								<Button
									variant="outlined"
									size="small"
									startIcon={busy === c.id ? <CircularProgress size={14} /> : <AddIcon />}
									disabled={busy === c.id}
									onClick={() => addPin(c)}
								>
									Sematkan
								</Button>
							</Box>
						))}
					</Stack>
				)}
			</Paper>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={3500}
				onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				sx={{ zIndex: 99999 }}
			>
				<Alert
					severity={snackbar.severity}
					variant="filled"
					onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
					sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
