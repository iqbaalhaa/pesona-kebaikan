"use server";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { getPageContent } from "@/actions/cms";
import type { ReactElement } from "react";

export default async function FundraiseGuidePage() {
	const content = await getPageContent("fundraiser_guide");

	const title = content?.title || "Panduan Menjadi Fundraiser";
	const html =
		content?.content ||
		`
    <h2>Apa itu Fundraiser?</h2>
    <p>Fundraiser adalah orang baik yang membantu menggalang dana untuk campaign orang lain. Kamu bisa menebar kebaikan tanpa perlu modal, cukup dengan membagikan link campaign.</p>
    <h2>Cara Menjadi Fundraiser</h2>
    <p>Pilih campaign yang ingin kamu bantu, klik tombol "Jadi Fundraiser", dan dapatkan link khusus untuk disebarkan.</p>
    <h2>Keuntungan Menjadi Fundraiser</h2>
    <p>Setiap donasi yang masuk melalui link kamu akan tercatat, dan kamu bisa melihat dampak kebaikan yang telah kamu sebarkan.</p>
  `;

	const tips: {
		icon: ReactElement;
		title: string;
		desc: string;
		color: string;
	}[] = [
		{
			icon: <LightbulbOutlinedIcon />,
			title: "Pilih campaign yang menyentuh hati",
			desc: "Pilih cerita yang menurutmu paling layak dibantu agar lebih semangat menyebarkannya.",
			color: "#10b981",
		},
		{
			icon: <CampaignOutlinedIcon />,
			title: "Bagikan ke circle terdekat",
			desc: "Mulai dari keluarga dan teman dekat, mereka lebih mudah percaya rekomendasi kamu.",
			color: "#0ea5e9",
		},
		{
			icon: <FavoriteBorderOutlinedIcon />,
			title: "Gunakan kata-kata personal",
			desc: "Tambahkan alasan kenapa kamu mendukung campaign ini saat membagikan link.",
			color: "#f59e0b",
		},
		{
			icon: <SecurityOutlinedIcon />,
			title: "Pantau donasi masuk",
			desc: "Cek secara berkala dashboard fundraiser kamu untuk melihat perkembangan donasi.",
			color: "#8b5cf6",
		},
	];

	const steps = [
		"Buka halaman detail campaign yang ingin dibantu",
		"Klik tombol 'Jadi Fundraiser'",
		"Isi form singkat jika diperlukan",
		"Salin link fundraiser kamu",
		"Bagikan link ke media sosial dan grup chat",
	];

	return (
		<Box sx={{ bgcolor: "background.default" }}>
			<Container maxWidth="md" sx={{ px: 2, pt: 3, pb: 8 }}>
				<Paper
					elevation={0}
					sx={{
						p: 3,
						borderRadius: 3,
						border: "1px solid",
						borderColor: "divider",
						bgcolor: "background.paper",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Chip
							label="Panduan"
							size="small"
							sx={{ borderRadius: 1, fontWeight: 700 }}
							color="success"
							variant="outlined"
						/>
					</Box>
					<Typography
						sx={{ fontWeight: 900, fontSize: 22, mt: 1, color: "text.primary" }}
					>
						{title}
					</Typography>
					<Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
						Cara mudah menebar kebaikan dengan menjadi jembatan donasi
					</Typography>

					<Box sx={{ mt: 4 }}>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800, fontSize: 18, mb: 2 }}
						>
							Langkah-langkah
						</Typography>
						<Stack spacing={2}>
							{steps.map((step, index) => (
								<Box
									key={index}
									sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
								>
									<Box
										sx={{
											width: 28,
											height: 28,
											borderRadius: "50%",
											bgcolor: "primary.main",
											color: "white",
											display: "grid",
											placeItems: "center",
											fontWeight: 700,
											fontSize: 14,
											flexShrink: 0,
										}}
									>
										{index + 1}
									</Box>
									<Typography sx={{ fontSize: 15, pt: 0.25 }}>
										{step}
									</Typography>
								</Box>
							))}
						</Stack>
					</Box>

					<Box sx={{ mt: 5 }}>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800, fontSize: 18, mb: 2 }}
						>
							Tips Sukses Fundraiser
						</Typography>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
								gap: 2,
							}}
						>
							{tips.map((tip, index) => (
								<Paper
									key={index}
									elevation={0}
									sx={{
										p: 2,
										borderRadius: 2,
										bgcolor: `${tip.color}08`, // 5% opacity
										border: "1px solid",
										borderColor: `${tip.color}20`,
									}}
								>
									<Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
										<Box sx={{ color: tip.color }}>{tip.icon}</Box>
										<Typography
											sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}
										>
											{tip.title}
										</Typography>
									</Box>
									<Typography
										sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}
									>
										{tip.desc}
									</Typography>
								</Paper>
							))}
						</Box>
					</Box>

					<Box sx={{ mt: 5 }}>
						<div
							className="prose prose-sm max-w-none"
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</Box>
				</Paper>
			</Container>
		</Box>
	);
}
