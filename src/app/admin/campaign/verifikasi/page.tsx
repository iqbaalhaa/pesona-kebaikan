"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
	Box,
	Paper,
	Typography,
	Stack,
	Chip,
	TextField,
	InputAdornment,
	IconButton,
	Button,
	Divider,
	Skeleton,
	Pagination,
	Tooltip,
	useTheme,
	alpha,
	LinearProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import ThumbDownAltRoundedIcon from "@mui/icons-material/ThumbDownAltRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PhotoRoundedIcon from "@mui/icons-material/PhotoRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import { getCampaigns, updateCampaignStatus } from "@/actions/campaign";

type CampaignType = "sakit" | "lainnya";
type CampaignStatus = "draft" | "review" | "active" | "ended" | "rejected";

type VerifyDocKey = "cover" | "ktp" | "resume_medis" | "surat_rs" | "pendukung";

type CampaignVerifyRow = {
	id: string;
	slug?: string;
	title: string;
	category: string;
	type: CampaignType;
	ownerName: string;
	ownerPhone: string;
	target: number;
	collected: number;
	donors: number;
	status: CampaignStatus; // di page ini fokus "review"
	updatedAt: string;
	thumbnail?: string;

	// ringkasan kelengkapan verifikasi
	docs: Record<VerifyDocKey, boolean>;
	notes?: string; // catatan singkat dari sistem / CS (dummy)
};

const PAGE_SIZE = 9;

function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function pct(collected: number, target: number) {
	if (!target || target <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((collected / target) * 100)));
}
function matchQuery(q: string, row: CampaignVerifyRow) {
	if (!q) return true;
	const s = q.toLowerCase();
	return (
		row.title.toLowerCase().includes(s) ||
		row.category.toLowerCase().includes(s) ||
		row.ownerName.toLowerCase().includes(s) ||
		row.id.toLowerCase().includes(s)
	);
}

type DocRule = {
	key: VerifyDocKey;
	label: string;
	requiredFor: CampaignType | "all";
	icon: React.ReactNode;
};

const DOC_RULES: DocRule[] = [
	{
		key: "cover",
		label: "Cover",
		requiredFor: "all",
		icon: <PhotoRoundedIcon fontSize="small" />,
	},
	{
		key: "ktp",
		label: "KTP",
		requiredFor: "all",
		icon: <BadgeRoundedIcon fontSize="small" />,
	},
	{
		key: "resume_medis",
		label: "Resume",
		requiredFor: "sakit",
		icon: <DescriptionRoundedIcon fontSize="small" />,
	},
	{
		key: "surat_rs",
		label: "Surat RS",
		requiredFor: "sakit",
		icon: <DescriptionRoundedIcon fontSize="small" />,
	},
	{
		key: "pendukung",
		label: "Pendukung",
		requiredFor: "lainnya",
		icon: <DescriptionRoundedIcon fontSize="small" />,
	},
];

function requiredDocsFor(type: CampaignType) {
	return DOC_RULES.filter(
		(d) => d.requiredFor === "all" || d.requiredFor === type
	).map((d) => d.key);
}
function missingRequired(row: CampaignVerifyRow) {
	const req = requiredDocsFor(row.type);
	return req.filter((k) => !row.docs[k]);
}

