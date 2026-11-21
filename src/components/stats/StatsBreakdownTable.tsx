"use client";

import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Typography } from "@mui/material";
import type { BreakdownRow } from "@/lib/campaign-stats";
import { idr } from "@/lib/currency";

export const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : "–");

export default function StatsBreakdownTable({
	rows,
	label,
	renderKey,
}: {
	rows: BreakdownRow[];
	label: string;
	renderKey: (r: BreakdownRow) => React.ReactNode;
}) {
	if (rows.length === 0) {
		return (
			<Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
				Belum ada data.
			</Typography>
		);
	}
	return (
		<TableContainer sx={{ overflowX: "auto" }}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>{label}</TableCell>
						<TableCell align="right">Dilihat</TableCell>
						<TableCell align="right">Klik</TableCell>
						<TableCell align="right">Checkout</TableCell>
						<TableCell align="right">Dibayar</TableCell>
						<TableCell align="right">Konversi</TableCell>
						<TableCell align="right">Terkumpul</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((r) => (
						<TableRow key={`${r.key}|${r.utmContent ?? ""}`}>
							<TableCell sx={{ maxWidth: 240, wordBreak: "break-word" }}>{renderKey(r)}</TableCell>
							<TableCell align="right">{r.views}</TableCell>
							<TableCell align="right">{r.clicks}</TableCell>
							<TableCell align="right">{r.checkouts}</TableCell>
							<TableCell align="right">{r.paid}</TableCell>
							<TableCell align="right">{pct(r.paid, r.views)}</TableCell>
							<TableCell align="right">{idr(r.paidAmount)}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
