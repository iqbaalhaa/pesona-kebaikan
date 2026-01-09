"use client";

import React from "react";
import {
	Box,
	Grid,
	Paper,
	Typography,
	Stack,
	Avatar,
	Chip,
	Button,
	Divider,
	LinearProgress,
	IconButton,
	useTheme,
	Drawer,
	List,
	ListItem,
	ListItemText,
	ListItemAvatar,
} from "@mui/material";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import { alpha } from "@mui/material/styles";
import * as echarts from "echarts";

import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	BarChart,
	Bar,
	Cell,
	PieChart,
	Pie,
	LineChart,
	Line,
} from "recharts";

import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

function fmtIDR(n: number) {
	const s = Math.round(n || 0).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function clamp2() {
	return {
		display: "-webkit-box",
		WebkitLineClamp: 2,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
	} as const;
}

function Surface({ children, sx }: { children: React.ReactNode; sx?: any }) {
	const t = useTheme();
	return (
		<Paper
			elevation={0}
			sx={{
				width: "100%",
				borderRadius: 2.25,
				overflow: "hidden",
				bgcolor: alpha(t.palette.background.paper, 0.86),
				backdropFilter: "blur(16px) saturate(140%)",
				border: "1px solid",
				borderColor: alpha(t.palette.divider, 0.08),
				boxShadow: `0 10px 28px ${alpha("#000", 0.06)}`,
				transition: "transform .15s ease, box-shadow .15s ease",
				"&:hover": {
					transform: "translateY(-1px)",
					boxShadow: `0 14px 34px ${alpha("#000", 0.08)}`,
				},
				...sx,
			}}
		>
			{children}
		</Paper>
	);
}

function ToneDot({
	tone,
}: {
	tone: "info" | "warning" | "success" | "error" | "primary";
}) {
	const t = useTheme();
	const c =
		tone === "success"
			? t.palette.success.main
			: tone === "warning"
			? t.palette.warning.main
			: tone === "error"
			? t.palette.error.main
			: tone === "info"
			? t.palette.info.main
			: t.palette.primary.main;

	return (
		<Box
			sx={{
				width: 8,
				height: 8,
				borderRadius: 999,
				bgcolor: c,
				boxShadow: `0 0 0 4px ${alpha(c, 0.14)}`,
				flex: "0 0 auto",
			}}
		/>
	);
}

function KpiCard({
	title,
	value,
	subtitle,
	icon,
	chip,
	tone = "primary",
}: {
	title: string;
	value: string;
	subtitle: string;
	icon: React.ReactNode;
	chip?: { label: string };
	tone?: "primary" | "success" | "warning" | "info";
}) {
	const t = useTheme();
	const toneColor = t.palette[tone].main;

	return (
		<Surface
			sx={{
				p: 1.75,
				height: "100%",
				minHeight: 144,
				position: "relative",
			}}
		>
			<Box
				sx={{
					position: "absolute",
					top: -90,
					right: -90,
					width: 200,
					height: 200,
					borderRadius: 999,
					background: `radial-gradient(circle, ${alpha(
						toneColor,
						0.16
					)} 0%, transparent 70%)`,
					filter: "blur(24px)",
					pointerEvents: "none",
				}}
			/>

			<Stack spacing={1.25} sx={{ position: "relative" }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="flex-start"
				>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: 2.25,
							display: "grid",
							placeItems: "center",
							bgcolor: alpha(toneColor, 0.12),
							color: toneColor,
						}}
					>
						{React.cloneElement(
							icon as React.ReactElement,
							{
								fontSize: "small",
							} as any
						)}
					</Box>

					<IconButton
						size="small"
						sx={{
							borderRadius: 2,
							color: "text.secondary",
							bgcolor: alpha(t.palette.action.hover, 0.04),
							"&:hover": { bgcolor: alpha(t.palette.action.hover, 0.1) },
						}}
					>
						<MoreHorizRoundedIcon fontSize="small" />
					</IconButton>
				</Stack>

				<Box sx={{ minWidth: 0 }}>
					<Typography
						sx={{ fontSize: 12, color: "text.secondary", fontWeight: 900 }}
					>
						{title}
					</Typography>

					<Typography
						sx={{
							mt: 0.25,
							fontSize: 20,
							fontWeight: 1000,
							letterSpacing: "-0.02em",
							lineHeight: 1.15,
						}}
					>
						{value}
					</Typography>

					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						flexWrap="wrap"
						sx={{ mt: 0.75 }}
					>
						{chip ? (
							<Chip
								label={chip.label}
								size="small"
								sx={{
									height: 22,
									borderRadius: 999,
									fontWeight: 900,
									bgcolor: alpha(toneColor, 0.12),
									color: t.palette.text.primary,
									border: "0px solid transparent",
								}}
							/>
						) : null}

						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
							{subtitle}
						</Typography>
					</Stack>
				</Box>
			</Stack>
		</Surface>
	);
}

function Panel({
	title,
	subtitle,
	right,
	children,
}: {
	title: string;
	subtitle?: string;
	right?: React.ReactNode;
	children: React.ReactNode;
}) {
	const t = useTheme();
	return (
		<Surface sx={{ p: 1.75, height: "100%" }}>
			<Stack
				direction="row"
				alignItems="flex-start"
				justifyContent="space-between"
				spacing={2}
			>
				<Box sx={{ minWidth: 0 }}>
					<Typography
						sx={{ fontWeight: 1000, fontSize: 13.5, lineHeight: 1.2 }}
					>
						{title}
					</Typography>
					{subtitle ? (
						<Typography
							sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}
						>
							{subtitle}
						</Typography>
					) : null}
				</Box>

				{right ? <Box sx={{ flex: "0 0 auto" }}>{right}</Box> : null}
			</Stack>

			<Divider sx={{ my: 1.25, borderColor: alpha(t.palette.divider, 0.08) }} />
			{children}
		</Surface>
	);
}

