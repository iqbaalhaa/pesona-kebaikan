"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import CardMedia from "@mui/material/CardMedia";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import ArticleIcon from "@mui/icons-material/Article";

import { getPageContent, updatePageContent } from "@/actions/cms";
import { uploadImage } from "@/actions/upload";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface OrgMember {
	name: string;
	position: string;
	image: string;
}

interface Socials {
	facebook: string;
	instagram: string;
	twitter: string;
	linkedin: string;
	youtube: string;
}

interface Legality {
	title: string;
	url: string;
}

interface AboutData {
	banner: string;
	vision: string;
	mission: string;
	goals: string;
	achievements: string;
	socials: Socials;
	organization: OrgMember[];
	legality: Legality[];
}

function CustomTabPanel(props: {
	children?: React.ReactNode;
	index: number;
	value: number;
}) {
	const { children, value, index, ...other } = props;
	return (
		<div role="tabpanel" hidden={value !== index} {...other}>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

const ImageUpload = ({
	label,
	value,
	onChange,
	onError,
	height = 200,
	id,
}: {
	label: string;
	value: string;
	onChange: (url: string) => void;
	onError?: (msg: string) => void;
	height?: number;
	id?: string;
}) => {
	const [uploading, setUploading] = useState(false);
	const inputId = id || `upload-${label}`;

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.[0]) return;
		setUploading(true);
		const formData = new FormData();
		formData.append("file", e.target.files[0]);
		try {
			const res = await uploadImage(formData);
			if (res.success && res.url) {
				onChange(res.url);
			} else {
				if (onError) onError("Upload failed");
			}
		} catch (err) {
			console.error(err);
			if (onError) onError("Upload failed");
		} finally {
			setUploading(false);
		}
	};

	return (
		<Box sx={{ mb: 2 }}>
			<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
				{label}
			</Typography>
			<Paper
				variant="outlined"
				sx={{
					height: height,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					bgcolor: "#f8fafc",
					borderStyle: "dashed",
					position: "relative",
					overflow: "hidden",
					cursor: "pointer",
					"&:hover": { bgcolor: "#f1f5f9" },
				}}
				onClick={() => document.getElementById(inputId)?.click()}
			>
				{value ? (
					<img
						src={value}
						alt="Preview"
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				) : (
					<>
						{uploading ? (
							<CircularProgress size={24} />
						) : (
							<CloudUploadIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
						)}
						<Typography variant="caption" color="text.secondary">
							Klik untuk upload gambar
						</Typography>
					</>
				)}
				<input
					type="file"
					id={inputId}
					hidden
					accept="image/*"
					onChange={handleUpload}
				/>
			</Paper>
			{value && (
				<Button
					size="small"
					color="error"
					onClick={(e) => {
						e.stopPropagation();
						onChange("");
					}}
					sx={{ mt: 1 }}
				>
					Hapus Gambar
				</Button>
			)}
		</Box>
	);
};

