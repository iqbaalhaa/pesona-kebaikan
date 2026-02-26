"use client";

import * as React from "react";
import { Box, Container, Typography, Chip, Stack, TextField, InputAdornment } from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CampaignCard, { CampaignCardSkeleton } from "@/components/common/CampaignCard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export type CampaignItem = {
	id: string;
	slug?: string;
	title: string;
	category: string;
	type?: string;
	ownerName: string;
	target: number;
	collected: number;
	donors: number;
	daysLeft: number;
	status: string;
	updatedAt: string;
	thumbnail: string;
	isEmergency?: boolean;
	verifiedAt?: Date | string | null;
};

export default function DonationExplorer({
	initialData,
	categories = [],
}: {
	initialData: CampaignItem[];
	categories?: string[];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	// Theme usage moved into card component

	// URL State
	const q = searchParams.get("q") || "";
	const category = searchParams.get("category") || "Semua";
	const onlyVerified = searchParams.get("verified") === "true";
	const onlyUrgent = searchParams.get("urgent") === "true";

	// Local state for search input
	const [searchVal, setSearchVal] = React.useState("");
	const inputRef = React.useRef<HTMLInputElement>(null);

	// Keep input independent from URL/query changes

	// Debounce search update
	React.useEffect(() => {
		const timer = setTimeout(() => {
			if (searchVal !== q) {
				updateParam("q", searchVal || null);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [searchVal]);

	const updateParam = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) params.set(key, value);
		else params.delete(key);
		router.replace(`/donasi?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		updateParam("q", searchVal || null);
	};

	const toggleVerified = () =>
		updateParam("verified", onlyVerified ? null : "true");
	const toggleUrgent = () => updateParam("urgent", onlyUrgent ? null : "true");

	const categoryList = ["Semua", ...categories];

	return (
		<Container maxWidth="xl" sx={{ py: 4 }}>
			{/* Header & Search */}
			<Box
				sx={{
					mb: 4,
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					gap: 2,
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box>
					<Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
						Jelajahi Donasi
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Temukan kampanye yang sesuai dengan kepedulian Anda.
					</Typography>
				</Box>

				<Box
					component="form"
					onSubmit={handleSearch}
					sx={{ width: { xs: "100%", md: 400 } }}
				>
					<TextField
						fullWidth
						inputRef={inputRef}
						placeholder="Cari donasi..."
						value={searchVal}
						onChange={(e) => setSearchVal(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchRoundedIcon />
								</InputAdornment>
							),
							sx: { borderRadius: 3, bgcolor: "background.paper" },
						}}
						size="small"
					/>
				</Box>
			</Box>

			{/* Filters */}
			<Stack
				direction="row"
				spacing={1}
				sx={{ mb: 3, overflowX: "auto", pb: 1 }}
				alignItems="center"
			>
				{categoryList.map((cat) => (
					<Chip
						key={cat}
						label={cat}
						onClick={() =>
							updateParam("category", cat === "Semua" ? null : cat)
						}
						color={category === cat ? "primary" : "default"}
						variant={category === cat ? "filled" : "outlined"}
						clickable
						sx={{ fontWeight: 600 }}
					/>
				))}

				<Box sx={{ flexGrow: 1 }} />

				<Chip
					label="Mendesak"
					onClick={toggleUrgent}
					color={onlyUrgent ? "error" : "default"}
					variant={onlyUrgent ? "filled" : "outlined"}
					clickable
				/>
				<Chip
					label="Terverifikasi"
					onClick={toggleVerified}
					color={onlyVerified ? "info" : "default"}
					variant={onlyVerified ? "filled" : "outlined"}
					icon={onlyVerified ? <VerifiedUserIcon /> : undefined}
					clickable
				/>
			</Stack>

			{/* List Grid */}
			<Box
				sx={{
					mt: 2,
					display: "grid",
					gridTemplateColumns: "repeat(2, minmax(0, 1fr))", // ✅ selalu 2 kolom
					gap: 1.25, // ✅ lebih rapat (sebelumnya 2)
				}}
			>
				{initialData.length === 0 && (
					<Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 6 }}>
						<Typography variant="body1" color="text.secondary">
							Belum ada donasi yang sesuai kriteria.
						</Typography>
					</Box>
				)}

				{initialData.map((x) => (
					<ErrorBoundary key={x.id} fallback={<CampaignCardSkeleton />}>
						<CampaignCard
							id={x.id}
							slug={x.slug}
							title={x.title}
							category={x.category}
							ownerName={x.ownerName}
							target={x.target}
							collected={x.collected}
							daysLeft={x.daysLeft}
							thumbnail={x.thumbnail}
							verifiedAt={x.verifiedAt}
						/>
					</ErrorBoundary>
				))}
			</Box>
		</Container>
	);
}