const FILTERS = [
	{ key: "all", label: "Semua" },
	{ key: "ready", label: "Siap Approve" },
	{ key: "missing", label: "Kurang Dokumen" },
	{ key: "sakit", label: "Medis" },
	{ key: "lainnya", label: "Lainnya" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function AdminCampaignVerifikasiPage() {
	const theme = useTheme();
	const router = useRouter();
	const sp = useSearchParams();
	const preselectId = sp.get("id") ?? "";

	const shellSx = {
		borderRadius: 3,
		// border: "1px solid",
		// borderColor: alpha(theme.palette.divider, 1),
		bgcolor: alpha(
			theme.palette.background.paper,
			theme.palette.mode === "dark" ? 0.92 : 1
		),
		backdropFilter: "blur(10px)",
		boxShadow:
			theme.palette.mode === "dark"
				? "0 4px 20px rgba(0,0,0,0.5)"
				: "0 4px 20px rgba(0,0,0,0.05)",
	};

	const [rows, setRows] = React.useState<CampaignVerifyRow[]>([]);
	const [loading, setLoading] = React.useState(true);

	const [q, setQ] = React.useState("");
	const [filter, setFilter] = React.useState<FilterKey>("all");
	const [page, setPage] = React.useState(1);

	// selection
	const [selectedId, setSelectedId] = React.useState<string>("");

	// confirm approve/reject (dummy)
	const [confirm, setConfirm] = React.useState<{
		open: boolean;
		mode?: "approve" | "reject";
		row?: CampaignVerifyRow;
	}>({ open: false });

	const fetchCampaigns = async () => {
		setLoading(true);
		const res = await getCampaigns(1, 100, "PENDING");
		if (res.success && res.data) {
			const mapped: CampaignVerifyRow[] = res.data.map((c: any) => ({
				id: c.id,
				title: c.title,
				category: c.category,
				type: c.type,
				ownerName: c.ownerName,
				ownerPhone: "-",
				target: c.target,
				collected: c.collected,
				donors: c.donors,
				status: "review",
				updatedAt: c.updatedAt,
				docs: {
					cover: !!c.thumbnail,
					ktp: false,
					resume_medis: false,
					surat_rs: false,
					pendukung: false,
				},
				notes: "",
			}));
			setRows(mapped);
		}
		setLoading(false);
	};

	React.useEffect(() => {
		fetchCampaigns();
	}, []);

	React.useEffect(() => {
		// preselect via query param (?id=cmp-001)
		if (!preselectId) return;
		setSelectedId(preselectId);
	}, [preselectId]);

	React.useEffect(() => {
		// default select first result
		if (loading) return;
		if (selectedId) return;
		if (rows.length) setSelectedId(rows[0].id);
	}, [loading, rows, selectedId]);

	const counts = React.useMemo(() => {
		const all = rows.length;
		const ready = rows.filter((r) => missingRequired(r).length === 0).length;
		const missing = rows.filter((r) => missingRequired(r).length > 0).length;
		const sakit = rows.filter((r) => r.type === "sakit").length;
		const lainnya = rows.filter((r) => r.type === "lainnya").length;
		return { all, ready, missing, sakit, lainnya };
	}, [rows]);

	const filtered = React.useMemo(() => {
		let base = rows
			.filter((r) => r.status === "review")
			.filter((r) => matchQuery(q, r));

		if (filter === "ready")
			base = base.filter((r) => missingRequired(r).length === 0);
		if (filter === "missing")
			base = base.filter((r) => missingRequired(r).length > 0);
		if (filter === "sakit") base = base.filter((r) => r.type === "sakit");
		if (filter === "lainnya") base = base.filter((r) => r.type === "lainnya");

		return base;
	}, [rows, q, filter]);

	React.useEffect(() => setPage(1), [q, filter]);

	const paged = React.useMemo(() => {
		const start = (page - 1) * PAGE_SIZE;
		return filtered.slice(start, start + PAGE_SIZE);
	}, [filtered, page]);

	const selected = React.useMemo(
		() => rows.find((r) => r.id === selectedId) ?? filtered[0],
		[rows, selectedId, filtered]
	);

	const onRefresh = () => {
		fetchCampaigns();
	};

	const onApprove = async () => {
		if (!confirm.row) return;
		const res = await updateCampaignStatus(confirm.row.id, "ACTIVE");
		if (res.success) {
			setRows((prev) => prev.filter((x) => x.id !== confirm.row?.id));
			setConfirm({ open: false });
		} else {
			alert("Gagal approve");
		}
	};

	const onReject = async () => {
		if (!confirm.row) return;
		const res = await updateCampaignStatus(confirm.row.id, "REJECTED");
		if (res.success) {
			setRows((prev) => prev.filter((x) => x.id !== confirm.row?.id));
			setConfirm({ open: false });
		} else {
			alert("Gagal reject");
		}
	};

	return (
		<Box sx={{ display: "grid", gap: 2 }}>
			{/* Header */}
			<Paper elevation={0} sx={{ ...shellSx, p: 1.5 }}>
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={1.25}
					alignItems={{ md: "center" }}
				>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography sx={{ fontWeight: 1000, fontSize: 16 }}>
							Verifikasi Campaign
						</Typography>
						<Typography
							sx={{ mt: 0.3, fontSize: 12.5, color: "text.secondary" }}
						>
							Review dokumen & approval untuk campaign yang masuk antrian.
						</Typography>
					</Box>

					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						sx={{ flexWrap: "wrap" }}
					>
						<TextField
							size="small"
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Cari campaign / ID / pemilik…"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchRoundedIcon fontSize="small" />
									</InputAdornment>
								),
							}}
							sx={{
								minWidth: { xs: "100%", sm: 360 },
								"& .MuiOutlinedInput-root": {
									borderRadius: 2.5,
									bgcolor: alpha(
										theme.palette.background.default,
										theme.palette.mode === "dark" ? 0.22 : 1
									),
								},
								"& .MuiInputBase-input": { fontSize: 13.5 },
							}}
						/>

						<Tooltip title="Refresh">
							<IconButton
								onClick={onRefresh}
								sx={{
									borderRadius: 2,
									// border: "1px solid",
									// borderColor: alpha(theme.palette.divider, 1),
									bgcolor: alpha(
										theme.palette.background.default,
										theme.palette.mode === "dark" ? 0.18 : 1
									),
								}}
							>
								<RefreshRoundedIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>

				<Divider sx={{ my: 1.25 }} />

				{/* Filter chips */}
				<Box
					sx={{
						display: "flex",
						gap: 1,
						overflowX: "auto",
						pb: 0.5,
						"&::-webkit-scrollbar": { display: "none" },
					}}
				>
					{FILTERS.map((f) => {
						const active = filter === f.key;
						const n =
							f.key === "all"
								? counts.all
								: f.key === "ready"
								? counts.ready
								: f.key === "missing"
								? counts.missing
								: f.key === "sakit"
								? counts.sakit
								: counts.lainnya;

						return (
							<Chip
								key={f.key}
								clickable
								onClick={() => setFilter(f.key)}
								label={
									<span
										style={{
											display: "inline-flex",
											alignItems: "center",
											gap: 8,
										}}
									>
										{f.label}
										<span
											style={{
												padding: "2px 8px",
												borderRadius: 999,
												fontSize: 11,
												fontWeight: 900,
												background: active
													? alpha(
															theme.palette.primary.main,
															theme.palette.mode === "dark" ? 0.25 : 0.18
													  )
													: alpha(
															theme.palette.text.primary,
															theme.palette.mode === "dark" ? 0.18 : 0.08
													  ),
												color: active
													? theme.palette.primary.main
													: theme.palette.text.secondary,
											}}
										>
											{n}
										</span>
									</span>
								}
								variant="outlined"
								sx={{
									borderRadius: 999,
									fontWeight: 900,
									borderColor: active
										? alpha(theme.palette.primary.main, 0.35)
										: alpha(theme.palette.divider, 1),
									bgcolor: active
										? alpha(
												theme.palette.primary.main,
												theme.palette.mode === "dark" ? 0.16 : 0.08
										  )
										: "transparent",
									color: active
										? theme.palette.primary.main
										: theme.palette.text.secondary,
								}}
							/>
						);
					})}
				</Box>
			</Paper>

			{/* Main split */}
			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
					alignItems: "start",
				}}
			>
				{/* Left list */}
				<Paper elevation={0} sx={{ ...shellSx, p: 1.25 }}>
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						sx={{ mb: 1 }}
					>
						<Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
							Antrian Review
						</Typography>
						<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
							{filtered.length} item
						</Typography>
					</Stack>

					<Divider sx={{ mb: 1.25 }} />

					<Box
						sx={{
							display: "grid",
							gap: 1.25,
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, minmax(0, 1fr))",
							},
						}}
					>
						{loading
							? Array.from({ length: 6 }).map((_, i) => (
									<Paper
										key={i}
										variant="outlined"
										sx={{
											borderRadius: 2.5,
											p: 1.25,
											// borderColor: alpha(theme.palette.divider, 1),
											border: "none",
											bgcolor: alpha(
												theme.palette.background.default,
												theme.palette.mode === "dark" ? 0.2 : 1
											),
										}}
									>
										<Skeleton variant="rounded" height={14} width="85%" />
										<Skeleton
											variant="rounded"
											height={12}
											width="60%"
											sx={{ mt: 1 }}
										/>
										<Skeleton
											variant="rounded"
											height={36}
											width="100%"
											sx={{ mt: 1.25, borderRadius: 2 }}
										/>
									</Paper>
							  ))
							: paged.map((row) => (
									<VerifyCard
										key={row.id}
										row={row}
										selected={row.id === selectedId}
										onClick={() => setSelectedId(row.id)}
									/>
							  ))}
					</Box>

					{/* Pagination */}
					<Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
						<Pagination
							count={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
							page={page}
							onChange={(_, p) => setPage(p)}
							shape="rounded"
							color="primary"
						/>
					</Box>
				</Paper>

				{/* Right detail */}
				<Paper elevation={0} sx={{ ...shellSx, p: 1.25 }}>
					<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
						<VerifiedRoundedIcon fontSize="small" />
						<Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
							Panel Verifikasi
						</Typography>
					</Stack>

					<Divider sx={{ mb: 1.25 }} />

					{!selected ? (
						<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
							Pilih campaign di sebelah kiri untuk mulai review.
						</Typography>
					) : (
						<Box>
							<Stack direction="row" spacing={1} alignItems="flex-start">
								<Box
									sx={{
										width: 44,
										height: 44,
										borderRadius: 2.25,
										overflow: "hidden",
										// border: "1px solid",
										// borderColor: alpha(theme.palette.divider, 1),
										display: "grid",
										placeItems: "center",
										bgcolor: alpha(
											theme.palette.background.default,
											theme.palette.mode === "dark" ? 0.2 : 1
										),
									}}
								>
									{selected.thumbnail ? (
										<Box
											component="img"
											src={selected.thumbnail}
											alt={selected.title}
											sx={{
												width: "100%",
												height: "100%",
												objectFit: "cover",
											}}
										/>
									) : selected.type === "sakit" ? (
										<LocalHospitalRoundedIcon fontSize="small" />
									) : (
										<CategoryRoundedIcon fontSize="small" />
									)}
								</Box>

								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										sx={{ fontWeight: 1000, fontSize: 14 }}
										className="line-clamp-2"
									>
										{selected.title}
									</Typography>
									<Typography
										sx={{ fontSize: 12.5, color: "text.secondary" }}
										className="line-clamp-1"
									>
										{selected.category} • <b>{selected.id}</b>
									</Typography>

									<Stack
										direction="row"
										spacing={1}
										sx={{ mt: 1, flexWrap: "wrap" }}
									>
										<Chip
											size="small"
											label={selected.type === "sakit" ? "Medis" : "Lainnya"}
											variant="outlined"
											sx={(t) => ({
												borderRadius: 999,
												fontWeight: 900,
												borderColor: alpha(
													selected.type === "sakit"
														? t.palette.info.main
														: t.palette.success.main,
													0.25
												),
												bgcolor: alpha(
													selected.type === "sakit"
														? t.palette.info.main
														: t.palette.success.main,
													t.palette.mode === "dark" ? 0.16 : 0.08
												),
												color:
													selected.type === "sakit"
														? t.palette.info.main
														: t.palette.success.main,
											})}
										/>
										<Chip
											size="small"
											label="Review"
											variant="outlined"
											sx={(t) => ({
												borderRadius: 999,
												fontWeight: 900,
												borderColor: alpha(t.palette.warning.main, 0.25),
												bgcolor: alpha(
													t.palette.warning.main,
													t.palette.mode === "dark" ? 0.16 : 0.08
												),
												color: t.palette.warning.main,
											})}
										/>
										<Chip
											size="small"
											label={`Update ${selected.updatedAt}`}
											variant="outlined"
											sx={{
												borderRadius: 999,
												fontWeight: 900,
												color: "text.secondary",
											}}
										/>
									</Stack>
								</Box>
							</Stack>

							<Divider sx={{ my: 1.25 }} />

							{/* Progress */}
							<Box>
								<Stack
									direction="row"
									alignItems="baseline"
									justifyContent="space-between"
								>
									<Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
										{idr(selected.collected)}{" "}
										<Typography
											component="span"
											sx={{ fontWeight: 800, color: "text.secondary" }}
										>
											/ {idr(selected.target)}
										</Typography>
									</Typography>
									<Typography
										sx={{
											fontSize: 12.5,
											color: "text.secondary",
											fontWeight: 900,
										}}
									>
										{pct(selected.collected, selected.target)}%
									</Typography>
								</Stack>

								<LinearProgress
									variant="determinate"
									value={pct(selected.collected, selected.target)}
									sx={{
										mt: 0.75,
										height: 8,
										borderRadius: 999,
										bgcolor: alpha(
											theme.palette.text.primary,
											theme.palette.mode === "dark" ? 0.1 : 0.06
										),
										"& .MuiLinearProgress-bar": { borderRadius: 999 },
									}}
								/>

								<Typography
									sx={{ mt: 0.75, fontSize: 12.5, color: "text.secondary" }}
								>
									<b>{selected.donors}</b> donatur • oleh{" "}
									<b>{selected.ownerName}</b>
								</Typography>
							</Box>

							<Divider sx={{ my: 1.25 }} />

							{/* Doc summary */}
							<Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>
								Kelengkapan Dokumen
							</Typography>

							<Stack
								direction="row"
								spacing={1}
								sx={{ mt: 1, flexWrap: "wrap" }}
							>
								{DOC_RULES.filter(
									(d) =>
										d.requiredFor === "all" || d.requiredFor === selected.type
								).map((d) => {
									const ok = selected.docs[d.key];
									return (
										<Chip
											key={d.key}
											size="small"
											icon={d.icon as any}
											label={d.label}
											variant="outlined"
											sx={(t) => ({
												borderRadius: 999,
												fontWeight: 900,
												borderColor: alpha(
													ok ? t.palette.success.main : t.palette.warning.main,
													0.25
												),
												bgcolor: alpha(
													ok ? t.palette.success.main : t.palette.warning.main,
													t.palette.mode === "dark" ? 0.16 : 0.08
												),
												color: ok
													? t.palette.success.main
													: t.palette.warning.main,
												"& .MuiChip-icon": {
													color: ok
														? t.palette.success.main
														: t.palette.warning.main,
												},
											})}
										/>
									);
								})}
							</Stack>

							{selected.notes ? (
								<Paper
									variant="outlined"
									sx={{
										mt: 1.25,
										borderRadius: 2.5,
										p: 1,
										// borderColor: alpha(theme.palette.warning.main, 0.25),
										border: "none",
										bgcolor: alpha(
											theme.palette.warning.main,
											theme.palette.mode === "dark" ? 0.12 : 0.06
										),
									}}
								>
									<Typography sx={{ fontSize: 12.5, fontWeight: 1000 }}>
										Catatan
									</Typography>
									<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
										{selected.notes}
									</Typography>
								</Paper>
							) : null}

							<Divider sx={{ my: 1.25 }} />

							{/* Actions */}
							<Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
								<Button
									component={Link}
									href={`/admin/campaign/${selected.id}`}
									variant="outlined"
									startIcon={<VisibilityRoundedIcon />}
									sx={{
										borderRadius: 999,
										fontWeight: 900,
										justifyContent: "flex-start",
									}}
								>
									Buka Detail
								</Button>

								<Button
									component={Link}
									href={`/donasi/${selected.slug || selected.id}`}
									target="_blank"
									variant="outlined"
									endIcon={<OpenInNewRoundedIcon />}
									sx={{
										borderRadius: 999,
										fontWeight: 900,
										justifyContent: "flex-start",
									}}
								>
									Lihat Public
								</Button>

								<Box sx={{ flex: 1 }} />

								<Button
									variant="contained"
									startIcon={<ThumbUpAltRoundedIcon />}
									disabled={missingRequired(selected).length > 0}
									onClick={() =>
										setConfirm({ open: true, mode: "approve", row: selected })
									}
									sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
								>
									Approve
								</Button>

								<Button
									variant="outlined"
									color="error"
									startIcon={<ThumbDownAltRoundedIcon />}
									onClick={() =>
										setConfirm({ open: true, mode: "reject", row: selected })
									}
									sx={{ borderRadius: 999, fontWeight: 900 }}
								>
									Reject
								</Button>
							</Stack>

							{missingRequired(selected).length > 0 ? (
								<Typography
									sx={{ mt: 1, fontSize: 12.5, color: "text.secondary" }}
								>
									Approve non-aktif karena dokumen required belum lengkap:{" "}
									<b>{missingRequired(selected).join(", ")}</b>
								</Typography>
							) : (
								<Typography
									sx={{ mt: 1, fontSize: 12.5, color: "text.secondary" }}
								>
									Siap approve (dokumen required lengkap).
								</Typography>
							)}
						</Box>
					)}
				</Paper>
			</Box>

			{/* Confirm Dialog (dummy) */}
			<Dialog
				open={confirm.open}
				onClose={() => setConfirm({ open: false })}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: 1000 }}>
					{confirm.mode === "approve"
						? "Approve campaign?"
						: "Reject campaign?"}
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{confirm.mode === "approve"
							? "Campaign akan dipindahkan dari antrian review. (Dummy)"
							: "Campaign akan ditolak dan dipindahkan dari antrian review. (Dummy)"}
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setConfirm({ open: false })}
						variant="outlined"
						sx={{ borderRadius: 999, fontWeight: 900 }}
					>
						Batal
					</Button>
					<Button
						onClick={() => {
							if (!confirm.row) return;
							if (confirm.mode === "approve") onApprove();
							else onReject();
						}}
						variant="contained"
						color={confirm.mode === "approve" ? "primary" : "error"}
						sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
					>
						{confirm.mode === "approve" ? "Approve" : "Reject"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

function VerifyCard({
	row,
	selected,
	onClick,
}: {
	row: CampaignVerifyRow;
	selected: boolean;
	onClick: () => void;
}) {
	const theme = useTheme();
	const progress = pct(row.collected, row.target);
	const missing = missingRequired(row);
	const ready = missing.length === 0;

	const shell = {
		borderRadius: 2.5,
		// border: "1px solid",
		// borderColor: selected
		// 	? alpha(theme.palette.primary.main, 0.45)
		// 	: alpha(theme.palette.divider, 1),
		border: "none",
		bgcolor: alpha(
			theme.palette.background.default,
			theme.palette.mode === "dark" ? 0.2 : 1
		),
		cursor: "pointer",
		transition: "all 140ms ease",
		"&:hover": {
			// borderColor: alpha(theme.palette.primary.main, selected ? 0.55 : 0.35),
			transform: "translateY(-1px)",
		},
	};

	return (
		<Paper variant="outlined" onClick={onClick} sx={shell}>
			<Box sx={{ p: 1.25 }}>
				<Stack direction="row" spacing={1} alignItems="flex-start">
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: 2.25,
							// border: "1px solid",
							// borderColor: alpha(theme.palette.divider, 1),
							display: "grid",
							placeItems: "center",
							bgcolor: alpha(
								theme.palette.background.paper,
								theme.palette.mode === "dark" ? 0.2 : 1
							),
						}}
					>
						{row.type === "sakit" ? (
							<LocalHospitalRoundedIcon fontSize="small" />
						) : (
							<CategoryRoundedIcon fontSize="small" />
						)}
					</Box>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							sx={{ fontWeight: 1000, fontSize: 13.5 }}
							className="line-clamp-2"
						>
							{row.title}
						</Typography>
						<Typography
							sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}
							className="line-clamp-1"
						>
							{row.category}
						</Typography>

						<Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
							<Chip
								size="small"
								label={row.id}
								variant="outlined"
								sx={{
									borderRadius: 999,
									fontWeight: 900,
									color: "text.secondary",
								}}
							/>
							<Chip
								size="small"
								label={ready ? "Siap" : `Kurang ${missing.length}`}
								variant="outlined"
								sx={(t) => ({
									borderRadius: 999,
									fontWeight: 900,
									borderColor: alpha(
										ready ? t.palette.success.main : t.palette.warning.main,
										0.25
									),
									bgcolor: alpha(
										ready ? t.palette.success.main : t.palette.warning.main,
										t.palette.mode === "dark" ? 0.16 : 0.08
									),
									color: ready
										? t.palette.success.main
										: t.palette.warning.main,
								})}
							/>
						</Stack>
					</Box>
				</Stack>

				<Divider sx={{ my: 1.25 }} />

				<Stack
					direction="row"
					alignItems="baseline"
					justifyContent="space-between"
				>
					<Typography sx={{ fontWeight: 1000, fontSize: 12.5 }}>
						{idr(row.collected)}{" "}
						<Typography
							component="span"
							sx={{ fontWeight: 800, color: "text.secondary" }}
						>
							/ {idr(row.target)}
						</Typography>
					</Typography>
					<Typography
						sx={{ fontSize: 12.5, color: "text.secondary", fontWeight: 900 }}
					>
						{progress}%
					</Typography>
				</Stack>

				<LinearProgress
					variant="determinate"
					value={progress}
					sx={{
						mt: 0.75,
						height: 7,
						borderRadius: 999,
						bgcolor: alpha(
							theme.palette.text.primary,
							theme.palette.mode === "dark" ? 0.1 : 0.06
						),
						"& .MuiLinearProgress-bar": { borderRadius: 999 },
					}}
				/>

				<Typography sx={{ mt: 0.75, fontSize: 12.5, color: "text.secondary" }}>
					Update <b>{row.updatedAt}</b> • oleh <b>{row.ownerName}</b>
				</Typography>
			</Box>
		</Paper>
	);
}
