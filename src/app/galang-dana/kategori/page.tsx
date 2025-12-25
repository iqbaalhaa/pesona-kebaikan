"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
	Box,
	Paper,
	Typography,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	Drawer,
	Button,
	Stack,
	LinearProgress,
} from "@mui/material";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import { getCampaigns } from "@/actions/campaign";
import { CATEGORY_TITLE } from "@/lib/constants";

import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import FloodRoundedIcon from "@mui/icons-material/FloodRounded";
import AccessibleRoundedIcon from "@mui/icons-material/AccessibleRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import ParkRoundedIcon from "@mui/icons-material/ParkRounded";

type Example = { title: string; img: string };
type Cat = {
	key: string;
	label: string;
	desc: string;
	icon: React.ReactNode;
	examples: Example[];
};

const BRAND = "#61ce70";

const CATEGORIES: Cat[] = [
	{
		key: "pendidikan",
		label: "Bantuan Pendidikan",
		desc: "Galang dana bantuan untuk bidang pendidikan, seperti beasiswa, biaya operasional pendidikan, dan pembangunan sekolah.",
		icon: <SchoolRoundedIcon />,
		examples: [
			{
				title: "Bantu Anisaatul Melanjutkan Kuliah",
				img: "/mock/pendidikan-1.jpg",
			},
			{ title: "Bantu Pelajar Membiaya...", img: "/mock/pendidikan-2.jpg" },
		],
	},
	{
		key: "bencana",
		label: "Bencana Alam",
		desc: "Galang dana untuk penanganan bencana alam di Indonesia.",
		icon: <FloodRoundedIcon />,
		examples: [
			{
				title: "Selamatkan Nyawa Sesama! #BersamaLawanCorona",
				img: "/mock/bencana-1.jpg",
			},
			{ title: "Bantu Korban Gempa di Donggala", img: "/mock/bencana-2.jpg" },
		],
	},
	{
		key: "difabel",
		label: "Difabel",
		desc: "Galang dana untuk membantu kebutuhan penyandang disabilitas dan aksesibilitas.",
		icon: <AccessibleRoundedIcon />,
		examples: [
			{ title: "Bantu alat bantu difabel", img: "/mock/difabel-1.jpg" },
			{ title: "Dukung terapi & kebutuhan", img: "/mock/difabel-2.jpg" },
		],
	},
	{
		key: "infrastruktur",
		label: "Infrastruktur Umum",
		desc: "Galang dana untuk perbaikan fasilitas umum seperti jalan, jembatan, dan sarana publik.",
		icon: <ApartmentRoundedIcon />,
		examples: [
			{ title: "Perbaikan jembatan warga", img: "/mock/infrastruktur-1.jpg" },
			{ title: "Renovasi fasilitas umum", img: "/mock/infrastruktur-2.jpg" },
		],
	},
	{
		key: "usaha",
		label: "Karya Kreatif & Modal Usaha",
		desc: "Galang dana untuk mendukung karya kreatif, UMKM, dan modal usaha produktif.",
		icon: <LightbulbRoundedIcon />,
		examples: [
			{ title: "Dukung modal usaha kecil", img: "/mock/usaha-1.jpg" },
			{ title: "Bantu produksi karya kreatif", img: "/mock/usaha-2.jpg" },
		],
	},
	{
		key: "sosial",
		label: "Kegiatan Sosial",
		desc: "Galang dana untuk kegiatan sosial, komunitas, dan aksi solidaritas.",
		icon: <GroupsRoundedIcon />,
		examples: [
			{ title: "Paket sembako untuk warga", img: "/mock/sosial-1.jpg" },
			{ title: "Program sosial komunitas", img: "/mock/sosial-2.jpg" },
		],
	},
	{
		key: "kemanusiaan",
		label: "Kemanusiaan",
		desc: "Galang dana untuk bantuan kemanusiaan dan keadaan darurat.",
		icon: <Diversity3RoundedIcon />,
		examples: [
			{ title: "Bantu keluarga terdampak", img: "/mock/kemanusiaan-1.jpg" },
			{ title: "Bantuan darurat & logistik", img: "/mock/kemanusiaan-2.jpg" },
		],
	},
	{
		key: "lingkungan",
		label: "Lingkungan",
		desc: "Galang dana untuk penghijauan, konservasi, dan program lingkungan.",
		icon: <ParkRoundedIcon />,
		examples: [
			{ title: "Tanam pohon untuk bumi", img: "/mock/lingkungan-1.jpg" },
			{ title: "Dukung konservasi alam", img: "/mock/lingkungan-2.jpg" },
		],
	},
];

function ExampleCard({ e }: { e: Example }) {
	return (
		<Paper
			elevation={0}
			sx={{
				width: 168,
				borderRadius: 2,
				overflow: "hidden",
				border: "1px solid",
				borderColor: "divider",
				flexShrink: 0,
				bgcolor: "background.paper",
			}}
		>
			<Box
				component="img"
				src="/defaultimg.webp"
				alt={e.title}
				sx={{
					width: "100%",
					height: 96,
					objectFit: "cover",
					display: "block",
					bgcolor: "background.default",
				}}
				onError={(ev: React.SyntheticEvent<HTMLImageElement, Event>) => {
					// fallback kalau gambar belum ada
					ev.currentTarget.style.display = "none";
				}}
			/>
			<Box sx={{ p: 1 }}>
				<Typography
					sx={{ fontSize: 12.5, fontWeight: 900 }}
					className="line-clamp-2"
				>
					{e.title}
				</Typography>
			</Box>
		</Paper>
	);
}

