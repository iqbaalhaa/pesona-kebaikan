"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { keyframes } from "@mui/system";

const PRIMARY = "#61ce70";

type Prayer = {
	id: string;
	name: string;
	time: string;
	campaignTitle: string;
	message: string;
	amiinCount: number;
};

const prayers: Prayer[] = [
	{
		id: "d1",
		name: "Amanda",
		time: "9 jam lalu",
		campaignTitle: "TUHANI Tolong Jamah Anak-Anak...",
		message: "Smoga bermanfaat dan menjadi berkatt",
		amiinCount: 5,
	},
	{
		id: "d2",
		name: "Anonim",
		time: "3 jam lalu",
		campaignTitle: "Bantu Operasi Darurat untuk Pasien...",
		message: "Semoga lekas sembuh dan dipermudah semuanya. Aamiin.",
		amiinCount: 18,
	},
	{
		id: "d3",
		name: "Rina",
		time: "Kemarin",
		campaignTitle: "DARURAT! Bantu Korban Banjir...",
		message: "Semoga cepat terkumpul dan penyaluran lancar ya.",
		amiinCount: 11,
	},
];

const heartFloat = keyframes`
  0%   { transform: translate(0, 0) scale(.85); opacity: 0; }
  12%  { opacity: 1; }
  100% { transform: translate(var(--dx), -54px) scale(1.15); opacity: 0; }
`;

const confettiFloat = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translate(var(--dx), -62px) rotate(var(--rot)); opacity: 0; }
`;

const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.06); }
  100% { transform: scale(1); }
`;

function AvatarIcon() {
	return (
		<Box
			sx={{
				width: 34,
				height: 34,
				borderRadius: 999,
				display: "grid",
				placeItems: "center",
				bgcolor: "rgba(15,23,42,0.06)",
				border: "1px solid rgba(15,23,42,0.08)",
				flexShrink: 0,
			}}
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				style={{ color: "rgba(15,23,42,.55)" }}
			>
				<path d="M20 21a8 8 0 1 0-16 0" />
				<circle cx="12" cy="7" r="4" />
			</svg>
		</Box>
	);
}

function HeartIcon({ filled }: { filled: boolean }) {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill={filled ? PRIMARY : "none"}
			stroke={filled ? PRIMARY : "rgba(15,23,42,.55)"}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ display: "block" }}
		>
			<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
		</svg>
	);
}

type Particle = {
	id: string;
	prayerId: string;
	kind: "heart" | "confetti";
	dx: number;
	delayMs: number;
	rotDeg?: number;
	size?: number;
	color?: string;
};

