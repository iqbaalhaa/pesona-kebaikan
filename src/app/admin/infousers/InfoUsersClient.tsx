"use client";

import React from "react";
import * as echarts from "echarts/core";
import { MapChart } from "echarts/charts";
import {
	TooltipComponent,
	VisualMapComponent,
	GeoComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import {
	Box,
	Stack,
	Typography,
	Paper,
	TextField,
	InputAdornment,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Chip,
	IconButton,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TablePagination,
	TableContainer,
	Button,
	Menu,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

echarts.use([
	MapChart,
	TooltipComponent,
	VisualMapComponent,
	GeoComponent,
	CanvasRenderer,
]);

type ProvinceStat = {
	name: string;
	users: number;
	donation: number;
	donationCount: number;
};
type UserInfoRow = {
	id: string;
	name: string | null;
	email: string;
	phone: string | null;
	province: string | null;
	totalDonation: number;
	donationCount: number;
	lastDonationAt: string | null;
};

function fmtIDR(n: number) {
	const v = Math.round(Number(n) || 0);
	return "Rp " + v.toLocaleString("id-ID");
}

function MapIndonesia({
	theme,
	provinceStats,
}: {
	theme: any;
	provinceStats: ProvinceStat[];
}) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const chartRef = React.useRef<echarts.ECharts | null>(null);
	const [mapLoaded, setMapLoaded] = React.useState(false);
	const [featureNames, setFeatureNames] = React.useState<string[]>([]);

	const normalize = (s: string) => {
		const x = s.toLowerCase().trim();
		if (x.includes("daerah khusus")) return "dki jakarta";
		if (x.includes("yogyakarta")) return "di yogyakarta";
		if (x.includes("nanggroe aceh")) return "aceh";
		return x.replace(/^provinsi\s+/, "").replace(/^propinsi\s+/, "");
	};
	const getVal = (name: string) => {
		const n = normalize(name);
		const found =
			provinceStats.find((p) => {
				const pn = normalize(p.name);
				return pn === n || pn.includes(n) || n.includes(pn);
			}) ?? null;
		if (!found) return 0;
		return found.users;
	};

	React.useEffect(() => {
		async function initMap() {
			if (!containerRef.current) return;
			const res = await fetch("/maps/indonesia.json");
			const geojson = await res.json();
			geojson.features.forEach((f: any) => {
				f.properties.name = f.properties.Propinsi;
			});
			echarts.registerMap("Indonesia", geojson as any);
			setFeatureNames(
				Array.isArray(geojson.features)
					? geojson.features.map((f: any) => f.properties?.name ?? "")
					: []
			);
			const chart = echarts.init(containerRef.current);
			chartRef.current = chart;
			setMapLoaded(true);
			const handleResize = () => chart.resize();
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}
		if (!chartRef.current) initMap();
		return () => {
			if (chartRef.current) {
				chartRef.current.dispose();
				chartRef.current = null;
			}
		};
	}, []);

	React.useEffect(() => {
		if (!mapLoaded || !chartRef.current) return;
		const gradientColors = [
			theme.palette.grey[200],
			theme.palette.success.main,
			theme.palette.error.main,
		];
		const featureValues = featureNames.map((n) => getVal(n));
		const positives = featureValues.filter((v) => v > 0);
		const min = positives.length ? Math.min(...positives) : 0;
		const max = featureValues.length ? Math.max(...featureValues) : 0;
		const sorted = positives.slice().sort((a, b) => a - b);
		const pick = (p: number) =>
			sorted.length ? sorted[Math.floor((sorted.length - 1) * p)] : 0;
		const q1 = pick(0.25);
		const q2 = pick(0.5);
		const q3 = pick(0.75);

		const data =
			featureNames.length > 0
				? featureNames.map((n) => ({ name: n, value: getVal(n) }))
				: provinceStats.map((p) => ({ name: p.name, value: p.users }));
		chartRef.current.clear();
		chartRef.current.setOption({
			tooltip: {
				trigger: "item",
				formatter: (params: any) => {
					const v = params.value || 0;
					const n = params.name?.toString() ?? "";
					const norm = (s: string) =>
						s
							.toLowerCase()
							.trim()
							.replace(/^provinsi\s+/, "")
							.replace(/^propinsi\s+/, "")
							.replace("daerah khusus", "dki jakarta")
							.replace("yogyakarta", "di yogyakarta")
							.replace("nanggroe aceh", "aceh");
					const stat =
						provinceStats.find((p) => {
							const pn = norm(p.name);
							const nn = norm(n);
							return pn === nn || pn.includes(nn) || nn.includes(pn);
						}) ?? null;
					const freq = stat?.donationCount ?? 0;
					return `<div style="font-size:13px; font-weight:800; margin-bottom:4px; color:${
						theme.palette.text.primary
					}">${params.name}</div><div style="font-size:12px">${Number(
						v
					).toLocaleString("id-ID")} User • ${freq.toLocaleString(
						"id-ID"
					)} donasi</div>`;
				},
				borderRadius: 8,
				backgroundColor: theme.palette.background.paper,
				borderColor: alpha(theme.palette.divider, 0.12),
				textStyle: { color: theme.palette.text.primary },
				padding: [10, 14],
			},
			visualMap:
				positives.length >= 4
					? {
							left: "left",
							bottom: "bottom",
							type: "piecewise",
							pieces: [
								{
									max: q1,
									color: theme.palette.success.light,
									label: "Rendah",
								},
								{
									min: q1,
									max: q2,
									color: theme.palette.success.main,
									label: "Menengah",
								},
								{
									min: q2,
									max: q3,
									color: theme.palette.warning.main,
									label: "Tinggi",
								},
								{
									min: q3,
									color: theme.palette.error.main,
									label: "Sangat Tinggi",
								},
							],
							outOfRange: { color: theme.palette.grey[300] },
							textStyle: {
								color: theme.palette.text.secondary,
								fontWeight: 700,
								fontSize: 11,
							},
					  }
					: {
							left: "left",
							bottom: "bottom",
							min,
							max,
							inRange: {
								color: [
									theme.palette.grey[200],
									theme.palette.success.main,
									theme.palette.error.main,
								],
							},
							outOfRange: { color: theme.palette.grey[300] },
							textStyle: {
								color: theme.palette.text.secondary,
								fontWeight: 700,
								fontSize: 11,
							},
							calculable: true,
					  },
			series: [
				{
					type: "map",
					map: "Indonesia",
					roam: true,
					zoom: 1.25,
					center: [118.0, -2.0],
					itemStyle: {
						borderColor: alpha(theme.palette.background.paper, 0.8),
						borderWidth: 0.8,
						areaColor: alpha(theme.palette.action.hover, 0.04),
					},
					label: { show: false },
					emphasis: {
						itemStyle: { areaColor: theme.palette.error.main },
						label: {
							show: true,
							color: theme.palette.getContrastText(theme.palette.error.main),
							fontWeight: "bold",
							fontSize: 14,
							formatter: (p: any) => p.name,
							textShadowColor: "transparent",
						},
					},
					select: { itemStyle: { areaColor: theme.palette.error.main } },
					data,
				},
			],
		});
	}, [mapLoaded, provinceStats, theme, featureNames]);

	const handleDefaultZoom = () => {
		if (!chartRef.current) return;
		chartRef.current.setOption({
			series: [{ zoom: 1.75, center: [118.0, -2.0] }],
		});
	};

	return (
		<Box sx={{ position: "relative" }}>
			<Box
				ref={containerRef}
				sx={{
					width: "100%",
					height: { xs: 360, sm: 420, md: 520 },
					minHeight: 360,
					borderRadius: 2,
					overflow: "hidden",
				}}
			/>
			<Box sx={{ position: "absolute", top: 8, right: 8 }}>
				<IconButton size="small" onClick={handleDefaultZoom}>
					<ZoomInRoundedIcon fontSize="small" />
				</IconButton>
			</Box>
		</Box>
	);
}

export default function InfoUsersClient({
	session,
	stats,
}: {
	session: any;
	stats: { provinceStats: ProvinceStat[]; users: UserInfoRow[] } | null;
}) {
	const theme = useTheme();
	const provinceStats = stats?.provinceStats ?? [];
	const users = stats?.users ?? [];

	const [q, setQ] = React.useState("");
	// removed obsolete text filters
	const [provinceSel, setProvinceSel] = React.useState<string>("");
	const [donationBucket, setDonationBucket] = React.useState<string>("all");
	const [freqBucket, setFreqBucket] = React.useState<string>("all");
	const [sortBy, setSortBy] = React.useState<string>("donation");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	const provinceOptions = React.useMemo(
		() =>
			Array.from(
				new Set((provinceStats ?? []).map((p) => p.name).filter(Boolean))
			),
		[provinceStats]
	);

	// Export controls
	const [anchorElExport, setAnchorElExport] =
		React.useState<null | HTMLElement>(null);
	const openExportMenu = Boolean(anchorElExport);
	const handleExportClick = (e: React.MouseEvent<HTMLElement>) =>
		setAnchorElExport(e.currentTarget);
	const handleExportClose = () => setAnchorElExport(null);

	const handleExportPDF = () => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.width;
		doc.setFontSize(18);
		doc.setFont("helvetica", "bold");
		doc.text("PESONA KEBAIKAN", pageWidth / 2, 15, { align: "center" });
		doc.setFontSize(10);
		doc.setFont("helvetica", "italic");
		doc.text('"Menebar Kebaikan, Menuai Keberkahan"', pageWidth / 2, 22, {
			align: "center",
		});
		doc.setLineWidth(0.5);
		doc.line(15, 25, pageWidth - 15, 25);
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("Laporan Informasi Users", pageWidth / 2, 35, { align: "center" });

		const tableData = filtered.map((u) => [
			u.name ?? "-",
			u.email,
			u.phone ?? "-",
			u.province ?? "-",
			fmtIDR(u.totalDonation),
			u.donationCount.toLocaleString("id-ID"),
			u.lastDonationAt ?? "-",
		]);

		autoTable(doc, {
			head: [
				[
					"Nama",
					"Email",
					"Telepon",
					"Provinsi",
					"Total Donasi",
					"Frekuensi",
					"Terakhir Donasi",
				],
			],
			body: tableData,
			startY: 40,
			styles: { fontSize: 9 },
			headStyles: { fillColor: [41, 128, 185], halign: "center" },
		});

		const finalY = (doc as any).lastAutoTable?.finalY || 40;
		doc.setFontSize(10);
		doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 15, finalY + 10);

		doc.save("informasi_users.pdf");
		handleExportClose();
	};

	const handleExportExcel = () => {
		const rows = filtered.map((u) => ({
			Nama: u.name ?? "-",
			Email: u.email,
			Telepon: u.phone ?? "-",
			Provinsi: u.province ?? "-",
			Total_Donasi: u.totalDonation,
			Frekuensi: u.donationCount,
			Terakhir_Donasi: u.lastDonationAt ?? "-",
		}));
		const ws = XLSX.utils.json_to_sheet(rows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "InfoUsers");
		XLSX.writeFile(wb, "informasi_users.xlsx");
		handleExportClose();
	};

	React.useEffect(() => {
		setPage(0);
	}, [q, provinceSel, donationBucket, freqBucket, sortBy]);

	const filtered = users
		.filter((u) => {
			const s = q.toLowerCase().trim();
			if (s) {
				const blob = `${u.name ?? ""} ${u.email} ${u.phone ?? ""} ${
					u.province ?? ""
				}`.toLowerCase();
				if (!blob.includes(s)) return false;
			}
			// rely on dropdown buckets instead of raw text thresholds
			if (provinceSel && (u.province ?? "") !== provinceSel) return false;
			if (donationBucket !== "all") {
				const d = u.totalDonation;
				if (donationBucket === "0-1M" && !(d >= 0 && d <= 1_000_000))
					return false;
				if (donationBucket === "1M-10M" && !(d > 1_000_000 && d <= 10_000_000))
					return false;
				if (donationBucket === "10M+" && !(d > 10_000_000)) return false;
			}
			if (freqBucket !== "all") {
				const f = u.donationCount;
				if (freqBucket === "1" && f !== 1) return false;
				if (freqBucket === "2-5" && !(f >= 2 && f <= 5)) return false;
				if (freqBucket === "6+" && !(f >= 6)) return false;
			}
			return true;
		})
		.sort((a, b) => {
			if (sortBy === "donation") return b.totalDonation - a.totalDonation;
			if (sortBy === "frequency") return b.donationCount - a.donationCount;
			if (sortBy === "name") return (a.name ?? "").localeCompare(b.name ?? "");
			return 0;
		});

	const paginated = React.useMemo(() => {
		const start = page * rowsPerPage;
		return filtered.slice(start, start + rowsPerPage);
	}, [filtered, page, rowsPerPage]);

	return (
		<Box sx={{ p: 2 }}>
			<Stack spacing={2}>
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={2}
					alignItems={{ md: "center" }}
					justifyContent="space-between"
				>
					<Typography sx={{ fontWeight: 1000 }}>Informasi Users</Typography>
					<Chip label={`Total User: ${users.length}`} />
				</Stack>
				<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
					<MapIndonesia theme={theme} provinceStats={provinceStats} />
				</Paper>
				<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
					<Stack spacing={2}>
						<Stack
							direction="row"
							alignItems="center"
							justifyContent="space-between"
							sx={{ mb: 1 }}
						>
							<Typography sx={{ fontWeight: 900 }}>Data Users</Typography>
							<Box>
								<Button
									variant="outlined"
									startIcon={<DownloadIcon />}
									onClick={handleExportClick}
									sx={{
										borderRadius: 3,
										textTransform: "none",
										fontWeight: 800,
									}}
								>
									Export
								</Button>
								<Menu
									anchorEl={anchorElExport}
									open={openExportMenu}
									onClose={handleExportClose}
									PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 180 } }}
								>
									<MenuItem
										onClick={handleExportPDF}
										sx={{ gap: 1.5, py: 1.25 }}
									>
										<PictureAsPdfIcon color="error" fontSize="small" />
										<Typography variant="body2" fontWeight={700}>
											Export as PDF
										</Typography>
									</MenuItem>
									<MenuItem
										onClick={handleExportExcel}
										sx={{ gap: 1.5, py: 1.25 }}
									>
										<TableViewIcon color="success" fontSize="small" />
										<Typography variant="body2" fontWeight={700}>
											Export as Excel
										</Typography>
									</MenuItem>
								</Menu>
							</Box>
						</Stack>
						<Stack direction={{ xs: "column", md: "row" }} spacing={2}>
							<TextField
								placeholder="Cari nama/email/telepon/provinsi"
								value={q}
								onChange={(e) => setQ(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchRoundedIcon />
										</InputAdornment>
									),
								}}
								fullWidth
							/>
							{/* removed obsolete inputs */}
							<FormControl sx={{ minWidth: 160 }}>
								<InputLabel>Provinsi</InputLabel>
								<Select
									label="Provinsi"
									value={provinceSel}
									onChange={(e) => setProvinceSel(e.target.value as string)}
								>
									<MenuItem value="">Semua</MenuItem>
									{provinceOptions.map((p) => (
										<MenuItem key={p} value={p}>
											{p}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl sx={{ minWidth: 160 }}>
								<InputLabel>Range Donasi</InputLabel>
								<Select
									label="Range Donasi"
									value={donationBucket}
									onChange={(e) => setDonationBucket(e.target.value as string)}
								>
									<MenuItem value="all">Semua</MenuItem>
									<MenuItem value="0-1M">0 - 1 juta</MenuItem>
									<MenuItem value="1M-10M">1 - 10 juta</MenuItem>
									<MenuItem value="10M+">{">"} 10 juta</MenuItem>
								</Select>
							</FormControl>
							<FormControl sx={{ minWidth: 140 }}>
								<InputLabel>Frekuensi</InputLabel>
								<Select
									label="Frekuensi"
									value={freqBucket}
									onChange={(e) => setFreqBucket(e.target.value as string)}
								>
									<MenuItem value="all">Semua</MenuItem>
									<MenuItem value="1">1</MenuItem>
									<MenuItem value="2-5">2 - 5</MenuItem>
									<MenuItem value="6+">≥ 6</MenuItem>
								</Select>
							</FormControl>
							<FormControl sx={{ minWidth: 140 }}>
								<InputLabel>Urutkan</InputLabel>
								<Select
									label="Urutkan"
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as string)}
								>
									<MenuItem value="donation">Donasi tertinggi</MenuItem>
									<MenuItem value="frequency">Frekuensi tertinggi</MenuItem>
									<MenuItem value="name">Nama</MenuItem>
								</Select>
							</FormControl>
						</Stack>
						<TableContainer
							sx={{
								borderRadius: 2,
								overflowX: "auto",
								border: "1px solid",
								borderColor: alpha(theme.palette.divider, 0.14),
								boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
								bgcolor: alpha(theme.palette.background.paper, 0.9),
								backdropFilter: "blur(2px)",
							}}
						>
							<Table
								sx={{
									"& thead th": {
										bgcolor: alpha(theme.palette.primary.main, 0.06),
										color: theme.palette.text.secondary,
										fontWeight: 900,
										fontSize: 12.5,
										letterSpacing: "-0.01em",
										borderBottom: "1px solid",
										borderColor: alpha(theme.palette.divider, 0.2),
									},
									"& tbody tr": {
										transition: "all .15s ease",
									},
									"& tbody tr:nth-of-type(odd)": {
										bgcolor: alpha(theme.palette.action.hover, 0.03),
									},
									"& tbody tr:hover": {
										bgcolor: alpha(theme.palette.primary.main, 0.07),
										boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
									},
									"& tbody td": {
										borderBottom: "1px solid",
										borderColor: alpha(theme.palette.divider, 0.12),
									},
								}}
							>
								<TableHead>
									<TableRow>
										<TableCell>Nama</TableCell>
										<TableCell>Email</TableCell>
										<TableCell>Telepon</TableCell>
										<TableCell>Provinsi</TableCell>
										<TableCell align="right">Total Donasi</TableCell>
										<TableCell align="right">Frekuensi</TableCell>
										<TableCell align="right">Terakhir Donasi</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{paginated.map((u) => (
										<TableRow key={u.id}>
											<TableCell>{u.name ?? "-"}</TableCell>
											<TableCell>{u.email}</TableCell>
											<TableCell>{u.phone ?? "-"}</TableCell>
											<TableCell>{u.province ?? "-"}</TableCell>
											<TableCell align="right">
												<Typography fontWeight={900} color="success.main">
													{fmtIDR(u.totalDonation)}
												</Typography>
											</TableCell>
											<TableCell align="right">
												<Chip
													size="small"
													label={u.donationCount.toLocaleString("id-ID")}
													color="primary"
													variant="outlined"
													sx={{ fontWeight: 900 }}
												/>
											</TableCell>
											<TableCell align="right">
												<Typography
													variant="caption"
													color="text.secondary"
													fontWeight={800}
												>
													{u.lastDonationAt ?? "-"}
												</Typography>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
							<TablePagination
								component="div"
								count={filtered.length}
								page={page}
								onPageChange={(_, newPage) => setPage(newPage)}
								rowsPerPage={rowsPerPage}
								onRowsPerPageChange={(e) => {
									setRowsPerPage(parseInt(e.target.value, 10));
									setPage(0);
								}}
								rowsPerPageOptions={[10, 25, 50]}
								labelRowsPerPage="Baris per halaman"
							/>
						</Box>
					</Stack>
				</Paper>
			</Stack>
		</Box>
	);
}
