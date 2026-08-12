"use client";

import React, { useState } from "react";
import {
	Box,
	Container,
	Typography,
	Stack,
	Button,
	Paper,
	TextField,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Chip,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { LinkIconButton } from "@/components/ui/LinkButton";
import { createCampaignUpdate } from "@/actions/campaign-admin";
import { useRouter } from "next/navigation";

function idr(n: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(n);
}

function formatIDR(numStr: string) {
	const n = numStr.replace(/\D/g, "");
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function KabarClient({
	campaign,
	updates,
}: {
	campaign: { id: string; slug: string; title: string };
	updates: any[];
}) {
	const router = useRouter();
	const [openUpdate, setOpenUpdate] = useState(false);
	const [submittingUpdate, setSubmittingUpdate] = useState(false);
	const [updateForm, setUpdateForm] = useState({ title: "", content: "", amount: "" });
	const [updateError, setUpdateError] = useState("");

	const handleUpdateSubmit = async () => {
		if (!updateForm.title || !updateForm.content) {
			setUpdateError("Judul dan isi kabar wajib diisi.");
			return;
		}

		setSubmittingUpdate(true);
		setUpdateError("");

		try {
			const res = await createCampaignUpdate({
				campaignId: campaign.id,
				title: updateForm.title,
				content: updateForm.content,
				amount: updateForm.amount ? Number(updateForm.amount.replace(/\./g, "")) : undefined,
			});

			if (res.success) {
				setOpenUpdate(false);
				setUpdateForm({ title: "", content: "", amount: "" });
				router.refresh();
			} else {
				setUpdateError(res.error || "Gagal memposting update.");
			}
		} catch {
			setUpdateError("Terjadi kesalahan sistem.");
		} finally {
			setSubmittingUpdate(false);
		}
	};

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			{/* Header */}
			<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
				<LinkIconButton href={`/galang-dana/${campaign.slug}`}>
					<ArrowBackRoundedIcon />
				</LinkIconButton>
				<Box sx={{ flex: 1 }}>
					<Typography variant="h5" fontWeight={700}>
						Kabar Terbaru
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{campaign.title}
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddRoundedIcon />}
					onClick={() => setOpenUpdate(true)}
					sx={{ fontWeight: 700, textTransform: "none", borderRadius: 2 }}
				>
					Tulis Kabar
				</Button>
			</Stack>

			{updates.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 5,
						textAlign: "center",
						borderRadius: 3,
						border: "1px solid",
						borderColor: "divider",
						bgcolor: "grey.50",
					}}
				>
					<Typography color="text.secondary" sx={{ mb: 1 }}>
						Belum ada kabar terbaru.
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Sampaikan perkembangan campaign ke donatur agar mereka tetap tahu perkembangannya.
					</Typography>
				</Paper>
			) : (
				<Stack spacing={2}>
					{updates.map((u) => (
						<Paper
							key={u.id}
							elevation={0}
							sx={{
								p: 2.5,
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
							}}
						>
							<Stack direction="row" alignItems="flex-start" spacing={2}>
								<Box
									sx={{
										mt: 0.3,
										width: 32,
										height: 32,
										borderRadius: "50%",
										bgcolor: "rgba(16,185,129,0.1)",
										display: "grid",
										placeItems: "center",
										flexShrink: 0,
									}}
								>
									<VerifiedUserIcon sx={{ color: "#059669", fontSize: 18 }} />
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography fontWeight={700} fontSize={15} sx={{ mb: 0.3 }}>
										{u.title}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{new Date(u.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "long",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
											timeZone: "Asia/Jakarta",
										})}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ whiteSpace: "pre-wrap", mt: 1 }}
									>
										{u.content}
									</Typography>
									{u.amount && (
										<Chip
											label={`Dana tersalurkan: ${idr(Number(u.amount))}`}
											size="small"
											color="success"
											variant="outlined"
											sx={{ mt: 1.5, fontWeight: 600 }}
										/>
									)}
								</Box>
							</Stack>
						</Paper>
					))}
				</Stack>
			)}

			{/* Dialog Tulis Kabar */}
			<Dialog
				open={openUpdate}
				onClose={() => setOpenUpdate(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle sx={{ fontWeight: 800 }}>Tulis Kabar Terbaru</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						{updateError && <Alert severity="error">{updateError}</Alert>}
						<TextField
							label="Judul Kabar"
							fullWidth
							placeholder="Contoh: Penyaluran Dana Tahap 1"
							value={updateForm.title}
							onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
						/>
						<TextField
							label="Isi Kabar"
							fullWidth
							multiline
							rows={6}
							placeholder="Ceritakan perkembangan terbaru atau penggunaan dana..."
							value={updateForm.content}
							onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
						/>
						<TextField
							label="Jumlah Dana Disalurkan (Opsional)"
							fullWidth
							value={updateForm.amount}
							onChange={(e) =>
								setUpdateForm({ ...updateForm, amount: formatIDR(e.target.value) })
							}
							InputProps={{
								startAdornment: (
									<Box sx={{ mr: 1, fontSize: 13, color: "text.secondary" }}>Rp</Box>
								),
							}}
							helperText="Isi jika update ini berkaitan dengan penyaluran dana tertentu."
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5 }}>
					<Button
						onClick={() => setOpenUpdate(false)}
						sx={{ textTransform: "none", fontWeight: 700 }}
					>
						Batal
					</Button>
					<Button
						variant="contained"
						onClick={handleUpdateSubmit}
						disabled={submittingUpdate}
						sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
					>
						{submittingUpdate ? "Memposting..." : "Posting Kabar"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
