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
	Skeleton,
	Tooltip,
	Button,
	Avatar,
	AvatarGroup,
	Divider,
	Pagination,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
	getCampaigns,
	updateCampaignStatus,
	deleteCampaign,
} from "@/actions/campaign";

const PAGE_SIZE = 9;

type CampaignStatus =
	| "draft"
	| "review"
	| "active"
	| "ended"
	| "rejected"
	| "pending";
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
	thumbnail?: string;
};

// Removed MOCK

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
	switch (status) {
		case "draft":
			return {
				label: "Draft",
				sx: {
					bgcolor: "rgba(15,23,42,.06)",
					borderColor: "rgba(15,23,42,.10)",
					color: "rgba(15,23,42,.70)",
				},
			};
		case "pending":
			return {
				label: "Pending",
				sx: {
					bgcolor: "rgba(245,158,11,.12)",
					borderColor: "rgba(245,158,11,.22)",
					color: "rgba(180,83,9,.95)",
				},
			};
		case "review":
			return {
				label: "Review",
				sx: {
					bgcolor: "rgba(245,158,11,.12)",
					borderColor: "rgba(245,158,11,.22)",
					color: "rgba(180,83,9,.95)",
				},
			};
		case "active":
			return {
				label: "Aktif",
				sx: {
					bgcolor: "rgba(34,197,94,.12)",
					borderColor: "rgba(34,197,94,.22)",
					color: "rgba(22,101,52,.95)",
				},
			};
		case "ended":
			return {
				label: "Berakhir",
				sx: {
					bgcolor: "rgba(59,130,246,.12)",
					borderColor: "rgba(59,130,246,.22)",
					color: "rgba(30,64,175,.95)",
				},
			};
		case "rejected":
			return {
				label: "Ditolak",
				sx: {
					bgcolor: "rgba(239,68,68,.12)",
					borderColor: "rgba(239,68,68,.22)",
					color: "rgba(153,27,27,.95)",
				},
			};
	}
}

const FILTERS: { key: "all" | CampaignStatus; label: string }[] = [
	{ key: "all", label: "Semua" },
	{ key: "pending", label: "Pending" },
	{ key: "active", label: "Aktif" },
	{ key: "draft", label: "Draft" },
	{ key: "ended", label: "Berakhir" },
	{ key: "rejected", label: "Ditolak" },
];

