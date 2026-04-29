"use client";

import * as React from "react";
import { Box, Typography, Chip, Stack, TextField, InputAdornment } from "@mui/material";
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
	fundraisers = [],
}: {
	initialData: CampaignItem[];
	categories?: string[];
	fundraisers?: CampaignItem[];
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const tab = searchParams.get("tab") || "campaign";
	const q = searchParams.get("q") || "";
	const category = searchParams.get("category") || "Semua";
	const onlyVerified = searchParams.get("verified") === "true";
	const onlyUrgent = searchParams.get("urgent") === "true";

	// Local state for search input
	const [searchVal, setSearchVal] = React.useState(q);
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
		<Box sx={{ pb: 4 }}>
			{/* Sticky Header */}
			<Box
				sx={{
					pt: 2,
					pb: 1.5,
					px: 2,
					bgcolor: "background.paper",
					borderBottom: "1px solid",
					borderColor: "divider",
					position: "sticky",
					top: 0,
					zIndex: 10,
				}}
			>
				<Typography sx={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
					Jelajahi Donasi
				</Typography>
				<Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
					Temukan kampanye yang sesuai dengan kepedulian Anda
				</Typography>
				<Box
					component="form"
					onSubmit={handleSearch}
					sx={{ mt: 1.5 }}
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
							sx: { borderRadius: 3, bgcolor: "background.default" },
						}}
						size="small"
					/>
				</Box>
			</Box>

			<Box sx={{ px: 2, mt: 2 }}>
			{/* Tabs */}
			<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
				<Chip
					label="Campaign"
					onClick={() => updateParam("tab", null)}
					color={tab === "campaign" ? "primary" : "default"}
					variant={tab === "campaign" ? "filled" : "outlined"}
					clickable
					sx={{ fontWeight: 700 }}
				/>
				<Chip
					label={`Fundraiser${fundraisers.length > 0 ? ` (${fundraisers.length})` : ""}`}
					onClick={() => updateParam("tab", "fundraiser")}
					color={tab === "fundraiser" ? "primary" : "default"}
					variant={tab === "fundraiser" ? "filled" : "outlined"}
					clickable
					sx={{ fontWeight: 700 }}
				/>
			</Stack>

			{tab === "campaign" && (
				<>
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

					{/* Campaign Grid */}
					<Box
						sx={{
							mt: 2,
							display: "grid",
							gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
							gap: 1.25,
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
				</>
			)}

			{tab === "fundraiser" && (
				<Box
					sx={{
						mt: 2,
						display: "grid",
						gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
						gap: 1.25,
					}}
				>
					{fundraisers.length === 0 ? (
						<Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 6 }}>
							<Typography variant="body1" color="text.secondary">
								Belum ada fundraiser aktif.
							</Typography>
						</Box>
					) : (
						fundraisers.map((x) => (
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
						))
					)}
				</Box>
			)}
		</Box>
		</Box>
	);
}
