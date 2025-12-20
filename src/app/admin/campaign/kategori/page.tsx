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
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

type Category = {
	id: string;
	name: string;
	slug: string;
	desc: string;
	active: boolean;
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

const MOCK: Category[] = [
	{
		id: "cat-edu",
		name: "Bantuan Pendidikan",
		slug: "bantuan-pendidikan",
		desc: "Galang dana untuk beasiswa, biaya operasional pendidikan, atau pengembangan sekolah.",
		active: true,
		updatedAt: "19 Des 2025",
		options: [
			{
				id: "opt-edu-1",
				title: "Biaya sekolah / kuliah",
				desc: "Contoh: uang semester, SPP, seragam, buku.",
				active: true,
			},
			{
				id: "opt-edu-2",
				title: "Beasiswa & bantuan pendidikan",
				desc: "Contoh: beasiswa siswa berprestasi, bantuan pendidikan darurat.",
				active: true,
			},
			{
				id: "opt-edu-3",
				title: "Pengembangan fasilitas belajar",
				desc: "Contoh: renovasi kelas, pengadaan komputer, perpustakaan.",
				active: true,
			},
		],
		examples: [
			{ id: "ex-1", title: "Bantu Anisa melanjutkan kuliah" },
			{ id: "ex-2", title: "Bantu pelajar membayar SPP" },
		],
	},
	{
		id: "cat-dis",
		name: "Bencana Alam",
		slug: "bencana-alam",
		desc: "Galang dana untuk tanggap darurat, pemulihan, logistik, dan perbaikan pasca bencana.",
		active: true,
		updatedAt: "18 Des 2025",
		options: [
			{
				id: "opt-dis-1",
				title: "Acara/gerakan/kegiatan/program",
				desc: "Contoh: program pemulihan psikologis, relawan, dsb.",
				active: true,
			},
			{
				id: "opt-dis-2",
				title: "Biaya operasional lembaga/yayasan",
				desc: "Contoh: logistik posko, makan, air, selimut, pengiriman.",
				active: true,
			},
			{
				id: "opt-dis-3",
				title: "Pembangunan/perbaikan infrastruktur",
				desc: "Contoh: perbaikan rumah, jalan, fasilitas umum pasca bencana.",
				active: true,
			},
			{
				id: "opt-dis-4",
				title: "Bantuan untuk korban tertentu",
				desc: "Contoh: santunan untuk korban terdampak.",
				active: true,
			},
		],
		examples: [
			{ id: "ex-3", title: "Selamatkan Nyawa Sesama" },
			{ id: "ex-4", title: "Bantu korban gempa" },
		],
	},
	{
		id: "cat-wor",
		name: "Rumah Ibadah",
		slug: "rumah-ibadah",
		desc: "Galang dana untuk pembangunan/renovasi rumah ibadah dan fasilitas penunjang kegiatan.",
		active: true,
		updatedAt: "17 Des 2025",
		options: [
			{
				id: "opt-wor-1",
				title: "Renovasi & pembangunan",
				desc: "Contoh: perbaikan atap, lantai, pengecatan, pembangunan baru.",
				active: true,
			},
			{
				id: "opt-wor-2",
				title: "Fasilitas & perlengkapan",
				desc: "Contoh: sound system, karpet, kipas, alat kebersihan.",
				active: true,
			},
		],
		examples: [
			{ id: "ex-5", title: "Bangun kembali masjid terdampak" },
			{ id: "ex-6", title: "Renovasi mushola kampung" },
		],
	},
];

function slugify(v: string) {
	return v
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function softCardSx(theme: any) {
	// NO border solid, only soft background + shadow
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

	React.useEffect(() => {
		setLoading(true);
		const t = setTimeout(() => {
			setRows(MOCK);
			setSelectedId(MOCK[0]?.id ?? "");
			setLoading(false);
		}, 350);
		return () => clearTimeout(t);
	}, []);

	const filtered = React.useMemo(() => {
		if (!q) return rows;
		const s = q.toLowerCase();
		return rows.filter(
			(x) =>
				x.name.toLowerCase().includes(s) ||
				x.slug.toLowerCase().includes(s) ||
				x.desc.toLowerCase().includes(s)
		);
	}, [rows, q]);

	const openMenu = (e: React.MouseEvent<HTMLElement>, row: Category) =>
		setMenu({ anchor: e.currentTarget, row });
	const closeMenu = () => setMenu({ anchor: null, row: undefined });

	const onRefresh = () => {
		setLoading(true);
		setTimeout(() => {
			setRows(MOCK);
			setLoading(false);
		}, 250);
	};

	const updateSelected = (patch: Partial<Category>) => {
		if (!selected) return;
		setRows((prev) =>
			prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r))
		);
	};

	const onCreateCategory = (name: string) => {
		const id = `cat-${Math.random().toString(16).slice(2, 8)}`;
		const next: Category = {
			id,
			name,
			slug: slugify(name),
			desc: "",
			active: true,
			updatedAt: "Hari ini",
			options: [],
			examples: [],
		};
		setRows((prev) => [next, ...prev]);
		setSelectedId(id);
	};

	const onDeleteCategory = (id: string) => {
		setRows((prev) => prev.filter((x) => x.id !== id));
		if (selectedId === id) setSelectedId("");
	};

	const addOption = () => {
		if (!selected) return;
		const id = `opt-${Math.random().toString(16).slice(2, 8)}`;
		updateSelected({
			options: [
				{
					id,
					title: "Judul opsi",
					desc: "Deskripsi singkat…",
					active: true,
				},
				...selected.options,
			],
			updatedAt: "Hari ini",
		});
		setSaveTick(0);
	};

	const addExample = () => {
		if (!selected) return;
		const id = `ex-${Math.random().toString(16).slice(2, 8)}`;
		updateSelected({
			examples: [{ id, title: "Contoh campaign…" }, ...selected.examples],
			updatedAt: "Hari ini",
		});
		setSaveTick(0);
	};

	const validate = React.useMemo(() => {
		if (!selected) return { ok: true, msg: "" };
		if (!selected.name.trim())
			return { ok: false, msg: "Nama kategori wajib diisi." };
		if (!selected.slug.trim())
			return { ok: false, msg: "Slug kategori wajib diisi." };
		if (selected.options.some((o) => !o.title.trim()))
			return { ok: false, msg: "Ada opsi tujuan yang judulnya kosong." };
		return { ok: true, msg: "" };
	}, [selected]);

	const onSaveDummy = () => {
		if (!selected) return;

		if (!validate.ok) {
			setSaveTick(2);
			setTimeout(() => setSaveTick(0), 1400);
			return;
		}

		setRows((prev) =>
			prev.map((r) =>
				r.id === selected.id ? { ...r, updatedAt: "Baru saja" } : r
			)
		);
		setSaveTick(1);
		setTimeout(() => setSaveTick(0), 1200);
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
								onClick={onRefresh}
								sx={{
									borderRadius: 2,
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
								// remove harsh outline feel: keep minimal focus ring via theme
								"& fieldset": { borderColor: "transparent" },
								"&:hover fieldset": { borderColor: "transparent" },
							},
							"& .MuiInputBase-input": { fontSize: 13.5 },
						}}
					/>
				</Box>

				<Box sx={{ mt: 1.25, display: "grid", gap: 1 }}>
					{loading
						? Array.from({ length: 5 }).map((_, i) => (
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
						: filtered.map((row) => (
								<CategoryRow
									key={row.id}
									row={row}
									active={row.id === selectedId}
									onClick={() => setSelectedId(row.id)}
									onMenu={openMenu}
								/>
						  ))}
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
							onClick={onSaveDummy}
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
											Aktif
										</Typography>
									}
									sx={{ m: 0 }}
								/>
							</Stack>

							<Stack spacing={1} sx={{ mt: 1.25 }}>
								<TextField
									size="small"
									label="Nama kategori"
									value={selected.name}
									onChange={(e) => {
										const name = e.target.value;
										updateSelected({
											name,
											slug: slugify(name),
											updatedAt: "Hari ini",
										});
										setSaveTick(0);
									}}
									fullWidth
									sx={fieldNoOutlineSx(theme)}
								/>

								<TextField
									size="small"
									label="Slug"
									value={selected.slug}
									onChange={(e) => {
										updateSelected({
											slug: slugify(e.target.value),
											updatedAt: "Hari ini",
										});
										setSaveTick(0);
									}}
									fullWidth
									sx={fieldNoOutlineSx(theme)}
								/>

								<TextField
									size="small"
									label="Deskripsi"
									value={selected.desc}
									onChange={(e) => {
										updateSelected({
											desc: e.target.value,
											updatedAt: "Hari ini",
										});
										setSaveTick(0);
									}}
									fullWidth
									multiline
									minRows={3}
									sx={fieldNoOutlineSx(theme)}
								/>

								<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
									Update: <b>{selected.updatedAt}</b>
								</Typography>

								{!validate.ok ? (
									<Typography
										sx={{
											fontSize: 12.5,
											color: "warning.main",
											fontWeight: 900,
										}}
									>
										{validate.msg}
									</Typography>
								) : null}
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
										Ini yang muncul saat user pilih kategori (seperti
										“Acara/Program”, “Biaya operasional”, dll).
									</Typography>
								</Box>

								<Button
									onClick={addOption}
									startIcon={<AddRoundedIcon />}
									variant="contained"
									sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
								>
									Tambah
								</Button>
							</Stack>

							<Box sx={{ mt: 1.25, display: "grid", gap: 1 }}>
								{selected.options.length === 0 ? (
									<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
										Belum ada opsi. Klik “Tambah”.
									</Typography>
								) : (
									selected.options.map((opt, idx) => (
										<OptionRow
											key={opt.id}
											index={idx}
											opt={opt}
											onChange={(patch) => {
												updateSelected({
													options: selected.options.map((o) =>
														o.id === opt.id ? { ...o, ...patch } : o
													),
													updatedAt: "Hari ini",
												});
												setSaveTick(0);
											}}
											onDelete={() => {
												updateSelected({
													options: selected.options.filter(
														(o) => o.id !== opt.id
													),
													updatedAt: "Hari ini",
												});
												setSaveTick(0);
											}}
										/>
									))
								)}
							</Box>
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
										Placeholder untuk kartu “contoh penggalangan dana” yang
										tampil di modal.
									</Typography>
								</Box>

								<Button
									onClick={addExample}
									startIcon={<ImageRoundedIcon />}
									variant="contained"
									sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
								>
									Tambah
								</Button>
							</Stack>

							<Stack
								direction="row"
								spacing={1}
								sx={{ mt: 1.25, flexWrap: "wrap" }}
							>
								{selected.examples.length === 0 ? (
									<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
										Belum ada contoh.
									</Typography>
								) : (
									selected.examples.map((x) => (
										<Chip
											key={x.id}
											label={x.title}
											onDelete={() => {
												updateSelected({
													examples: selected.examples.filter(
														(e) => e.id !== x.id
													),
													updatedAt: "Hari ini",
												});
												setSaveTick(0);
											}}
											sx={{
												borderRadius: 999,
												fontWeight: 900,
												bgcolor: alpha(
													theme.palette.primary.main,
													theme.palette.mode === "dark" ? 0.14 : 0.08
												),
												color: "text.primary",
												"& .MuiChip-deleteIcon": { opacity: 0.75 },
											}}
										/>
									))
								)}
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
						borderRadius: 3,
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
						onDeleteCategory(row.id);
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
								onCreateCategory(dlg.name.trim());
							} else {
								// rename selected
								const row = rows.find((r) => r.id === selectedId);
								if (row) {
									setRows((prev) =>
										prev.map((r) =>
											r.id === row.id
												? {
														...r,
														name: dlg.name.trim(),
														slug: slugify(dlg.name.trim()),
														updatedAt: "Hari ini",
												  }
												: r
										)
									);
									setSaveTick(0);
								}
							}

							setDlg({ open: false, mode: "create", name: "" });
						}}
						variant="contained"
						sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
					>
						Simpan
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

