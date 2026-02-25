"use client";

import { Box, CircularProgress } from "@mui/material";

export default function Loading() {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				width: "100%",
				position: "fixed",
				top: 0,
				left: 0,
				zIndex: 9999,
				bgcolor: "background.default",
			}}
		>
			<CircularProgress size={60} thickness={4} color="primary" />
		</Box>
	);
}
