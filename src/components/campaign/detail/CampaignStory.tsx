"use client";

import * as React from "react";
import { Box, Button, Divider } from "@mui/material";

interface CampaignStoryProps {
	data: any;
	showFullStory: boolean;
	setShowFullStory: (show: boolean) => void;
}

export default function CampaignStory({
	data,
	showFullStory,
	setShowFullStory,
}: CampaignStoryProps) {
	return (
		<>
			<Box
				sx={{
					position: "relative",
				}}
			>
				<Box
					sx={{
						color: "#334155",
						lineHeight: 1.8,
						fontSize: 15,
						maxHeight: showFullStory ? "none" : 300,
						overflow: "hidden",
						"& p": { mb: 2 },
						"& ul": { mb: 2, pl: 2 },
						"& li": { mb: 0.5 },
						"& img": {
							maxWidth: "100%",
							height: "auto",
							borderRadius: 2,
							display: "block",
						},
					}}
					dangerouslySetInnerHTML={{ __html: data.description }}
				/>
				{!showFullStory && (
					<Box
						sx={{
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							height: 120,
							background:
								"linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 80%)",
							pointerEvents: "none",
						}}
					/>
				)}
			</Box>
			<Button
				onClick={() => setShowFullStory(!showFullStory)}
				fullWidth
				sx={{ mt: 2, textTransform: "none", color: "#0ba976" }}
			>
				{showFullStory ? "Tutup Cerita" : "Baca Selengkapnya"}
			</Button>

			<Divider sx={{ my: 3 }} />
		</>
	);
}
