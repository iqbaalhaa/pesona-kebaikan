"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
	Box,
	Paper,
	Typography,
	Stack,
	Chip,
	Button,
	Divider,
	LinearProgress,
	IconButton,
	TextField,
	Snackbar,
	Alert,
} from "@mui/material";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

type CampaignStatus = "draft" | "review" | "active" | "ended" | "rejected";
type CampaignType = "sakit" | "lainnya";

const STATUS_STYLE: Record<CampaignStatus, { label: string; sx: any }> = {
	draft: {
		label: "Draft",
		sx: { borderRadius: 999, fontWeight: 1000, variant: "outlined" as const },
	},
	review: {
		label: "Review",
		sx: {
			borderRadius: 999,
			fontWeight: 1000,
			bgcolor: "rgba(245,158,11,.14)",
			borderColor: "rgba(245,158,11,.28)",
			color: "rgb(161,98,7)",
		},
	},
	active: {
		label: "Aktif",
		sx: {
			borderRadius: 999,
			fontWeight: 1000,
			bgcolor: "rgba(34,197,94,.14)",
			borderColor: "rgba(34,197,94,.28)",
			color: "rgb(21,128,61)",
		},
	},
	ended: {
		label: "Berakhir",
		sx: {
			borderRadius: 999,
			fontWeight: 1000,
			bgcolor: "rgba(2,132,199,.12)",
			borderColor: "rgba(2,132,199,.22)",
			color: "rgb(3,105,161)",
		},
	},
	rejected: {
		label: "Ditolak",
		sx: {
			borderRadius: 999,
			fontWeight: 1000,
			bgcolor: "rgba(239,68,68,.12)",
			borderColor: "rgba(239,68,68,.22)",
			color: "rgb(185,28,28)",
		},
	},
};

function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function pct(collected: number, target: number) {
	if (!target || target <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((collected / target) * 100)));
}

