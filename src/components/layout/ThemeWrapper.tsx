"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "@/theme";

export const ColorModeContext = React.createContext({
	toggleColorMode: () => {},
	mode: "light" as "light" | "dark",
});

export default function ThemeWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const [mode, setMode] = React.useState<"light" | "dark">("light");

	React.useEffect(() => {
		const savedMode = localStorage.getItem("themeMode") as "light" | "dark";
		if (savedMode) {
			setMode(savedMode);
		}
	}, []);

	const colorMode = React.useMemo(
		() => ({
			toggleColorMode: () => {
				setMode((prevMode) => {
					const newMode = prevMode === "light" ? "dark" : "light";
					localStorage.setItem("themeMode", newMode);
					return newMode;
				});
			},
			mode,
		}),
		[mode]
	);

	const theme = React.useMemo(
		() => (mode === "light" ? lightTheme : darkTheme),
		[mode]
	);

	// Prevent hydration mismatch
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);

	// Sync mode with Tailwind class
	React.useEffect(() => {
		if (mode === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [mode]);

	if (!mounted) {
		return null;
	}

	return (
		<ColorModeContext.Provider value={colorMode}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
}
