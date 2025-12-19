"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme } from "@/theme";
import { SessionProvider } from "next-auth/react";

export default function ThemeWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	// Force light mode as per user request
	// const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

	const theme = React.useMemo(
		() => lightTheme, // Always use light theme
		[]
	);

	// Prevent hydration mismatch by rendering only after mount
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null; // or a loading spinner / default light theme structure
	}

	return (
		<SessionProvider>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</SessionProvider>
	);
}
