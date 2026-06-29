import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Branded site-wide OG card (homepage + all pages without their own image).
// Rendered as PNG so WhatsApp/Facebook always show a preview.

export const runtime = "nodejs";
export const alt = "Pesona Kebaikan – Platform Donasi dan Galang Dana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "#0ba976";
const BRAND_DARK = "#059669";

// Headline & subtext configurable via env (falls back to defaults).
const HEADLINE_LINE1 = process.env.NEXT_PUBLIC_OG_HEADLINE_1 || "Berbagi Kebaikan,";
const HEADLINE_LINE2 = process.env.NEXT_PUBLIC_OG_HEADLINE_2 || "Menguatkan Sesama";
const SUBTEXT =
	process.env.NEXT_PUBLIC_OG_SUBTEXT ||
	"Platform donasi & galang dana online — transparan dan terpercaya.";

async function loadLogoDataUri(): Promise<string | null> {
	try {
		const file = await readFile(path.join(process.cwd(), "public/brand/logo.png"));
		return `data:image/png;base64,${file.toString("base64")}`;
	} catch {
		return null;
	}
}

export default async function Image() {
	const logo = await loadLogoDataUri();

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
					background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
					fontFamily: "sans-serif",
				}}
			>
				{/* Soft radial glow */}
				<div
					style={{
						position: "absolute",
						top: -200,
						right: -150,
						width: 600,
						height: 600,
						borderRadius: 999,
						background: "rgba(255,255,255,0.12)",
						display: "flex",
					}}
				/>
				<div
					style={{
						position: "absolute",
						bottom: -220,
						left: -160,
						width: 560,
						height: 560,
						borderRadius: 999,
						background: "rgba(255,255,255,0.08)",
						display: "flex",
					}}
				/>

				{/* Logo badge */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: 132,
						height: 132,
						borderRadius: 32,
						backgroundColor: "#ffffff",
						boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
						marginBottom: 40,
					}}
				>
					{logo && (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={logo} alt="" width={92} height={92} style={{ objectFit: "contain" }} />
					)}
				</div>

				{/* Headline */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
						color: "#ffffff",
						fontSize: 64,
						fontWeight: 800,
						lineHeight: 1.15,
						letterSpacing: -1,
						textShadow: "0 2px 12px rgba(0,0,0,0.25)",
					}}
				>
					<div style={{ display: "flex" }}>{HEADLINE_LINE1}</div>
					{HEADLINE_LINE2 && <div style={{ display: "flex" }}>{HEADLINE_LINE2}</div>}
				</div>

				{/* Subtext */}
				<div
					style={{
						display: "flex",
						maxWidth: 880,
						textAlign: "center",
						color: "rgba(255,255,255,0.92)",
						fontSize: 30,
						fontWeight: 500,
						marginTop: 28,
						lineHeight: 1.35,
					}}
				>
					{SUBTEXT}
				</div>

				{/* Brand footer */}
				<div
					style={{
						position: "absolute",
						bottom: 40,
						display: "flex",
						alignItems: "center",
						gap: 12,
						color: "#ffffff",
						fontSize: 28,
						fontWeight: 700,
						opacity: 0.95,
					}}
				>
					Pesona Kebaikan
				</div>
			</div>
		),
		{ ...size },
	);
}
