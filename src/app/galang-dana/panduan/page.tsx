"use server";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getPageContent } from "@/actions/cms";
import BackButton from "./BackButton";

export default async function FundraiseGuidePage() {
	const content = await getPageContent("fundraise_guide");

	const title = content?.title || "Panduan Galang Dana";
	const html =
		content?.content ||
		`
    <h2>Mulai Dengan Cerita Yang Kuat</h2>
    <p>Ceritakan siapa yang dibantu, kenapa butuh bantuan, dan bagaimana dampaknya. Gunakan bahasa yang jujur dan menyentuh.</p>
    <h2>Tambahkan Bukti Yang Relevan</h2>
    <p>Sertakan foto, dokumen pendukung, dan update berkala untuk menjaga kepercayaan donatur.</p>
    <h2>Bagikan Ke Komunitas</h2>
    <p>Bagikan campaign ke WhatsApp, media sosial, dan komunitas untuk menjangkau lebih banyak orang baik.</p>
  `;

	const tips = [
		{
			title: "Tulis judul yang spesifik",
			desc: "Judul yang jelas memudahkan orang memahami tujuan galang dana.",
		},
		{
			title: "Gunakan visual yang kuat",
			desc: "Foto/Video yang relevan meningkatkan kepercayaan dan empati.",
		},
		{
			title: "Update secara berkala",
			desc: "Cerita perkembangan membuat donatur merasa terlibat.",
		},
		{
			title: "Transparansi penggunaan dana",
			desc: "Jelaskan rencana penggunaan dana dan bukti penyaluran.",
		},
	];

	const steps = [
		"Tentukan tujuan dan target dana yang realistis",
		"Siapkan cerita dan bukti pendukung",
		"Pilih kategori yang sesuai",
		"Bagikan campaign secara konsisten",
		"Berikan update dan ucapan terima kasih",
	];

	return (
		<Box sx={{ bgcolor: "background.default" }}>
			<Paper
				elevation={0}
				square
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 1100,
					borderBottom: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ height: 56, px: 2 }}
				>
					<BackButton />
					<Typography sx={{ fontSize: 16, fontWeight: 700 }}>
						{title}
					</Typography>
				</Stack>
			</Paper>
			<Container maxWidth="md" sx={{ px: 2, pt: 3, pb: 8 }}>
				<Typography
					sx={{ fontWeight: 900, fontSize: 24, color: "text.primary" }}
				>
					{title}
				</Typography>
				<Typography sx={{ fontSize: 14, color: "text.secondary", mt: 0.5, mb: 4 }}>
					Tips agar campaign kamu lebih sukses, informatif, dan dipercaya
				</Typography>

				{/* Langkah-langkah */}
				<Typography sx={{ fontWeight: 800, fontSize: 18, mb: 2, color: "text.primary" }}>
					Langkah-langkah
				</Typography>
				{steps.map((s, i) => (
					<Box
						key={i}
						sx={{
							display: "flex",
							gap: 1.5,
							alignItems: "flex-start",
							mb: 2,
						}}
					>
						<Box
							sx={{
								width: 28,
								height: 28,
								borderRadius: "50%",
								bgcolor: "#0ba976",
								color: "#fff",
								display: "grid",
								placeItems: "center",
								fontSize: 13,
								fontWeight: 800,
								flexShrink: 0,
								mt: 0.2,
							}}
						>
							{i + 1}
						</Box>
						<Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.7 }}>
							{s}
						</Typography>
					</Box>
				))}

				{/* Tips */}
				<Typography sx={{ fontWeight: 800, fontSize: 18, mt: 4, mb: 2, color: "text.primary" }}>
					Tips Sukses
				</Typography>
				{tips.map((t, i) => (
					<Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 2 }}>
						<CheckCircleIcon sx={{ fontSize: 20, color: "#0ba976", mt: 0.2, flexShrink: 0 }} />
						<Box>
							<Typography sx={{ fontWeight: 700, fontSize: 14, color: "text.primary" }}>
								{t.title}
							</Typography>
							<Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.3 }}>
								{t.desc}
							</Typography>
						</Box>
					</Box>
				))}

				{/* CMS Content */}
				<Box
					sx={{
						mt: 4,
						"& img": {
							maxWidth: "100%",
							height: "auto",
							borderRadius: 2,
							my: 1.5,
						},
						"& p": {
							fontSize: 15,
							lineHeight: 1.8,
							color: "text.secondary",
							mb: 2,
						},
						"& h1, & h2, & h3": {
							color: "text.primary",
							fontWeight: 800,
							mt: 3,
							mb: 1,
						},
						"& ul, & ol": { pl: 3, mb: 2 },
						"& li": { mb: 0.5, fontSize: 14, color: "text.secondary" },
						"& a": { color: "primary.main", textDecoration: "underline" },
					}}
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</Container>
		</Box>
	);
}
