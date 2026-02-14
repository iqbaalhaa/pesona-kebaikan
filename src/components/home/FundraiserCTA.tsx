"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const PRIMARY = "#0ba976";

type Campaign = {
	id: string;
	title: string;
	organizer: string;
	cover: string;
};

const campaigns: Campaign[] = [
	{
		id: "c1",
		title: "DARURAT! Bantu Korban Banjir Sumut, Aceh & Sumbar",
		organizer: "Rumah Zakat",
		cover: "/campaign/urgent-1.jpg",
	},
	{
		id: "c2",
		title: "Bantu Operasi Darurat untuk Pasien Tidak Mampu",
		organizer: "Yayasan Harapan",
		cover: "/campaign/urgent-2.jpg",
	},
	{
		id: "c3",
		title: "Beasiswa Anak Desa untuk Tetap Sekolah",
		organizer: "Relawan Pesona",
		cover: "/campaign/urgent-3.jpg",
	},
];

export default function FundraiserCTA() {
	const [open, setOpen] = React.useState(false);
	const [selectedId, setSelectedId] = React.useState<string>(
		campaigns[0]?.id ?? "",
	);
	const [generated, setGenerated] = React.useState<string>("");

	const [snackbar, setSnackbar] = React.useState<{
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

	const selected = React.useMemo(
		() => campaigns.find((c) => c.id === selectedId) ?? campaigns[0],
		[selectedId],
	);

	const fundraiserLink = React.useMemo(() => {
		const base = "https://pesonakebaikan.id";
		const ref = "rifk"; // nanti dari user profile / auth
		return `${base}/donasi/${selected?.id}?ref=${ref}`;
	}, [selected]);

	const onGenerate = () => {
		setGenerated(fundraiserLink);
	};

	const onCopy = async () => {
		if (!generated) return;
		try {
			await navigator.clipboard.writeText(generated);
			showSnackbar("Link berhasil disalin!", "success");
		} catch {
			showSnackbar("Gagal salin otomatis. Salin manual ya.", "error");
		}
	};

	return (
		<Box sx={{ px: 2, mt: 3, mb: 4 }}>
			{/* CTA Card */}
			<Paper
				elevation={0}
				sx={{
					p: 2.5,
					position: "relative",
					overflow: "hidden",
					background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
					border: "1px solid rgba(11,169,118,0.15)",
					boxShadow: "0 10px 30px -10px rgba(11,169,118,0.15)",
					transition: "all 0.3s ease",
					"&:hover": {
						boxShadow: "0 20px 40px -12px rgba(11,169,118,0.25)",
						transform: "translateY(-2px)",
						borderColor: "rgba(11,169,118,0.3)",
					},
				}}
			>
				{/* Decorative Background Elements */}
				<Box
					sx={{
						position: "absolute",
						top: -20,
						right: -20,
						width: 120,
						height: 120,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(11,169,118,0.1) 0%, rgba(11,169,118,0) 70%)",
						pointerEvents: "none",
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						bottom: -30,
						left: -10,
						width: 100,
						height: 100,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(11,169,118,0.08) 0%, rgba(11,169,118,0) 70%)",
						pointerEvents: "none",
					}}
				/>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						position: "relative",
						zIndex: 1,
					}}
				>
					{/* Icon Box */}
					<Box
						sx={{
							width: 52,
							height: 52,
							borderRadius: 3,
							display: "grid",
							placeItems: "center",
							background: "linear-gradient(135deg, #0ba976 0%, #067a54 100%)",
							boxShadow: "0 8px 16px rgba(11,169,118,0.25)",
							flexShrink: 0,
							color: "white",
						}}
					>
						<CampaignRoundedIcon sx={{ fontSize: 28 }} />
					</Box>

					{/* Text Content */}
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							variant="h6"
							sx={{
								fontSize: 16,
								fontWeight: 800,
								color: "#1e293b",
								lineHeight: 1.3,
								letterSpacing: "-0.01em",
								mb: 0.5,
							}}
						>
							Jadi Fundraiser
						</Typography>
						<Typography
							sx={{
								fontSize: 13,
								color: "#64748b",
								lineHeight: 1.4,
								display: "flex",
								alignItems: "center",
								gap: 0.5,
							}}
						>
							Bantu sebarkan kebaikan
							<ArrowForwardRoundedIcon sx={{ fontSize: 14, color: PRIMARY }} />
						</Typography>
					</Box>

					{/* Action Button */}
					<Box
						component="button"
						onClick={() => setOpen(true)}
						sx={{
							height: 40,
							px: 2.5,
							borderRadius: 10,
							border: "none",
							background: "rgba(11,169,118,0.1)",
							color: PRIMARY,
							fontSize: 13,
							fontWeight: 700,
							cursor: "pointer",
							transition: "all 0.2s ease",
							display: "flex",
							alignItems: "center",
							gap: 1,
							"&:hover": {
								background: PRIMARY,
								color: "white",
								transform: "scale(1.02)",
								boxShadow: "0 4px 12px rgba(11,169,118,0.2)",
							},
							"&:active": {
								transform: "scale(0.98)",
							},
						}}
					>
						Mulai
					</Box>
				</Box>

				{/* Footer Info */}
				<Box
					sx={{
						mt: 2,
						pt: 1.5,
						borderTop: "1px dashed rgba(11,169,118,0.2)",
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<VolunteerActivismRoundedIcon sx={{ fontSize: 16, color: PRIMARY }} />
					<Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
						Ajak orang berdonasi & jadilah jembatan kebaikan
					</Typography>
				</Box>
			</Paper>

			{/* Bottom Sheet Modal */}
			{open && (
				<Box
					sx={{
						position: "fixed",
						inset: 0,
						zIndex: 2000,
						display: "flex",
						alignItems: "flex-end",
						justifyContent: "center",
					}}
				>
					{/* Backdrop */}
					<Box
						onClick={() => setOpen(false)}
						sx={{
							position: "absolute",
							inset: 0,
							bgcolor: "rgba(15,23,42,0.6)",
							backdropFilter: "blur(4px)",
							animation: "fadeIn 0.2s ease-out",
							"@keyframes fadeIn": {
								from: { opacity: 0 },
								to: { opacity: 1 },
							},
						}}
					/>

					{/* Sheet Content */}
					<Paper
						elevation={24}
						sx={{
							position: "relative",
							width: "100%",
							maxWidth: 480,
							bgcolor: "white",
							borderTopLeftRadius: 24,
							borderTopRightRadius: 24,
							overflow: "hidden",
							animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
							"@keyframes slideUp": {
								from: { transform: "translateY(100%)" },
								to: { transform: "translateY(0)" },
							},
						}}
					>
						{/* Handle Bar */}
						<Box sx={{ pt: 1.5, pb: 1, display: "grid", placeItems: "center" }}>
							<Box
								sx={{
									width: 40,
									height: 4,
									borderRadius: 2,
									bgcolor: "rgba(15,23,42,0.1)",
								}}
							/>
						</Box>

						{/* Header */}
						<Box
							sx={{
								px: 3,
								pb: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Box>
								<Typography
									variant="h6"
									sx={{ fontWeight: 800, color: "#1e293b", fontSize: 18 }}
								>
									Mulai jadi Fundraiser
								</Typography>
								<Typography
									variant="body2"
									sx={{ color: "#64748b", mt: 0.5, fontSize: 13 }}
								>
									Pilih campaign untuk membuat link ajakan
								</Typography>
							</Box>
							<IconButton
								onClick={() => setOpen(false)}
								sx={{
									bgcolor: "rgba(15,23,42,0.05)",
									"&:hover": { bgcolor: "rgba(15,23,42,0.1)" },
								}}
							>
								<CloseRoundedIcon sx={{ fontSize: 20, color: "#64748b" }} />
							</IconButton>
						</Box>

						<Box sx={{ height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />

						<Box sx={{ px: 3, py: 3, maxHeight: "70vh", overflowY: "auto" }}>
							{/* Campaign Selection */}
							<Typography
								sx={{
									fontSize: 12,
									fontWeight: 700,
									textTransform: "uppercase",
									letterSpacing: "0.05em",
									color: "#94a3b8",
									mb: 1.5,
								}}
							>
								Pilih Campaign
							</Typography>

							<Box sx={{ display: "grid", gap: 1.5 }}>
								{campaigns.map((c) => {
									const active = c.id === selectedId;
									return (
										<Paper
											key={c.id}
											component="button"
											onClick={() => {
												setSelectedId(c.id);
												setGenerated("");
											}}
											elevation={0}
											sx={{
												width: "100%",
												textAlign: "left",
												p: 2,
												borderRadius: 3,
												cursor: "pointer",
												border: "1px solid",
												borderColor: active ? PRIMARY : "rgba(15,23,42,0.1)",
												bgcolor: active ? "rgba(11,169,118,0.04)" : "white",
												transition: "all 0.2s ease",
												"&:hover": {
													borderColor: active ? PRIMARY : "rgba(15,23,42,0.2)",
													transform: "translateY(-1px)",
												},
											}}
										>
											<Typography
												sx={{
													fontSize: 14,
													fontWeight: 700,
													color: active ? PRIMARY : "#1e293b",
													mb: 0.5,
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
												}}
											>
												{c.title}
											</Typography>
											<Typography
												sx={{
													fontSize: 12,
													color: "#64748b",
													display: "flex",
													alignItems: "center",
													gap: 0.5,
												}}
											>
												oleh{" "}
												<Box component="span" sx={{ fontWeight: 600 }}>
													{c.organizer}
												</Box>
											</Typography>
										</Paper>
									);
								})}
							</Box>

							{/* Generated Link Section */}
							<Box sx={{ mt: 4 }}>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 700,
										textTransform: "uppercase",
										letterSpacing: "0.05em",
										color: "#94a3b8",
										mb: 1.5,
									}}
								>
									Link Fundraiser Kamu
								</Typography>

								<Paper
									elevation={0}
									sx={{
										p: 1.5,
										borderRadius: 3,
										bgcolor: "#f8fafc",
										border: "1px solid rgba(15,23,42,0.08)",
										display: "flex",
										alignItems: "center",
										gap: 1.5,
									}}
								>
									<Box
										sx={{
											width: 36,
											height: 36,
											borderRadius: 2,
											bgcolor: "white",
											display: "grid",
											placeItems: "center",
											border: "1px solid rgba(15,23,42,0.06)",
											color: "#64748b",
										}}
									>
										<LinkRoundedIcon sx={{ fontSize: 20 }} />
									</Box>
									<Typography
										sx={{
											flex: 1,
											fontSize: 13,
											fontFamily: "monospace",
											color: generated ? "#1e293b" : "#94a3b8",
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{generated || "Link akan muncul di sini..."}
									</Typography>
								</Paper>
							</Box>
						</Box>

						{/* Footer Actions */}
						<Box
							sx={{
								p: 3,
								pt: 2,
								borderTop: "1px solid rgba(15,23,42,0.06)",
								display: "flex",
								flexDirection: "column",
								gap: 1.5,
							}}
						>
							<Button
								fullWidth
								variant="contained"
								onClick={onGenerate}
								startIcon={<LinkRoundedIcon />}
								sx={{
									bgcolor: PRIMARY,
									color: "white",
									py: 1.5,
									borderRadius: 3,
									fontSize: 14,
									fontWeight: 700,
									textTransform: "none",
									boxShadow: "0 8px 16px rgba(11,169,118,0.2)",
									"&:hover": {
										bgcolor: "#099265",
										boxShadow: "0 12px 20px rgba(11,169,118,0.3)",
									},
								}}
							>
								Buat Link Fundraiser
							</Button>

							<Button
								fullWidth
								variant="outlined"
								onClick={onCopy}
								disabled={!generated}
								startIcon={<ContentCopyRoundedIcon />}
								sx={{
									py: 1.5,
									borderRadius: 3,
									fontSize: 14,
									fontWeight: 700,
									textTransform: "none",
									borderColor: "rgba(15,23,42,0.15)",
									color: "#1e293b",
									"&:hover": {
										borderColor: "#1e293b",
										bgcolor: "rgba(15,23,42,0.02)",
									},
									"&.Mui-disabled": {
										borderColor: "rgba(15,23,42,0.1)",
										color: "rgba(15,23,42,0.3)",
									},
								}}
							>
								Salin Link
							</Button>
						</Box>
					</Paper>
				</Box>
			)}
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
