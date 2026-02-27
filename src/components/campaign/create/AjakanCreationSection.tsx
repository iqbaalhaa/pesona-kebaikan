"use client";

import React from "react";
import { Box, Typography, TextField, Paper } from "@mui/material";

interface AjakanCreationSectionProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: boolean;
}

export default function AjakanCreationSection({
	value,
	onChange,
	placeholder,
	error,
}: AjakanCreationSectionProps) {
	const maxLength = 160;
	const remaining = maxLength - value.length;

	return (
		<Box>
			{/* Title & Subtitle */}
			<Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
				Tulis ajakan singkat untuk donasi di galang dana ini{" "}
				<span style={{ color: "red" }}>*</span>
			</Typography>
			<Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>
				Ini akan menjadi ajakan setiap kamu membagikan di media sosial
			</Typography>

			{/* Textarea */}
			<TextField
				size="small"
				sx={{
					"& .MuiInputBase-input": { fontSize: 13.5 },
					"& .MuiInputLabel-root": { fontSize: 13.5 },
				}}
				value={value}
				onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
				fullWidth
				multiline
				minRows={4}
				placeholder={placeholder}
				error={error}
			/>

			{/* Counter */}
			<Typography
				sx={{
					mt: 0.75,
					fontSize: 12.5,
					textAlign: "right",
					color: remaining < 0 ? "error.main" : "text.secondary",
				}}
			>
				{value.length} / {maxLength}
			</Typography>

			{/* Info Box */}
			<Paper
				variant="outlined"
				sx={{
					mt: 3,
					p: 2,
					borderRadius: 2,
					bgcolor: "rgba(248,250,252,0.5)",
					border: "1px solid",
					borderColor: "divider",
				}}
			>
				<Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1 }}>
					Apa gunanya ajakan singkat?
				</Typography>
				<Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
					Ajakan singkat akan digunakan saat kamu membagikan penggalangan kamu
					ke media sosial
				</Typography>

				{/* Visual Representation (Mockup) */}
				<Box
					sx={{
						maxWidth: 200,
						mx: 0, // Align left as per typical info boxes, or center if preferred. User screenshot shows left alignment of text but image seems centered or left. Let's keep it left for now or maybe center.
						// The screenshot has the image below the text.
						position: "relative",
					}}
				>
					<Box
						sx={{
							border: "4px solid #3b82f6",
							borderRadius: 2.5,
							overflow: "hidden",
							bgcolor: "white",
							boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
						}}
					>
						{/* Fake Phone Header */}
						<Box
							sx={{
								height: 14,
								bgcolor: "#3b82f6",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Box
								sx={{
									width: 30,
									height: 3,
									bgcolor: "rgba(255,255,255,0.3)",
									borderRadius: 99,
								}}
							/>
						</Box>

						<Box sx={{ p: 1.5, pb: 3, bgcolor: "#f0f2f5" }}>
							<Box
								sx={{
									width: "fit-content",
									bgcolor: "#dcf8c6",
									p: 1,
									borderRadius: 1.5,
									borderTopLeftRadius: 0,
									boxShadow: "0 1px 1px rgba(0,0,0,0.05)",
									maxWidth: "100%",
								}}
							>
								{/* Link Preview Card */}
								<Box
									sx={{
										bgcolor: "rgba(0,0,0,0.05)",
										borderRadius: 1,
										display: "flex",
										overflow: "hidden",
										mb: 0.5,
									}}
								>
									<Box
										sx={{
											width: 40,
											height: 40,
											bgcolor: "#94a3b8",
											flexShrink: 0,
										}}
									/>
									<Box
										sx={{
											p: 0.5,
											flex: 1,
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											gap: 0.5,
										}}
									>
										<Box
											sx={{
												height: 4,
												width: "80%",
												bgcolor: "rgba(0,0,0,0.2)",
												borderRadius: 1,
											}}
										/>
										<Box
											sx={{
												height: 4,
												width: "50%",
												bgcolor: "rgba(0,0,0,0.1)",
												borderRadius: 1,
											}}
										/>
									</Box>
								</Box>

								{/* Text */}
								<Typography
									sx={{
										fontSize: 9,
										color: "text.primary",
										lineHeight: 1.3,
									}}
								>
									Hai Put, apa kabar? Aku mau minta tolong nih. Aku lagi galang
									dana...
									<span style={{ color: "#00a884" }}>
										{" "}
										pesonakebaikan.id/anak...
									</span>
									<br />
									Terima kasih ya put 🙏
								</Typography>
							</Box>
						</Box>
					</Box>
				</Box>
			</Paper>
		</Box>
	);
}
