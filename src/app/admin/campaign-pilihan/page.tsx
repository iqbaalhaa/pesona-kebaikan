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
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { updateCampaign, getCampaignById } from "@/actions/campaign";
import { updateNotifyKey } from "@/actions/settings";

type CampaignOption = {
	id: string;
	title: string;
	slug: string;
	cover: string;
};

type FeaturedItem = CampaignOption & { order: number };

export default function AdminFeaturedPage() {
	const [allCampaigns, setAllCampaigns] = useState<CampaignOption[]>([]);
	const [featured, setFeatured] = useState<FeaturedItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({ open: false, message: "", severity: "info" });
	const [search, setSearch] = useState("");
	const [featuredTitle, setFeaturedTitle] = useState("");

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "info" | "warning" = "info",
	) => setSnackbar({ open: true, message, severity });
	const handleCloseSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [listRes, featRes, titleRes] = await Promise.all([
					fetch("/api/admin/campaign-list"),
					fetch("/api/admin/featured-campaigns"),
					fetch("/api/admin/featured-title"),
				]);
				const list: CampaignOption[] = listRes.ok ? await listRes.json() : [];
				const featRaw: any[] = featRes.ok ? await featRes.json() : [];
				const titleJson = titleRes.ok
					? await titleRes.json()
					: { title: "Pilihan Kitabisa" };
				setAllCampaigns(list);
				const mapped = featRaw.map((f, idx) => ({
					id: f.id,
					title: f.title,
					slug: f.slug,
					cover: f.cover,
					order: typeof f.order === "number" ? f.order : idx + 1,
				}));
				setFeatured(mapped);
				originalRef.current = mapped;
				setFeaturedTitle(titleJson.title || "Pilihan Kitabisa");
			} catch (e) {
				console.error(e);
				showSnackbar("Gagal memuat data", "error");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const filteredAll = useMemo(() => {
		const q = search.trim().toLowerCase();
		const pickedIds = new Set(featured.map((f) => f.id));
		return allCampaigns
			.filter((c) => !pickedIds.has(c.id))
			.filter((c) => (q ? c.title.toLowerCase().includes(q) : true));
	}, [allCampaigns, featured, search]);

	const addToFeatured = (c: CampaignOption) => {
		setFeatured((prev) => [...prev, { ...c, order: prev.length + 1 }]);
	};
	const removeFeatured = (id: string) => {
		setFeatured((prev) =>
			prev.filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i + 1 })),
		);
	};
	const move = (id: string, dir: "up" | "down") => {
		setFeatured((prev) => {
			const idx = prev.findIndex((x) => x.id === id);
			if (idx < 0) return prev;
			const j = dir === "up" ? idx - 1 : idx + 1;
			if (j < 0 || j >= prev.length) return prev;
			const next = [...prev];
			const tmp = next[idx];
			next[idx] = next[j];
			next[j] = tmp;
			return next.map((x, i) => ({ ...x, order: i + 1 }));
		});
	};

	const dragFromRef = useRef<number | null>(null);
	const [dragOverId, setDragOverId] = useState<string | null>(null);
	const originalRef = useRef<FeaturedItem[]>([]);
	const onDragStart = (index: number) => {
		dragFromRef.current = index;
	};
	const onDragOver = (e: React.DragEvent, id: string) => {
		e.preventDefault();
		setDragOverId(id);
	};
	const onDrop = (toIndex: number) => {
		const fromIndex = dragFromRef.current;
		setDragOverId(null);
		dragFromRef.current = null;
		if (fromIndex === null || fromIndex === toIndex) return;
		setFeatured((prev) => {
			const arr = [...prev];
			const [item] = arr.splice(fromIndex, 1);
			arr.splice(toIndex, 0, item);
			return arr.map((x, i) => ({ ...x, order: i + 1 }));
		});
	};
	const onDragEnd = () => {
		setDragOverId(null);
		dragFromRef.current = null;
	};

	const dirty = useMemo(() => {
		const a = featured;
		const b = originalRef.current;
		if (a.length !== b.length) return true;
		for (let i = 0; i < a.length; i++) {
			if (a[i].id !== b[i].id || a[i].order !== b[i].order) return true;
		}
		return false;
	}, [featured]);

	const revert = async () => {
		setFeatured(originalRef.current);
		showSnackbar("Perubahan dibatalkan", "info");
	};

	const resetOrder = async () => {
		setSaving(true);
		try {
			const resp = await fetch("/api/admin/featured-campaigns", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ items: [] }),
			});
			if (!resp.ok) throw new Error("Gagal reset urutan");
			setFeatured([]);
			originalRef.current = [];
			showSnackbar("Urutan dikembalikan ke default", "success");
		} catch (e) {
			console.error(e);
			showSnackbar("Gagal reset urutan", "error");
		} finally {
			setSaving(false);
		}
	};

	const save = async () => {
		setSaving(true);
		try {
			await updateNotifyKey(
				"home_featured_title",
				featuredTitle,
				"Featured Section Title",
			);

			const payload = {
				items: featured.map((f) => ({ id: f.id, order: f.order })),
			};
			const resp = await fetch("/api/admin/featured-campaigns", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!resp.ok) {
				throw new Error("Gagal menyimpan urutan campaign pilihan");
			}

			showSnackbar("Campaign Pilihan berhasil disimpan", "success");
			originalRef.current = featured;
		} catch (e) {
			console.error(e);
			showSnackbar("Gagal menyimpan Campaign Pilihan", "error");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<Box p={3} display="flex" alignItems="center" justifyContent="center">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box p={3}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography variant="h5" fontWeight="bold">
					Campaign Pilihan
				</Typography>
				<Stack direction="row" gap={1}>
					<Button
						variant="outlined"
						color="warning"
						onClick={resetOrder}
						disabled={saving}
					>
						Reset ke default
					</Button>
					{dirty ? (
						<Button
							variant="contained"
							onClick={save}
							disabled={saving}
							sx={{ bgcolor: "#0ba976" }}
						>
							{saving ? <CircularProgress size={22} /> : "Simpan Urutan"}
						</Button>
					) : (
						<Button variant="outlined" onClick={revert} disabled={saving}>
							Batal Simpan
						</Button>
					)}
				</Stack>
			</Stack>

			<Paper sx={{ p: 2, mb: 3 }}>
				<Typography fontWeight={800} mb={1}>
					Judul Section
				</Typography>
				<TextField
					fullWidth
					label="Judul di beranda"
					value={featuredTitle}
					onChange={(e) => setFeaturedTitle(e.target.value)}
					placeholder="Contoh: Pilihan Kitabisa"
				/>
			</Paper>

			<Paper sx={{ p: 2, mb: 3 }}>
				<Typography fontWeight={800} mb={1}>
					Urutan Tampil
				</Typography>
				{featured.length === 0 ? (
					<Typography variant="body2" color="text.secondary">
						Belum ada campaign pilihan
					</Typography>
				) : (
					<Stack divider={<Divider />} spacing={1}>
						{featured.map((f, idx) => (
							<Box
								key={f.id}
								display="flex"
								alignItems="center"
								gap={2}
								py={1}
								draggable
								onDragStart={() => onDragStart(idx)}
								onDragOver={(e) => onDragOver(e, f.id)}
								onDrop={() => onDrop(idx)}
								onDragEnd={onDragEnd}
								sx={{
									bgcolor:
										dragOverId === f.id
											? "rgba(11,169,118,0.08)"
											: "transparent",
									transition: "background-color 120ms ease",
								}}
							>
								<Typography sx={{ width: 24, fontWeight: 800 }}>
									{idx + 1}
								</Typography>
								<Avatar
									src={f.cover}
									variant="rounded"
									sx={{ width: 80, height: 48 }}
								/>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography fontWeight={800} noWrap>
										{f.title}
									</Typography>
									<Typography variant="caption" color="text.secondary" noWrap>
										/donasi/{f.slug || f.id}
									</Typography>
								</Box>
								<Stack direction="row" gap={1}>
									<IconButton size="small">
										<DragIndicatorIcon />
									</IconButton>
									<IconButton
										size="small"
										onClick={() => move(f.id, "up")}
										disabled={idx === 0}
									>
										<ArrowUpwardIcon />
									</IconButton>
									<IconButton
										size="small"
										onClick={() => move(f.id, "down")}
										disabled={idx === featured.length - 1}
									>
										<ArrowDownwardIcon />
									</IconButton>
									<IconButton
										size="small"
										color="error"
										onClick={() => removeFeatured(f.id)}
									>
										<DeleteIcon />
									</IconButton>
								</Stack>
							</Box>
						))}
					</Stack>
				)}
			</Paper>

			<Paper sx={{ p: 2 }}>
				<Stack direction="row" alignItems="center" gap={1} mb={2}>
					<SearchIcon fontSize="small" />
					<TextField
						size="small"
						placeholder="Cari campaign..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						sx={{ maxWidth: 320 }}
					/>
				</Stack>
				<Typography fontWeight={800} mb={1}>
					Tambah dari daftar
				</Typography>
				<Stack divider={<Divider />} spacing={1}>
					{filteredAll.map((c) => (
						<Box key={c.id} display="flex" alignItems="center" gap={2} py={1}>
							<Avatar
								src={c.cover}
								variant="rounded"
								sx={{ width: 64, height: 40 }}
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
								startIcon={<AddIcon />}
								onClick={() => addToFeatured(c)}
							>
								Tambah
							</Button>
						</Box>
					))}
				</Stack>
			</Paper>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				sx={{ zIndex: 99999 }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					variant="filled"
					sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
