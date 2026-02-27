"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html>
			<body>
				<Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
					<Box sx={{ mb: 4 }}>
						<Typography
							variant="h4"
							component="h1"
							gutterBottom
							fontWeight="bold"
						>
							Terjadi Kesalahan Fatal
						</Typography>
						<Typography color="text.secondary" paragraph>
							Maaf, terjadi kesalahan sistem. Silakan muat ulang halaman.
						</Typography>
					</Box>
					<Button variant="contained" onClick={() => reset()}>
						Muat Ulang
					</Button>
				</Container>
			</body>
		</html>
	);
}
