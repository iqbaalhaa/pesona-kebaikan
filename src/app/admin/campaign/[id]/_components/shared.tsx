"use client";

import * as React from "react";
import {
	Box,
	Paper,
	Typography,
	Stack,
	Chip,
	Button,
	IconButton,
	Tooltip,
	Checkbox,
	FormControlLabel,
	Avatar,
	useTheme,
	alpha,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Divider,
	TableRow,
	TableCell,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

// ---- Types ----

export type CampaignStatus = "draft" | "review" | "active" | "ended" | "rejected" | "pending" | "paused";
export type CampaignType = "sakit" | "lainnya";
export type DocKey = "cover" | "ktp" | "resume_medis" | "surat_rs" | "pendukung";

export type DocItem = {
	key: DocKey;
	title: string;
	required: boolean;
	help?: string;
	uploaded: boolean;
	filename?: string;
	previewUrl?: string;
	updatedAt?: string;
};

export type AuditEvent = {
	id: string;
	at: string;
	title: string;
	meta?: string;
	tone?: "neutral" | "success" | "warning" | "error" | "info";
};

export type TxStatus = "paid" | "pending" | "failed" | "refunded";
export type PayMethod = "qris" | "va_bca" | "va_bri" | "gopay" | "manual";

export type TxRow = {
	id: string;
	createdAt: string;
	campaignId: string;
	campaignTitle: string;
	donorName: string;
	donorPhone: string;
	donorEmail: string;
	message: string;
	isAnonymous: boolean;
	allowContact: boolean;
	amount: number;
	method: PayMethod;
	status: TxStatus;
	refCode: string;
	account: { name: string; email: string; phone: string } | null;
};

// ---- Helpers ----

export function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function pct(collected: number, target: number) {
	if (!target || target <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((collected / target) * 100)));
}

export function statusMeta(status: TxStatus) {
	switch (status) {
		case "paid": return { label: "Berhasil", icon: <CheckCircleRoundedIcon fontSize="small" />, tone: "success" as const };
		case "pending": return { label: "Pending", icon: <HourglassBottomRoundedIcon fontSize="small" />, tone: "warning" as const };
		case "failed": return { label: "Gagal", icon: <ErrorRoundedIcon fontSize="small" />, tone: "error" as const };
		case "refunded": return { label: "Refund", icon: <ErrorRoundedIcon fontSize="small" />, tone: "info" as const };
	}
}

export function methodLabel(m: PayMethod) {
	switch (m) {
		case "qris": return "QRIS";
		case "va_bca": return "VA BCA";
		case "va_bri": return "VA BRI";
		case "gopay": return "GoPay";
		case "manual": return "Manual";
	}
}

export function fieldSx(theme: any) {
	return {
		"& .MuiOutlinedInput-root": {
			borderRadius: 2.5,
			bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.22 : 1),
		},
		"& .MuiInputBase-input": { fontSize: 13.5 },
	};
}

export const shellSx = {
	borderRadius: 3,
	border: "1px solid",
	borderColor: "divider",
	bgcolor: "background.paper",
};

// ---- UI Components ----

export function SegTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
	const theme = useTheme();
	return (
		<Box
			component="button"
			onClick={onClick}
			sx={{
				px: 1.5, py: 0.75, fontSize: 13, fontWeight: active ? 900 : 700,
				color: active ? theme.palette.primary.main : theme.palette.text.secondary,
				borderBottom: active ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
				background: "none", border: "none", borderBottomStyle: "solid",
				cursor: "pointer", whiteSpace: "nowrap", transition: "all 140ms ease",
				"&:hover": { color: theme.palette.primary.main },
			}}
		>
			{label}
		</Box>
	);
}

export function InfoRow({ k, v }: { k: string; v: string }) {
	return (
		<Box sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
			<Typography sx={{ width: 120, fontSize: 12.5, color: "text.secondary" }}>{k}</Typography>
			<Typography sx={{ fontSize: 12.5, fontWeight: 900 }}>{v}</Typography>
		</Box>
	);
}

