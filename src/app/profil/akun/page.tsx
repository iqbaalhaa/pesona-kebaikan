"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function AccountInfoPage() {
	const router = useRouter();
	const [user, setUser] = React.useState({
		name: "Ahmad Fulan",
		email: "ahmad@example.com",
		phone: "+62 812-3456-7890",
		memberStatus: "Member Basic",
		joined: "Jan 2024",
		initial: "A",
	});
	const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
	const [openEdit, setOpenEdit] = React.useState(false);
	const [editForm, setEditForm] = React.useState({
		name: user.name,
		email: user.email,
		phone: user.phone,
	});

	const handleOpenEdit = () => {
		setEditForm({ name: user.name, email: user.email, phone: user.phone });
		setOpenEdit(true);
	};

	const handleSaveEdit = () => {
		setUser((u) => ({ ...u, ...editForm }));
		setOpenEdit(false);
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		setAvatarUrl(url);
	};

	return (
		<Box sx={{ px: 2, pt: 2.5, pb: 6 }}>
			<Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
				<IconButton
					onClick={() => router.back()}
					edge="start"
					sx={{ color: "#0f172a" }}
				>
					<ArrowBackIcon />
				</IconButton>
				<Typography sx={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
					Informasi Akun
				</Typography>
			</Box>

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
							bgcolor: "#61ce70",
							fontSize: 24,
							fontWeight: 800,
						}}
					>
						{user.initial}
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
						{user.name}
					</Typography>
					<Typography sx={{ fontSize: 13, color: "rgba(15,23,42,0.6)" }}>
						{user.email}
					</Typography>
					<Box
						sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: "#61ce70",
							}}
						/>
						<Typography
							sx={{ fontSize: 11, fontWeight: 700, color: "#61ce70" }}
						>
							{user.memberStatus}
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
							secondary={user.name}
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
							secondary={user.email}
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
							secondary={user.phone}
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
							secondary={user.memberStatus}
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
							secondary={user.joined}
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
		</Box>
	);
}
