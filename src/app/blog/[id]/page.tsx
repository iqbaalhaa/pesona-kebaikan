import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TwitterIcon from "@mui/icons-material/Twitter";

type Post = {
	id: string;
	title: string;
	date: string;
	tag: string;
	cover: string;
	images: string[];
	video?: string;
	content: string[];
};

const posts: Post[] = [
	{
		id: "1",
		title: "Kenapa Donasi Kecil Tetap Berdampak Besar",
		date: "17 Des 2025",
		tag: "Inspiration",
		cover: "/defaultimg.webp",
		images: ["/defaultimg.webp", "/defaultimg.webp", "/defaultimg.webp"],
		video: "https://www.w3schools.com/html/mov_bbb.mp4",
		content: [
			"Donasi kecil yang dilakukan secara konsisten memiliki kekuatan untuk menciptakan perubahan besar. Saat banyak orang bergerak bersama, dampak kumulatifnya bisa luar biasa.",
			"Komunitas yang solid bukan hanya tentang nominal, tapi juga tentang semangat saling dukung dan kolaborasi.",
		],
	},
	{
		id: "2",
		title: "Transparansi Penggalangan Dana di Pesona Kebaikan",
		date: "10 Des 2025",
		tag: "Update",
		cover: "/defaultimg.webp",
		images: ["/defaultimg.webp", "/defaultimg.webp"],
		content: [
			"Kami mengedepankan transparansi melalui pelaporan berkala dan jejak transaksi yang dapat ditelusuri.",
			"Kepercayaan adalah fondasi dari setiap donasi yang Anda berikan.",
		],
	},
	{
		id: "3",
		title: "Tips Menggalang Dana Efektif untuk Komunitas",
		date: "02 Des 2025",
		tag: "Guide",
		cover: "/defaultimg.webp",
		images: ["/defaultimg.webp"],
		content: [
			"Tulis cerita yang relevan, gunakan visual yang kuat, dan ajak audiens untuk bertindak dengan jelas.",
			"Konsistensi komunikasi serta update perkembangan akan meningkatkan peluang keberhasilan.",
		],
	},
];

export default async function BlogDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const post = posts.find((p) => p.id === resolvedParams.id);

	if (!post) {
		return (
			<Box sx={{ px: 2, py: 4 }}>
				<Typography sx={{ fontWeight: 900, fontSize: 18 }}>
					Tidak ditemukan
				</Typography>
				<Button
					component="a"
					href="/blog"
					startIcon={<ArrowBackIosNewIcon fontSize="small" />}
					sx={{ mt: 2 }}
				>
					Kembali
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ px: 2, pt: 2.5, pb: 4, maxWidth: 1040, mx: "auto" }}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: 2,
				}}
			>
				<Button
					component="a"
					href="/blog"
					startIcon={<ArrowBackIosNewIcon fontSize="small" />}
					sx={{ textTransform: "none", fontWeight: 800 }}
				>
					Kembali
				</Button>
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
				<Stack direction="row" spacing={1} alignItems="center">
					<Chip label={post.tag} size="small" sx={{ borderRadius: 1 }} />
					<Typography
						sx={{ fontSize: 12, fontWeight: 800, color: "rgba(15,23,42,.55)" }}
					>
						{post.date}
					</Typography>
				</Stack>
				<Typography
					sx={{
						fontSize: { xs: 22, md: 32 },
						fontWeight: 900,
						color: "#0f172a",
						lineHeight: 1.2,
					}}
				>
					{post.title}
				</Typography>
			</Box>

			<Card
				variant="outlined"
				sx={{
					mt: 2,
					borderRadius: 2,
					overflow: "hidden",
					borderColor: "rgba(0,0,0,0.08)",
				}}
			>
				<CardMedia
					component="img"
					image={post.cover}
					alt={post.title}
					sx={{ height: { xs: 220, md: 420 }, objectFit: "cover" }}
				/>
			</Card>

			<Box
				sx={{
					mt: 2.5,
					display: "grid",
					gap: 2,
					gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
				}}
			>
				<Box>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{post.content.map((p, i) => (
							<Typography
								key={i}
								sx={{
									fontSize: 15.5,
									color: "rgba(15,23,42,.80)",
									lineHeight: 1.75,
								}}
							>
								{p}
							</Typography>
						))}
					</Box>

					{post.video && (
						<Card
							variant="outlined"
							sx={{
								mt: 3,
								borderRadius: 2,
								overflow: "hidden",
								borderColor: "rgba(0,0,0,0.08)",
							}}
						>
							<CardMedia
								component="video"
								src={post.video}
								controls
								sx={{
									width: "100%",
									height: { xs: 220, md: 360 },
									backgroundColor: "black",
								}}
							/>
						</Card>
					)}
				</Box>

				<Box>
					<Typography
						sx={{ fontWeight: 900, fontSize: 14.5, color: "#0f172a", mb: 1 }}
					>
						Galeri
					</Typography>
					<Box
						sx={{
							display: "grid",
							gap: 1.5,
							gridTemplateColumns: "repeat(2, 1fr)",
						}}
					>
						{post.images.map((src, i) => {
							// Jika jumlah ganjil, gambar pertama jadi full width biar keren
							const isFullWidth = post.images.length % 2 !== 0 && i === 0;
							return (
								<Card
									key={i}
									variant="outlined"
									sx={{
										gridColumn: isFullWidth ? "span 2" : "span 1",
										borderRadius: 2,
										overflow: "hidden",
										borderColor: "rgba(0,0,0,0.08)",
									}}
								>
									<CardMedia
										component="img"
										image={src}
										alt={`image-${i + 1}`}
										sx={{
											height: isFullWidth ? 200 : 120,
											width: "100%",
											objectFit: "cover",
										}}
									/>
								</Card>
							);
						})}
					</Box>
					<Divider sx={{ my: 2 }} />
					<Typography sx={{ fontSize: 13, color: "rgba(15,23,42,.60)" }}>
						Bagikan
					</Typography>
					<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
						<IconButton
							size="small"
							href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
								post.title
							)}`}
							component="a"
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								border: "1px solid rgba(0,0,0,0.12)",
								borderRadius: 2,
								color: "rgba(15,23,42,.7)",
							}}
						>
							<TwitterIcon fontSize="small" />
						</IconButton>
						<IconButton
							size="small"
							href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
								"https://example.com/blog/" + post.id
							)}`}
							component="a"
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								border: "1px solid rgba(0,0,0,0.12)",
								borderRadius: 2,
								color: "rgba(15,23,42,.7)",
							}}
						>
							<FacebookIcon fontSize="small" />
						</IconButton>
						<IconButton
							size="small"
							href="https://www.instagram.com/"
							component="a"
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								border: "1px solid rgba(0,0,0,0.12)",
								borderRadius: 2,
								color: "rgba(15,23,42,.7)",
							}}
						>
							<InstagramIcon fontSize="small" />
						</IconButton>
						<IconButton
							size="small"
							href={`https://wa.me/?text=${encodeURIComponent(
								post.title + " https://example.com/blog/" + post.id
							)}`}
							component="a"
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								border: "1px solid rgba(0,0,0,0.12)",
								borderRadius: 2,
								color: "rgba(15,23,42,.7)",
							}}
						>
							<WhatsAppIcon fontSize="small" />
						</IconButton>
					</Stack>
				</Box>
			</Box>
		</Box>
	);
}

export function generateStaticParams() {
	return posts.map((p) => ({ id: p.id }));
}