function ChartCard({
	title,
	subtitle,
	right,
	children,
	height = 320,
}: {
	title: string;
	subtitle?: string;
	right?: React.ReactNode;
	children: React.ReactNode;
	height?: number;
}) {
	const t = useTheme();
	return (
		<Surface sx={{ p: 2, height: "100%" }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
				sx={{ mb: 1.25 }}
			>
				<Box sx={{ minWidth: 0 }}>
					<Typography
						sx={{ fontWeight: 1000, fontSize: 14.5, lineHeight: 1.2 }}
					>
						{title}
					</Typography>
					{subtitle ? (
						<Typography
							sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}
						>
							{subtitle}
						</Typography>
					) : null}
				</Box>
				{right ? <Box sx={{ flex: "0 0 auto" }}>{right}</Box> : null}
			</Stack>

			<Divider sx={{ mb: 1.25, borderColor: alpha(t.palette.divider, 0.08) }} />

			<Box sx={{ width: "100%", height }}>{children}</Box>

			<Box sx={{ mt: 1.25, display: "flex", gap: 1, flexWrap: "wrap" }}>
				<Chip
					size="small"
					label="Realtime look"
					sx={{
						height: 22,
						borderRadius: 999,
						fontWeight: 900,
						bgcolor: alpha(t.palette.action.hover, 0.06),
					}}
				/>
				<Chip
					size="small"
					label="Hover for detail"
					sx={{
						height: 22,
						borderRadius: 999,
						fontWeight: 900,
						bgcolor: alpha(t.palette.action.hover, 0.06),
					}}
				/>
			</Box>
		</Surface>
	);
}

function FlowMini({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone: "primary" | "warning" | "success" | "error" | "info";
}) {
	const t = useTheme();
	const c = t.palette[tone].main;

	return (
		<Box
			sx={{
				borderRadius: 2.25,
				p: 1.25,
				bgcolor: alpha(t.palette.background.default, 0.42),
				border: "1px solid",
				borderColor: alpha(c, 0.14),
				minWidth: 0,
			}}
		>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				justifyContent="space-between"
			>
				<Typography
					sx={{ fontSize: 12, fontWeight: 900, color: "text.secondary" }}
				>
					{label}
				</Typography>
				<ToneDot tone={tone} />
			</Stack>

			<Typography sx={{ mt: 0.4, fontSize: 18, fontWeight: 1000 }}>
				{value.toLocaleString("id-ID")}
			</Typography>
		</Box>
	);
}

