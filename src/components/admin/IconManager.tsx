"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import * as React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Tabs,
	Tab,
	Box,
	Button,
	Typography,
	IconButton,
	CircularProgress,
	Tooltip,
	useTheme,
	alpha,
	TextField,
	Slider,
	Stack,
	InputAdornment,
	FormControlLabel,
	Switch,
} from "@mui/material";
import {
	Close as CloseIcon,
	CloudUpload as UploadIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	AspectRatio as AspectRatioIcon,
	Image as ImageIcon,
	Search as SearchIcon,
	Palette as PaletteIcon,
	Check as CheckIcon,
} from "@mui/icons-material";
import { CATEGORY_ICON_MAP } from "@/lib/categoryIcons";
import { Chip } from "@mui/material";

import { SYSTEM_ICONS } from "@/lib/systemIcons";

interface IconManagerProps {
	open: boolean;
	onClose: () => void;
	onSelect: (icon: string) => void;
	currentIcon?: string;
	onNotify: (
		message: string,
		severity: "success" | "error" | "info" | "warning",
	) => void;
}

interface CustomIcon {
	id: string;
	name: string;
	url: string;
}

export default function IconManager({
	open,
	onClose,
	onSelect,
	currentIcon,
	onNotify,
}: IconManagerProps) {
	const theme = useTheme();
	const [tab, setTab] = useState(0);
	const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);

	// Preview & Upload State
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewFile, setPreviewFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [uploadName, setUploadName] = useState("");
	const [resizeWidth, setResizeWidth] = useState(128);
	const [fitSquare, setFitSquare] = useState(true);
	const [originalAspectRatio, setOriginalAspectRatio] = useState(1);

	// Edit State
	const [editOpen, setEditOpen] = useState(false);
	const [editIcon, setEditIcon] = useState<CustomIcon | null>(null);
	const [editName, setEditName] = useState("");

	useEffect(() => {
		if (open && tab === 1) {
			fetchCustomIcons();
		}
	}, [open, tab]);

	const fetchCustomIcons = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/admin/icons");
			const data = await res.json();
			if (data.success) {
				setCustomIcons(data.icons);
			}
		} catch (error) {
			console.error("Failed to fetch icons", error);
		} finally {
			setLoading(false);
		}
	};

	const [systemSearch, setSystemSearch] = useState("");
	const [activeCategory, setActiveCategory] = useState<string>("All");

	// Color Selection State
	const [selectedColor, setSelectedColor] = useState<string>("");
	const [pendingIcon, setPendingIcon] = useState<string | null>(null);

	const COLORS = [
		{ name: "Default", value: "" },
		{ name: "Blue", value: "#3b82f6" },
		{ name: "Red", value: "#ef4444" },
		{ name: "Green", value: "#10b981" },
		{ name: "Amber", value: "#f59e0b" },
		{ name: "Purple", value: "#8b5cf6" },
		{ name: "Pink", value: "#ec4899" },
		{ name: "Indigo", value: "#6366f1" },
		{ name: "Rose", value: "#f43f5e" },
		{ name: "Orange", value: "#ea580c" },
		{ name: "Slate", value: "#64748b" },
		{ name: "Teal", value: "#14b8a6" },
		{ name: "Cyan", value: "#06b6d4" },
	];

	// Parse current icon and color on open
	useEffect(() => {
		if (open && currentIcon) {
			const [icon, color] = currentIcon.includes("|")
				? currentIcon.split("|")
				: [currentIcon, ""];
			setPendingIcon(icon);
			setSelectedColor(color);
		} else if (open) {
			setPendingIcon(null);
			setSelectedColor("");
		}
	}, [open, currentIcon]);

	// Deduplicate System Icons & Filter
	const systemIcons = useMemo(() => {
		// Start with our new extensive library
		const allIcons = [...SYSTEM_ICONS];

		// Add legacy icons from CATEGORY_ICON_MAP if not already present
		const existingNames = new Set(allIcons.map((i) => i.name.toLowerCase()));

		Object.entries(CATEGORY_ICON_MAP).forEach(([key, { icon, color }]) => {
			const t: any = (icon as any)?.type;
			const name =
				(t?.muiName as string | undefined) ||
				(t?.displayName as string | undefined) ||
				(t?.name as string | undefined) ||
				key;

			// Only add if it doesn't seem to be in our new system library
			// This is a rough check, but good enough to preserve custom mapped icons
			if (!existingNames.has(name.toLowerCase())) {
				allIcons.push({
					name: name,
					category: "Legacy",
					icon: icon,
					tags: [key, name],
				});
			}
		});

		// Filter
		return allIcons.filter((item) => {
			if (activeCategory !== "All" && item.category !== activeCategory)
				return false;
			if (!systemSearch) return true;

			const q = systemSearch.toLowerCase();
			return (
				item.name.toLowerCase().includes(q) ||
				item.tags.some((tag) => tag.toLowerCase().includes(q))
			);
		});
	}, [systemSearch, activeCategory]);

	const categories = useMemo(() => {
		const cats = new Set(SYSTEM_ICONS.map((i) => i.category));
		return ["All", ...Array.from(cats).sort(), "Legacy"];
	}, []);

	// Handle File Selection
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return;
		const file = e.target.files[0];

		if (file.size > 3 * 1024 * 1024) {
			onNotify("File too large (max 3MB)", "error");
			return;
		}

		const url = URL.createObjectURL(file);
		setPreviewFile(file);
		setPreviewUrl(url);
		setUploadName(file.name.split(".")[0]);

		// Load image to get dimensions
		const img = new Image();
		img.onload = () => {
			setOriginalAspectRatio(img.width / img.height);
			setResizeWidth(Math.min(img.width, 128)); // Default to 128 or original if smaller
		};
		img.src = url;

		setPreviewOpen(true);
		// Reset file input
		e.target.value = "";
	};

	const processImage = async (
		file: File,
		targetWidth: number,
	): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				let drawX = 0;
				let drawY = 0;
				let drawWidth = targetWidth;
				let drawHeight = targetWidth;

				if (fitSquare) {
					canvas.width = targetWidth;
					canvas.height = targetWidth;
					if (originalAspectRatio > 1) {
						drawHeight = targetWidth / originalAspectRatio;
						drawY = (targetWidth - drawHeight) / 2;
					} else {
						drawWidth = targetWidth * originalAspectRatio;
						drawX = (targetWidth - drawWidth) / 2;
					}
				} else {
					canvas.width = targetWidth;
					canvas.height = targetWidth / originalAspectRatio;
					drawHeight = canvas.height;
				}

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("Canvas context not available"));
					return;
				}
				ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
				canvas.toBlob(
					(blob) => {
						if (blob) resolve(blob);
						else reject(new Error("Conversion failed"));
					},
					"image/png",
					1.0,
				);
			};
			img.onerror = reject;
			img.src = URL.createObjectURL(file);
		});
	};

	const handleConfirmUpload = async () => {
		if (!previewFile) return;

		setUploading(true);
		try {
			// Process image
			const processedBlob = await processImage(previewFile, resizeWidth);
			const formData = new FormData();
			formData.append(
				"file",
				processedBlob,
				`${uploadName.replace(/\s+/g, "-")}.png`,
			);
			formData.append("name", uploadName);

			const res = await fetch("/api/admin/icons", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();

			if (data.success) {
				onNotify("Icon uploaded successfully", "success");
				fetchCustomIcons();
				setPreviewOpen(false);
				setPreviewFile(null);
				setPreviewUrl("");
			} else {
				onNotify(data.message || "Upload failed", "error");
			}
		} catch (error) {
			console.error(error);
			onNotify("Upload failed", "error");
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!confirm("Are you sure you want to delete this icon?")) return;

		try {
			const res = await fetch(`/api/admin/icons/${id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.success) {
				onNotify("Icon deleted", "success");
				setCustomIcons((prev) => prev.filter((icon) => icon.id !== id));
			} else {
				onNotify(data.message || "Delete failed", "error");
			}
		} catch (error) {
			onNotify("Delete failed", "error");
		}
	};

	const openEdit = (icon: CustomIcon, e: React.MouseEvent) => {
		e.stopPropagation();
		setEditIcon(icon);
		setEditName(icon.name);
		setEditOpen(true);
	};

	const handleSaveEdit = async () => {
		if (!editIcon) return;
		try {
			const res = await fetch(`/api/admin/icons/${editIcon.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: editName }),
			});
			const data = await res.json();
			if (data.success) {
				onNotify("Icon updated", "success");
				setCustomIcons((prev) =>
					prev.map((i) =>
						i.id === editIcon.id ? { ...i, name: editName } : i,
					),
				);
				setEditOpen(false);
			} else {
				onNotify(data.message || "Update failed", "error");
			}
		} catch (error) {
			onNotify("Update failed", "error");
		}
	};

	const handleSelect = (iconName: string) => {
		setPendingIcon(iconName);
	};

	const handleConfirm = () => {
		if (pendingIcon) {
			const finalValue = selectedColor
				? `${pendingIcon}|${selectedColor}`
				: pendingIcon;
			onSelect(finalValue);
			onClose();
		}
	};

	return (
		<>
			<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						borderBottom: 1,
						borderColor: "divider",
					}}
				>
					<Stack direction="row" spacing={2} alignItems="center">
						<Typography variant="h6">Icon Manager</Typography>
						{pendingIcon && (
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography variant="body2" color="text.secondary">
									Selected:
								</Typography>
								<Chip
									label={pendingIcon}
									size="small"
									color="primary"
									onDelete={() => setPendingIcon(null)}
								/>
							</Stack>
						)}
					</Stack>
					<Stack direction="row" spacing={1}>
						{pendingIcon && (
							<Button
								variant="contained"
								startIcon={<CheckIcon />}
								onClick={handleConfirm}
								size="small"
							>
								Confirm
							</Button>
						)}
						<IconButton onClick={onClose} size="small">
							<CloseIcon />
						</IconButton>
					</Stack>
				</DialogTitle>
				<DialogContent dividers sx={{ p: 0, minHeight: 400 }}>
					<Tabs
						value={tab}
						onChange={(_, v) => setTab(v)}
						variant="fullWidth"
						sx={{ borderBottom: 1, borderColor: "divider" }}
					>
						<Tab label="System Icons" />
						<Tab label="Custom Icons" />
					</Tabs>

					<Box sx={{ p: 3 }}>
						{tab === 0 && (
							<Stack spacing={3}>
								{/* Search & Filter */}
								<Stack direction="row" spacing={2} alignItems="center">
									<TextField
										placeholder="Search icons..."
										size="small"
										fullWidth
										value={systemSearch}
										onChange={(e) => setSystemSearch(e.target.value)}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<SearchIcon />
												</InputAdornment>
											),
										}}
									/>
									<TextField
										select
										size="small"
										value={activeCategory}
										onChange={(e) => setActiveCategory(e.target.value)}
										SelectProps={{ native: true }}
										sx={{ minWidth: 150 }}
									>
										{categories.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</TextField>
									<TextField
										select
										size="small"
										value={selectedColor}
										onChange={(e) => setSelectedColor(e.target.value)}
										SelectProps={{ native: true }}
										sx={{ minWidth: 150 }}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PaletteIcon
														sx={{ color: selectedColor || "action.active" }}
													/>
												</InputAdornment>
											),
										}}
									>
										{COLORS.map((col) => (
											<option key={col.name} value={col.value}>
												{col.name}
											</option>
										))}
									</TextField>
								</Stack>

								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
										gap: 2,
										maxHeight: "60vh",
										overflowY: "auto",
										pr: 1,
									}}
								>
									{systemIcons.map((item) => (
										<Tooltip
											title={`${item.name} (${item.category})`}
											key={item.name}
										>
											<Box
												onClick={() => {
													handleSelect(item.name.toLowerCase());
												}}
												sx={{
													aspectRatio: "1/1",
													display: "grid",
													placeItems: "center",
													borderRadius: 2,
													cursor: "pointer",
													border: "2px solid",
													borderColor:
														pendingIcon === item.name.toLowerCase()
															? "primary.main"
															: "divider",
													bgcolor:
														pendingIcon === item.name.toLowerCase()
															? "primary.light"
															: "background.paper",
													color:
														pendingIcon === item.name.toLowerCase() &&
														selectedColor
															? selectedColor
															: "text.primary",
													transition: "all 0.2s",
													"&:hover": {
														bgcolor: "action.hover",
														transform: "scale(1.05)",
														borderColor: "primary.main",
													},
												}}
											>
												{React.isValidElement(item.icon)
													? React.cloneElement(
															item.icon as React.ReactElement<any>,
															{
																sx: { fontSize: 32 },
															},
														)
													: null}
											</Box>
										</Tooltip>
									))}
								</Box>
							</Stack>
						)}

						{tab === 1 && (
							<Box>
								<Box
									sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}
								>
									<Button
										component="label"
										variant="contained"
										startIcon={<UploadIcon />}
									>
										Upload Icon
										<input
											type="file"
											hidden
											accept="image/*"
											onChange={handleFileSelect}
										/>
									</Button>
								</Box>

								{loading ? (
									<Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
										<CircularProgress />
									</Box>
								) : customIcons.length === 0 ? (
									<Typography align="center" color="text.secondary" py={5}>
										No custom icons uploaded yet.
									</Typography>
								) : (
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns:
												"repeat(auto-fill, minmax(100px, 1fr))",
											gap: 2,
										}}
									>
										{customIcons.map((icon) => (
											<Box
												key={icon.id}
												onClick={() => {
													onSelect(icon.url);
													onClose();
												}}
												sx={{
													position: "relative",
													aspectRatio: "1/1",
													display: "flex",
													flexDirection: "column",
													alignItems: "center",
													justifyContent: "center",
													borderRadius: 2,
													cursor: "pointer",
													border: "2px solid",
													borderColor:
														currentIcon === icon.url
															? "primary.main"
															: "divider",
													bgcolor:
														currentIcon === icon.url
															? alpha(theme.palette.primary.main, 0.05)
															: "background.paper",
													transition: "all 0.2s",
													p: 1,
													"&:hover": {
														borderColor: "primary.main",
														"& .actions": { opacity: 1 },
													},
												}}
											>
												<Box
													component="img"
													src={icon.url}
													alt={icon.name}
													sx={{
														width: 48,
														height: 48,
														objectFit: "contain",
														mb: 1,
													}}
												/>
												<Typography
													variant="caption"
													noWrap
													sx={{
														maxWidth: "100%",
														textAlign: "center",
														width: "100%",
													}}
												>
													{icon.name}
												</Typography>

												<Box
													className="actions"
													sx={{
														position: "absolute",
														top: 2,
														right: 2,
														display: "flex",
														gap: 0.5,
														opacity: 0,
														transition: "opacity 0.2s",
													}}
												>
													<IconButton
														size="small"
														onClick={(e) => openEdit(icon, e)}
														sx={{
															bgcolor: "primary.main",
															color: "white",
															p: 0.5,
															"&:hover": { bgcolor: "primary.dark" },
														}}
													>
														<EditIcon sx={{ fontSize: 14 }} />
													</IconButton>
													<IconButton
														size="small"
														onClick={(e) => handleDelete(icon.id, e)}
														sx={{
															bgcolor: "error.main",
															color: "white",
															p: 0.5,
															"&:hover": { bgcolor: "error.dark" },
														}}
													>
														<DeleteIcon sx={{ fontSize: 14 }} />
													</IconButton>
												</Box>
											</Box>
										))}
									</Box>
								)}
							</Box>
						)}
					</Box>
				</DialogContent>
			</Dialog>

			{/* Preview & Upload Dialog */}
			<Dialog
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Upload Icon</DialogTitle>
				<DialogContent dividers>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 3,
						}}
					>
						{previewUrl && (
							<Box
								sx={{
									width: 128,
									height: 128,
									border: "1px dashed",
									borderColor: "divider",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									p: 1,
								}}
							>
								<Box
									component="img"
									src={previewUrl}
									alt="Preview"
									sx={{
										maxWidth: "100%",
										maxHeight: "100%",
										objectFit: "contain",
									}}
								/>
							</Box>
						)}

						<TextField
							label="Icon Name"
							fullWidth
							value={uploadName}
							onChange={(e) => setUploadName(e.target.value)}
							size="small"
						/>

						<Box sx={{ width: "100%" }}>
							<Typography gutterBottom variant="body2">
								Resize Width (px) - Original aspect ratio preserved
							</Typography>
							<Stack
								direction="row"
								spacing={2}
								alignItems="center"
								sx={{ mb: 1 }}
							>
								<ImageIcon fontSize="small" color="action" />
								<Slider
									value={resizeWidth}
									onChange={(_, v) => setResizeWidth(v as number)}
									min={32}
									max={512}
									valueLabelDisplay="auto"
									sx={{ flex: 1 }}
								/>
								<TextField
									value={resizeWidth}
									onChange={(e) => setResizeWidth(Number(e.target.value) || 32)}
									size="small"
									type="number"
									sx={{ width: 80 }}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">px</InputAdornment>
										),
									}}
								/>
							</Stack>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
					<Button
						onClick={handleConfirmUpload}
						variant="contained"
						disabled={uploading || !uploadName}
					>
						{uploading ? "Uploading..." : "Upload & Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog
				open={editOpen}
				onClose={() => setEditOpen(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle>Edit Icon</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="Icon Name"
						fullWidth
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditOpen(false)}>Cancel</Button>
					<Button onClick={handleSaveEdit} variant="contained">
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
