"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PageContainer from "@/components/profile/PageContainer";
import { getMyProfile, updateMyProfile } from "@/actions/user";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import Slider from "@mui/material/Slider";

export default function AccountInfoPage() {
	const [user, setUser] = React.useState<{
		id: string;
		name: string | null;
		email: string;
		phone: string | null;
		memberStatus: string;
		joined: string;
		initial: string;
		image: string | null;
	} | null>(null);
	const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
	const [openEdit, setOpenEdit] = React.useState(false);
	const [editForm, setEditForm] = React.useState<{
		name: string;
		email: string;
		phone: string;
	}>({
		name: "",
		email: "",
		phone: "",
	});

	// Crop state
	const [crop, setCrop] = React.useState({ x: 0, y: 0 });
	const [zoom, setZoom] = React.useState(1);
	const [isCropping, setIsCropping] = React.useState(false);
	const [tempImage, setTempImage] = React.useState<string | null>(null);
	const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<any>(null);

	React.useEffect(() => {
		const load = async () => {
			const profile = await getMyProfile();
			if (!profile) return;
			const joined = new Date(profile.createdAt).toLocaleDateString("id-ID", {
				month: "short",
				year: "numeric",
			});
			const initial = (
				profile.name?.[0] ||
				profile.email?.[0] ||
				"A"
			).toUpperCase();
			const memberStatus = profile.verifiedAt
				? profile.verifiedAs === "organization"
					? "Organisasi Terverifikasi"
					: "Individu Terverifikasi"
				: "Belum Terverifikasi";
			setUser({
				id: profile.id,
				name: profile.name,
				email: profile.email,
				phone: profile.phone,
				memberStatus,
				joined,
				initial,
				image: profile.image,
			});
			setAvatarUrl(profile.image ?? null);
			setEditForm({
				name: profile.name || "",
				email: profile.email,
				phone: profile.phone || "",
			});
		};
		load();
	}, []);

	const handleOpenEdit = () => {
		if (!user) return;
		setEditForm({
			name: user.name || "",
			email: user.email,
			phone: user.phone || "",
		});
		setOpenEdit(true);
	};

	const handleSaveEdit = () => {
		updateMyProfile({
			name: editForm.name,
			email: editForm.email,
			phone: editForm.phone,
			image: avatarUrl,
		}).then(async (res) => {
			if (res?.success) {
				const profile = await getMyProfile();
				if (profile) {
					const joined = new Date(profile.createdAt).toLocaleDateString(
						"id-ID",
						{
							month: "short",
							year: "numeric",
						},
					);
					const initial = (
						profile.name?.[0] ||
						profile.email?.[0] ||
						"A"
					).toUpperCase();
					const memberStatus = profile.verifiedAt
						? profile.verifiedAs === "organization"
							? "Organisasi Terverifikasi"
							: "Individu Terverifikasi"
						: profile.verificationRequests?.[0]?.status === "PENDING"
							? "Menunggu Verifikasi"
							: "Belum Terverifikasi";
					setUser({
						id: profile.id,
						name: profile.name,
						email: profile.email,
						phone: profile.phone,
						memberStatus,
						joined,
						initial,
						image: profile.image,
					});
				}
				setOpenEdit(false);
			}
		});
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file size (max 4MB)
		if (file.size > 4 * 1024 * 1024) {
			alert("Ukuran file maksimal 4MB");
			return;
		}

		// Read file as data URL to preview and prepare for upload
		const reader = new FileReader();
		reader.onloadend = () => {
			setTempImage(reader.result as string);
			setIsCropping(true);
			setZoom(1);
			setCrop({ x: 0, y: 0 });
		};
		reader.readAsDataURL(file);
		// Reset input value so same file can be selected again
		e.target.value = "";
	};

	const onCropComplete = React.useCallback(
		(croppedArea: any, croppedAreaPixels: any) => {
			setCroppedAreaPixels(croppedAreaPixels);
		},
		[],
	);

	const handleSaveCroppedImage = async () => {
		try {
			if (!tempImage || !croppedAreaPixels) return;
			const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
			if (croppedImage) {
				// Auto-save the image to the server
				const res = await updateMyProfile({ image: croppedImage });
				if (res?.success) {
					setAvatarUrl(croppedImage);
					setUser((prev) => (prev ? { ...prev, image: croppedImage } : null));
					setIsCropping(false);
					setTempImage(null);
				} else {
					alert("Gagal menyimpan foto profil");
				}
			}
		} catch (e) {
			console.error("Error cropping/saving image:", e);
			alert("Terjadi kesalahan saat memproses gambar");
		}
	};

	return (
		<PageContainer>
			<ProfileHeader title="Informasi Akun" />

			<Paper
				elevation={0}
				variant="outlined"
				sx={{
					p: 2,
					mb: 3,
					borderRadius: 4,
					display: "flex",
					alignItems: "center",
					gap: 2,
					bgcolor: "#fff",
					borderColor: "rgba(0,0,0,0.08)",
				}}
			>
				<Box sx={{ position: "relative" }}>
					<Avatar
						src={avatarUrl ?? undefined}
						sx={{
							width: 64,
							height: 64,
							bgcolor: "#0ba976",
							fontSize: 24,
							fontWeight: 800,
						}}
					>
						{user?.initial || "A"}
					</Avatar>
					<input
						id="avatar-upload"
						type="file"
						accept="image/*"
						style={{ display: "none" }}
						onChange={handleAvatarChange}
					/>
					<Tooltip title="Ubah Foto">
						<IconButton
							component="label"
							htmlFor="avatar-upload"
							sx={{
								position: "absolute",
								right: -8,
								bottom: -8,
								bgcolor: "#fff",
								border: "1px solid rgba(0,0,0,0.1)",
								"&:hover": { bgcolor: "#f5f5f5" },
							}}
							size="small"
						>
							<PhotoCamera fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
				<Box sx={{ flex: 1 }}>
					<Typography sx={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
						{user?.name || "User"}
					</Typography>
					<Typography sx={{ fontSize: 13, color: "rgba(15,23,42,0.6)" }}>
						{user?.email}
					</Typography>
					<Box
						sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: "#0ba976",
							}}
						/>
						<Typography
							sx={{ fontSize: 11, fontWeight: 700, color: "#0ba976" }}
						>
							{user?.memberStatus || "Member"}
						</Typography>
					</Box>
				</Box>
				<Button variant="outlined" size="small" onClick={handleOpenEdit}>
					Ubah Profil
				</Button>
			</Paper>

			<Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
				<List disablePadding>
					<ListItem sx={{ px: 1.5 }}>
						<ListItemText
							primary="Nama Lengkap"
							secondary={user?.name || "-"}
							primaryTypographyProps={{
								fontSize: 12,
								color: "rgba(15,23,42,0.6)",
							}}
							secondaryTypographyProps={{
								fontSize: 14,
								fontWeight: 700,
								color: "#0f172a",
							}}
						/>
					</ListItem>
					<Divider />
					<ListItem sx={{ px: 1.5 }}>
						<ListItemText
							primary="Email"
							secondary={user?.email || "-"}
							primaryTypographyProps={{
								fontSize: 12,
								color: "rgba(15,23,42,0.6)",
							}}
							secondaryTypographyProps={{
								fontSize: 14,
								fontWeight: 700,
								color: "#0f172a",
							}}
						/>
					</ListItem>
					<Divider />
					<ListItem sx={{ px: 1.5 }}>
						<ListItemText
							primary="Nomor HP"
							secondary={user?.phone || "-"}
							primaryTypographyProps={{
								fontSize: 12,
								color: "rgba(15,23,42,0.6)",
							}}
							secondaryTypographyProps={{
								fontSize: 14,
								fontWeight: 700,
								color: "#0f172a",
							}}
						/>
					</ListItem>
					<Divider />
					<ListItem sx={{ px: 1.5 }}>
						<ListItemText
							primary="Status Member"
							secondary={user?.memberStatus || "Member"}
							primaryTypographyProps={{
								fontSize: 12,
								color: "rgba(15,23,42,0.6)",
							}}
							secondaryTypographyProps={{
								fontSize: 14,
								fontWeight: 700,
								color: "#0f172a",
							}}
						/>
					</ListItem>
					<Divider />
					<ListItem sx={{ px: 1.5 }}>
						<ListItemText
							primary="Bergabung Sejak"
							secondary={user?.joined || "-"}
							primaryTypographyProps={{
								fontSize: 12,
								color: "rgba(15,23,42,0.6)",
							}}
							secondaryTypographyProps={{
								fontSize: 14,
								fontWeight: 700,
								color: "#0f172a",
							}}
						/>
					</ListItem>
				</List>
			</Paper>
			<Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
				<DialogTitle>Edit Profil</DialogTitle>
				<DialogContent sx={{ pt: 1 }}>
					<TextField
						label="Nama Lengkap"
						value={editForm.name}
						onChange={(e) =>
							setEditForm((f) => ({ ...f, name: e.target.value }))
						}
						fullWidth
						margin="dense"
					/>
					<TextField
						label="Email"
						type="email"
						value={editForm.email}
						onChange={(e) =>
							setEditForm((f) => ({ ...f, email: e.target.value }))
						}
						fullWidth
						margin="dense"
					/>
					<TextField
						label="Nomor HP"
						value={editForm.phone}
						onChange={(e) =>
							setEditForm((f) => ({ ...f, phone: e.target.value }))
						}
						fullWidth
						margin="dense"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenEdit(false)}>Batal</Button>
					<Button variant="contained" onClick={handleSaveEdit}>
						Simpan
					</Button>
				</DialogActions>
			</Dialog>

			{/* Crop Dialog */}
			<Dialog
				open={isCropping}
				onClose={() => setIsCropping(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Sesuaikan Foto</DialogTitle>
				<DialogContent dividers>
					<Box
						sx={{
							position: "relative",
							width: "100%",
							height: 400,
							bgcolor: "#333",
							mb: 2,
						}}
					>
						{tempImage && (
							<Cropper
								image={tempImage}
								crop={crop}
								zoom={zoom}
								aspect={1}
								onCropChange={setCrop}
								onCropComplete={onCropComplete}
								onZoomChange={setZoom}
							/>
						)}
					</Box>
					<Box sx={{ px: 2 }}>
						<Typography
							gutterBottom
							variant="caption"
							sx={{ color: "text.secondary" }}
						>
							Zoom
						</Typography>
						<Slider
							value={zoom}
							min={1}
							max={3}
							step={0.1}
							onChange={(e, zoom) => setZoom(zoom as number)}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsCropping(false)}>Batal</Button>
					<Button variant="contained" onClick={handleSaveCroppedImage}>
						Simpan Foto
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
}
