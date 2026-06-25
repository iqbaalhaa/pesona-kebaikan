"use client";

import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Image from "next/image";
import type { Campaign } from "./CampaignFormDialog";

export default function VerifyCampaignDialog({
	open,
	data,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	data: Campaign | null;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	const [imgSrc, setImgSrc] = React.useState("/defaultimg.webp");

	React.useEffect(() => {
		if (data) {
			setImgSrc((data.images && data.images[0]) || "/defaultimg.webp");
		}
	}, [data]);

	return (
		<Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
			<DialogTitle className="font-bold">Verifikasi Campaign</DialogTitle>
			<DialogContent className="pt-2">
				{data ? (
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
							<div className="relative h-48 w-full rounded-lg overflow-hidden">
								<Image
									src={imgSrc}
									alt={data.title}
									fill
									unoptimized
									className="object-cover"
									sizes="400px"
									onError={() => setImgSrc("/defaultimg.webp")}
								/>
							</div>
							<div>
								<div className="flex items-start justify-between">
									<Typography variant="h6" className="font-bold">
										{data.title}
									</Typography>
									<Chip
										label={data.status}
										size="small"
										className="font-semibold"
									/>
								</div>
								<div className="mt-2 text-sm text-gray-600">
									{data.description || "Tidak ada deskripsi"}
								</div>
								<div className="mt-3 grid grid-cols-2 gap-3">
									<div className="rounded-lg bg-gray-50 p-3">
										<div className="text-xs text-gray-500">Target</div>
										<div className="text-sm font-semibold">{data.target}</div>
									</div>
									<div className="rounded-lg bg-gray-50 p-3">
										<div className="text-xs text-gray-500">Terkumpul</div>
										<div className="text-sm font-semibold">
											{data.collected}
										</div>
									</div>
								</div>
							</div>
						</div>

						<Grid container spacing={2}>
							<Grid size={{ xs: 12, md: 6 }}>
								<div className="rounded-lg border border-gray-200 p-3">
									<div className="text-xs text-gray-500">Penggalang</div>
									<div className="text-sm font-semibold">{data.creator}</div>
								</div>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<div className="rounded-lg border border-gray-200 p-3">
									<div className="text-xs text-gray-500">Kontak</div>
									<div className="text-sm font-semibold">
										{data.contactPhone || "-"}
									</div>
								</div>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<div className="rounded-lg border border-gray-200 p-3">
									<div className="text-xs text-gray-500">Tanggal</div>
									<div className="text-sm font-semibold">{data.date}</div>
								</div>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<div className="rounded-lg border border-gray-200 p-3">
									<div className="text-xs text-gray-500">Status Saat Ini</div>
									<div className="text-sm font-semibold">{data.status}</div>
								</div>
							</Grid>
						</Grid>
					</div>
				) : null}
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Batal</Button>
				<Button variant="contained" color="success" onClick={onConfirm}>
					Verifikasi
				</Button>
			</DialogActions>
		</Dialog>
	);
}