export function MiniStat({ label, value, avatar }: { label: string; value: string; avatar?: string }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75 }}>
			{avatar && <Avatar src={avatar} sx={{ width: 36, height: 36 }} />}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 700 }}>{label}</Typography>
				<Typography sx={{ mt: 0.2, fontSize: 12.5, fontWeight: 900 }} className="line-clamp-2">{value}</Typography>
			</Box>
		</Box>
	);
}

export function VerifyItem({ label, checked, onChange, hint, readOnly }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string; readOnly?: boolean }) {
	return (
		<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 0.25 }}>
			<FormControlLabel
				control={
					<Checkbox
						checked={checked}
						onChange={readOnly ? undefined : (e) => onChange(e.target.checked)}
						disabled={readOnly}
						sx={readOnly ? { pointerEvents: "none" } : undefined}
					/>
				}
				label={
					<Box>
						<Typography sx={{ fontSize: 13, fontWeight: 900 }}>{label}</Typography>
						{hint && <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{hint}</Typography>}
					</Box>
				}
				sx={{ m: 0 }}
			/>
		</Box>
	);
}

export function FormBlock({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<Box sx={{ mt: 2 }}>
			<Typography sx={{ fontWeight: 1000, fontSize: 13.5 }}>{label}</Typography>
			<Box sx={{ mt: 1 }}>{children}</Box>
		</Box>
	);
}

export function DocRow({ doc, onUpload, onPreview, onRemove }: { doc: DocItem; onUpload: (file?: File | null) => void; onPreview: () => void; onRemove: () => void }) {
	const theme = useTheme();
	const id = `file-${doc.key}`;
	const badgeColor = doc.uploaded ? theme.palette.success.main : theme.palette.warning.main;

	return (
		<Paper variant="outlined" sx={{ borderRadius: 2.5, p: 1, border: "none", bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.2 : 1) }}>
			<input id={id} type="file" hidden accept="image/*,.pdf" onChange={(e) => onUpload(e.target.files?.[0] ?? null)} />
			<Stack direction="row" spacing={1} alignItems="center">
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
						<Typography sx={{ fontSize: 13, fontWeight: 1000 }} className="line-clamp-1">{doc.title}</Typography>
						{doc.required && (
							<Chip size="small" label="Required" variant="outlined" sx={{ borderRadius: 999, fontWeight: 900, height: 22, borderColor: alpha(theme.palette.divider, 1), color: "text.secondary" }} />
						)}
						<Chip size="small" label={doc.uploaded ? "Uploaded" : "Belum"} variant="outlined" sx={{ borderRadius: 999, fontWeight: 900, height: 22, borderColor: alpha(badgeColor, 0.28), bgcolor: alpha(badgeColor, theme.palette.mode === "dark" ? 0.16 : 0.08), color: badgeColor }} />
					</Stack>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }} className="line-clamp-1">
						{doc.uploaded ? <>{doc.filename} {doc.updatedAt ? `• ${doc.updatedAt}` : ""}</> : doc.help || "—"}
					</Typography>
				</Box>
				{doc.uploaded ? (
					<Stack direction="row" spacing={1}>
						<Button variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={onPreview} disabled={!doc.previewUrl} sx={{ borderRadius: 999, fontWeight: 900 }}>Preview</Button>
						<Tooltip title="Hapus dokumen"><IconButton onClick={onRemove} sx={{ borderRadius: 2 }}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip>
					</Stack>
				) : (
					<Button component="label" htmlFor={id} variant="outlined" startIcon={<UploadFileRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 900 }}>Upload</Button>
				)}
			</Stack>
		</Paper>
	);
}

