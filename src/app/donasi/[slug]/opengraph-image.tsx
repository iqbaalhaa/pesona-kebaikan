import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCampaignBySlug } from "@/actions/campaign";
import { idr } from "@/lib/currency";

// Branded OG card rendered as PNG so WhatsApp/Facebook always show a preview.
// Stored covers are .webp (not renderable by WhatsApp), so we re-encode the
// cover to PNG with sharp and composite it; falls back to a solid card.

export const runtime = "nodejs";
export const alt = "Pesona Kebaikan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#0DA85A";

async function loadLogoDataUri(): Promise<string | null> {
	try {
		const file = await readFile(path.join(process.cwd(), "src/app/favicon.png"));
		return `data:image/png;base64,${file.toString("base64")}`;
	} catch {
		return null;
	}
}

async function loadCoverDataUri(url?: string): Promise<string | null> {
	if (!url || !/^https?:\/\//.test(url)) return null;
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const input = Buffer.from(await res.arrayBuffer());
		const sharpModule = await import("sharp");
		const sharp = sharpModule.default || sharpModule;
		const png = await sharp(input)
			.rotate()
			.resize(size.width, size.height, { fit: "cover" })
			.png()
			.toBuffer();
		return `data:image/png;base64,${png.toString("base64")}`;
	} catch {
		return null;
	}
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const res = await getCampaignBySlug(slug);
	const data = res.success ? res.data : null;

	const rawFundraiserTitle = (data as any)?.fundraiserTitle;
	const title =
		typeof rawFundraiserTitle === "string" && rawFundraiserTitle.trim()
			? rawFundraiserTitle
			: data?.title || "Pesona Kebaikan";

	const target = Number(data?.target) || 0;
	const collected = Number(data?.collected) || 0;
	const percent = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;
	const daysLeft = Number(data?.daysLeft) || 0;

	const coverUrl =
		data?.thumbnail ||
		(Array.isArray(data?.images) && data?.images.length ? data!.images[0] : undefined);

	const [logo, cover] = await Promise.all([
		loadLogoDataUri(),
		loadCoverDataUri(coverUrl),
	]);

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					position: "relative",
					backgroundColor: "#ffffff",
					fontFamily: "sans-serif",
				}}
			>
				{cover ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={cover}
						alt=""
						width={size.width}
						height={size.height}
						style={{ position: "absolute", inset: 0, objectFit: "cover" }}
					/>
				) : (
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: `linear-gradient(135deg, ${BRAND} 0%, #0a8f4c 100%)`,
						}}
					/>
				)}

				{/* Bottom gradient for legibility */}
				<div
					style={{
						position: "absolute",
						left: 0,
						right: 0,
						bottom: 0,
						height: 360,
						background:
							"linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
						display: "flex",
					}}
				/>

				{/* Top brand row */}
				<div
					style={{
						position: "absolute",
						top: 40,
						left: 48,
						display: "flex",
						alignItems: "center",
						gap: 16,
					}}
				>
					{logo && (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={logo} alt="" width={64} height={64} />
					)}
					<div
						style={{
							color: "#ffffff",
							fontSize: 34,
							fontWeight: 700,
							textShadow: "0 2px 8px rgba(0,0,0,0.5)",
						}}
					>
						Pesona Kebaikan
					</div>
				</div>

				{/* Bottom content */}
				<div
					style={{
						position: "absolute",
						left: 48,
						right: 48,
						bottom: 48,
						display: "flex",
						flexDirection: "column",
						gap: 20,
					}}
				>
					<div
						style={{
							color: "#ffffff",
							fontSize: 52,
							fontWeight: 800,
							lineHeight: 1.1,
							display: "flex",
						}}
					>
						{title.length > 90 ? `${title.slice(0, 87)}...` : title}
					</div>

					{/* Progress bar */}
					<div
						style={{
							width: "100%",
							height: 16,
							borderRadius: 999,
							backgroundColor: "rgba(255,255,255,0.3)",
							display: "flex",
						}}
					>
						<div
							style={{
								width: `${percent}%`,
								height: "100%",
								borderRadius: 999,
								backgroundColor: BRAND,
								display: "flex",
							}}
						/>
					</div>

					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							color: "#ffffff",
							fontSize: 30,
							fontWeight: 600,
						}}
					>
						<div style={{ display: "flex" }}>Terkumpul {idr(collected)}</div>
						<div style={{ display: "flex" }}>
							{daysLeft > 0 ? `${daysLeft} hari lagi` : "Donasi sekarang"}
						</div>
					</div>
				</div>
			</div>
		),
		{ ...size },
	);
}