function fieldNoOutlineSx(theme: any) {
	return {
		"& .MuiOutlinedInput-root": {
			borderRadius: 2.25,
			bgcolor: alpha(
				theme.palette.background.paper,
				theme.palette.mode === "dark" ? 0.35 : 1
			),
			"& fieldset": { borderColor: "transparent" }, // remove outline
			"&:hover fieldset": { borderColor: "transparent" }, // remove outline hover
			"&.Mui-focused fieldset": { borderColor: "transparent" }, // keep clean; focus handled by shadow/bg
		},
		"& .MuiInputBase-input": { fontSize: 13.5 },
		"& .MuiInputLabel-root": { fontSize: 13.5 },
	};
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
	onMenu: (e: React.MouseEvent<HTMLElement>, r: Category) => void;
}) {
	const theme = useTheme();
	const soft = softInsetSx(theme);

	return (
		<Paper
			elevation={0}
			onClick={onClick}
			sx={{
				...soft,
				p: 1.25,
				cursor: "pointer",
				transition: "transform 140ms ease, box-shadow 140ms ease",
				boxShadow: active
					? `0 14px 30px ${alpha(
							theme.palette.primary.main,
							theme.palette.mode === "dark" ? 0.18 : 0.1
					  )}`
					: (soft as any).boxShadow,
				transform: active ? "translateY(-1px)" : "none",
			}}
		>
			<Stack direction="row" spacing={1} alignItems="flex-start">
				<Box
					sx={{
						width: 42,
						height: 42,
						borderRadius: 2.25,
						bgcolor: alpha(
							theme.palette.primary.main,
							theme.palette.mode === "dark" ? 0.18 : 0.1
						),
						display: "grid",
						placeItems: "center",
					}}
				>
					<CategoryRoundedIcon fontSize="small" />
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						justifyContent="space-between"
					>
						<Typography
							sx={{ fontWeight: 1000, fontSize: 13.5 }}
							className="line-clamp-1"
						>
							{row.name}
						</Typography>

						<IconButton
							onClick={(e) => {
								e.stopPropagation();
								onMenu(e, row);
							}}
							size="small"
							sx={{
								borderRadius: 2,
								bgcolor: alpha(
									theme.palette.background.paper,
									theme.palette.mode === "dark" ? 0.35 : 1
								),
							}}
						>
							<MoreHorizRoundedIcon fontSize="small" />
						</IconButton>
					</Stack>

					<Typography
						sx={{ mt: 0.2, fontSize: 12.5, color: "text.secondary" }}
						className="line-clamp-2"
					>
						{row.desc || "—"}
					</Typography>

					<Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
						<Chip
							size="small"
							label={`${row.options.length} opsi`}
							sx={{
								borderRadius: 999,
								fontWeight: 900,
								bgcolor: alpha(
									theme.palette.text.primary,
									theme.palette.mode === "dark" ? 0.16 : 0.08
								),
								color: "text.secondary",
							}}
						/>
						<Chip
							size="small"
							label={row.active ? "Aktif" : "Nonaktif"}
							sx={{
								borderRadius: 999,
								fontWeight: 900,
								bgcolor: alpha(
									row.active
										? theme.palette.success.main
										: theme.palette.text.primary,
									theme.palette.mode === "dark" ? 0.16 : 0.08
								),
								color: row.active
									? theme.palette.success.main
									: theme.palette.text.secondary,
							}}
						/>
						<Typography
							sx={{ fontSize: 12.5, color: "text.secondary", ml: "auto" }}
						>
							Update <b>{row.updatedAt}</b>
						</Typography>
					</Stack>
				</Box>
			</Stack>
		</Paper>
	);
}

