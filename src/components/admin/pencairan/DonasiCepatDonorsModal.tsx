"use client";

import * as React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Typography,
	Stack,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Pagination,
	CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

import { getCampaignTransactions, getCampaignDonorsExport } from "@/actions/admin";
import { exportDonorsToPDF, exportDonorsToCSV } from "@/lib/export/donationExport";
import { TxTableRow, type TxRow } from "@/app/admin/campaign/[id]/_components/shared";

const PAGE_SIZE = 20;

export default function DonasiCepatDonorsModal({
	open,
	onClose,
	campaignId,
	campaignTitle,
}: {
	open: boolean;
	onClose: () => void;
	campaignId: string;
	campaignTitle: string;
}) {
	const [rows, setRows] = React.useState<TxRow[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [page, setPage] = React.useState(1);
	const [totalPages, setTotalPages] = React.useState(1);
	const [total, setTotal] = React.useState(0);
	const [exporting, setExporting] = React.useState<"pdf" | "csv" | null>(null);
	const [error, setError] = React.useState("");

	const fetchRows = React.useCallback(async () => {
		if (!campaignId) return;
		setLoading(true);
		setError("");
		try {
			const res = await getCampaignTransactions(campaignId, page, PAGE_SIZE);
			if (res.success && res.data) {
				setRows(res.data as unknown as TxRow[]);
				setTotalPages(res.totalPages || 1);
				setTotal(res.total || 0);
			} else {
				setError(res.error || "Gagal mengambil data donatur");
			}
		} catch (e) {
			console.error(e);
			setError("Gagal mengambil data donatur");
		} finally {
			setLoading(false);
		}
	}, [campaignId, page]);

	React.useEffect(() => {
		if (open) setPage(1);
	}, [open, campaignId]);

	React.useEffect(() => {
		if (open) fetchRows();
	}, [open, fetchRows]);

	const handleExport = async (format: "pdf" | "csv") => {
		setExporting(format);
		try {
			const res = await getCampaignDonorsExport(campaignId);
			if (!res.success || !res.data) {
				setError(res.error || "Gagal mengambil data export");
				return;
			}
			if (format === "pdf") await exportDonorsToPDF(res.data as any, campaignTitle);
			else await exportDonorsToCSV(res.data as any, campaignTitle);
		} catch (e) {
			console.error(e);
			setError("Gagal mengekspor data donatur");
		} finally {
			setExporting(null);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
			<DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<Typography sx={{ fontWeight: 900, fontSize: 16 }}>
					Donatur Donasi Cepat
				</Typography>
				<IconButton size="small" onClick={onClose}>
					<CloseRoundedIcon fontSize="small" />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary", fontStyle: "italic" }}>
						Klik baris untuk lihat detail donatur.
					</Typography>
					<Stack direction="row" spacing={1}>
						<Button
							size="small"
							variant="outlined"
							startIcon={<PictureAsPdfRoundedIcon fontSize="small" />}
							disabled={!!exporting || total === 0}
							onClick={() => handleExport("pdf")}
							sx={{ fontWeight: 700, textTransform: "none", whiteSpace: "nowrap" }}
						>
							{exporting === "pdf" ? "Memproses..." : "PDF"}
						</Button>
						<Button
							size="small"
							variant="outlined"
							startIcon={<FileDownloadRoundedIcon fontSize="small" />}
							disabled={!!exporting || total === 0}
							onClick={() => handleExport("csv")}
							sx={{ fontWeight: 700, textTransform: "none", whiteSpace: "nowrap" }}
						>
							{exporting === "csv" ? "Memproses..." : "CSV"}
						</Button>
					</Stack>
				</Stack>

				{loading ? (
					<Stack alignItems="center" sx={{ py: 4 }}>
						<CircularProgress size={24} />
					</Stack>
				) : error ? (
					<Typography sx={{ fontSize: 13, color: "error.main", textAlign: "center", py: 4 }}>
						{error}
					</Typography>
				) : rows.length === 0 ? (
					<Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center", py: 4 }}>
						Belum ada donasi.
					</Typography>
				) : (
					<TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Donatur</TableCell>
									<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Jumlah</TableCell>
									<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Tanggal</TableCell>
									<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Metode</TableCell>
									<TableCell sx={{ fontWeight: 800, fontSize: 12 }} align="right">Status</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<TxTableRow key={row.id} row={row} />
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{!loading && !error && rows.length > 0 && (
					<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
						<Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
							Menampilkan {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + rows.length} dari {total} donasi
						</Typography>
						{totalPages > 1 && (
							<Pagination
								count={totalPages}
								page={page}
								onChange={(_, p) => setPage(p)}
								color="primary"
								shape="rounded"
								size="small"
							/>
						)}
					</Stack>
				)}
			</DialogContent>
		</Dialog>
	);
}
