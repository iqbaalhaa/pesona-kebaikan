import Box from "@mui/material/Box";
import HomeFeed from "@/components/home/HomeFeed";
import ExploreSection from "@/components/home/ExploreSection";
import MiniFooter from "@/components/home/MiniFooter";
import { getHomeFeed } from "@/lib/home-feed";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

// Static (ISR) so the layout's auth() doesn't make every visit hit the DB;
// the feed is baked into the HTML and refreshed at most every 30s, so the
// hero image starts loading without waiting for JS + /api/home.
export const dynamic = "force-static";
export const revalidate = 30;

// Meta Business domain verification tag, set from /admin/settings. Meta checks
// the domain root, so the homepage is enough. Admins may paste the whole
// <meta> tag; keep only the code.
export async function generateMetadata(): Promise<Metadata> {
	const row = await prisma.notifyKey
		.findUnique({ where: { key: "meta_domain_verification" } })
		.catch(() => null);
	const raw = row?.value?.trim() ?? "";
	const code = (raw.match(/content=["']([^"']+)["']/)?.[1] ?? raw).replace(/[^A-Za-z0-9]/g, "");
	return code ? { other: { "facebook-domain-verification": code } } : {};
}

export default async function Home() {
	// DB down (e.g. at build time): fall back to HomeFeed's client fetch.
	// JSON round-trip keeps the props identical to what /api/home returns.
	const initialData = await getHomeFeed()
		.then((d) => JSON.parse(JSON.stringify(d)))
		.catch((e) => {
			console.error("home feed prerender failed:", e);
			return undefined;
		});

	return (
		<Box sx={{ pb: 2 }}>
			<HomeFeed initialData={initialData} />
			<ExploreSection />
			<MiniFooter />
		</Box>
	);
}
