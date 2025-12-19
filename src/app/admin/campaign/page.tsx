"use client";

import * as React from "react";
import Link from "next/link";
import {
	Box,
	Paper,
	Typography,
	Stack,
	Chip,
	TextField,
	InputAdornment,
	IconButton,
	LinearProgress,
	Menu,
	MenuItem,
	ButtonBase,
	Avatar,
	AvatarGroup,
	Divider,
	Skeleton,
	Tooltip,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Pagination from "@mui/material/Pagination";

const PAGE_SIZE = 9;

type CampaignStatus = "draft" | "review" | "active" | "ended" | "rejected";
type CampaignType = "sakit" | "lainnya";

type CampaignRow = {
	id: string;
	title: string;
	category: string;
	type: CampaignType;
	ownerName: string;
	target: number;
	collected: number;
	donors: number;
	status: CampaignStatus;
	updatedAt: string;
};

const BRAND = "#61ce70";

const MOCK: CampaignRow[] = [
	{
		id: "cmp-001",
		title: "Bantu Abi Melawan Kanker Hati",
		category: "Bantuan Medis & Kesehatan",
		type: "sakit",
		ownerName: "Rifki Dermawan",
		target: 20000000,
		collected: 4820000,
		donors: 119,
		status: "review",
		updatedAt: "19 Des 2025",
	},
	{
		id: "cmp-002",
		title: "Bangun Kembali Masjid Terdampak Bencana",
		category: "Bencana Alam",
		type: "lainnya",
		ownerName: "Budi Sentosa",
		target: 50000000,
		collected: 544000,
		donors: 12,
		status: "active",
		updatedAt: "19 Des 2025",
	},
	{
		id: "cmp-003",
		title: "[Campaign belum ada judul]",
		category: "Bantuan Pendidikan",
		type: "lainnya",
		ownerName: "—",
		target: 0,
		collected: 0,
		donors: 0,
		status: "draft",
		updatedAt: "18 Des 2025",
	},
	{
		id: "cmp-004",
		title: "Biaya Operasional Posko Bencana",
		category: "Bencana Alam",
		type: "lainnya",
		ownerName: "Rani",
		target: 15000000,
		collected: 2500000,
		donors: 44,
		status: "active",
		updatedAt: "17 Des 2025",
	},
	{
		id: "cmp-005",
		title: "Bantu Bayar Biaya Sekolah Anak",
		category: "Bantuan Pendidikan",
		type: "lainnya",
		ownerName: "Asep",
		target: 8000000,
		collected: 1200000,
		donors: 21,
		status: "review",
		updatedAt: "16 Des 2025",
	},
	{
		id: "cmp-006",
		title: "Pengobatan Pasien Stroke",
		category: "Bantuan Medis & Kesehatan",
		type: "sakit",
		ownerName: "Nadia",
		target: 30000000,
		collected: 30000000,
		donors: 980,
		status: "ended",
		updatedAt: "10 Des 2025",
	},
];

function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function pct(collected: number, target: number) {
	if (!target || target <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((collected / target) * 100)));
}

function matchQuery(q: string, row: CampaignRow) {
	if (!q) return true;
	const s = q.toLowerCase();
	return (
		row.title.toLowerCase().includes(s) ||
		row.category.toLowerCase().includes(s) ||
		row.ownerName.toLowerCase().includes(s) ||
		row.id.toLowerCase().includes(s)
	);
}

function statusChip(status: CampaignStatus) {
	const base = {
		borderRadius: 999,
		fontWeight: 1000,
		height: 26,
		bgcolor: "rgba(2,6,23,.35)",
		border: "1px solid rgba(148,163,184,.14)",
		"& .MuiChip-label": { px: 1.1, fontSize: 12 },
	};
	switch (status) {
		case "draft":
			return {
				label: "Draft",
				sx: { ...base, color: "rgba(226,232,240,.72)" },
			};
		case "review":
			return {
				label: "Review",
				sx: {
					...base,
					borderColor: "rgba(245,158,11,.25)",
					bgcolor: "rgba(245,158,11,.14)",
					color: "rgb(253,186,116)",
				},
			};
		case "active":
			return {
				label: "Aktif",
				sx: {
					...base,
					borderColor: "rgba(97,206,112,.25)",
					bgcolor: "rgba(97,206,112,.14)",
					color: "rgb(134,239,172)",
				},
			};
		case "ended":
			return {
				label: "Berakhir",
				sx: {
					...base,
					borderColor: "rgba(56,189,248,.22)",
					bgcolor: "rgba(56,189,248,.12)",
					color: "rgb(125,211,252)",
				},
			};
		case "rejected":
			return {
				label: "Ditolak",
				sx: {
					...base,
					borderColor: "rgba(239,68,68,.22)",
					bgcolor: "rgba(239,68,68,.12)",
					color: "rgb(252,165,165)",
				},
			};
	}
}