export default function AdminTentangPage() {
	const [tab, setTab] = useState(0);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({
		open: false,
		message: "",
		severity: "info",
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

	// Core content
	const [title, setTitle] = useState("Tentang Kami");
	const [content, setContent] = useState(""); // Main story

	// Structured Data
	const [data, setData] = useState<AboutData>({
		banner: "",
		vision: "",
		mission: "",
		goals: "",
		achievements: "",
		socials: {
			facebook: "",
			instagram: "",
			twitter: "",
			linkedin: "",
			youtube: "",
		},
		organization: [],
		legality: [],
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const page = await getPageContent("about");
			if (page) {
				setTitle(page.title || "Tentang Kami");
				setContent(page.content || "");
				if (page.data) {
					const loadedData = page.data as any;
					setData((prev) => ({
						...prev,
						...loadedData,
						socials: { ...prev.socials, ...(loadedData.socials || {}) },
						organization: loadedData.organization || [],
						legality: loadedData.legality || [],
					}));
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await updatePageContent("about", {
				title,
				content,
				data,
			});
			showSnackbar("Berhasil disimpan", "success");
		} catch (error) {
			showSnackbar("Gagal menyimpan", "error");
		} finally {
			setSaving(false);
		}
	};

	const handleSocialChange = (key: keyof Socials, value: string) => {
		setData((prev) => ({
			...prev,
			socials: { ...prev.socials, [key]: value },
		}));
	};

	// Organization Handlers
	const handleOrgAdd = () => {
		setData((prev) => ({
			...prev,
			organization: [
				...prev.organization,
				{ name: "", position: "", image: "" },
			],
		}));
	};

	const handleOrgRemove = (index: number) => {
		setData((prev) => ({
			...prev,
			organization: prev.organization.filter((_, i) => i !== index),
		}));
	};

	const handleOrgChange = (
		index: number,
		field: keyof OrgMember,
		value: string,
	) => {
		const newOrg = [...data.organization];
		newOrg[index] = { ...newOrg[index], [field]: value };
		setData((prev) => ({ ...prev, organization: newOrg }));
	};

	// Legality Handlers
	const handleLegalityAdd = () => {
		setData((prev) => ({
			...prev,
			legality: [...prev.legality, { title: "", url: "" }],
		}));
	};

	const handleLegalityRemove = (index: number) => {
		setData((prev) => ({
			...prev,
			legality: prev.legality.filter((_, i) => i !== index),
		}));
	};

	const handleLegalityChange = (
		index: number,
		field: keyof Legality,
		value: string,
	) => {
		const newLegality = [...data.legality];
		newLegality[index] = { ...newLegality[index], [field]: value };
		setData((prev) => ({ ...prev, legality: newLegality }));
	};

	const handleLegalityUpload = async (
		index: number,
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		if (!e.target.files?.[0]) return;
		const formData = new FormData();
		formData.append("file", e.target.files[0]);
		try {
			const res = await uploadImage(formData);
			if (res.success && res.url) {
				handleLegalityChange(index, "url", res.url);
			} else {
				showSnackbar("Upload failed", "error");
			}
		} catch (err) {
			console.error(err);
			showSnackbar("Upload failed", "error");
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "50vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			{/* Header */}
			<Box
				sx={{
					mb: 4,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: 3,
							bgcolor: "#e0f2fe",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#0284c7",
						}}
					>
						<InfoOutlinedIcon />
					</Box>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
							Tentang Platform
						</Typography>
						<Typography variant="body2" sx={{ color: "#64748b" }}>
							Kelola konten halaman Tentang Kami
						</Typography>
					</Box>
				</Box>
				<Button
					variant="contained"
					startIcon={<SaveIcon />}
					onClick={handleSave}
					disabled={saving || loading}
					sx={{
						bgcolor: "#0ba976",
						fontWeight: 700,
						textTransform: "none",
						borderRadius: 2,
						"&:hover": { bgcolor: "#16a34a" },
					}}
				>
					{saving ? "Menyimpan..." : "Simpan Perubahan"}
				</Button>
			</Box>

			<Paper
				elevation={0}
				sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
			>
				<Tabs
					value={tab}
					onChange={(_, v) => setTab(v)}
					sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
				>
					<Tab label="Umum & Cerita" />
					<Tab label="Visi & Misi" />
					<Tab label="Sosial Media" />
					<Tab label="Organisasi" />
					<Tab label="Legalitas" />
				</Tabs>

				{/* Tab 0: Umum & Cerita */}
				<CustomTabPanel value={tab} index={0}>
					<Stack spacing={4}>
						<Box>
							<ImageUpload
								label="Banner Halaman"
								value={data.banner}
								onChange={(url) =>
									setData((prev) => ({ ...prev, banner: url }))
								}
								onError={(msg) => showSnackbar(msg, "error")}
								height={250}
							/>
							<Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
								Banner akan ditampilkan di bagian atas halaman publik. Pastikan
								rasio gambar landscape (misal 16:9 atau 21:9) untuk hasil
								terbaik.
							</Alert>
						</Box>

						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								maxWidth: 600,
								mx: "auto",
								width: "100%",
							}}
						>
							<Typography
								variant="subtitle2"
								sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
							>
								Judul Halaman
							</Typography>
							<TextField
								fullWidth
								variant="outlined"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Contoh: Tentang Kami"
								sx={{
									bgcolor: "background.paper",
									"& .MuiOutlinedInput-root": {
										fontSize: "1.25rem",
										fontWeight: 600,
										textAlign: "center",
									},
									"& .MuiOutlinedInput-input": {
										textAlign: "center",
									},
								}}
							/>
						</Box>

						<Box sx={{ px: { xs: 1, md: 4 } }}>
							<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
								Cerita Kami (About Us)
							</Typography>
							<RichTextEditor
								value={content}
								onChange={setContent}
								placeholder="Tulis cerita tentang platform ini..."
								minHeight={400}
							/>
						</Box>
					</Stack>
				</CustomTabPanel>

				{/* Tab 1: Visi & Misi */}
				<CustomTabPanel value={tab} index={1}>
					<Stack spacing={4}>
						<Box>
							<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
								Visi
							</Typography>
							<RichTextEditor
								value={data.vision}
								onChange={(val) =>
									setData((prev) => ({ ...prev, vision: val }))
								}
								minHeight={200}
							/>
						</Box>
						<Box>
							<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
								Misi
							</Typography>
							<RichTextEditor
								value={data.mission}
								onChange={(val) =>
									setData((prev) => ({ ...prev, mission: val }))
								}
								minHeight={200}
							/>
						</Box>
						<Box>
							<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
								Tujuan
							</Typography>
							<RichTextEditor
								value={data.goals}
								onChange={(val) => setData((prev) => ({ ...prev, goals: val }))}
								minHeight={200}
							/>
						</Box>
						<Box>
							<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
								Capaian & Prestasi
							</Typography>
							<RichTextEditor
								value={data.achievements}
								onChange={(val) =>
									setData((prev) => ({ ...prev, achievements: val }))
								}
								minHeight={200}
							/>
						</Box>
					</Stack>
				</CustomTabPanel>

				{/* Tab 2: Sosial Media */}
				<CustomTabPanel value={tab} index={2}>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Facebook URL"
								value={data.socials.facebook}
								onChange={(e) => handleSocialChange("facebook", e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<FacebookIcon />
										</InputAdornment>
									),
								}}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Instagram URL"
								value={data.socials.instagram}
								onChange={(e) =>
									handleSocialChange("instagram", e.target.value)
								}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<InstagramIcon />
										</InputAdornment>
									),
								}}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="Twitter / X URL"
								value={data.socials.twitter}
								onChange={(e) => handleSocialChange("twitter", e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<TwitterIcon />
										</InputAdornment>
									),
								}}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="LinkedIn URL"
								value={data.socials.linkedin}
								onChange={(e) => handleSocialChange("linkedin", e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LinkedInIcon />
										</InputAdornment>
									),
								}}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								fullWidth
								label="YouTube URL"
								value={data.socials.youtube}
								onChange={(e) => handleSocialChange("youtube", e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<YouTubeIcon />
										</InputAdornment>
									),
								}}
							/>
						</Grid>
					</Grid>
				</CustomTabPanel>

				{/* Tab 3: Organisasi */}
				<CustomTabPanel value={tab} index={3}>
					<Button
						startIcon={<AddIcon />}
						variant="outlined"
						onClick={handleOrgAdd}
						sx={{ mb: 3 }}
					>
						Tambah Anggota Tim
					</Button>
					<Grid container spacing={3}>
						{data.organization.map((member, index) => (
							<Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
								<Card variant="outlined" sx={{ borderRadius: 2 }}>
									<CardContent>
										<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
											<IconButton
												size="small"
												color="error"
												onClick={() => handleOrgRemove(index)}
											>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Box>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												mb: 2,
											}}
										>
											<ImageUpload
												label="Foto Profil"
												id={`org-image-${index}`}
												value={member.image}
												onChange={(url) => handleOrgChange(index, "image", url)}
												onError={(msg) => showSnackbar(msg, "error")}
												height={120}
											/>
										</Box>
										<Stack spacing={2}>
											<TextField
												size="small"
												fullWidth
												label="Nama Lengkap"
												value={member.name}
												onChange={(e) =>
													handleOrgChange(index, "name", e.target.value)
												}
											/>
											<TextField
												size="small"
												fullWidth
												label="Jabatan"
												value={member.position}
												onChange={(e) =>
													handleOrgChange(index, "position", e.target.value)
												}
											/>
										</Stack>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				</CustomTabPanel>

				{/* Tab 4: Legalitas */}
				<CustomTabPanel value={tab} index={4}>
					<Button
						startIcon={<AddIcon />}
						variant="outlined"
						onClick={handleLegalityAdd}
						sx={{ mb: 3 }}
					>
						Tambah Dokumen Legalitas
					</Button>
					<Stack spacing={2}>
						{data.legality.map((doc, index) => (
							<Paper
								key={index}
								variant="outlined"
								sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
							>
								<Box sx={{ p: 1, bgcolor: "#f1f5f9", borderRadius: 1 }}>
									<ArticleIcon color="action" />
								</Box>
								<Box sx={{ flexGrow: 1 }}>
									<Grid container spacing={2} alignItems="center">
										<Grid size={{ xs: 12, md: 5 }}>
											<TextField
												size="small"
												fullWidth
												label="Nama Dokumen"
												placeholder="Contoh: SK Kemenkumham"
												value={doc.title}
												onChange={(e) =>
													handleLegalityChange(index, "title", e.target.value)
												}
											/>
										</Grid>
										<Grid size={{ xs: 12, md: 5 }}>
											<Box sx={{ display: "flex", gap: 1 }}>
												<TextField
													size="small"
													fullWidth
													label="URL File"
													value={doc.url}
													onChange={(e) =>
														handleLegalityChange(index, "url", e.target.value)
													}
												/>
												<Button
													component="label"
													variant="outlined"
													size="small"
													sx={{ minWidth: 40, px: 0 }}
												>
													<CloudUploadIcon />
													<input
														type="file"
														hidden
														onChange={(e) => handleLegalityUpload(index, e)}
													/>
												</Button>
											</Box>
										</Grid>
									</Grid>
								</Box>
								<IconButton
									color="error"
									onClick={() => handleLegalityRemove(index)}
								>
									<DeleteIcon />
								</IconButton>
							</Paper>
						))}
					</Stack>
				</CustomTabPanel>
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