export default function GalangDanaKategoriPage() {
	const router = useRouter();
	const { status } = useSession();

	React.useEffect(() => {
		if (status === "unauthenticated") {
			router.replace("/auth/login?callbackUrl=/galang-dana/kategori");
		}
	}, [status, router]);

	const [open, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<Cat | null>(null);
	const [realExamples, setRealExamples] = React.useState<Example[]>([]);
	const [loadingExamples, setLoadingExamples] = React.useState(false);

	const openSheet = async (cat: Cat) => {
		setSelected(cat);
		setOpen(true);
		setLoadingExamples(true);
		setRealExamples([]);

		try {
			const catName = CATEGORY_TITLE[cat.key];
			if (catName) {
				const res = await getCampaigns(1, 5, "active", "", undefined, catName);
				if (res.success && res.data && res.data.length > 0) {
					const mapped = res.data.map((c: any) => ({
						title: c.title,
						img: c.thumbnail || "/defaultimg.webp",
					}));
					setRealExamples(mapped);
				}
			}
		} catch (error) {
			console.error("Failed to fetch examples", error);
		}
		setLoadingExamples(false);
	};

	const chooseThis = () => {
		if (!selected) return;
		setOpen(false);
		router.push(
			`/galang-dana/buat?type=lainnya&category=${encodeURIComponent(
				selected.key
			)}`
		);
	};

	if (status === "loading") {
		return (
			<Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
				<LinearProgress sx={{ width: 120, borderRadius: 99 }} />
			</Box>
		);
	}

	return (
		<Box sx={{ pb: "calc(var(--bottom-nav-h, 72px) + 12px)" }}>
			{/* Header hijau */}
			<Paper
				elevation={0}
				sx={{
					borderRadius: 0,
					bgcolor: BRAND,
					color: "#fff",
					px: 1,
					py: 1.25,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<IconButton onClick={() => router.back()} sx={{ color: "#fff" }}>
						<ArrowBackIosNewRoundedIcon fontSize="small" />
					</IconButton>

					<Typography sx={{ fontWeight: 1000, fontSize: 14.5 }}>
						Pilih kategori galang dana
					</Typography>
				</Box>
			</Paper>

			{/* List kategori */}
			<Paper elevation={0} sx={{ borderRadius: 0 }}>
				<List disablePadding>
					{CATEGORIES.map((c, idx) => (
						<React.Fragment key={c.key}>
							<ListItemButton onClick={() => openSheet(c)} sx={{ py: 1.55 }}>
								<ListItemIcon sx={{ minWidth: 44, color: BRAND }}>
									{c.icon}
								</ListItemIcon>

								<ListItemText
									primary={
										<Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
											{c.label}
										</Typography>
									}
								/>

								<ChevronRightRoundedIcon sx={{ color: "text.disabled" }} />
							</ListItemButton>

							{idx !== CATEGORIES.length - 1 ? <Divider /> : null}
						</React.Fragment>
					))}
				</List>
			</Paper>

			{/* Bottom-sheet modal preview */}
			<Drawer
				anchor="bottom"
				open={open}
				onClose={() => setOpen(false)}
				ModalProps={{ hideBackdrop: true }}
				PaperProps={{
					sx: {
						bottom: "var(--bottom-nav-h, 72px)",
						maxHeight: "calc(100dvh - var(--bottom-nav-h, 72px))",
						borderTopLeftRadius: 14,
						borderTopRightRadius: 14,
						overflow: "hidden",
						maxWidth: 480,
						mx: "auto",
						width: "100%",
						bgcolor: "#fff",
					},
				}}
			>
				<Box sx={{ px: 2, pt: 1.5, pb: 1.25 }}>
					<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
						{selected?.label ?? "-"}
					</Typography>

					<Typography sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}>
						{selected?.desc ?? ""}
					</Typography>

					<Typography sx={{ mt: 1.25, fontSize: 12.5, fontWeight: 1000 }}>
						Contoh penggalangan {selected?.label?.toLowerCase() ?? ""}
					</Typography>

					<Box
						sx={{
							mt: 1,
							display: "flex",
							gap: 1,
							overflowX: "auto",
							pb: 1,
							"&::-webkit-scrollbar": { height: 8 },
							"&::-webkit-scrollbar-thumb": {
								background: "rgba(15,23,42,.25)",
								borderRadius: 999,
							},
							"&::-webkit-scrollbar-track": {
								background: "rgba(15,23,42,.08)",
								borderRadius: 999,
							},
						}}
					>
						{loadingExamples ? (
							<Typography sx={{ fontSize: 13, color: "text.secondary", py: 2 }}>
								Memuat contoh...
							</Typography>
						) : (
							(realExamples.length > 0
								? realExamples
								: selected?.examples ?? []
							).map((e) => <ExampleCard key={e.title} e={e} />)
						)}
					</Box>

					<Stack spacing={1} sx={{ mt: 1 }}>
						<Button
							variant="contained"
							fullWidth
							onClick={chooseThis}
							sx={{
								borderRadius: 2.5,
								fontWeight: 1000,
								py: 1.15,
								bgcolor: BRAND,
								"&:hover": { bgcolor: BRAND },
							}}
						>
							Pilih kategori galang dana ini
						</Button>

						<Button
							variant="outlined"
							fullWidth
							onClick={() => setOpen(false)}
							sx={{
								borderRadius: 2.5,
								fontWeight: 900,
								py: 1.05,
								borderColor: BRAND,
								color: BRAND,
							}}
						>
							Pilih kategori lain
						</Button>
					</Stack>
				</Box>
			</Drawer>
		</Box>
	);
}