function OptionRow({
	index,
	opt,
	onChange,
	onDelete,
}: {
	index: number;
	opt: Category["options"][number];
	onChange: (patch: Partial<Category["options"][number]>) => void;
	onDelete: () => void;
}) {
	const theme = useTheme();

	return (
		<Paper elevation={0} sx={{ ...softInsetSx(theme), p: 1 }}>
			<Stack direction="row" spacing={1} alignItems="flex-start">
				<Box
					sx={{
						width: 34,
						height: 34,
						borderRadius: 2,
						bgcolor: alpha(
							theme.palette.text.primary,
							theme.palette.mode === "dark" ? 0.14 : 0.06
						),
						display: "grid",
						placeItems: "center",
					}}
				>
					<DragIndicatorRoundedIcon fontSize="small" />
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={1}
						alignItems={{ sm: "center" }}
					>
						<TextField
							size="small"
							label={`Judul opsi #${index + 1}`}
							value={opt.title}
							onChange={(e) => onChange({ title: e.target.value })}
							fullWidth
							sx={fieldNoOutlineSx(theme)}
						/>
						<FormControlLabel
							control={
								<Switch
									checked={opt.active}
									onChange={(e) => onChange({ active: e.target.checked })}
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
									Aktif
								</Typography>
							}
							sx={{ m: 0, pl: 0.5 }}
						/>
					</Stack>

					<TextField
						size="small"
						label="Deskripsi"
						value={opt.desc}
						onChange={(e) => onChange({ desc: e.target.value })}
						fullWidth
						multiline
						minRows={2}
						sx={{ mt: 1, ...fieldNoOutlineSx(theme) }}
					/>

					<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
						<Button
							onClick={onDelete}
							startIcon={<DeleteRoundedIcon />}
							variant="text"
							color="error"
							sx={{ borderRadius: 999, fontWeight: 900 }}
						>
							Hapus
						</Button>
					</Stack>
				</Box>
			</Stack>
		</Paper>
	);
}