const FILTERS: { key: "all" | CampaignStatus; label: string }[] = [
	{ key: "all", label: "Semua" },
	{ key: "review", label: "Review" },
	{ key: "active", label: "Aktif" },
	{ key: "draft", label: "Draft" },
	{ key: "ended", label: "Berakhir" },
	{ key: "rejected", label: "Ditolak" },
];

export default function AdminCampaignPage() {
	const [rows, setRows] = React.useState<CampaignRow[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [page, setPage] = React.useState(1);

	const [q, setQ] = React.useState("");
	const [filter, setFilter] = React.useState<"all" | CampaignStatus>("all");

	const [menu, setMenu] = React.useState<{
		anchor: HTMLElement | null;
		row?: CampaignRow;
	}>({
		anchor: null,
	});

	React.useEffect(() => {
		// simulate fetch
		const t = setTimeout(() => {
			setRows(MOCK);
			setLoading(false);
		}, 450);
		return () => clearTimeout(t);
	}, []);

	const counts = React.useMemo(() => {
		const c: Record<string, number> = { all: rows.length };
		for (const f of FILTERS) c[f.key] = 0;
		rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
		c.all = rows.length;
		return c;
	}, [rows]);

	const filtered = React.useMemo(() => {
		let base = rows.filter((r) => matchQuery(q, r));
		if (filter !== "all") base = base.filter((r) => r.status === filter);
		return base;
	}, [rows, q, filter]);

	React.useEffect(() => {
		setPage(1);
	}, [q, filter]);

	const paginatedRows = React.useMemo(() => {
		const start = (page - 1) * PAGE_SIZE;
		return filtered.slice(start, start + PAGE_SIZE);
	}, [filtered, page]);

	const openMenu = (e: React.MouseEvent<HTMLElement>, row: CampaignRow) =>
		setMenu({ anchor: e.currentTarget, row });
	const closeMenu = () => setMenu({ anchor: null, row: undefined });

	const onEnd = (id: string) => {
		setRows((prev) =>
			prev.map((x) =>
				x.id === id ? { ...x, status: "ended", updatedAt: "Hari ini" } : x
			)
		);
	};

	const onRefresh = () => {
		setLoading(true);
		setTimeout(() => {
			setRows(MOCK);
			setLoading(false);
		}, 350);
	};

	return (
		<Box>
			{/* Top header / toolbar */}
			<Paper
				elevation={0}
				sx={{
					p: 1.5,
					borderRadius: 3,
					border: "1px solid rgba(148,163,184,.14)",
					bgcolor: "rgba(15,23,42,.72)",
					backdropFilter: "blur(10px)",
				}}
			>
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={1.25}
					alignItems={{ md: "center" }}
				>
					<Box sx={{ flex: 1 }}>
						<Typography
							sx={{ fontSize: 18, fontWeight: 1000, letterSpacing: -0.3 }}
						>
							Campaign
						</Typography>
						<Typography
							sx={{ mt: 0.2, fontSize: 12.5, color: "rgba(226,232,240,.72)" }}
						>
							Monitor & kelola campaign dalam format card premium (dark).
						</Typography>
					</Box>

					<Stack direction="row" spacing={1} alignItems="center">
						<TextField
							size="small"
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Cari campaign…"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchRoundedIcon fontSize="small" />
									</InputAdornment>
								),
							}}
							sx={{
								minWidth: { xs: 220, md: 340 },
								"& .MuiOutlinedInput-root": {
									borderRadius: 2.5,
									bgcolor: "rgba(2,6,23,.35)",
									border: "1px solid rgba(148,163,184,.12)",
									color: "rgba(226,232,240,.92)",
									"& fieldset": { border: "none" },
								},
								"& .MuiInputBase-input": { fontSize: 13.5 },
								"& .MuiInputAdornment-root": { color: "rgba(226,232,240,.7)" },
							}}
						/>

						<Tooltip title="Refresh">
							<IconButton
								onClick={onRefresh}
								sx={{
									borderRadius: 2,
									width: 38,
									height: 38,
									border: "1px solid rgba(148,163,184,.14)",
									bgcolor: "rgba(2,6,23,.22)",
									color: "rgba(226,232,240,.85)",
								}}
							>
								<RefreshRoundedIcon fontSize="small" />
							</IconButton>
						</Tooltip>

						<ButtonBase
							component={Link}
							href="/admin/campaign/create"
							sx={{
								height: 38,
								px: 1.5,
								borderRadius: 999,
								fontWeight: 1000,
								color: "#0b1220",
								bgcolor: BRAND,
								boxShadow: "0 10px 26px rgba(97,206,112,.22)",
								transition: "transform 120ms ease",
								"&:active": { transform: "scale(.99)" },
							}}
						>
							<AddRoundedIcon fontSize="small" style={{ marginRight: 6 }} />
							Buat
						</ButtonBase>
					</Stack>
				</Stack>

				<Divider sx={{ mt: 1.25, borderColor: "rgba(148,163,184,.14)" }} />

				{/* Filter chips */}
				<Box
					sx={{
						mt: 1.1,
						display: "flex",
						gap: 1,
						overflowX: "auto",
						pb: 0.5,
						"&::-webkit-scrollbar": { display: "none" },
					}}
				>
					<Chip
						icon={<FilterAltRoundedIcon />}
						label="Filter"
						variant="outlined"
						sx={{
							borderRadius: 999,
							borderColor: "rgba(148,163,184,.14)",
							color: "rgba(226,232,240,.72)",
							bgcolor: "rgba(2,6,23,.18)",
							"& .MuiChip-icon": { color: "rgba(226,232,240,.65)" },
						}}
					/>
					{FILTERS.map((f) => {
						const selected = filter === f.key;
						const n = counts[f.key] ?? 0;
						return (
							<Chip
								key={f.key}
								clickable
								onClick={() => setFilter(f.key)}
								label={
									<Box
										sx={{
											display: "inline-flex",
											alignItems: "center",
											gap: 0.8,
										}}
									>
										{f.label}
										<Box
											sx={{
												px: 0.9,
												height: 18,
												borderRadius: 999,
												display: "inline-flex",
												alignItems: "center",
												fontSize: 11,
												fontWeight: 1000,
												bgcolor: selected
													? "rgba(2,6,23,.22)"
													: "rgba(148,163,184,.14)",
												color: selected
													? "rgba(226,232,240,.9)"
													: "rgba(226,232,240,.65)",
											}}
										>
											{n}
										</Box>
									</Box>
								}
								variant={selected ? "filled" : "outlined"}
								sx={{
									borderRadius: 999,
									fontWeight: 1000,
									borderColor: "rgba(148,163,184,.14)",
									bgcolor: selected ? "rgba(97,206,112,.14)" : "transparent",
									color: selected
										? "rgb(134,239,172)"
										: "rgba(226,232,240,.75)",
								}}
							/>
						);
					})}
				</Box>
			</Paper>

			{/* Grid cards */}
			<Box
				sx={{
					mt: 2,
					display: "grid",
					gap: 1.25,
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, minmax(0, 1fr))",
						lg: "repeat(3, minmax(0, 1fr))",
					},
				}}
			>
				{loading
					? Array.from({ length: 6 }).map((_, i) => (
							<Paper
								key={i}
								elevation={0}
								sx={{
									borderRadius: 3,
									border: "1px solid rgba(148,163,184,.14)",
									bgcolor: "rgba(15,23,42,.68)",
									p: 1.5,
								}}
							>
								<Stack direction="row" spacing={1.25} alignItems="center">
									<Skeleton variant="rounded" width={40} height={40} />
									<Box sx={{ flex: 1 }}>
										<Skeleton width="85%" />
										<Skeleton width="60%" />
									</Box>
									<Skeleton variant="rounded" width={36} height={36} />
								</Stack>
								<Box sx={{ mt: 1.25 }}>
									<Skeleton width="45%" />
									<Skeleton width="90%" />
									<Skeleton width="70%" />
								</Box>
							</Paper>
					  ))
					: paginatedRows.map((row) => (
							<PremiumCampaignCard key={row.id} row={row} onMenu={openMenu} />
					  ))}
			</Box>

			{/* Pagination */}
			<Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
				<Pagination
					count={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
					page={page}
					onChange={(_, p) => setPage(p)}
					sx={{
						"& .MuiPaginationItem-root": {
							color: "rgba(241,245,249,.85)",
							borderColor: "rgba(255,255,255,.10)",
						},
						"& .Mui-selected": {
							bgcolor: "rgba(97,206,112,.18) !important",
							color: "rgb(134,239,172) !important",
						},
					}}
				/>
			</Box>

			{/* Row menu */}
			<Menu
				anchorEl={menu.anchor}
				open={!!menu.anchor}
				onClose={closeMenu}
				PaperProps={{
					sx: {
						borderRadius: 2.5,
						border: "1px solid rgba(148,163,184,.14)",
						bgcolor: "rgba(15,23,42,.92)",
						backdropFilter: "blur(12px)",
						boxShadow: "0 22px 60px rgba(0,0,0,.35)",
						color: "rgba(226,232,240,.92)",
						minWidth: 220,
					},
				}}
			>
				<MenuItem
					component={Link}
					href={`/admin/campaign/${menu.row?.id ?? ""}`}
					onClick={closeMenu}
				>
					<VisibilityRoundedIcon fontSize="small" style={{ marginRight: 10 }} />
					Detail
				</MenuItem>
				<MenuItem
					component={Link}
					href={`/admin/campaign/${menu.row?.id ?? ""}/edit`}
					onClick={closeMenu}
				>
					<EditRoundedIcon fontSize="small" style={{ marginRight: 10 }} />
					Edit
				</MenuItem>
				{menu.row?.status === "review" ? (
					<MenuItem
						component={Link}
						href={`/admin/campaign/${menu.row?.id ?? ""}?tab=verify`}
						onClick={closeMenu}
					>
						<VerifiedRoundedIcon fontSize="small" style={{ marginRight: 10 }} />
						Verifikasi
					</MenuItem>
				) : null}
				{menu.row?.status === "active" ? (
					<MenuItem
						onClick={() => {
							const id = menu.row!.id;
							closeMenu();
							onEnd(id);
						}}
					>
						<StopCircleRoundedIcon
							fontSize="small"
							style={{ marginRight: 10 }}
						/>
						Akhiri
					</MenuItem>
				) : null}
			</Menu>
		</Box>
	);
}