export default function AdminCampaignPage() {
	const [rows, setRows] = React.useState<CampaignRow[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [page, setPage] = React.useState(1);
	const [totalPages, setTotalPages] = React.useState(1);
	const [totalRows, setTotalRows] = React.useState(0);

	const [q, setQ] = React.useState("");
	const [filter, setFilter] = React.useState<"all" | CampaignStatus>("all");

	const [menu, setMenu] = React.useState<{
		anchor: HTMLElement | null;
		row?: CampaignRow;
	}>({ anchor: null });

	const fetchCampaigns = React.useCallback(async () => {
		setLoading(true);
		try {
			const res = await getCampaigns(page, PAGE_SIZE, filter, q);
			if (res.success && res.data) {
				setRows(res.data as any);
				setTotalPages(res.totalPages || 1);
				setTotalRows(res.total || 0);
			}
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	}, [page, filter, q]);

	React.useEffect(() => {
		const t = setTimeout(() => {
			fetchCampaigns();
		}, 450);
		return () => clearTimeout(t);
	}, [fetchCampaigns]);

	const openMenu = (e: React.MouseEvent<HTMLElement>, row: CampaignRow) =>
		setMenu({ anchor: e.currentTarget, row });
	const closeMenu = () => setMenu({ anchor: null, row: undefined });

	const onEnd = async (id: string) => {
		if (confirm("Apakah anda yakin ingin mengakhiri campaign ini?")) {
			await updateCampaignStatus(id, "ENDED");
			fetchCampaigns();
		}
	};

	const onDelete = async (id: string) => {
		if (confirm("Apakah anda yakin ingin menghapus campaign ini?")) {
			const res = await deleteCampaign(id);
			if (res.success) {
				fetchCampaigns();
			} else {
				alert(
					"Gagal menghapus campaign: " + (res.error || "Terjadi kesalahan")
				);
			}
		}
	};

	const onVerify = async (id: string) => {
		if (confirm("Verifikasi campaign ini agar aktif?")) {
			await updateCampaignStatus(id, "ACTIVE");
			fetchCampaigns();
		}
	};

	const onRefresh = () => {
		fetchCampaigns();
	};

	return (
		<Box>
			{/* Top area (premium panel) */}
			<Paper
				elevation={0}
				sx={{
					borderRadius: 3,
					border: "1px solid rgba(15,23,42,.10)",
					bgcolor: "#fff",
					overflow: "hidden",
				}}
			>
				<Box
					sx={{
						p: 2,
						background:
							"radial-gradient(900px 380px at 0% 0%, rgba(97,206,112,.18), transparent 55%), radial-gradient(900px 380px at 100% 0%, rgba(59,130,246,.12), transparent 55%)",
					}}
				>
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={1.5}
						alignItems={{ xs: "stretch", md: "center" }}
						justifyContent="space-between"
					>
						<Box>
							<Typography
								sx={{ fontWeight: 1000, fontSize: 20, color: "#0f172a" }}
							>
								Campaign
							</Typography>
							<Typography
								sx={{ mt: 0.25, fontSize: 12.5, color: "rgba(15,23,42,.62)" }}
							>
								Monitor & kelola campaign yang terdaftar.
							</Typography>

							<Stack
								direction="row"
								spacing={1}
								sx={{ mt: 1.25 }}
								alignItems="center"
							>
								<Chip
									label={`${rows.length} hasil`}
									variant="outlined"
									sx={{
										borderRadius: 999,
										fontWeight: 900,
										bgcolor: "rgba(255,255,255,.55)",
										borderColor: "rgba(15,23,42,.12)",
										color: "rgba(15,23,42,.75)",
									}}
								/>
								<Chip
									label={`Total: ${totalRows}`}
									variant="outlined"
									sx={{
										borderRadius: 999,
										fontWeight: 900,
										bgcolor: "rgba(255,255,255,.55)",
										borderColor: "rgba(15,23,42,.12)",
										color: "rgba(15,23,42,.75)",
									}}
								/>
							</Stack>
						</Box>

						<Stack direction="row" spacing={1} alignItems="center">
							<TextField
								size="small"
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Cari campaign, user, kategori, ID…"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchRoundedIcon
												fontSize="small"
												style={{ color: "rgba(15,23,42,.45)" }}
											/>
										</InputAdornment>
									),
								}}
								sx={{
									width: { xs: "100%", md: 360 },
									"& .MuiOutlinedInput-root": {
										borderRadius: 999,
										bgcolor: "rgba(255,255,255,.70)",
										border: "1px solid rgba(15,23,42,.10)",
										boxShadow: "0 12px 30px rgba(15,23,42,.06)",
										"& fieldset": { border: "none" },
									},
									"& .MuiOutlinedInput-input": { fontSize: 13.5 },
								}}
							/>

							<Tooltip title="Refresh">
								<IconButton
									onClick={onRefresh}
									sx={{
										width: 40,
										height: 40,
										borderRadius: 999,
										bgcolor: "rgba(255,255,255,.70)",
										border: "1px solid rgba(15,23,42,.10)",
										boxShadow: "0 12px 30px rgba(15,23,42,.06)",
									}}
								>
									<RefreshRoundedIcon fontSize="small" />
								</IconButton>
							</Tooltip>

							<Button
								component={Link}
								href="/admin/campaign/create"
								variant="contained"
								startIcon={<AddRoundedIcon />}
								sx={{
									borderRadius: 999,
									fontWeight: 1000,
									textTransform: "none",
									px: 2,
									boxShadow: "0 14px 34px rgba(97,206,112,.22)",
									bgcolor: "#61ce70",
									"&:hover": { bgcolor: "#55bf64" },
								}}
							>
								Buat
							</Button>
						</Stack>
					</Stack>

					<Divider sx={{ mt: 2, borderColor: "rgba(15,23,42,.08)" }} />

					{/* Filter chips */}
					<Box
						sx={{
							mt: 1.5,
							display: "flex",
							gap: 1,
							overflowX: "auto",
							pb: 0.5,
							"&::-webkit-scrollbar": { display: "none" },
						}}
					>
						<Chip
							icon={<CategoryRoundedIcon />}
							label="Filter"
							variant="outlined"
							sx={{
								borderRadius: 999,
								bgcolor: "rgba(255,255,255,.55)",
								borderColor: "rgba(15,23,42,.12)",
								color: "rgba(15,23,42,.70)",
								fontWeight: 900,
							}}
						/>
						{FILTERS.map((f) => {
							const selected = filter === f.key;
							// const n = counts[f.key] ?? 0;

							return (
								<Chip
									key={f.key}
									clickable
									onClick={() => setFilter(f.key)}
									label={
										<Stack direction="row" spacing={1} alignItems="center">
											<Typography sx={{ fontSize: 12.5, fontWeight: 900 }}>
												{f.label}
											</Typography>
											{/* <Box
												sx={{
													minWidth: 26,
													height: 20,
													px: 0.9,
													borderRadius: 999,
													display: "grid",
													placeItems: "center",
													fontSize: 11,
													fontWeight: 1000,
													bgcolor: selected
														? "rgba(255,255,255,.22)"
														: "rgba(15,23,42,.08)",
													color: selected ? "#fff" : "rgba(15,23,42,.65)",
												}}
											>
												{n}
											</Box> */}
										</Stack>
									}
									variant={selected ? "filled" : "outlined"}
									sx={{
										borderRadius: 999,
										fontWeight: 900,
										borderColor: selected
											? "rgba(97,206,112,.60)"
											: "rgba(15,23,42,.12)",
										bgcolor: selected ? "#61ce70" : "rgba(255,255,255,.55)",
										color: selected ? "#fff" : "rgba(15,23,42,.70)",
										boxShadow: selected
											? "0 14px 28px rgba(97,206,112,.20)"
											: "none",
										"&:hover": {
											bgcolor: selected ? "#55bf64" : "rgba(255,255,255,.72)",
										},
									}}
								/>
							);
						})}
					</Box>
				</Box>
			</Paper>

			{/* Grid cards */}
			<Box
				sx={{
					mt: 2,
					display: "grid",
					gap: 2,
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
									border: "1px solid rgba(15,23,42,.10)",
									bgcolor: "#fff",
									p: 2,
								}}
							>
								<Stack direction="row" spacing={1.25} alignItems="center">
									<Skeleton variant="rounded" width={42} height={42} />
									<Box sx={{ flex: 1 }}>
										<Skeleton width="85%" />
										<Skeleton width="60%" />
									</Box>
									<Skeleton variant="rounded" width={36} height={36} />
								</Stack>
								<Box sx={{ mt: 1.5 }}>
									<Skeleton width="45%" />
									<Skeleton width="90%" />
									<Skeleton width="70%" />
								</Box>
							</Paper>
					  ))
					: rows.map((row) => (
							<CampaignCard key={row.id} row={row} onMenu={openMenu} />
					  ))}
			</Box>

			{/* Pagination */}
			<Box sx={{ mt: 3.5, display: "flex", justifyContent: "center" }}>
				<Pagination
					count={totalPages}
					page={page}
					onChange={(_, p) => setPage(p)}
					shape="rounded"
					sx={{
						"& .MuiPaginationItem-root": {
							borderRadius: 2,
							fontWeight: 900,
							color: "rgba(15,23,42,.70)",
						},
						"& .Mui-selected": {
							bgcolor: "rgba(97,206,112,.20) !important",
							color: "rgba(15,23,42,.90) !important",
							border: "1px solid rgba(97,206,112,.45)",
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
					elevation: 0,
					sx: {
						borderRadius: 3,
						border: "1px solid rgba(15,23,42,.10)",
						bgcolor: "#fff",
						boxShadow: "0 18px 60px rgba(15,23,42,.18)",
						minWidth: 200,
						overflow: "hidden",
					},
				}}
			>
				<MenuItem
					component={Link}
					href={`/admin/campaign/${menu.row?.id ?? ""}`}
					onClick={closeMenu}
					sx={{ py: 1.2 }}
				>
					<VisibilityRoundedIcon
						fontSize="small"
						style={{ marginRight: 10, opacity: 0.65 }}
					/>
					<Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>
						Detail
					</Typography>
				</MenuItem>

				<MenuItem
					component={Link}
					href={`/admin/campaign/${menu.row?.id ?? ""}/edit`}
					onClick={closeMenu}
					sx={{ py: 1.2 }}
				>
					<EditRoundedIcon
						fontSize="small"
						style={{ marginRight: 10, opacity: 0.65 }}
					/>
					<Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>Edit</Typography>
				</MenuItem>

				{menu.row?.status === "pending" || menu.row?.status === "review" ? (
					<MenuItem
						onClick={() => {
							const id = menu.row!.id;
							closeMenu();
							onVerify(id);
						}}
						sx={{ py: 1.2 }}
					>
						<VerifiedRoundedIcon
							fontSize="small"
							style={{ marginRight: 10, opacity: 0.65 }}
						/>
						<Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>
							Verifikasi
						</Typography>
					</MenuItem>
				) : null}

				{menu.row?.status === "active" ? (
					<MenuItem
						onClick={() => {
							const id = menu.row!.id;
							closeMenu();
							onEnd(id);
						}}
						sx={{ py: 1.2, color: "#b91c1c" }}
					>
						<StopCircleRoundedIcon
							fontSize="small"
							style={{ marginRight: 10, opacity: 0.85 }}
						/>
						<Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
							Akhiri
						</Typography>
					</MenuItem>
				) : null}

				<MenuItem
					onClick={() => {
						const id = menu.row!.id;
						closeMenu();
						onDelete(id);
					}}
					sx={{ py: 1.2, color: "#ef4444" }}
				>
					<DeleteRoundedIcon
						fontSize="small"
						style={{ marginRight: 10, opacity: 0.85 }}
					/>
					<Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
						Hapus
					</Typography>
				</MenuItem>
			</Menu>
		</Box>
	);
}