export function TimelineRow({ event }: { event: AuditEvent }) {
	const theme = useTheme();
	const tone = event.tone ?? "neutral";
	const c = tone === "success" ? theme.palette.success.main : tone === "warning" ? theme.palette.warning.main : tone === "error" ? theme.palette.error.main : tone === "info" ? theme.palette.info.main : theme.palette.text.secondary;

	return (
		<Paper variant="outlined" sx={{ borderRadius: 2.5, p: 1, border: "none", bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.2 : 1) }}>
			<Stack direction="row" spacing={1} alignItems="baseline">
				<Typography sx={{ fontSize: 12, color: "text.secondary", minWidth: 72 }}>{event.at}</Typography>
				<Box sx={{ flex: 1 }}>
					<Typography sx={{ fontSize: 13, fontWeight: 1000 }}>{event.title}</Typography>
					{event.meta && <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{event.meta}</Typography>}
				</Box>
				<Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: c, boxShadow: `0 0 0 3px ${alpha(c, theme.palette.mode === "dark" ? 0.18 : 0.12)}` }} />
			</Stack>
		</Paper>
	);
}

export function TxTableRow({ row }: { row: TxRow }) {
	const meta = statusMeta(row.status);
	const [open, setOpen] = React.useState(false);

	return (
		<>
			<TableRow
				hover
				onClick={() => setOpen(true)}
				sx={{ cursor: "pointer" }}
			>
				<TableCell>
					<Typography sx={{ fontSize: 13, fontWeight: 800 }}>
						{row.donorName}
						{row.isAnonymous && (
							<Typography component="span" sx={{ fontSize: 10.5, color: "text.secondary", fontWeight: 700, ml: 0.5 }}>
								(anonim)
							</Typography>
						)}
					</Typography>
				</TableCell>
				<TableCell>
					<Typography sx={{ fontSize: 13, fontWeight: 800 }}>{idr(row.amount)}</Typography>
				</TableCell>
				<TableCell>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{row.createdAt}</Typography>
				</TableCell>
				<TableCell>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{methodLabel(row.method)}</Typography>
				</TableCell>
				<TableCell align="right">
					<Chip
						icon={meta.icon}
						label={meta.label}
						size="small"
						color={meta.tone}
						sx={{ fontWeight: 800 }}
					/>
				</TableCell>
			</TableRow>

			<Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 1000, fontSize: 15 }}>
					Detail Transaksi
					<IconButton size="small" onClick={() => setOpen(false)}>
						<CloseRoundedIcon fontSize="small" />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={1.5}>
						<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<Typography sx={{ fontSize: 20, fontWeight: 1000 }}>{idr(row.amount)}</Typography>
							<Chip
								label={meta.label}
								size="small"
								color={meta.tone}
								sx={{ fontWeight: 800 }}
							/>
						</Box>

						<Divider />

						<Stack spacing={0.75}>
							<InfoRow k="Donatur" v={row.donorName} />
							<InfoRow k="No. HP" v={row.donorPhone && row.donorPhone !== "-" ? row.donorPhone : "-"} />
							<InfoRow k="Email" v={row.donorEmail && row.donorEmail !== "-" ? row.donorEmail : "-"} />
							<InfoRow k="Anonim" v={row.isAnonymous ? "Ya (tampil samar di publik)" : "Tidak"} />
							<InfoRow k="Izin dihubungi" v={row.allowContact ? "Ya" : "Tidak"} />
						</Stack>

						{row.account && (
							<>
								<Divider />
								<Stack spacing={0.75}>
									<Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "text.secondary" }}>
										AKUN TERDAFTAR
									</Typography>
									<InfoRow k="Nama Akun" v={row.account.name} />
									<InfoRow k="Email Akun" v={row.account.email} />
									<InfoRow k="HP Akun" v={row.account.phone && row.account.phone !== "-" ? row.account.phone : "-"} />
								</Stack>
							</>
						)}

						<Divider />

						<Stack spacing={0.75}>
							<InfoRow k="Campaign" v={row.campaignTitle} />
							<InfoRow k="Metode" v={methodLabel(row.method)} />
							<InfoRow k="Kode Ref" v={row.refCode} />
							<InfoRow k="Waktu" v={row.createdAt} />
						</Stack>

						{row.message && row.message !== "-" && (
							<>
								<Divider />
								<Stack spacing={0.5}>
									<Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "text.secondary" }}>
										PESAN
									</Typography>
									<Typography sx={{ fontSize: 13, fontStyle: "italic" }}>
										"{row.message}"
									</Typography>
								</Stack>
							</>
						)}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Tutup</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