function PremiumCampaignCard({
	row,
	onMenu,
}: {
	row: CampaignRow;
	onMenu: (e: React.MouseEvent<HTMLElement>, r: CampaignRow) => void;
}) {
	const progress = pct(row.collected, row.target);
	const status = statusChip(row.status);

	const typeMeta =
		row.type === "sakit"
			? {
					icon: <LocalHospitalRoundedIcon fontSize="small" />,
					label: "Medis",
					glow: "rgba(56,189,248,.22)",
					glow2: "rgba(56,189,248,.10)",
			  }
			: {
					icon: <CategoryRoundedIcon fontSize="small" />,
					label: "Lainnya",
					glow: "rgba(97,206,112,.22)",
					glow2: "rgba(97,206,112,.10)",
			  };

	return (
		<Paper
			elevation={0}
			sx={{
				position: "relative",
				borderRadius: 3,
				overflow: "hidden",

				// ✅ surface lebih "angkat"
				bgcolor: "rgba(17, 24, 39, .98)", // slate-900-ish
				border: "1px solid rgba(255,255,255,.08)",
				boxShadow: "0 14px 38px rgba(0,0,0,.35)",
				backdropFilter: "blur(10px)",

				// ✅ inner highlight biar tepi kebaca
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					borderRadius: 12,
					pointerEvents: "none",
					boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
				},

				// ✅ hover lebih “terasa”
				transition:
					"transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
				"&:hover": {
					transform: "translateY(-2px)",
					borderColor: "rgba(255,255,255,.12)",
					boxShadow: "0 22px 60px rgba(0,0,0,.45)",
				},
			}}
		>
			{/* ✅ glow jangan menutupi border: taruh di bawah, opacity kecil */}
			<Box
				sx={{
					position: "absolute",
					inset: 0,
					pointerEvents: "none",
					opacity: 0.85,
					background: `
            radial-gradient(520px 260px at 85% 0%, ${typeMeta.glow}, transparent 58%),
            radial-gradient(520px 260px at 0% 100%, ${typeMeta.glow2}, transparent 62%)
          `,
				}}
			/>

			<Box sx={{ position: "relative", p: 1.5 }}>
				<Stack direction="row" spacing={1.2} alignItems="flex-start">
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: 2,
							display: "grid",
							placeItems: "center",
							flexShrink: 0,

							// ✅ icon chip lebih kontras
							bgcolor: "rgba(2,6,23,.55)",
							border: "1px solid rgba(255,255,255,.08)",
							color: "rgba(226,232,240,.9)",
						}}
					>
						{typeMeta.icon}
					</Box>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							sx={{
								fontWeight: 1000,
								fontSize: 13.6,
								color: "rgba(241,245,249,.92)",
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
							}}
						>
							{row.title}
						</Typography>

						<Typography
							sx={{
								mt: 0.25,
								fontSize: 12,
								color: "rgba(226,232,240,.68)",
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{row.category}
						</Typography>

						<Stack
							direction="row"
							spacing={0.8}
							alignItems="center"
							sx={{ mt: 1, flexWrap: "wrap" }}
						>
							<Chip
								label={typeMeta.label}
								size="small"
								variant="outlined"
								sx={{
									borderRadius: 999,
									fontWeight: 1000,
									height: 26,
									bgcolor: "rgba(2,6,23,.40)",
									borderColor: "rgba(255,255,255,.10)",
									color: "rgba(241,245,249,.85)",
									"& .MuiChip-label": { px: 1.1, fontSize: 12 },
								}}
							/>
							<Chip
								label={status.label}
								size="small"
								variant="outlined"
								sx={status.sx}
							/>
							<Typography
								sx={{ fontSize: 11.5, color: "rgba(226,232,240,.60)" }}
							>
								Update{" "}
								<b style={{ color: "rgba(241,245,249,.88)" }}>
									{row.updatedAt}
								</b>
							</Typography>
						</Stack>
					</Box>

					<IconButton
						onClick={(e) => onMenu(e, row)}
						sx={{
							borderRadius: 2,
							width: 36,
							height: 36,
							bgcolor: "rgba(2,6,23,.45)",
							border: "1px solid rgba(255,255,255,.08)",
							color: "rgba(241,245,249,.86)",
							"&:hover": { bgcolor: "rgba(2,6,23,.60)" },
						}}
					>
						<MoreHorizRoundedIcon fontSize="small" />
					</IconButton>
				</Stack>

				<Box sx={{ mt: 1.1 }}>
					<Typography sx={{ fontSize: 12, color: "rgba(226,232,240,.62)" }}>
						By <b style={{ color: "rgba(241,245,249,.88)" }}>{row.ownerName}</b>{" "}
						• ID:{" "}
						<span style={{ color: "rgba(241,245,249,.84)", fontWeight: 900 }}>
							{row.id}
						</span>
					</Typography>
				</Box>

				<Box sx={{ mt: 1.15 }}>
					<Stack direction="row" alignItems="baseline" spacing={0.8}>
						<Typography
							sx={{
								fontWeight: 1000,
								fontSize: 12.8,
								color: "rgba(241,245,249,.92)",
							}}
						>
							{idr(row.collected)}
						</Typography>
						<Typography
							sx={{
								fontWeight: 800,
								fontSize: 12,
								color: "rgba(226,232,240,.55)",
							}}
						>
							/ {idr(row.target || 0)}
						</Typography>
						<Box sx={{ flex: 1 }} />
						<Typography
							sx={{
								fontWeight: 1000,
								fontSize: 12,
								color: "rgba(241,245,249,.86)",
							}}
						>
							{progress}%
						</Typography>
					</Stack>

					<LinearProgress
						variant="determinate"
						value={progress}
						sx={{
							mt: 0.75,
							height: 8,
							borderRadius: 999,
							bgcolor: "rgba(255,255,255,.10)",
							"& .MuiLinearProgress-bar": {
								borderRadius: 999,
								background: `linear-gradient(90deg, ${BRAND}, rgba(97,206,112,.50))`,
								boxShadow: "0 10px 18px rgba(97,206,112,.18)",
							},
						}}
					/>
				</Box>

				<Divider sx={{ my: 1.25, borderColor: "rgba(255,255,255,.08)" }} />

				<Stack direction="row" alignItems="center" spacing={1}>
					<AvatarGroup
						max={4}
						sx={{
							"& .MuiAvatar-root": {
								width: 26,
								height: 26,
								fontSize: 11,
								border: "1px solid rgba(255,255,255,.10)",
								bgcolor: "rgba(2,6,23,.55)",
								color: "rgba(241,245,249,.92)",
							},
						}}
					>
						<Avatar>R</Avatar>
						<Avatar>B</Avatar>
						<Avatar>N</Avatar>
						<Avatar>A</Avatar>
					</AvatarGroup>

					<Typography sx={{ fontSize: 12, color: "rgba(226,232,240,.62)" }}>
						{row.donors} donatur
					</Typography>

					<Box sx={{ flex: 1 }} />

					<ButtonBase
						component={Link}
						href={`/admin/campaign/${row.id}`}
						sx={{
							height: 34,
							px: 1.4,
							borderRadius: 2,
							fontWeight: 1000,
							fontSize: 12.5,
							color: "#08120b",
							bgcolor: BRAND,
							boxShadow: "0 12px 28px rgba(97,206,112,.22)",
							transition: "transform 120ms ease",
							"&:active": { transform: "scale(.99)" },
						}}
					>
						Detail
					</ButtonBase>
				</Stack>
			</Box>
		</Paper>
	);
}