export default function PrayersSection() {
	const [liked, setLiked] = React.useState<Record<string, boolean>>({});
	const [particles, setParticles] = React.useState<Particle[]>([]);
	const [pulsing, setPulsing] = React.useState<Record<string, boolean>>({});

	const idRef = React.useRef(0);
	const nextId = React.useCallback(() => {
		idRef.current += 1;
		return `p_${idRef.current.toString(36)}`;
	}, []);

	const pulseCount = (prayerId: string) => {
		setPulsing((prev) => ({ ...prev, [prayerId]: true }));
		window.setTimeout(() => {
			setPulsing((prev) => ({ ...prev, [prayerId]: false }));
		}, 260);
	};

	const spawnFX = (prayerId: string) => {
		const base = [-22, -12, -4, 4, 12, 22];
		const hearts: Particle[] = Array.from({ length: 6 }).map((_, i) => {
			const jitter = ((i % 3) - 1) * 2; // -2, 0, 2 pattern
			return {
				id: `${nextId()}_h${i}`,
				prayerId,
				kind: "heart",
				dx: base[i] + jitter,
				delayMs: i * 45,
			};
		});

		const confetti: Particle[] = Array.from({ length: 8 }).map((_, i) => {
			const size = 4 + (i % 4);
			const color =
				i % 2 === 0 ? "rgba(97,206,112,0.95)" : "rgba(15,23,42,0.18)";
			const dx = ((i * 9) % 56) - 28;
			const rot = ((i * 37) % 260) - 130;
			return {
				id: `${nextId()}_c${i}`,
				prayerId,
				kind: "confetti",
				dx,
				delayMs: 60 + i * 30,
				rotDeg: rot,
				size,
				color,
			};
		});

		const next = [...hearts, ...confetti];
		setParticles((prev) => [...prev, ...next]);

		next.forEach((p) => {
			const dur = p.kind === "heart" ? 900 : 800;
			window.setTimeout(() => {
				setParticles((prev) => prev.filter((x) => x.id !== p.id));
			}, dur + p.delayMs + 80);
		});
	};

	const toggleAmiin = (id: string) => {
		spawnFX(id);
		pulseCount(id);
		setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<Box sx={{ px: 2, mt: 2.5 }}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: 1.25,
				}}
			>
				<Typography sx={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
					Doa-doa orang baik
				</Typography>

				<Button
					size="small"
					variant="text"
					sx={{
						textTransform: "none",
						fontWeight: 800,
						color: "rgba(15,23,42,.60)",
						px: 1,
						borderRadius: 2,
						"&:hover": { bgcolor: "rgba(15,23,42,.04)" },
					}}
					onClick={() => alert("Lihat semua doa (route menyusul)")}
				>
					Lihat semua
				</Button>
			</Box>

			<Box
				sx={{
					display: "flex",
					gap: 1.25,
					overflowX: "auto",
					pb: 1,
					scrollSnapType: "x mandatory",
					WebkitOverflowScrolling: "touch",
					"&::-webkit-scrollbar": { height: 0 },
				}}
			>
				{prayers.map((p) => {
					const isLiked = !!liked[p.id];
					const isPulse = !!pulsing[p.id];
					const localParticles = particles.filter((x) => x.prayerId === p.id);

					return (
						<Box
							key={p.id}
							sx={{
								minWidth: 260,
								maxWidth: 260,
								borderRadius: "10px",
								bgcolor: "#fff",
								border: "1px solid rgba(15,23,42,0.08)",
								boxShadow: "0 14px 26px rgba(15,23,42,.06)",
								overflow: "hidden",
								scrollSnapAlign: "start",
							}}
						>
							<Box sx={{ p: 1.4 }}>
								<Box
									sx={{ display: "flex", alignItems: "flex-start", gap: 1.1 }}
								>
									<AvatarIcon />

									<Box sx={{ minWidth: 0, flex: 1 }}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												gap: 1,
											}}
										>
											<Typography
												sx={{
													fontSize: 12.5,
													fontWeight: 1000,
													color: "#0f172a",
													lineHeight: 1.1,
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
												}}
											>
												{p.name}
											</Typography>

											<Typography
												sx={{
													fontSize: 10.5,
													color: "rgba(15,23,42,.45)",
													flexShrink: 0,
												}}
											>
												• {p.time}
											</Typography>
										</Box>

										<Box
											sx={{
												mt: 0.55,
												display: "inline-flex",
												maxWidth: "100%",
												px: 1,
												py: "3px",
												borderRadius: 999,
												border: "1px solid rgba(97,206,112,0.22)",
												bgcolor: "rgba(97,206,112,0.10)",
											}}
										>
											<Typography
												sx={{
													fontSize: 10.5,
													fontWeight: 900,
													color: "rgba(15,23,42,.70)",
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
													maxWidth: "100%",
												}}
											>
												{p.campaignTitle}
											</Typography>
										</Box>
									</Box>

									<Box
										sx={{
											color: "rgba(15,23,42,.35)",
											fontWeight: 900,
											mt: 0.2,
										}}
									>
										⋯
									</Box>
								</Box>

								<Typography
									sx={{
										mt: 1.2,
										fontSize: 12.5,
										color: "rgba(15,23,42,.78)",
										lineHeight: 1.35,
										display: "-webkit-box",
										WebkitLineClamp: 4,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
										minHeight: 70,
									}}
								>
									{p.message}
								</Typography>

								<Typography
									sx={{
										mt: 1.2,
										fontSize: 10.5,
										color: "rgba(15,23,42,.45)",
										display: "inline-block",
										animation: isPulse ? `${pop} 260ms ease` : "none",
									}}
								>
									{p.amiinCount + (isLiked ? 1 : 0)} orang mengaminkan doa ini
								</Typography>
							</Box>

							{/* Footer */}
							<Box
								sx={{
									p: 1.1,
									position: "relative",
									bgcolor: "#fff",
									borderTop: "1px solid rgba(15,23,42,0.06)",
								}}
							>
								{/* FX layer (di bawah tombol) */}
								<Box
									sx={{
										position: "absolute",
										inset: 0,
										pointerEvents: "none",
										overflow: "hidden",
										zIndex: 0,
									}}
								>
									{localParticles.map((pt) => {
										if (pt.kind === "heart") {
											return (
												<Box
													key={pt.id}
													sx={{
														position: "absolute",
														left: "50%",
														bottom: 18,
														transform: `translateX(${pt.dx}px)`,
													}}
												>
													<Box
														sx={{
															"--dx": "0px",
															animation: `${heartFloat} 900ms ease-out`,
															animationDelay: `${pt.delayMs}ms`,
															opacity: 0,
														}}
													>
														<svg
															width="16"
															height="16"
															viewBox="0 0 24 24"
															fill={PRIMARY}
															stroke={PRIMARY}
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
														</svg>
													</Box>
												</Box>
											);
										}

										const size = pt.size ?? 5;
										const rot = pt.rotDeg ?? 90;
										const color = pt.color ?? "rgba(15,23,42,0.18)";

										return (
											<Box
												key={pt.id}
												sx={{
													position: "absolute",
													left: "50%",
													bottom: 18,
												}}
											>
												<Box
													sx={{
														"--dx": `${pt.dx}px`,
														"--rot": `${rot}deg`,
														width: size,
														height: size * 0.8,
														borderRadius: 1,
														bgcolor: color,
														animation: `${confettiFloat} 800ms ease-out`,
														animationDelay: `${pt.delayMs}ms`,
														opacity: 0,
													}}
												/>
											</Box>
										);
									})}
								</Box>

								{/* Tombol Aamiin (pasti tampil) */}
								<Button
									onClick={() => toggleAmiin(p.id)}
									fullWidth
									disableRipple
									variant="contained"
									sx={{
										position: "relative",
										zIndex: 2,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 1,
										borderRadius: 2.5,
										py: 1,
										border: "1px solid rgba(15,23,42,0.10)",
										bgcolor: "rgba(15,23,42,0.02)",
										color: isLiked ? PRIMARY : "rgba(15,23,42,.75)",
										textTransform: "none",
										fontWeight: 800,
										boxShadow: "none",
										"&:hover": {
											bgcolor: "rgba(15,23,42,0.06)",
											boxShadow: "none",
											border: "1px solid rgba(15,23,42,0.10)",
										},
										"&:active": { transform: "scale(0.97)" },
									}}
								>
									<Box
										component="span"
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											animation: isPulse ? `${pop} 260ms ease` : "none",
										}}
									>
										<HeartIcon filled={isLiked} />
										<Typography
											component="span"
											sx={{
												fontSize: 13,
												fontWeight: "inherit",
												lineHeight: 1,
											}}
										>
											Aamiin
										</Typography>
									</Box>
								</Button>
							</Box>
						</Box>
					);
				})}
			</Box>

			<Box sx={{ mt: 1.5, height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />
		</Box>
	);
}