function MapIndonesia({
	theme,
	mapMetric,
	provinceStats,
	fmtIDR,
}: {
	theme: any;
	mapMetric: "users" | "donation";
	provinceStats: Array<{ name: string; users: number; donation: number }>;
	fmtIDR: (n: number) => string;
}) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const chartRef = React.useRef<echarts.ECharts | null>(null);
	const [mapLoaded, setMapLoaded] = React.useState(false);
	const [selectedProvince, setSelectedProvince] =
		React.useState<ProvinceStat | null>(null);
	const [featureNames, setFeatureNames] = React.useState<string[]>([]);
	const normalize = (s: string) =>
		s
			.toLowerCase()
			.trim()
			.replace("provinsi ", "")
			.replace("propinsi ", "")
			.replace("daerah khusus ibu kota", "dki jakarta")
			.replace("yogyakarta", "di yogyakarta")
			.replace("nanggroe aceh darussalam", "aceh");
	const getVal = (name: string) => {
		const n = normalize(name);
		const found =
			provinceStats.find((p) => {
				const pn = normalize(p.name);
				return pn === n || pn.includes(n) || n.includes(pn);
			}) ?? null;
		if (!found) return 0;
		return mapMetric === "users" ? found.users : found.donation;
	};

	// 1. Init Map (Load GeoJSON & Register) - Run Once
	React.useEffect(() => {
		async function initMap() {
			if (!containerRef.current) return;
			try {
				const res = await fetch("/maps/indonesia.json");
				if (!res.ok) throw new Error("Failed to load map");
				const geojson = await res.json();

				// Fix: Map 'Propinsi' to 'name' because the GeoJSON uses 'Propinsi'
				geojson.features.forEach((feature: any) => {
					feature.properties.name = feature.properties.Propinsi;
				});

				echarts.registerMap("Indonesia", geojson as any);
				setFeatureNames(
					Array.isArray(geojson.features)
						? geojson.features.map((f: any) => f.properties?.name ?? "")
						: []
				);

				// Initialize chart
				const chart = echarts.init(containerRef.current);
				chartRef.current = chart;

				// Do not set geo here to avoid double map layers

				setMapLoaded(true);

				const handleResize = () => chart.resize();
				window.addEventListener("resize", handleResize);
				return () => window.removeEventListener("resize", handleResize);
			} catch (err) {
				console.error("Map init error:", err);
			}
		}

		if (!chartRef.current) {
			initMap();
		}

		return () => {
			if (chartRef.current) {
				chartRef.current.dispose();
				chartRef.current = null;
			}
		};
	}, []); // Empty dependency to run once

	// 2. Update Data & Colors - Run when props change
	React.useEffect(() => {
		if (!mapLoaded || !chartRef.current) return;

		const baseColor =
			mapMetric === "users"
				? theme.palette.success.main
				: theme.palette.primary.main;

		const gradientColors =
			mapMetric === "users"
				? [
						theme.palette.grey[200],
						theme.palette.success.main,
						theme.palette.error.main,
				  ]
				: [
						alpha(baseColor, 0.08),
						alpha(baseColor, 0.25),
						alpha(baseColor, 0.45),
						alpha(baseColor, 0.65),
						alpha(baseColor, 0.85),
						baseColor,
				  ];

		const featureValues = featureNames.map((n) => getVal(n));
		const min = featureValues.length ? Math.min(...featureValues) : 0;
		const max = featureValues.length ? Math.max(...featureValues) : 0;
		const positives = featureValues.filter((v) => v > 0);
		const sorted = positives.slice().sort((a, b) => a - b);
		const pick = (p: number) =>
			sorted.length ? sorted[Math.floor((sorted.length - 1) * p)] : 0;
		const q1 = pick(0.25);
		const q2 = pick(0.5);
		const q3 = pick(0.75);

		const data =
			featureNames.length > 0
				? featureNames.map((n) => ({
						name: n,
						value: getVal(n),
				  }))
				: provinceStats.map((p) => ({
						name: p.name,
						value: mapMetric === "users" ? p.users : p.donation,
				  }));

		// Handle Click Event
		chartRef.current.off("click");
		chartRef.current.on("click", (params: any) => {
			if (params.componentType === "series") {
				const pName = params.name;
				const stat =
					provinceStats.find((p) => p.name === pName) ||
					({ name: pName, users: 0, donation: 0 } as ProvinceStat);
				setSelectedProvince(stat);
			}
		});

		chartRef.current.clear();
		chartRef.current.setOption({
			tooltip: {
				trigger: "item",
				formatter: (params: any) => {
					const v = params.value || 0;
					const norm = (s: string) =>
						s
							.toLowerCase()
							.trim()
							.replace("provinsi ", "")
							.replace("propinsi ", "")
							.replace("daerah khusus ibu", "dki jakarta")
							.replace("yogyakarta", "di yogyakarta")
							.replace("nanggroe aceh", "aceh");
					const stat =
						provinceStats.find((p) => {
							const pn = norm(p.name);
							const nn = norm(params.name || "");
							return pn === nn || pn.includes(nn) || nn.includes(pn);
						}) ?? null;
					const freq = stat?.donationCount ?? 0;
					const valText =
						mapMetric === "users"
							? `${Number(v).toLocaleString("id-ID")} User`
							: fmtIDR(Number(v));

					const textColor =
						theme.palette.mode === "dark" ? "#ffffff" : "#000000";

					return `<div style="font-size:13px; font-weight:800; margin-bottom:4px; color:${textColor}">${
						params.name
					}</div><div style="font-size:12px; color:${textColor}">${valText} • ${freq.toLocaleString(
						"id-ID"
					)} donasi</div>`;
				},
				borderRadius: 8,
				backgroundColor: theme.palette.background.paper,
				borderColor: alpha(theme.palette.divider, 0.12),
				textStyle: {
					color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
				},
				padding: [10, 14],
			},
			visualMap:
				mapMetric === "users"
					? positives.length >= 4
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
						  }
					: {
							left: "left",
							bottom: "bottom",
							min,
							max,
							inRange: {
								color: gradientColors,
							},
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
						itemStyle: {
							areaColor: theme.palette.primary.main,
						},
						label: {
							show: true,
							color: theme.palette.getContrastText(theme.palette.primary.main),
							fontWeight: "bold",
							fontSize: 14,
							formatter: (p: any) => p.name,
							textShadowColor: "transparent",
						},
					},
					select: {
						itemStyle: { areaColor: theme.palette.primary.main },
						label: {
							show: true,
							color: theme.palette.getContrastText(theme.palette.primary.main),
							fontWeight: "bold",
							fontSize: 14,
							formatter: (p: any) => p.name,
							textShadowColor: "transparent",
						},
					},
					data,
				},
			],
		});
	}, [mapLoaded, mapMetric, provinceStats, theme, fmtIDR]);

	return (
		<>
			<Box sx={{ position: "relative", mb: 1 }}>
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
					<IconButton
						size="small"
						onClick={() => {
							if (!chartRef.current) return;
							chartRef.current.setOption({
								series: [{ zoom: 1.75, center: [118.0, -2.0] }],
							});
						}}
					>
						<ZoomInRoundedIcon fontSize="small" />
					</IconButton>
				</Box>
			</Box>
			<Drawer
				anchor="right"
				open={!!selectedProvince}
				onClose={() => setSelectedProvince(null)}
				PaperProps={{
					sx: {
						width: { xs: "100%", sm: 400 },
						p: 0,
						bgcolor: theme.palette.background.paper,
						backgroundImage: "none",
						boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
					},
				}}
			>
				{selectedProvince && (
					<Box
						sx={{ height: "100%", display: "flex", flexDirection: "column" }}
					>
						{/* Header */}
						<Box
							sx={{
								p: 3,
								pb: 2,
								borderBottom: "1px solid",
								borderColor: "divider",
								display: "flex",
								alignItems: "flex-start",
								justifyContent: "space-between",
							}}
						>
							<Box>
								<Typography
									variant="h5"
									fontWeight={1000}
									letterSpacing="-0.02em"
								>
									{selectedProvince.name}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mt: 0.5 }}
								>
									Detail statistik wilayah
								</Typography>
							</Box>
							<IconButton
								onClick={() => setSelectedProvince(null)}
								size="small"
							>
								<CloseRoundedIcon />
							</IconButton>
						</Box>

						<Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
							{/* Summary Cards */}
							<Grid container spacing={2} sx={{ mb: 4 }}>
								<Grid size={6}>
									<Paper
										variant="outlined"
										sx={{
											p: 2,
											borderRadius: 2.5,
											bgcolor: alpha(theme.palette.primary.main, 0.04),
											borderColor: alpha(theme.palette.primary.main, 0.15),
										}}
									>
										<Stack spacing={1}>
											<Box
												sx={{
													width: 32,
													height: 32,
													borderRadius: 99,
													bgcolor: alpha(theme.palette.primary.main, 0.1),
													color: theme.palette.primary.main,
													display: "grid",
													placeItems: "center",
												}}
											>
												<PersonRoundedIcon fontSize="small" />
											</Box>
											<Box>
												<Typography
													variant="caption"
													color="text.secondary"
													fontWeight={700}
												>
													Total User
												</Typography>
												<Typography
													variant="h6"
													fontWeight={900}
													color="primary"
												>
													{selectedProvince.users.toLocaleString("id-ID")}
												</Typography>
											</Box>
										</Stack>
									</Paper>
								</Grid>
								<Grid size={6}>
									<Paper
										variant="outlined"
										sx={{
											p: 2,
											borderRadius: 2.5,
											bgcolor: alpha(theme.palette.success.main, 0.04),
											borderColor: alpha(theme.palette.success.main, 0.15),
										}}
									>
										<Stack spacing={1}>
											<Box
												sx={{
													width: 32,
													height: 32,
													borderRadius: 99,
													bgcolor: alpha(theme.palette.success.main, 0.1),
													color: theme.palette.success.main,
													display: "grid",
													placeItems: "center",
												}}
											>
												<VolunteerActivismRoundedIcon fontSize="small" />
											</Box>
											<Box>
												<Typography
													variant="caption"
													color="text.secondary"
													fontWeight={700}
												>
													Total Donasi
												</Typography>
												<Typography
													variant="h6"
													fontWeight={900}
													color="success.main"
													sx={{ fontSize: 15 }}
												>
													{fmtIDR(selectedProvince.donation)}
												</Typography>
											</Box>
										</Stack>
									</Paper>
								</Grid>
							</Grid>

							{/* Mock Data Lists */}
							<Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2 }}>
								Donatur Teratas di {selectedProvince.name}
							</Typography>
							<Paper
								variant="outlined"
								sx={{ borderRadius: 2.5, overflow: "hidden" }}
							>
								<List disablePadding>
									{[1, 2, 3, 4, 5].map((i) => (
										<React.Fragment key={i}>
											<ListItem
												sx={{
													py: 1.5,
													"&:hover": {
														bgcolor: alpha(theme.palette.action.hover, 0.04),
													},
												}}
											>
												<ListItemAvatar>
													<Avatar
														sx={{
															width: 36,
															height: 36,
															bgcolor: alpha(theme.palette.primary.main, 0.1),
															color: theme.palette.primary.main,
															fontWeight: 800,
															fontSize: 14,
														}}
													>
														{String.fromCharCode(64 + i)}
													</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary={
														<Typography fontWeight={700} fontSize={14}>
															Hamba Allah {i}
														</Typography>
													}
													secondary={
														<Typography
															variant="caption"
															color="text.secondary"
														>
															Baru saja berdonasi
														</Typography>
													}
												/>
												<Typography
													fontWeight={800}
													fontSize={14}
													color="success.main"
												>
													{fmtIDR(
														Math.floor(selectedProvince.donation * (0.1 / i))
													)}
												</Typography>
											</ListItem>
											{i < 5 && <Divider variant="inset" component="li" />}
										</React.Fragment>
									))}
								</List>
							</Paper>
						</Box>
					</Box>
				)}
			</Drawer>
		</>
	);
}

