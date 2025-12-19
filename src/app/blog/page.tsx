"use client";

import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ShareIcon from "@mui/icons-material/Share";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const posts = [
	{
		id: "1",
		title: "Kenapa Donasi Kecil Tetap Berdampak Besar",
		excerpt:
			"Banyak orang mengira donasi kecil tidak berarti. Faktanya, konsistensi dan kebersamaan membuat dampak nyata.",
		cover: "/defaultimg.webp",
		date: "17 Des 2025",
		tag: "Inspiration",
	},
	{
		id: "2",
		title: "Transparansi Penggalangan Dana di Pesona Kebaikan",
		excerpt:
			"Kami memastikan setiap rupiah tercatat dan dilaporkan. Inilah cara kami menjaga kepercayaan.",
		cover: "/defaultimg.webp",
		date: "10 Des 2025",
		tag: "Update",
	},
	{
		id: "3",
		title: "Tips Menggalang Dana Efektif untuk Komunitas",
		excerpt:
			"Dari penulisan cerita hingga distribusi kampanye, berikut panduan singkat menggalang dana secara efektif.",
		cover: "/defaultimg.webp",
		date: "02 Des 2025",
		tag: "Guide",
	},
];

export default function BlogPage() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const [filter, setFilter] = React.useState("Semua");
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);
	const open = Boolean(anchorEl); // Still used for Menu
	const drawerOpen = Boolean(selectedPostId); // Used for Drawer logic

	const handleShareClick = (event: React.MouseEvent<HTMLElement>, postId: string) => {
		event.preventDefault();
		event.stopPropagation();
		// If desktop, use Menu (requires anchor). If mobile, just set ID to trigger Drawer.
		if (!isMobile) {
			setAnchorEl(event.currentTarget);
		}
		setSelectedPostId(postId);
	};

	const handleClose = (e?: React.MouseEvent) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		setAnchorEl(null);
		setSelectedPostId(null);
	};

	const handleShare = (platform: string) => {
		if (!selectedPostId) return;

		const post = posts.find((p) => p.id === selectedPostId);
		if (!post) return;

		const url = `${window.location.origin}/blog/${post.id}`;
		const text = post.title;

		let shareUrl = "";
		switch (platform) {
			case "twitter":
				shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
				break;
			case "facebook":
				shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
				break;
			case "whatsapp":
				shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
				break;
			case "copy":
				navigator.clipboard.writeText(url);
				handleClose();
				return;
		}

		if (shareUrl) {
			window.open(shareUrl, "_blank", "noopener,noreferrer");
		}
		handleClose();
	};

	const filteredPosts = React.useMemo(() => {
		if (filter === "Semua") return posts;
		return posts.filter((p) => p.tag === filter);
	}, [filter]);

	const shareOptions = [
		{ id: "twitter", label: "Twitter", icon: <TwitterIcon fontSize="small" /> },
		{ id: "facebook", label: "Facebook", icon: <FacebookIcon fontSize="small" /> },
		{ id: "whatsapp", label: "WhatsApp", icon: <WhatsAppIcon fontSize="small" /> },
		{ id: "copy", label: "Salin Link", icon: <ContentCopyIcon fontSize="small" /> },
	];

	return (
		<Box sx={{ px: 2.5, pt: 2.5, pb: 4, maxWidth: 600, mx: "auto" }}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: 2,
				}}
			>
				<Typography sx={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>
					Blog
				</Typography>
			</Box>

			<Stack direction="row" spacing={1} sx={{ mt: 2, mb: 3, overflowX: "auto", pb: 0.5 }}>
				{["Semua", "Inspiration", "Update", "Guide"].map((tag) => (
					<Chip
						key={tag}
						label={tag}
						color={filter === tag ? "primary" : "default"}
						variant={filter === tag ? "filled" : "outlined"}
						onClick={() => setFilter(tag)}
						sx={{ fontWeight: 600 }}
					/>
				))}
			</Stack>

			<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				{filteredPosts.map((post) => (
					<Link key={post.id} href={`/blog/${post.id}`} style={{ textDecoration: "none" }}>
						<Card
							variant="outlined"
							sx={{
								display: "flex",
								flexDirection: { xs: "column", sm: "row" },
								gap: 2,
								p: 1.5,
								borderRadius: 3,
								borderColor: "rgba(0,0,0,0.08)",
								bgcolor: "#fff",
								transition: "all 0.2s ease",
								"&:hover": {
									borderColor: "primary.main",
									boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
									transform: "translateY(-2px)",
								},
							}}
						>
							<CardMedia
								component="img"
								image={post.cover}
								alt={post.title}
								sx={{
									width: { xs: "100%", sm: 140 },
									height: { xs: 180, sm: 140 },
									borderRadius: 2,
									objectFit: "cover",
									flexShrink: 0,
									bgcolor: "rgba(0,0,0,0.04)",
								}}
							/>
							<CardContent
								sx={{
									p: 0,
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									flex: 1,
									"&:last-child": { pb: 0 },
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
									<Chip
										size="small"
										label={post.tag}
										sx={{ borderRadius: 1, height: 24, fontSize: 11, fontWeight: 700 }}
										color="primary"
										variant="filled"
									/>
									<Typography
										sx={{
											fontSize: 11.5,
											color: "rgba(15,23,42,.55)",
											fontWeight: 700,
										}}
									>
										{post.date}
									</Typography>
								</Box>
								<Typography
									sx={{
										fontSize: 16,
										fontWeight: 800,
										color: "#0f172a",
										lineHeight: 1.3,
										mb: 0.5,
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
									}}
								>
									{post.title}
								</Typography>
								<Typography
									sx={{
										fontSize: 13.5,
										color: "rgba(15,23,42,.70)",
										lineHeight: 1.5,
										mb: 1.5,
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
									}}
								>
									{post.excerpt}
								</Typography>
								
								<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
									<Typography sx={{ fontSize: 13, fontWeight: 700, color: "primary.main" }}>
										Baca Selengkapnya
									</Typography>
									<IconButton
										size="small"
										onClick={(e) => handleShareClick(e, post.id)}
										sx={{ color: "rgba(15,23,42,.4)" }}
									>
										<ShareIcon fontSize="small" />
									</IconButton>
								</Box>
							</CardContent>
						</Card>
					</Link>
				))}
			</Box>

			{isMobile ? (
				<Drawer
					anchor="bottom"
					open={drawerOpen}
					onClose={() => handleClose()}
					PaperProps={{
						sx: {
							borderTopLeftRadius: 16,
							borderTopRightRadius: 16,
							p: 2,
						},
					}}
				>
					<Typography sx={{ fontWeight: 800, mb: 2, fontSize: 16, textAlign: "center", color: "#0f172a" }}>
						Bagikan ke
					</Typography>
					<List sx={{ pt: 0 }}>
						{shareOptions.map((option) => (
							<ListItem key={option.id} disablePadding>
								<ListItemButton
									onClick={() => handleShare(option.id)}
									sx={{
										borderRadius: 2,
										py: 1.5,
										display: "flex",
										gap: 2,
									}}
								>
									<ListItemIcon sx={{ minWidth: 0, color: "rgba(15,23,42,.8)" }}>
										{option.icon}
									</ListItemIcon>
									<ListItemText
										primary={option.label}
										primaryTypographyProps={{
											fontWeight: 600,
											fontSize: 14.5,
											color: "#0f172a",
										}}
									/>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</Drawer>
			) : (
				<Menu
					anchorEl={anchorEl}
					open={open}
					onClose={() => handleClose()}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					PaperProps={{
						elevation: 3,
						sx: {
							mt: 1,
							borderRadius: 2,
							minWidth: 180,
							"& .MuiMenuItem-root": {
								fontSize: 14,
								fontWeight: 600,
								color: "rgba(15,23,42,.8)",
								py: 1,
							},
						},
					}}
					transformOrigin={{ horizontal: "right", vertical: "top" }}
					anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				>
					{shareOptions.map((option) => (
						<MenuItem key={option.id} onClick={() => handleShare(option.id)}>
							<ListItemIcon>{option.icon}</ListItemIcon>
							<ListItemText>{option.label}</ListItemText>
						</MenuItem>
					))}
				</Menu>
			)}
		</Box>
	);
}
