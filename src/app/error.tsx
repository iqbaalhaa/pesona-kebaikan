"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
					Terjadi Kesalahan
				</Typography>
				<Typography color="text.secondary" paragraph>
					Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
				</Typography>
				{process.env.NODE_ENV !== "production" && (
					<Typography
						variant="caption"
						component="pre"
						sx={{
							mt: 2,
							p: 2,
							bgcolor: "grey.100",
							borderRadius: 1,
							overflow: "auto",
							textAlign: "left",
						}}
					>
						{error.message}
					</Typography>
				)}
			</Box>
			<Button variant="contained" onClick={() => reset()}>
				Coba Lagi
			</Button>
		</Container>
	);
}