export default function AdminCampaignDetailPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const id = params?.id ?? "";

	// dummy data (nanti ganti dari DB by id)
	const [data, setData] = React.useState({
		id,
		title: "Bantu Abi Melawan Kanker Hati",
		type: "sakit" as CampaignType,
		category: "Bantuan Medis & Kesehatan",
		status: "review" as CampaignStatus,
		ownerName: "Rifki Dermawan",
		ownerPhone: "08xxxxxxxxxx",
		target: 20000000,
		collected: 4820000,
		donors: 119,
		createdAt: "18 Desember 2025",
		updatedAt: "19 Desember 2025",
		publicUrl: `/campaign/${id || "cmp-001"}`,
		shortInvite: "Bantu Abi melawan kanker hati. Setiap donasi sangat berarti.",
		story:
			"Abi didiagnosa kanker hati dan membutuhkan biaya pengobatan yang besar. Saat ini keluarga sudah berusaha semampunya, namun biaya terus bertambah. Kami membuka penggalangan dana ini untuk membantu biaya rawat jalan, kontrol rutin, obat, dan tindakan medis sesuai rekomendasi dokter.\n\nMohon doa dan dukungan #OrangBaik. Setiap bantuan akan sangat berarti.",
	});

	const [tab, setTab] = React.useState<
		"overview" | "story" | "docs" | "timeline"
	>("overview");
	const [snack, setSnack] = React.useState<{
		open: boolean;
		msg: string;
		type: "success" | "info" | "warning" | "error";
	}>({
		open: false,
		msg: "",
		type: "info",
	});

	const progress = pct(data.collected, data.target);

	const typeBadge =
		data.type === "sakit"
			? {
					label: "Medis",
					icon: <LocalHospitalRoundedIcon fontSize="small" />,
					bg: "rgba(14,165,233,.12)",
					bd: "rgba(14,165,233,.24)",
			  }
			: {
					label: "Lainnya",
					icon: <CategoryRoundedIcon fontSize="small" />,
					bg: "rgba(97,206,112,.14)",
					bd: "rgba(97,206,112,.28)",
			  };

	const copy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setSnack({ open: true, msg: "Tersalin.", type: "success" });
		} catch {
			setSnack({ open: true, msg: "Gagal menyalin.", type: "error" });
		}
	};

	return (
		<Box>
			{/* Header */}
			<Paper
				elevation={0}
				sx={{
					p: 1.25,
					borderRadius: 3,
					border: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<Stack direction="row" spacing={1} alignItems="center">
					<IconButton
						onClick={() => router.back()}
						sx={{
							borderRadius: 2,
							border: "1px solid",
							borderColor: "divider",
							width: 38,
							height: 38,
						}}
					>
						<ArrowBackIosNewRoundedIcon fontSize="small" />
					</IconButton>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							sx={{ fontWeight: 1000, fontSize: 16 }}
							className="line-clamp-2"
						>
							{data.title}
						</Typography>
						<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
							ID: <b>{data.id || "—"}</b> • Update <b>{data.updatedAt}</b>
						</Typography>
					</Box>

					<Stack direction="row" spacing={1} alignItems="center">
						<Chip
							label={typeBadge.label}
							icon={typeBadge.icon as any}
							variant="outlined"
							sx={{
								borderRadius: 999,
								fontWeight: 1000,
								bgcolor: typeBadge.bg,
								borderColor: typeBadge.bd,
							}}
						/>
						<Chip
							label={STATUS_STYLE[data.status].label}
							variant="outlined"
							sx={{
								borderRadius: 999,
								fontWeight: 1000,
								...(STATUS_STYLE[data.status].sx ?? {}),
							}}
						/>
					</Stack>
				</Stack>

				<Divider sx={{ my: 1.25 }} />

				{/* Actions */}
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={1}
					alignItems={{ md: "center" }}
				>
					<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
						<Button
							component={Link}
							href={`/admin/campaign/${data.id}/edit`}
							variant="outlined"
							startIcon={<EditRoundedIcon />}
							sx={{ borderRadius: 999, fontWeight: 900 }}
						>
							Edit
						</Button>

						<Button
							component={Link}
							href={`/admin/campaign/verifikasi?id=${data.id}`}
							variant="outlined"
							startIcon={<VerifiedRoundedIcon />}
							sx={{ borderRadius: 999, fontWeight: 900 }}
						>
							Verifikasi
						</Button>

						<Button
							onClick={() =>
								setSnack({
									open: true,
									msg: "Campaign diakhiri (dummy).",
									type: "success",
								})
							}
							variant="outlined"
							color="error"
							startIcon={<StopCircleRoundedIcon />}
							sx={{ borderRadius: 999, fontWeight: 900 }}
						>
							Akhiri
						</Button>
					</Stack>

					<Box sx={{ flex: 1 }} />

					<Stack direction="row" spacing={1} alignItems="center">
						<Button
							component={Link}
							href={data.publicUrl}
							target="_blank"
							variant="contained"
							endIcon={<OpenInNewRoundedIcon />}
							sx={{ borderRadius: 999, fontWeight: 900, px: 2 }}
						>
							Buka Public Page
						</Button>

						<IconButton
							onClick={() => copy(data.publicUrl)}
							sx={{
								borderRadius: 2,
								border: "1px solid",
								borderColor: "divider",
								width: 42,
								height: 42,
							}}
						>
							<ContentCopyRoundedIcon fontSize="small" />
						</IconButton>
					</Stack>
				</Stack>
			</Paper>

			{/* Progress + summary */}
			<Paper
				elevation={0}
				sx={{
					mt: 2,
					p: 1.25,
					borderRadius: 3,
					border: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
					<Box sx={{ flex: 1 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
							{idr(data.collected)}{" "}
							<span style={{ fontWeight: 700, color: "rgba(0,0,0,.45)" }}>
								/ {idr(data.target)}
							</span>{" "}
							<span style={{ fontWeight: 900, color: "rgba(0,0,0,.55)" }}>
								({progress}%)
							</span>
						</Typography>

						<Box sx={{ mt: 0.8 }}>
							<LinearProgress variant="determinate" value={progress} />
							<Typography
								sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
							>
								{data.donors} donatur • Dibuat <b>{data.createdAt}</b>
							</Typography>
						</Box>
					</Box>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
							gap: 1,
							minWidth: { md: 360 },
						}}
					>
						<MiniStat label="Pemilik" value={data.ownerName} />
						<MiniStat label="No. HP" value={data.ownerPhone} />
						<MiniStat label="Kategori" value={data.category} />
						<MiniStat label="Status" value={STATUS_STYLE[data.status].label} />
					</Box>
				</Stack>
			</Paper>

			{/* Tabs */}
			<Box sx={{ mt: 2 }}>
				<Stack
					direction="row"
					spacing={1}
					sx={{
						overflowX: "auto",
						pb: 0.5,
						"&::-webkit-scrollbar": { display: "none" },
					}}
				>
					<TabChip
						label="Overview"
						active={tab === "overview"}
						onClick={() => setTab("overview")}
					/>
					<TabChip
						label="Story"
						active={tab === "story"}
						onClick={() => setTab("story")}
					/>
					<TabChip
						label="Dokumen"
						active={tab === "docs"}
						onClick={() => setTab("docs")}
					/>
					<TabChip
						label="Timeline"
						active={tab === "timeline"}
						onClick={() => setTab("timeline")}
					/>
				</Stack>
			</Box>

			{/* Content */}
			<Box sx={{ mt: 1.25, display: "grid", gap: 1.25 }}>
				{tab === "overview" && (
					<Paper
						elevation={0}
						sx={{
							p: 1.25,
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
							Ringkasan
						</Typography>
						<Typography
							sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
						>
							Ini ringkasan admin untuk memastikan campaign siap masuk
							verifikasi dan publik.
						</Typography>

						<Divider sx={{ my: 1.25 }} />

						<Stack spacing={1}>
							<InfoRow k="Tipe" v={typeBadge.label} />
							<InfoRow k="Kategori" v={data.category} />
							<InfoRow k="Status" v={STATUS_STYLE[data.status].label} />
							<InfoRow k="Target" v={idr(data.target)} />
							<InfoRow k="Terkumpul" v={idr(data.collected)} />
							<InfoRow k="Donatur" v={`${data.donors}`} />
						</Stack>
					</Paper>
				)}

				{tab === "story" && (
					<Paper
						elevation={0}
						sx={{
							p: 1.25,
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
							Judul
						</Typography>
						<TextField
							size="small"
							value={data.title}
							onChange={(e) =>
								setData((d) => ({ ...d, title: e.target.value }))
							}
							fullWidth
							sx={{
								mt: 1,
								"& .MuiOutlinedInput-root": { borderRadius: 2.5 },
								"& .MuiInputBase-input": { fontSize: 13.5 },
							}}
						/>

						<Typography sx={{ mt: 2, fontWeight: 1000, fontSize: 14 }}>
							Cerita
						</Typography>
						<TextField
							size="small"
							value={data.story}
							onChange={(e) =>
								setData((d) => ({ ...d, story: e.target.value }))
							}
							fullWidth
							multiline
							minRows={8}
							sx={{
								mt: 1,
								"& .MuiOutlinedInput-root": { borderRadius: 2.5 },
								"& .MuiInputBase-input": { fontSize: 13.5 },
							}}
						/>

						<Typography sx={{ mt: 2, fontWeight: 1000, fontSize: 14 }}>
							Ajakan singkat
						</Typography>
						<TextField
							size="small"
							value={data.shortInvite}
							onChange={(e) =>
								setData((d) => ({ ...d, shortInvite: e.target.value }))
							}
							fullWidth
							multiline
							minRows={3}
							sx={{
								mt: 1,
								"& .MuiOutlinedInput-root": { borderRadius: 2.5 },
								"& .MuiInputBase-input": { fontSize: 13.5 },
							}}
						/>

						<Stack direction="row" spacing={1} sx={{ mt: 2 }}>
							<Button
								variant="contained"
								onClick={() =>
									setSnack({
										open: true,
										msg: "Disimpan (dummy).",
										type: "success",
									})
								}
								sx={{ borderRadius: 999, fontWeight: 900, px: 2 }}
							>
								Simpan
							</Button>
							<Button
								variant="outlined"
								onClick={() =>
									setSnack({ open: true, msg: "Reset (dummy).", type: "info" })
								}
								sx={{ borderRadius: 999, fontWeight: 900, px: 2 }}
							>
								Reset
							</Button>
						</Stack>
					</Paper>
				)}

				{tab === "docs" && (
					<Paper
						elevation={0}
						sx={{
							p: 1.25,
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
							Dokumen
						</Typography>
						<Typography
							sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
						>
							Placeholder: untuk campaign medis biasanya ada dokumen tambahan
							(resume medis, surat RS, dll).
						</Typography>

						<Divider sx={{ my: 1.25 }} />

						<Stack spacing={1}>
							<DocRow title="Foto Sampul" status="Belum diupload" />
							<DocRow title="Identitas / KTP" status="Belum diupload" />
							{data.type === "sakit" ? (
								<>
									<DocRow
										title="Surat / Resume Medis"
										status="Belum diupload"
									/>
									<DocRow title="Dokumen Rumah Sakit" status="Belum diupload" />
								</>
							) : (
								<DocRow title="Dokumen Pendukung" status="Opsional" />
							)}
						</Stack>

						<Button
							variant="outlined"
							startIcon={<VerifiedRoundedIcon />}
							onClick={() =>
								setSnack({
									open: true,
									msg: "Kirim ke verifikasi (dummy).",
									type: "info",
								})
							}
							sx={{ mt: 2, borderRadius: 999, fontWeight: 900 }}
						>
							Kirim ke Verifikasi
						</Button>
					</Paper>
				)}

				{tab === "timeline" && (
					<Paper
						elevation={0}
						sx={{
							p: 1.25,
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<Typography sx={{ fontWeight: 1000, fontSize: 14 }}>
							Timeline
						</Typography>
						<Typography
							sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
						>
							Placeholder audit log: perubahan status, update data, verifikasi,
							pencairan, dsb.
						</Typography>

						<Divider sx={{ my: 1.25 }} />

						<Stack spacing={1}>
							<TimelineRow title="Campaign dibuat" meta={data.createdAt} />
							<TimelineRow title="Update terakhir" meta={data.updatedAt} />
							<TimelineRow title="Masuk antrian review" meta="—" />
						</Stack>
					</Paper>
				)}
			</Box>

			{/* Toast */}
			<Snackbar
				open={snack.open}
				autoHideDuration={2200}
				onClose={() => setSnack((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					severity={snack.type}
					variant="filled"
					onClose={() => setSnack((s) => ({ ...s, open: false }))}
					sx={{ borderRadius: 3 }}
				>
					{snack.msg}
				</Alert>
			</Snackbar>
		</Box>
	);
}

function TabChip({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<Chip
			label={label}
			clickable
			onClick={onClick}
			color={active ? "primary" : "default"}
			variant={active ? "filled" : "outlined"}
			sx={{ borderRadius: 999, fontWeight: 1000 }}
		/>
	);
}

function MiniStat({ label, value }: { label: string; value: string }) {
	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 2.5,
				p: 1,
				bgcolor: "background.paper",
			}}
		>
			<Typography
				sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 800 }}
			>
				{label}
			</Typography>
			<Typography
				sx={{ mt: 0.2, fontSize: 12.5, fontWeight: 1000 }}
				className="line-clamp-2"
			>
				{value}
			</Typography>
		</Paper>
	);
}

function InfoRow({ k, v }: { k: string; v: string }) {
	return (
		<Box sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
			<Typography sx={{ width: 120, fontSize: 12.5, color: "text.secondary" }}>
				{k}
			</Typography>
			<Typography sx={{ fontSize: 12.5, fontWeight: 900 }}>{v}</Typography>
		</Box>
	);
}

function DocRow({ title, status }: { title: string; status: string }) {
	return (
		<Paper variant="outlined" sx={{ borderRadius: 2.5, p: 1 }}>
			<Stack direction="row" spacing={1} alignItems="center">
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						sx={{ fontSize: 13, fontWeight: 1000 }}
						className="line-clamp-1"
					>
						{title}
					</Typography>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
						{status}
					</Typography>
				</Box>
				<Button variant="outlined" sx={{ borderRadius: 999, fontWeight: 900 }}>
					Upload
				</Button>
			</Stack>
		</Paper>
	);
}

function TimelineRow({ title, meta }: { title: string; meta: string }) {
	return (
		<Paper variant="outlined" sx={{ borderRadius: 2.5, p: 1 }}>
			<Typography sx={{ fontSize: 13, fontWeight: 1000 }}>{title}</Typography>
			<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
				{meta}
			</Typography>
		</Paper>
	);
}