function CampaignCard({
	row,
	onMenu,
}: {
	row: CampaignRow;
	onMenu: (e: React.MouseEvent<HTMLElement>, r: CampaignRow) => void;
}) {
	const [imgError, setImgError] = React.useState(false);
	const progress = pct(row.collected, row.target);
	const status = statusChip(row.status);

	const typeMeta =
		row.type === "sakit"
			? {
					icon: <LocalHospitalRoundedIcon fontSize="small" />,
					label: "Medis",
					pillBg: "rgba(56,189,248,.12)",
					pillBorder: "rgba(56,189,248,.22)",
					pillText: "rgba(2,132,199,.95)",
					glow: "rgba(56,189,248,.18)",
			  }
			: {
					icon: <CategoryRoundedIcon fontSize="small" />,
					label: "Lainnya",
					pillBg: "rgba(97,206,112,.14)",
					pillBorder: "rgba(97,206,112,.26)",
					pillText: "rgba(22,101,52,.95)",
					glow: "rgba(97,206,112,.18)",
			  };

	const initials = (name: string) => {
		const s = (name || "").trim();
		if (!s || s === "—") return "—";
		const parts = s.split(/\s+/).slice(0, 2);
		return parts.map((p) => p[0]?.toUpperCase()).join("");
	};

	return (
		<Paper
			elevation={0}
			sx={{
				position: "relative",
				borderRadius: 3,
				overflow: "hidden",
				bgcolor: "#fff",
				border: "1px solid rgba(15,23,42,.10)",
				boxShadow: "0 14px 34px rgba(15,23,42,.08)",
				transition:
					"transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
				"&:hover": {
					transform: "translateY(-2px)",
					boxShadow: "0 24px 70px rgba(15,23,42,.12)",
					borderColor: "rgba(97,206,112,.45)",
				},
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					pointerEvents: "none",
					boxShadow: "inset 0 1px 0 rgba(255,255,255,.9)",
				},
			}}
		>
			<Box
				sx={{
					position: "absolute",
					inset: 0,
					pointerEvents: "none",
					background: `radial-gradient(520px 260px at 80% 0%, ${typeMeta.glow}, transparent 58%)`,
				}}
			/>

			<Box sx={{ position: "relative", p: 2 }}>
				<Stack direction="row" spacing={1.25} alignItems="flex-start">
					{row.thumbnail && !imgError ? (
						<Box
							component="img"
							src={row.thumbnail}
							alt={row.title}
							onError={() => setImgError(true)}
							sx={{
								width: 50,
								height: 50,
								borderRadius: 2.2,
								objectFit: "cover",
								flexShrink: 0,
								bgcolor: "rgba(15,23,42,.04)",
								border: "1px solid rgba(15,23,42,.08)",
							}}
						/>
					) : (
						<Box
							sx={{
								width: 42,
								height: 42,
								borderRadius: 2.2,
								display: "grid",
								placeItems: "center",
								flexShrink: 0,
								bgcolor: "rgba(15,23,42,.04)",
								border: "1px solid rgba(15,23,42,.08)",
								color: "rgba(15,23,42,.72)",
							}}
						>
							{typeMeta.icon}
						</Box>
					)}

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							sx={{
								fontWeight: 1000,
								fontSize: 14,
								lineHeight: 1.25,
								color: "#0f172a",
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
								mt: 0.5,
								fontSize: 12.5,
								color: "rgba(15,23,42,.60)",
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
									height: 26,
									borderRadius: 999,
									fontWeight: 1000,
									bgcolor: typeMeta.pillBg,
									borderColor: typeMeta.pillBorder,
									color: typeMeta.pillText,
									"& .MuiChip-label": { px: 1.1, fontSize: 12 },
								}}
							/>
							<Chip
								label={status.label}
								size="small"
								variant="outlined"
								sx={{
									height: 26,
									borderRadius: 999,
									fontWeight: 1000,
									...status.sx,
									"& .MuiChip-label": { px: 1.1, fontSize: 12 },
								}}
							/>
							<Typography sx={{ fontSize: 11.5, color: "rgba(15,23,42,.52)" }}>
								Update{" "}
								<b style={{ color: "rgba(15,23,42,.78)" }}>{row.updatedAt}</b>
							</Typography>
						</Stack>
					</Box>

					<IconButton
						onClick={(e) => onMenu(e, row)}
						sx={{
							width: 36,
							height: 36,
							borderRadius: 2,
							bgcolor: "rgba(255,255,255,.55)",
							border: "1px solid rgba(15,23,42,.10)",
							color: "rgba(15,23,42,.70)",
							"&:hover": { bgcolor: "rgba(255,255,255,.78)" },
						}}
					>
						<MoreHorizRoundedIcon fontSize="small" />
					</IconButton>
				</Stack>

				<Box sx={{ mt: 1.25 }}>
					<Typography sx={{ fontSize: 12.5, color: "rgba(15,23,42,.62)" }}>
						By <b style={{ color: "rgba(15,23,42,.86)" }}>{row.ownerName}</b> •
						ID:{" "}
						<span style={{ fontWeight: 1000, color: "rgba(15,23,42,.78)" }}>
							{row.id}
						</span>
					</Typography>
				</Box>

				<Box sx={{ mt: 1.25 }}>
					<Stack direction="row" alignItems="baseline" spacing={0.8}>
						<Typography
							sx={{ fontWeight: 1000, fontSize: 13.5, color: "#0f172a" }}
						>
							{idr(row.collected)}
						</Typography>
						<Typography
							sx={{
								fontWeight: 900,
								fontSize: 12,
								color: "rgba(15,23,42,.52)",
							}}
						>
							/ {idr(row.target || 0)}
						</Typography>
						<Box sx={{ flex: 1 }} />
						<Typography
							sx={{
								fontWeight: 1000,
								fontSize: 12.5,
								color: "rgba(15,23,42,.82)",
							}}
						>
							{progress}%
						</Typography>
					</Stack>

					<LinearProgress
						variant="determinate"
						value={progress}
						sx={{
							mt: 0.8,
							height: 8,
							borderRadius: 999,
							bgcolor: "rgba(15,23,42,.08)",
							"& .MuiLinearProgress-bar": {
								borderRadius: 999,
								background:
									"linear-gradient(90deg, #61ce70, rgba(97,206,112,.55))",
								boxShadow: "0 14px 30px rgba(97,206,112,.18)",
							},
						}}
					/>
				</Box>

				<Divider sx={{ my: 1.5, borderColor: "rgba(15,23,42,.08)" }} />

				<Stack direction="row" alignItems="center" spacing={1.25}>
					<AvatarGroup
						max={4}
						sx={{
							"& .MuiAvatar-root": {
								width: 28,
								height: 28,
								fontSize: 11,
								fontWeight: 1000,
								bgcolor: "rgba(15,23,42,.06)",
								color: "rgba(15,23,42,.72)",
								border: "1px solid rgba(15,23,42,.10)",
							},
						}}
					>
						<Avatar>{initials(row.ownerName) || "U"}</Avatar>
						<Avatar>R</Avatar>
						<Avatar>B</Avatar>
						<Avatar>N</Avatar>
					</AvatarGroup>

					<Typography sx={{ fontSize: 12.5, color: "rgba(15,23,42,.60)" }}>
						<b style={{ color: "rgba(15,23,42,.82)" }}>{row.donors}</b> donatur
					</Typography>

					<Box sx={{ flex: 1 }} />

					<Button
						component={Link}
						href={`/admin/campaign/${row.id}`}
						variant="contained"
						sx={{
							borderRadius: 999,
							fontWeight: 1000,
							textTransform: "none",
							px: 2,
							py: 0.8,
							bgcolor: "#61ce70",
							boxShadow: "0 16px 34px rgba(97,206,112,.22)",
							"&:hover": { bgcolor: "#55bf64" },
						}}
					>
						Detail
					</Button>
				</Stack>
			</Box>
		</Paper>
	);
}
