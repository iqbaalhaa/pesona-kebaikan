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
	DialogContentText,
	Menu,
	MenuItem,
	Skeleton,
	Switch,
	FormControlLabel,
	useTheme,
	alpha,
	Snackbar,
	Alert,
	Tabs,
	Tab,
	Fade,
	Grow,
	Theme,
	Tooltip,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import { getCategoryIcon } from "@/lib/categoryIcons";
import { MEDICAL_SLUG } from "@/lib/categoryUtils";
import IconManager from "@/components/admin/IconManager";

type Category = {
	id: string;
	name: string;
	slug: string;
	desc: string;
	active: boolean;
	icon?: string;
	updatedAt: string;
};

function slugify(v: string) {
	return v
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

// --- Design System Styles ---

const glassSx = (theme: Theme) => ({
	bgcolor: alpha(theme.palette.background.paper, 0.7),
	backdropFilter: "blur(20px)",
	border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
	boxShadow:
		theme.palette.mode === "dark"
			? "0 4px 30px rgba(0, 0, 0, 0.1)"
			: "0 4px 30px rgba(0, 0, 0, 0.03)",
});

const premiumCardSx = (theme: Theme) => ({
	borderRadius: 1.5,
	bgcolor: theme.palette.background.paper,
	border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
	boxShadow:
		theme.palette.mode === "dark"
			? "0 4px 20px rgba(0,0,0,0.4)"
			: "0 4px 20px rgba(148, 163, 184, 0.1)",
	overflow: "hidden",
	transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
	"&:hover": {
		transform: "translateY(-2px)", // Reduced from -4px
		boxShadow:
			theme.palette.mode === "dark"
				? "0 8px 30px rgba(0,0,0,0.5)"
				: "0 12px 30px rgba(148, 163, 184, 0.2)",
		borderColor: alpha(theme.palette.primary.main, 0.2),
	},
});

const activeCardSx = (theme: Theme) => ({
	...premiumCardSx(theme),
	borderColor: theme.palette.primary.main,
	boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.15)}`, // Reduced shadow
	transform: "translateY(-2px)", // Reduced from -4px
});

const fieldPremiumSx = (theme: Theme) => ({
	"& .MuiOutlinedInput-root": {
		borderRadius: 1.5,
		bgcolor: alpha(theme.palette.background.default, 0.5),
		transition: "all 0.2s",
		"& fieldset": {
			borderColor: alpha(theme.palette.divider, 0.1),
		},
		"&:hover": {
			bgcolor: alpha(theme.palette.background.default, 0.8),
			"& fieldset": { borderColor: alpha(theme.palette.divider, 0.2) },
		},
		"&.Mui-focused": {
			bgcolor: theme.palette.background.paper,
			boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
			"& fieldset": {
				borderColor: theme.palette.primary.main,
				borderWidth: 2,
			},
		},
	},
});

const scrollSx = (theme: Theme) => ({
	"&::-webkit-scrollbar": {
		width: 6,
		height: 6,
	},
	"&::-webkit-scrollbar-track": {
		bgcolor: "transparent",
	},
	"&::-webkit-scrollbar-thumb": {
		bgcolor: alpha(theme.palette.text.secondary, 0.1),
		borderRadius: 3,
		"&:hover": {
			bgcolor: alpha(theme.palette.text.secondary, 0.3),
		},
	},
});

export default function AdminCampaignKategoriPage() {
	const theme = useTheme();

	const [rows, setRows] = React.useState<Category[]>([]);
	const [loading, setLoading] = React.useState(true);

	// "medis" | "non-medis"
	const [activeTab, setActiveTab] = React.useState(0);

	const [q, setQ] = React.useState("");
	const [placeholder, setPlaceholder] = React.useState("Cari kategori...");

	React.useEffect(() => {
		const texts = ["Cari kategori...", "Ketikan nama...", "Filter list..."];
		let index = 0;
		const interval = setInterval(() => {
			index = (index + 1) % texts.length;
			setPlaceholder(texts[index]);
		}, 3000);
		return () => clearInterval(interval);
	}, []);
	const [selectedId, setSelectedId] = React.useState<string>("");

	// Helper to determine if a row is Medical
	const isMedical = (slug: string) =>
		slug === MEDICAL_SLUG || slug === "bantuan-medis-kesehatan";

	// Filter rows based on activeTab and search query
	const filteredRows = React.useMemo(() => {
		// First filter by Tab
		let tabFiltered = rows.filter((r) => {
			if (activeTab === 0) return !isMedical(r.slug); // Non-Medis
			return isMedical(r.slug); // Medis
		});

		// Then filter by search query
		if (q) {
			const s = q.toLowerCase();
			tabFiltered = tabFiltered.filter(
				(x) =>
					x.name.toLowerCase().includes(s) || x.slug.toLowerCase().includes(s),
			);
		}
		return tabFiltered;
	}, [rows, activeTab, q]);

	// Auto-select first item when tab changes or rows load
	React.useEffect(() => {
		if (filteredRows.length > 0) {
			// If current selectedId is not in the filtered list, select the first one
			if (!filteredRows.find((r) => r.id === selectedId)) {
				setSelectedId(filteredRows[0].id);
			}
		} else {
			setSelectedId("");
		}
	}, [filteredRows, selectedId]);

	const selected = React.useMemo(
		() => rows.find((r) => r.id === selectedId) ?? null,
		[rows, selectedId],
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

	const [iconManagerOpen, setIconManagerOpen] = React.useState(false);

	const [snackbar, setSnackbar] = React.useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({
		open: false,
		message: "",
		severity: "info",
	});

	const [confirmDialog, setConfirmDialog] = React.useState<{
		open: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({
		open: false,
		title: "",
		message: "",
		onConfirm: () => {},
	});

	const showSnackbar = (
		message: string,
		severity: "success" | "error" | "info" | "warning" = "info",
	) => {
		setSnackbar({ open: true, message, severity });
	};

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	const fetchCategories = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/campaigns/categories", {
				cache: "no-store",
			});
			if (!res.ok) {
				let msg = "Gagal memuat kategori";
				try {
					const err = await res.json();
					if (err?.error) msg = err.error;
				} catch {}
				showSnackbar(msg, "error");
				setRows([]);
				return;
			}

			const raw = await res.json();
			if (!Array.isArray(raw)) {
				console.error("Unexpected categories payload", raw);
				showSnackbar("Gagal memuat kategori", "error");
				setRows([]);
				return;
			}

			const mapped: Category[] = raw.map((c: any) => ({
				id: c.id,
				name: c.name,
				slug: c.slug || slugify(c.name),
				desc: "",
				active: c.isActive,
				icon: c.icon || c.name,
				updatedAt: new Date(c.updatedAt).toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				}),
			}));
			setRows(mapped);
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchCategories();
	}, []);

	const openMenu = (e: React.MouseEvent<HTMLElement>, row: Category) =>
		setMenu({ anchor: e.currentTarget, row });
	const closeMenu = () => setMenu({ anchor: null, row: undefined });

	const updateSelected = (patch: Partial<Category>) => {
		if (!selected) return;
		setRows((prev) =>
			prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r)),
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
					slug: selected.slug,
					icon: selected.icon,
					isActive: selected.active,
				}),
			});

			if (!res.ok) {
				let msg = "Gagal menyimpan kategori";
				try {
					const err = await res.json();
					if (err?.error) msg = err.error;
				} catch {}
				console.error("Save category failed", msg);
				setSaveTick(2);
				setTimeout(() => setSaveTick(0), 1400);
				showSnackbar(msg, "error");
				return;
			}

			const updated: any = await res.json();
			const mappedUpdated: Category = {
				id: updated.id,
				name: updated.name,
				slug: updated.slug || slugify(updated.name),
				desc: selected.desc,
				active: updated.isActive,
				icon: updated.icon || updated.name,
				updatedAt: new Date(updated.updatedAt).toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				}),
			};

			setRows((prev) =>
				prev.map((r) => (r.id === mappedUpdated.id ? mappedUpdated : r)),
			);
			setSaveTick(1);
			setTimeout(() => setSaveTick(0), 1200);
		} catch (error) {
			console.error(error);
			setSaveTick(2);
			setTimeout(() => setSaveTick(0), 1400);
			showSnackbar("Gagal menyimpan kategori", "error");
		}
	};

	const handleCreate = async (name: string) => {
		try {
			const slugUnderscore = name
				.toLowerCase()
				.trim()
				.replace(/[^\w\s-]/g, "")
				.replace(/[\s_-]+/g, "_");
			const res = await fetch("/api/campaigns/categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, slug: slugUnderscore, isActive: true }),
			});

			if (!res.ok) {
				let errMsg = "Gagal membuat kategori";
				try {
					const err = await res.json();
					if (err?.error) errMsg = err.error;
				} catch {}
				showSnackbar(errMsg, "error");
				return;
			}

			const created = await res.json();
			const newCategory: Category = {
				id: created.id,
				name: created.name,
				slug: created.slug || slugify(created.name),
				desc: "",
				active: created.isActive,
				icon: created.icon || created.name,
				updatedAt: new Date(created.updatedAt).toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				}),
			};

			setRows((prev) => [newCategory, ...prev]);
			setSelectedId(created.id);
			setDlg({ open: false, mode: "create", name: "" });
			showSnackbar("Kategori berhasil dibuat", "success");
		} catch (error) {
			console.error(error);
			showSnackbar("Gagal membuat kategori", "error");
		}
	};

	const handleDelete = (id: string) => {
		setConfirmDialog({
			open: true,
			title: "Hapus Kategori",
			message: "Yakin ingin menghapus kategori ini?",
			onConfirm: async () => {
				try {
					const res = await fetch(`/api/campaigns/categories?id=${id}`, {
						method: "DELETE",
					});

					const payload = await res.json().catch(() => null);

					if (!res.ok) {
						showSnackbar(payload?.error || "Gagal menghapus", "error");
						setConfirmDialog((prev) => ({ ...prev, open: false }));
						return;
					}

					setRows((prev) => prev.filter((x) => x.id !== id));
					if (selectedId === id) setSelectedId("");

					if (payload?.movedCampaigns > 0) {
						const toName = payload?.movedTo?.name || "kategori lain";
						showSnackbar(
							`Kategori berhasil dihapus. ${payload.movedCampaigns} campaign dipindahkan ke "${toName}".`,
							"success",
						);
					} else {
						showSnackbar("Kategori berhasil dihapus", "success");
					}
				} catch (error) {
					console.error(error);
					showSnackbar("Gagal menghapus kategori", "error");
				}
				setConfirmDialog((prev) => ({ ...prev, open: false }));
			},
		});
	};

	// --- Drag and Drop Logic ---
	const [draggedId, setDraggedId] = React.useState<string | null>(null);

	const handleDragStart = (e: React.DragEvent, id: string) => {
		setDraggedId(id);
		e.dataTransfer.effectAllowed = "move";
		// Optional: Set a custom drag image
		// const img = new Image();
		// img.src = ...;
		// e.dataTransfer.setDragImage(img, 0, 0);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent, targetId: string) => {
		e.preventDefault();
		if (!draggedId || draggedId === targetId) return;

		// Only allow reordering if not searching
		if (q) return;

		const oldIndex = rows.findIndex((r) => r.id === draggedId);
		const newIndex = rows.findIndex((r) => r.id === targetId);

		if (oldIndex === -1 || newIndex === -1) return;

		const newRows = [...rows];
		const [moved] = newRows.splice(oldIndex, 1);
		newRows.splice(newIndex, 0, moved);

		setRows(newRows);
		setDraggedId(null);
		showSnackbar("Urutan berhasil diperbarui", "success");
	};

	return (
		<Box sx={{ p: { xs: 1, md: 1.5 } }}>
			<Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
				<Box sx={{ flex: 1 }}>
					<Typography
						variant="h5"
						sx={{ fontWeight: 800, mb: 0.25, fontSize: "1.25rem" }}
					>
						Kategori Galang Dana
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ fontSize: 13 }}
					>
						Kelola kategori campaign dan opsi pilihannya dengan mudah
					</Typography>
				</Box>
				{activeTab === 0 && ( // Only show Create button for Non-Medis
					<Button
						variant="contained"
						startIcon={<AddRoundedIcon />}
						onClick={() => setDlg({ open: true, mode: "create", name: "" })}
						sx={{
							borderRadius: 2,
							textTransform: "none",
							fontWeight: 700,
							px: 1.5,
							py: 0.75,
							boxShadow: theme.shadows[4],
							fontSize: "0.8rem",
						}}
					>
						Buat Kategori
					</Button>
				)}
			</Box>

			{/* Tabs for Medis vs Non-Medis */}
			<Paper
				elevation={0}
				sx={{
					mb: 1.5,
					borderRadius: 2,
					p: 0.5,
					bgcolor: alpha(theme.palette.background.paper, 0.6),
					border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
					width: "fit-content",
				}}
			>
				<Tabs
					value={activeTab}
					onChange={(_, v) => setActiveTab(v)}
					sx={{
						"& .MuiTabs-indicator": {
							height: "100%",
							borderRadius: 1.5,
							bgcolor: alpha(theme.palette.primary.main, 0.1),
						},
						"& .MuiTab-root": {
							textTransform: "none",
							fontWeight: 700,
							fontSize: 11.5,
							minHeight: 36,
							px: 1.5,
							borderRadius: 1.5,
							zIndex: 1,
							transition: "all 0.2s",
							"&.Mui-selected": {
								color: "primary.main",
							},
						},
					}}
				>
					<Tab
						label="Non Medis"
						icon={<VolunteerActivismRoundedIcon sx={{ fontSize: 18 }} />}
						iconPosition="start"
					/>
					<Tab
						label="Medis"
						icon={<MedicalServicesRoundedIcon sx={{ fontSize: 18 }} />}
						iconPosition="start"
					/>
				</Tabs>
			</Paper>

			{/* Main Content Layout - Flexbox for stability */}
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					gap: 1.5,
					height: { xs: "auto", md: "calc(100vh - 180px)" }, // Adjust height to fit viewport on desktop
					alignItems: "flex-start",
				}}
			>
				{/* Sidebar List */}
				<Box
					sx={{
						width: { xs: "100%", md: 260, lg: 300 },
						flexShrink: 0,
						height: { xs: 450, md: "100%" }, // Fixed height on mobile to allow scrolling inside
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Paper
						elevation={0}
						sx={{
							...glassSx(theme),
							borderRadius: 2,
							display: "flex",
							flexDirection: "column",
							height: "100%",
							overflow: "hidden",
						}}
					>
						<Box
							sx={{
								p: 1,
								borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
							}}
						>
							<TextField
								fullWidth
								placeholder={placeholder}
								size="small"
								value={q}
								onChange={(e) => setQ(e.target.value)}
								sx={{
									...fieldPremiumSx(theme),
									"& .MuiInputBase-input": { fontSize: "0.8rem" },
									"& .MuiOutlinedInput-root": {
										...fieldPremiumSx(theme)["& .MuiOutlinedInput-root"],
										transition: "all 0.3s ease-in-out",
										"&.Mui-focused": {
											...fieldPremiumSx(theme)["& .MuiOutlinedInput-root"][
												"&.Mui-focused"
											],
											boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
											transform: "scale(1.01)",
										},
									},
								}}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchRoundedIcon
												sx={{
													color: "text.disabled",
													fontSize: 18,
													transition: "color 0.3s",
													".Mui-focused &": { color: "primary.main" },
												}}
											/>
										</InputAdornment>
									),
								}}
							/>
						</Box>

						<Box
							sx={{
								flex: 1,
								overflowY: "auto",
								p: 1,
								...scrollSx(theme),
							}}
						>
							{loading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<Paper
										key={i}
										elevation={0}
										sx={{
											p: 1,
											mb: 1,
											borderRadius: 3,
											border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
										}}
									>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<Skeleton
												variant="rounded"
												width={36}
												height={36}
												sx={{ borderRadius: 2.5 }}
											/>
											<Box sx={{ flex: 1 }}>
												<Skeleton
													variant="text"
													width="60%"
													height={16}
													sx={{ mb: 0.5 }}
												/>
												<Stack direction="row" spacing={1}>
													<Skeleton variant="rounded" width={36} height={16} />
													<Skeleton variant="rounded" width={36} height={16} />
												</Stack>
											</Box>
										</Stack>
									</Paper>
								))
							) : filteredRows.length === 0 ? (
								<Box sx={{ p: 2, textAlign: "center" }}>
									<ImageRoundedIcon
										sx={{ fontSize: 36, color: "text.disabled", mb: 1 }}
									/>
									<Typography
										variant="body2"
										color="text.secondary"
										fontSize={12}
									>
										Tidak ada kategori ditemukan
									</Typography>
								</Box>
							) : (
								<Box sx={{ display: "grid", gap: 1 }}>
									{filteredRows.map((row) => {
										const isSel = row.id === selectedId;
										const { icon, color } = getCategoryIcon(
											row.icon || row.slug,
										);
										const isMed = isMedical(row.slug);

										return (
											<Paper
												key={row.id}
												elevation={0}
												draggable={!q}
												onDragStart={(e) => handleDragStart(e, row.id)}
												onDragOver={handleDragOver}
												onDrop={(e) => handleDrop(e, row.id)}
												onClick={() => setSelectedId(row.id)}
												sx={{
													...(isSel
														? activeCardSx(theme)
														: premiumCardSx(theme)),
													opacity: draggedId === row.id ? 0.4 : 1,
													cursor: q ? "pointer" : "grab",
													"&:active": { cursor: q ? "pointer" : "grabbing" },
												}}
												style={{ position: "relative" }}
											>
												<Box sx={{ p: 1 }}>
													<Stack
														direction="row"
														spacing={1.5}
														alignItems="center"
													>
														<Box
															sx={{
																width: 36,
																height: 36,
																borderRadius: 2,
																display: "grid",
																placeItems: "center",
																bgcolor: alpha(color, 0.1),
																color: color,
															}}
														>
															{React.cloneElement(
																icon as React.ReactElement<any>,
																{
																	sx: { fontSize: 18 },
																},
															)}
														</Box>
														<Box sx={{ flex: 1, minWidth: 0 }}>
															<Typography
																sx={{
																	fontSize: 11.5,
																	fontWeight: isSel ? 700 : 600,
																	color: isSel
																		? "primary.main"
																		: "text.primary",
																	mb: 0.25,
																}}
																noWrap
															>
																{row.name}
															</Typography>
															<Stack
																direction="row"
																spacing={0.5}
																alignItems="center"
															>
																<Chip
																	label={row.active ? "Aktif" : "Nonaktif"}
																	size="small"
																	color={row.active ? "success" : "default"}
																	sx={{
																		height: 18,
																		fontSize: 9,
																		fontWeight: 700,
																	}}
																/>
																{isMed && (
																	<Chip
																		label="MEDIS"
																		size="small"
																		color="error"
																		sx={{
																			height: 18,
																			fontSize: 9,
																			fontWeight: 700,
																		}}
																	/>
																)}
															</Stack>
														</Box>
														{/* Drag Handle */}
														<Tooltip title="Seret untuk mengurutkan">
															<Box
																component="span"
																sx={{
																	display: "inline-flex",
																	cursor: "grab",
																	"&:active": { cursor: "grabbing" },
																}}
															>
																<DragIndicatorRoundedIcon
																	sx={{
																		color: "text.disabled",
																		fontSize: 18,
																		opacity: 0.5,
																		"&:hover": {
																			opacity: 1,
																			color: "text.primary",
																		},
																	}}
																/>
															</Box>
														</Tooltip>
													</Stack>
												</Box>
												{/* Action Menu Trigger */}
												{!isMed && (
													<Box
														sx={{
															position: "absolute",
															top: 6,
															right: 6,
														}}
													>
														<IconButton
															size="small"
															onClick={(e) => {
																e.stopPropagation();
																openMenu(e, row);
															}}
															sx={{
																opacity: 0.6,
																"&:hover": { opacity: 1 },
																padding: 0.5,
															}}
														>
															<MoreHorizRoundedIcon sx={{ fontSize: 16 }} />
														</IconButton>
													</Box>
												)}
											</Paper>
										);
									})}
								</Box>
							)}
						</Box>
					</Paper>
				</Box>

				{/* Detail & Edit Area */}
				<Box
					sx={{
						flex: 1,
						minWidth: 0, // Prevent flex item from overflowing
						height: "100%",
					}}
				>
					<Paper
						elevation={0}
						sx={{
							...glassSx(theme),
							borderRadius: 2,
							height: "100%",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						}}
					>
						{/* Editor Header */}
						<Box
							sx={{
								p: 2,
								borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
							}}
						>
							<Stack
								direction="row"
								spacing={1.5}
								alignItems="center"
								justifyContent="space-between"
							>
								<Box>
									<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
										{selected ? `Edit ${selected.name}` : "Editor Kategori"}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 0.25, fontSize: 12 }}
									>
										{selected
											? "Sesuaikan detail kategori dan opsinya"
											: "Pilih kategori untuk memulai"}
									</Typography>
								</Box>

								<Stack direction="row" spacing={1} alignItems="center">
									{saveTick === 1 ? (
										<Chip
											icon={<CheckCircleRoundedIcon fontSize="small" />}
											label="Tersimpan"
											sx={{
												borderRadius: 999,
												fontWeight: 700,
												bgcolor: alpha(theme.palette.success.main, 0.1),
												color: "success.main",
												height: 24,
												fontSize: 11,
											}}
										/>
									) : saveTick === 2 ? (
										<Chip
											icon={<WarningAmberRoundedIcon fontSize="small" />}
											label="Periksa input"
											sx={{
												borderRadius: 999,
												fontWeight: 700,
												bgcolor: alpha(theme.palette.warning.main, 0.1),
												color: "warning.main",
												height: 24,
												fontSize: 11,
											}}
										/>
									) : null}

									{selected && !isMedical(selected.slug) && (
										<Tooltip title="Hapus Kategori">
											<IconButton
												color="error"
												onClick={() => handleDelete(selected.id)}
												sx={{
													bgcolor: alpha(theme.palette.error.main, 0.1),
													"&:hover": {
														bgcolor: alpha(theme.palette.error.main, 0.2),
													},
													padding: 0.75,
												}}
											>
												<DeleteRoundedIcon sx={{ fontSize: 18 }} />
											</IconButton>
										</Tooltip>
									)}

									<Button
										onClick={handleSave}
										startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
										variant="contained"
										disabled={!selected}
										sx={{
											borderRadius: 2,
											fontWeight: 700,
											boxShadow: theme.shadows[2],
											px: 2,
											py: 0.75,
											textTransform: "none",
											fontSize: "0.8rem",
										}}
									>
										Simpan
									</Button>
								</Stack>
							</Stack>
						</Box>

						<Box
							sx={{
								flex: 1,
								overflowY: "auto",
								p: 1.5,
								...scrollSx(theme),
								bgcolor: alpha(theme.palette.background.default, 0.3),
							}}
						>
							{!selected ? (
								<Box
									sx={{
										height: "100%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexDirection: "column",
										opacity: 0.5,
									}}
								>
									<EditRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
									<Typography
										variant="subtitle1"
										fontWeight={700}
										fontSize={14}
									>
										Pilih Kategori
									</Typography>
									<Typography variant="body2" fontSize={12}>
										Klik salah satu kategori di kiri untuk mengedit
									</Typography>
								</Box>
							) : (
								<Box
									sx={{ display: "grid", gap: 1.5, maxWidth: 800, mx: "auto" }}
								>
									{/* Main Info Card */}
									<Paper
										elevation={0}
										sx={{
											...premiumCardSx(theme),
											p: 1.5,
											"&:hover": { transform: "none", boxShadow: "none" },
										}}
									>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="center"
											mb={1.5}
										>
											<Typography
												variant="subtitle1"
												fontWeight={800}
												fontSize={14}
											>
												Informasi Utama
											</Typography>
											<FormControlLabel
												control={
													<Switch
														size="small"
														checked={selected.active}
														disabled={isMedical(selected.slug)}
														onChange={(e) =>
															updateSelected({ active: e.target.checked })
														}
													/>
												}
												label={
													<Typography fontWeight={600} fontSize={11.5}>
														{selected.active
															? "Status Aktif"
															: "Status Nonaktif"}
													</Typography>
												}
											/>
										</Stack>

										<Box sx={{ display: "grid", gap: 2 }}>
											<Box>
												<Stack spacing={2}>
													<TextField
														label="Nama Kategori"
														value={selected.name}
														disabled={isMedical(selected.slug)}
														onChange={(e) => {
															const name = e.target.value;
															updateSelected({
																name,
																slug: slugify(name),
															});
														}}
														fullWidth
														sx={{
															...fieldPremiumSx(theme),
															transition: "all 0.3s ease",
															"& .MuiInputBase-input": {
																fontSize: "1rem",
																transition: "all 0.3s ease",
															},
															"& .MuiInputLabel-root": {
																fontSize: "1rem",
																transition: "all 0.3s ease",
															},
														}}
													/>
												</Stack>
											</Box>
											<Box>
												<Typography
													fontWeight={700}
													fontSize={14}
													color="text.secondary"
													mb={1}
												>
													Icon Kategori
												</Typography>
												<Box
													sx={{ display: "flex", alignItems: "center", gap: 2 }}
												>
													<Box
														sx={{
															width: 60,
															height: 60,
															display: "grid",
															placeItems: "center",
															borderRadius: 2,
															border: "1px solid",
															borderColor: "divider",
															bgcolor: "background.paper",
															overflow: "hidden",
														}}
													>
														{(() => {
															const { icon, color } = getCategoryIcon(
																selected.icon,
															);
															return React.cloneElement(
																icon as React.ReactElement<any>,
																{
																	sx: {
																		fontSize: 32,
																		color,
																		width: 32,
																		height: 32,
																		objectFit: "contain",
																	},
																},
															);
														})()}
													</Box>
													<Button
														variant="outlined"
														startIcon={<ImageRoundedIcon />}
														onClick={() => setIconManagerOpen(true)}
													>
														Ganti Icon
													</Button>
												</Box>
												<IconManager
													open={iconManagerOpen}
													onClose={() => setIconManagerOpen(false)}
													onSelect={(icon) => updateSelected({ icon })}
													currentIcon={selected.icon}
													onNotify={showSnackbar}
												/>
											</Box>
										</Box>
									</Paper>
								</Box>
							)}
						</Box>
					</Paper>
				</Box>
			</Box>

			{/* Row menu */}
			<Menu
				anchorEl={menu.anchor}
				open={!!menu.anchor}
				onClose={closeMenu}
				PaperProps={{
					elevation: 0,
					sx: {
						...premiumCardSx(theme),
						p: 0.5,
						minWidth: 140,
						"&:hover": { transform: "none", boxShadow: theme.shadows[10] },
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
					sx={{
						borderRadius: 1,
						mb: 0.25,
						fontWeight: 600,
						fontSize: "0.8rem",
					}}
				>
					<EditRoundedIcon
						fontSize="small"
						sx={{ mr: 1, opacity: 0.7, fontSize: 16 }}
					/>
					Rename
				</MenuItem>
				<MenuItem
					onClick={() => {
						const row = menu.row;
						closeMenu();
						if (!row) return;
						handleDelete(row.id);
					}}
					sx={{
						borderRadius: 1,
						color: "error.main",
						fontWeight: 600,
						fontSize: "0.8rem",
						"&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) },
					}}
				>
					<DeleteRoundedIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
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
						...premiumCardSx(theme),
						p: 1,
						"&:hover": { transform: "none" },
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 800, fontSize: "1rem" }}>
					{dlg.mode === "create" ? "Tambah Kategori" : "Rename Kategori"}
				</DialogTitle>
				<DialogContent sx={{ pt: 1 }}>
					<TextField
						autoFocus
						label="Nama Kategori"
						size="small"
						value={dlg.name}
						onChange={(e) => setDlg((d) => ({ ...d, name: e.target.value }))}
						fullWidth
						sx={{
							...fieldPremiumSx(theme),
							mt: 1,
							"& .MuiInputBase-input": { fontSize: "0.8rem" },
							"& .MuiInputLabel-root": { fontSize: "0.8rem" },
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ p: 1, pt: 0.5 }}>
					<Button
						onClick={() => setDlg((d) => ({ ...d, open: false }))}
						variant="text"
						sx={{ borderRadius: 999, fontWeight: 700, fontSize: "0.8rem" }}
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
								if (selectedId) {
									updateSelected({ name: dlg.name.trim() });
									setDlg({ open: false, mode: "create", name: "" });
								}
							}
						}}
						variant="contained"
						sx={{
							borderRadius: 999,
							fontWeight: 700,
							boxShadow: "none",
							fontSize: "0.8rem",
						}}
					>
						{dlg.mode === "create" ? "Buat" : "Simpan"}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={confirmDialog.open}
				onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
				PaperProps={{
					sx: { borderRadius: 3, p: 1, maxWidth: 360 },
				}}
			>
				<DialogTitle sx={{ fontWeight: 800, fontSize: "1rem" }}>
					{confirmDialog.title}
				</DialogTitle>
				<DialogContent>
					<DialogContentText
						sx={{ color: "text.secondary", fontSize: "0.85rem" }}
					>
						{confirmDialog.message}
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 1 }}>
					<Button
						onClick={() =>
							setConfirmDialog((prev) => ({ ...prev, open: false }))
						}
						sx={{
							color: "text.secondary",
							fontWeight: 700,
							fontSize: "0.8rem",
						}}
					>
						Batal
					</Button>
					<Button
						onClick={confirmDialog.onConfirm}
						variant="contained"
						color="error"
						sx={{
							fontWeight: 700,
							borderRadius: 2.5,
							boxShadow: "none",
							fontSize: "0.8rem",
						}}
					>
						Ya, Hapus
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				sx={{ zIndex: 99999 }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					variant="filled"
					sx={{ width: "100%", boxShadow: 3, fontWeight: 600, borderRadius: 3 }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