interface DashboardClientProps {
	session: any;
	kpi: any;
	reviewSolvedRate: number;
	recentQueue: any[];
}

type ProvinceStat = { name: string; users: number; donation: number };

export default function DashboardClient({
	session,
	kpi,
	reviewSolvedRate,
	recentQueue,
}: DashboardClientProps) {
	const theme = useTheme();

	// --- SAMPLE DATA (ganti dari backend nanti kalau sudah ada) ---
	const donation7d = kpi?.donation7d ?? [
		{ name: "Sen", value: 2500000 },
		{ name: "Sel", value: 3800000 },
		{ name: "Rab", value: 1200000 },
		{ name: "Kam", value: 5600000 },
		{ name: "Jum", value: 4100000 },
		{ name: "Sab", value: 8900000 },
		{ name: "Min", value: 6700000 },
	];

	const categoryDist = kpi?.categoryDist ?? [
		{ name: "Pendidikan", value: 85 },
		{ name: "Bencana", value: 65 },
		{ name: "Kesehatan", value: 45 },
		{ name: "Masjid", value: 30 },
		{ name: "Yatim", value: 20 },
	];

	const payMethodDist = kpi?.payMethodDist ?? [
		{ name: "QRIS", value: 42 },
		{ name: "Transfer", value: 28 },
		{ name: "E-Wallet", value: 20 },
		{ name: "Lainnya", value: 10 },
	];

	const campaignCreated14d = kpi?.campaignCreated14d ?? [
		{ day: "D-13", value: 2 },
		{ day: "D-12", value: 3 },
		{ day: "D-11", value: 1 },
		{ day: "D-10", value: 4 },
		{ day: "D-9", value: 2 },
		{ day: "D-8", value: 5 },
		{ day: "D-7", value: 3 },
		{ day: "D-6", value: 2 },
		{ day: "D-5", value: 6 },
		{ day: "D-4", value: 4 },
		{ day: "D-3", value: 5 },
		{ day: "D-2", value: 3 },
		{ day: "D-1", value: 7 },
		{ day: "Hari ini", value: 4 },
	];

	const provinceStats: ProvinceStat[] = kpi?.provinceStats ?? [
		{ name: "DKI Jakarta", users: 12450, donation: 215000000 },
		{ name: "Jawa Barat", users: 18230, donation: 175000000 },
		{ name: "Jawa Timur", users: 16890, donation: 189000000 },
		{ name: "Jawa Tengah", users: 14210, donation: 132000000 },
		{ name: "Banten", users: 9200, donation: 86000000 },
		{ name: "DI Yogyakarta", users: 5100, donation: 48000000 },
		{ name: "Sumatera Utara", users: 7600, donation: 72000000 },
		{ name: "Aceh", users: 4300, donation: 38000000 },
		{ name: "Kalimantan Timur", users: 5200, donation: 69000000 },
		{ name: "Bali", users: 6100, donation: 54000000 },
	];

	const [mapMetric, setMapMetric] = React.useState<"users" | "donation">(
		"users"
	);

	function normalizeProvName(s: string) {
		const x = s.toLowerCase().trim();
		if (x.includes("daerah khusus ibu")) return "dki jakarta";
		if (x.includes("yogyakarta")) return "di yogyakarta";
		if (x.includes("nanggroe aceh") || x === "aceh") return "aceh";
		return x.replace("provinsi ", "").replace("propinsi ", "");
	}

	function getValueByProvince(name: string) {
		const norm = normalizeProvName(name);
		const found =
			provinceStats.find(
				(p) =>
					normalizeProvName(p.name) === norm ||
					normalizeProvName(p.name).includes(norm) ||
					norm.includes(normalizeProvName(p.name))
			) ?? null;
		if (!found) return 0;
		return mapMetric === "users" ? found.users : found.donation;
	}

	const metricValues = provinceStats.map((p: ProvinceStat) =>
		mapMetric === "users" ? p.users : p.donation
	);
	const metricMin = Math.min(...metricValues);
	const metricMax = Math.max(...metricValues);

	function colorFor(value: number) {
		const range = metricMax - metricMin || 1;
		const ratio = Math.min(1, Math.max(0, (value - metricMin) / range));
		const base = theme.palette.primary.main;
		const low = alpha(base, 0.18);
		const mid = alpha(base, 0.36);
		const hi = alpha(base, 0.62);
		if (ratio < 0.33) return low;
		if (ratio < 0.66) return mid;
		return hi;
	}

	// tooltip style shared
	const tooltipStyle = {
		backgroundColor: theme.palette.background.paper,
		borderRadius: 12,
		border: "1px solid " + alpha(theme.palette.divider, 0.12),
		boxShadow: "0 10px 28px rgba(0,0,0,0.10)",
		fontWeight: 800,
	} as const;

	return (
		<Box sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
			<Stack spacing={2}>
				{/* Header / Greeting */}
				<Surface sx={{ p: 1.75, position: "relative" }}>
					<Box
						sx={{
							position: "absolute",
							top: -90,
							right: -90,
							width: 220,
							height: 220,
							borderRadius: 999,
							background: `radial-gradient(circle, ${alpha(
								theme.palette.primary.main,
								0.12
							)} 0%, transparent 70%)`,
							filter: "blur(22px)",
							pointerEvents: "none",
						}}
					/>

					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={1.5}
						alignItems={{ md: "center" }}
						justifyContent="space-between"
						sx={{ position: "relative" }}
					>
						<Stack direction="row" spacing={1.5} alignItems="center">
							<Avatar
								src={session?.user?.image ?? undefined}
								alt={session?.user?.name ?? "Admin"}
								sx={{
									width: 44,
									height: 44,
									bgcolor: alpha(theme.palette.primary.main, 0.14),
								}}
							/>

							<Box sx={{ minWidth: 0 }}>
								<Typography
									sx={{ fontWeight: 1000, fontSize: 15.5, lineHeight: 1.15 }}
								>
									Halo, {session?.user?.name ?? "Admin"} 👋
								</Typography>

								<Stack
									direction="row"
									spacing={0.75}
									alignItems="center"
									sx={{ mt: 0.4, flexWrap: "wrap" }}
								>
									<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
										Fokus hari ini:
									</Typography>
									<Chip
										label="Verifikasi"
										size="small"
										sx={{
											height: 22,
											borderRadius: 999,
											fontWeight: 1000,
											bgcolor: alpha(theme.palette.success.main, 0.12),
											color: theme.palette.success.dark,
											border: "0px solid transparent",
										}}
									/>
									<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
										→ Publish
									</Typography>
								</Stack>
							</Box>
						</Stack>

						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
							sx={{ flexWrap: "wrap" }}
						>
							<Chip
								icon={<VerifiedRoundedIcon fontSize="small" />}
								label={`Antrian: ${kpi?.campaignReview ?? 0}`}
								sx={{
									height: 32,
									borderRadius: 999,
									fontWeight: 1000,
									bgcolor: alpha(theme.palette.warning.main, 0.12),
									color: theme.palette.warning.dark,
									border: "0px solid transparent",
									"& .MuiChip-icon": { color: theme.palette.warning.main },
								}}
							/>

							<Button
								href="/admin/campaign/verifikasi"
								component="a"
								variant="contained"
								endIcon={<ArrowForwardRoundedIcon />}
								sx={{
									borderRadius: 999,
									px: 2,
									py: 0.9,
									fontWeight: 900,
									textTransform: "none",
									boxShadow: "none",
								}}
							>
								Mulai Verifikasi
							</Button>

							<IconButton
								size="small"
								sx={{
									width: 34,
									height: 34,
									borderRadius: 2,
									bgcolor: alpha(theme.palette.action.hover, 0.06),
									"&:hover": {
										bgcolor: alpha(theme.palette.action.hover, 0.12),
									},
								}}
							>
								<RefreshRoundedIcon fontSize="small" />
							</IconButton>
						</Stack>
					</Stack>
				</Surface>

				{/* KPI Cards */}
				<Grid container spacing={1.5}>
					<Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ minWidth: 0 }}>
						<KpiCard
							title="Campaign Aktif"
							value={(kpi?.campaignActive ?? 0).toLocaleString("id-ID")}
							subtitle="Sedang menerima donasi"
							icon={<CampaignRoundedIcon />}
							chip={{
								label: `Total: ${(kpi?.campaignTotal ?? 0).toLocaleString(
									"id-ID"
								)}`,
							}}
							tone="success"
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ minWidth: 0 }}>
						<KpiCard
							title="Donasi Bulan Ini"
							value={fmtIDR(kpi?.donationMonth ?? 0)}
							subtitle={`Hari ini: ${fmtIDR(kpi?.donationToday ?? 0)}`}
							icon={<VolunteerActivismRoundedIcon />}
							tone="primary"
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ minWidth: 0 }}>
						<KpiCard
							title="Pencairan Pending"
							value={(kpi?.payoutPending ?? 0).toLocaleString("id-ID")}
							subtitle={`Tersalurkan: ${fmtIDR(kpi?.payoutMonth ?? 0)}`}
							icon={<PaymentsRoundedIcon />}
							tone="warning"
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ minWidth: 0 }}>
						<KpiCard
							title="Total User"
							value={(kpi?.usersTotal ?? 0).toLocaleString("id-ID")}
							subtitle="Terdaftar di platform"
							icon={<PeopleAltRoundedIcon />}
							tone="info"
						/>
					</Grid>

					{/* === CHARTS GRID (4 charts) === */}
					<Grid size={{ xs: 12, md: 8 }}>
						<ChartCard
							title="Trend Donasi"
							subtitle="7 hari terakhir (placeholder, bisa diganti dari backend)"
							right={
								<Chip
									label="Weekly"
									size="small"
									sx={{
										height: 24,
										borderRadius: 999,
										fontWeight: 900,
										bgcolor: alpha(theme.palette.primary.main, 0.1),
									}}
								/>
							}
							height={320}
						>
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={donation7d}>
									<defs>
										<linearGradient
											id="donationFill"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor={theme.palette.primary.main}
												stopOpacity={0.22}
											/>
											<stop
												offset="95%"
												stopColor={theme.palette.primary.main}
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>

									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke={alpha(theme.palette.divider, 0.1)}
									/>
									<XAxis
										dataKey="name"
										axisLine={false}
										tickLine={false}
										tick={{
											fill: theme.palette.text.secondary,
											fontSize: 12,
											fontWeight: 700,
										}}
										dy={10}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{
											fill: theme.palette.text.secondary,
											fontSize: 12,
											fontWeight: 700,
										}}
										tickFormatter={(value) =>
											`${Math.round(value / 1000000)}jt`
										}
									/>
									<Tooltip
										contentStyle={tooltipStyle}
										formatter={(value: any) => [
											`Rp${Number(value || 0).toLocaleString("id-ID")}`,
											"Donasi",
										]}
									/>
									<Area
										type="monotone"
										dataKey="value"
										stroke={theme.palette.primary.main}
										strokeWidth={3}
										fill="url(#donationFill)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</ChartCard>
					</Grid>

					<Grid size={{ xs: 12, md: 4 }}>
						<ChartCard
							title="Metode Pembayaran"
							subtitle="Komposisi donasi (contoh data)"
							right={
								<Chip
									label="Last 30d"
									size="small"
									sx={{
										height: 24,
										borderRadius: 999,
										fontWeight: 900,
										bgcolor: alpha(theme.palette.success.main, 0.1),
									}}
								/>
							}
							height={320}
						>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Tooltip contentStyle={tooltipStyle} />
									<Pie
										data={payMethodDist}
										dataKey="value"
										nameKey="name"
										innerRadius={70}
										outerRadius={105}
										paddingAngle={3}
										stroke={alpha(theme.palette.background.paper, 0.0)}
									>
										{payMethodDist.map((_: any, i: number) => (
											<Cell
												key={i}
												fill={
													[
														theme.palette.primary.main,
														theme.palette.info.main,
														theme.palette.success.main,
														theme.palette.warning.main,
														theme.palette.error.main,
													][i % 5]
												}
											/>
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</ChartCard>
					</Grid>

					<Grid size={{ xs: 12 }}>
						<ChartCard
							title="Peta Sebaran Provinsi"
							subtitle={`Warna menunjukkan ${
								mapMetric === "users" ? "jumlah User" : "total donasi"
							} per provinsi`}
							right={
								<Stack direction="row" spacing={1}>
									<Chip
										label="User"
										size="small"
										onClick={() => setMapMetric("users")}
										sx={{
											height: 24,
											borderRadius: 999,
											fontWeight: 900,
											bgcolor:
												mapMetric === "users"
													? alpha(theme.palette.primary.main, 0.18)
													: alpha(theme.palette.action.hover, 0.06),
										}}
									/>
									<Chip
										label="Donasi"
										size="small"
										onClick={() => setMapMetric("donation")}
										sx={{
											height: 24,
											borderRadius: 999,
											fontWeight: 900,
											bgcolor:
												mapMetric === "donation"
													? alpha(theme.palette.success.main, 0.18)
													: alpha(theme.palette.action.hover, 0.06),
										}}
									/>
								</Stack>
							}
							height={420}
						>
							<MapIndonesia
								theme={theme}
								mapMetric={mapMetric}
								provinceStats={provinceStats}
								fmtIDR={fmtIDR}
							/>

							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
								sx={{ mt: 1.25 }}
							>
								<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
									Skala:
								</Typography>
								<Box
									sx={{
										height: 10,
										borderRadius: 999,
										flex: 1,
										background: `linear-gradient(90deg, ${alpha(
											theme.palette.primary.main,
											0.18
										)}, ${alpha(theme.palette.primary.main, 0.62)})`,
										border: "1px solid",
										borderColor: alpha(theme.palette.divider, 0.12),
									}}
								/>
								<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
									{mapMetric === "users"
										? `${metricMin.toLocaleString(
												"id-ID"
										  )} → ${metricMax.toLocaleString("id-ID")} User`
										: `${fmtIDR(metricMin)} → ${fmtIDR(metricMax)}`}
								</Typography>
							</Stack>
						</ChartCard>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<ChartCard
							title="Sebaran Kategori"
							subtitle="Campaign per kategori (contoh)"
							height={300}
						>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									layout="vertical"
									data={categoryDist}
									margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										horizontal
										vertical={false}
										stroke={alpha(theme.palette.divider, 0.1)}
									/>
									<XAxis type="number" hide />
									<YAxis
										dataKey="name"
										type="category"
										axisLine={false}
										tickLine={false}
										tick={{
											fill: theme.palette.text.secondary,
											fontSize: 11,
											fontWeight: 800,
										}}
										width={86}
									/>
									<Tooltip
										cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
										contentStyle={tooltipStyle}
									/>
									<Bar
										dataKey="value"
										radius={[0, 6, 6, 0]}
										barSize={22}
										fill={theme.palette.primary.main}
									>
										{categoryDist.map((_: any, index: number) => (
											<Cell
												key={`cell-${index}`}
												fill={
													[
														theme.palette.primary.main,
														theme.palette.info.main,
														theme.palette.success.main,
														theme.palette.warning.main,
														theme.palette.error.main,
													][index % 5]
												}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</ChartCard>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<ChartCard
							title="Campaign Dibuat"
							subtitle="14 hari terakhir (contoh)"
							right={
								<Chip
									label="Daily"
									size="small"
									sx={{
										height: 24,
										borderRadius: 999,
										fontWeight: 900,
										bgcolor: alpha(theme.palette.info.main, 0.1),
									}}
								/>
							}
							height={300}
						>
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={campaignCreated14d}
									margin={{ left: 10, right: 10 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke={alpha(theme.palette.divider, 0.1)}
									/>
									<XAxis
										dataKey="day"
										axisLine={false}
										tickLine={false}
										tick={{
											fill: theme.palette.text.secondary,
											fontSize: 11,
											fontWeight: 800,
										}}
										interval={2}
										dy={10}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{
											fill: theme.palette.text.secondary,
											fontSize: 11,
											fontWeight: 800,
										}}
										allowDecimals={false}
									/>
									<Tooltip contentStyle={tooltipStyle} />
									<Line
										type="monotone"
										dataKey="value"
										stroke={theme.palette.info.main}
										strokeWidth={3}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</ChartCard>
					</Grid>

					{/* Alur Sistem */}
					<Grid size={{ xs: 12, lg: 8 }}>
						<Panel
							title="Alur Sistem Campaign"
							subtitle="Draft → Review → Aktif → Berakhir / Ditolak"
							right={
								<Button
									href="/admin/campaign"
									component="a"
									variant="text"
									endIcon={<ArrowForwardRoundedIcon />}
									sx={{
										borderRadius: 999,
										textTransform: "none",
										fontWeight: 900,
										px: 1.5,
										py: 0.6,
										bgcolor: alpha(theme.palette.action.hover, 0.06),
										"&:hover": {
											bgcolor: alpha(theme.palette.action.hover, 0.12),
										},
									}}
								>
									Monitor Semua
								</Button>
							}
						>
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: {
										xs: "repeat(2, minmax(0, 1fr))",
										sm: "repeat(3, minmax(0, 1fr))",
										md: "repeat(6, minmax(0, 1fr))",
									},
									gap: 1,
								}}
							>
								<FlowMini
									label="Draft"
									value={kpi?.campaignDraft ?? 0}
									tone="info"
								/>
								<FlowMini
									label="Menunggu Verifikasi"
									value={kpi?.campaignReview ?? 0}
									tone="warning"
								/>
								<FlowMini
									label="Aktif"
									value={kpi?.campaignActive ?? 0}
									tone="success"
								/>
								<FlowMini
									label="Berakhir"
									value={kpi?.campaignEnded ?? 0}
									tone="primary"
								/>
								<FlowMini
									label="Ditolak"
									value={kpi?.campaignRejected ?? 0}
									tone="error"
								/>
								<FlowMini
									label="Users"
									value={kpi?.usersTotal ?? 0}
									tone="info"
								/>
							</Box>

							<Box
								sx={{
									mt: 1.5,
									p: 1.25,
									borderRadius: 2.5,
									bgcolor: alpha(theme.palette.background.default, 0.42),
									border: "1px solid",
									borderColor: alpha(theme.palette.divider, 0.08),
								}}
							>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
									sx={{ mb: 0.8 }}
								>
									<Stack direction="row" spacing={0.8} alignItems="center">
										<VerifiedRoundedIcon fontSize="small" color="primary" />
										<Typography sx={{ fontSize: 12.5, fontWeight: 900 }}>
											Progress Verifikasi
										</Typography>
									</Stack>
									<Typography
										sx={{
											fontSize: 12.5,
											fontWeight: 1000,
											color: "primary.main",
										}}
									>
										{reviewSolvedRate}%
									</Typography>
								</Stack>

								<LinearProgress
									variant="determinate"
									value={reviewSolvedRate}
									sx={{
										height: 10,
										borderRadius: 999,
										bgcolor: alpha(theme.palette.primary.main, 0.12),
										"& .MuiLinearProgress-bar": {
											borderRadius: 999,
											backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
										},
									}}
								/>

								<Stack
									direction={{ xs: "column", sm: "row" }}
									spacing={1}
									sx={{ mt: 1.25 }}
								>
									<Button
										href="/admin/campaign/verifikasi"
										component="a"
										variant="contained"
										startIcon={<VerifiedRoundedIcon />}
										sx={{
											flex: 1,
											borderRadius: 999,
											fontWeight: 900,
											textTransform: "none",
											boxShadow: "none",
											py: 0.9,
										}}
									>
										Kerjakan Antrian
									</Button>

									<Button
										href="/admin/pencairan"
										component="a"
										variant="text"
										startIcon={<ReceiptLongRoundedIcon />}
										sx={{
											flex: 1,
											borderRadius: 999,
											fontWeight: 900,
											textTransform: "none",
											py: 0.9,
											bgcolor: alpha(theme.palette.action.hover, 0.06),
											"&:hover": {
												bgcolor: alpha(theme.palette.action.hover, 0.12),
											},
										}}
									>
										Proses Pencairan
									</Button>
								</Stack>
							</Box>
						</Panel>
					</Grid>

					{/* Quick tasks + recent queue */}
					<Grid size={{ xs: 12, lg: 4 }}>
						<Panel
							title="Tugas Admin"
							subtitle="Akses cepat menu prioritas"
							right={
								<Chip
									label="Priority"
									size="small"
									sx={{
										height: 22,
										borderRadius: 999,
										fontWeight: 1000,
										bgcolor: alpha(theme.palette.warning.main, 0.12),
										color: theme.palette.warning.dark,
										border: "0px solid transparent",
									}}
								/>
							}
						>
							<Stack spacing={1.25}>
								<Button
									href="/admin/campaign/verifikasi"
									component="a"
									variant="contained"
									fullWidth
									startIcon={<VerifiedRoundedIcon />}
									sx={{
										borderRadius: 2.5,
										fontWeight: 900,
										textTransform: "none",
										boxShadow: "none",
										py: 1,
										justifyContent: "flex-start",
									}}
								>
									Buka Antrian Verifikasi
								</Button>

								{[
									{
										label: "Cek Transaksi Donasi",
										icon: <VolunteerActivismRoundedIcon fontSize="small" />,
										href: "/admin/transaksi",
									},
									{
										label: "Kelola Kategori",
										icon: <CategoryRoundedIcon fontSize="small" />,
										href: "/admin/campaign/kategori",
									},
									{
										label: "Manajemen User",
										icon: <PeopleAltRoundedIcon fontSize="small" />,
										href: "/admin/users",
									},
								].map((btn) => (
									<Button
										key={btn.label}
										href={btn.href}
										component="a"
										variant="text"
										fullWidth
										startIcon={btn.icon}
										sx={{
											borderRadius: 2.5,
											fontWeight: 900,
											textTransform: "none",
											py: 1,
											justifyContent: "flex-start",
											bgcolor: alpha(theme.palette.action.hover, 0.06),
											"&:hover": {
												bgcolor: alpha(theme.palette.action.hover, 0.12),
											},
										}}
									>
										{btn.label}
									</Button>
								))}

								<Divider
									sx={{
										my: 0.5,
										borderStyle: "dashed",
										borderColor: alpha(theme.palette.divider, 0.12),
									}}
								/>

								<Stack direction="row" spacing={0.8} alignItems="center">
									<AccessTimeRoundedIcon fontSize="small" color="action" />
									<Typography sx={{ fontWeight: 1000, fontSize: 13 }}>
										Antrian terbaru
									</Typography>
								</Stack>

								<Stack spacing={1}>
									{recentQueue.map((x) => (
										<Box
											key={x.id}
											sx={{
												p: 1.25,
												borderRadius: 2.5,
												bgcolor: alpha(theme.palette.background.default, 0.42),
												border: "1px solid",
												borderColor: alpha(theme.palette.divider, 0.08),
											}}
										>
											<Typography
												sx={{ fontWeight: 1000, fontSize: 12.75, ...clamp2() }}
											>
												{x.title}
											</Typography>

											<Stack
												direction="row"
												spacing={0.6}
												alignItems="center"
												sx={{ mt: 0.6 }}
											>
												<AccessTimeRoundedIcon
													sx={{ fontSize: 14, color: "text.secondary" }}
												/>
												<Typography
													sx={{ fontSize: 12, color: "text.secondary" }}
												>
													{x.meta}
												</Typography>
											</Stack>

											<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
												<Button
													href={`/admin/campaign/${x.id}`}
													component="a"
													size="small"
													variant="text"
													endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
													sx={{
														borderRadius: 999,
														textTransform: "none",
														fontWeight: 900,
														px: 1.25,
														bgcolor: alpha(theme.palette.action.hover, 0.06),
														"&:hover": {
															bgcolor: alpha(theme.palette.action.hover, 0.12),
														},
													}}
												>
													Detail
												</Button>

												<Button
													href={`/admin/campaign/verifikasi?id=${x.id}`}
													component="a"
													size="small"
													variant="contained"
													sx={{
														borderRadius: 999,
														textTransform: "none",
														fontWeight: 900,
														boxShadow: "none",
														ml: "auto",
														px: 1.5,
													}}
												>
													Review
												</Button>
											</Stack>
										</Box>
									))}
								</Stack>
							</Stack>
						</Panel>
					</Grid>
				</Grid>
			</Stack>
		</Box>
	);
}
