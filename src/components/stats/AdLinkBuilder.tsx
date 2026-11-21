"use client";

import * as React from "react";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

const SOURCES = [
	{ value: "facebook", label: "Facebook" },
	{ value: "instagram", label: "Instagram" },
	{ value: "whatsapp", label: "WhatsApp" },
	{ value: "tiktok", label: "TikTok" },
	{ value: "google", label: "Google" },
	{ value: "youtube", label: "YouTube" },
];

// utm values: lowercase, spaces → "-", only safe chars (tracking-source.ts cleans again server-side).
const slugify = (s: string) =>
	s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_.-]/g, "").slice(0, 60);

const noopSubscribe = () => () => {};

/** Builds a campaign link with utm_* so per-ad stats fill in, with a copy button. */
export default function AdLinkBuilder({ campaignSlug }: { campaignSlug: string }) {
	const [source, setSource] = React.useState("facebook");
	const [campaign, setCampaign] = React.useState("");
	const [content, setContent] = React.useState("");
	const [copied, setCopied] = React.useState(false);
	// "" during SSR, real origin after hydration (no mismatch).
	const origin = React.useSyncExternalStore(
		noopSubscribe,
		() => window.location.origin,
		() => "",
	);

	const params = new URLSearchParams({ utm_source: source });
	if (slugify(campaign)) params.set("utm_campaign", slugify(campaign));
	if (slugify(content)) params.set("utm_content", slugify(content));
	const link = `${origin}/donasi/${campaignSlug}?${params.toString()}`;

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(link);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard blocked: the link stays selectable in the field.
		}
	};

	return (
		<Stack spacing={1.5}>
			<Typography variant="body2" color="text.secondary">
				Pakai link ini di iklan atau saat membagikan, supaya terlihat iklan/sumber mana yang menghasilkan donasi
				(tabel &quot;Per sumber&quot; dan &quot;Per iklan&quot; di atas).
			</Typography>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
				<TextField select size="small" label="Dibagikan di" value={source} onChange={(e) => setSource(e.target.value)} sx={{ minWidth: 150 }}>
					{SOURCES.map((s) => (
						<MenuItem key={s.value} value={s.value}>
							{s.label}
						</MenuItem>
					))}
				</TextField>
				<TextField size="small" label="Nama kampanye iklan" placeholder="mis. ramadhan" value={campaign} onChange={(e) => setCampaign(e.target.value)} fullWidth />
				<TextField size="small" label="Nama materi (opsional)" placeholder="mis. video1" value={content} onChange={(e) => setContent(e.target.value)} fullWidth />
			</Stack>
			<Box sx={{ display: "flex", gap: 1 }}>
				<TextField size="small" value={link} fullWidth InputProps={{ readOnly: true }} onFocus={(e) => e.target.select()} />
				<Button variant="contained" onClick={copy} startIcon={<ContentCopyRoundedIcon />} sx={{ whiteSpace: "nowrap" }}>
					{copied ? "Tersalin" : "Salin"}
				</Button>
			</Box>
		</Stack>
	);
}
