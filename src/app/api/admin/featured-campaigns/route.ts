import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
	try {
		const campaigns = await prisma.campaign.findMany({
			// Only ACTIVE + not-yet-ended campaigns can appear here — same
			// convention as the public getFeaturedCampaigns() query. This is
			// what makes an ended campaign automatically drop out of the
			// admin's "Urutan Tampil" list too (previously it stayed listed
			// here forever even after it silently disappeared from the public
			// homepage, which is what looked like a mismatch — 3 selected in
			// admin, only 1 actually showing publicly).
			where: {
				NOT: { slug: "donasi-cepat" },
				status: "ACTIVE",
				OR: [{ end: null }, { end: { gte: new Date() } }],
			},
			select: {
				id: true,
				title: true,
				slug: true,
				metadata: true as any,
				media: { where: { isThumbnail: true }, take: 1 },
			},
			orderBy: { createdAt: "desc" },
			take: 200,
		});

		const featured = campaigns
			.map((c: any) => {
				const m = c.metadata || {};
				const isFeatured = m?.featured === true || m?.featured === "true";
				const order =
					typeof m?.featuredOrder === "number"
						? m.featuredOrder
						: parseInt(m?.featuredOrder || "0", 10) || 0;
				return {
					id: c.id,
					title: c.title,
					slug: c.slug,
					cover: c.media[0]?.url || "",
					featured: isFeatured,
					order,
				};
			})
			.filter((f) => f.featured)
			.sort((a, b) => a.order - b.order);

		return NextResponse.json(featured);
	} catch (error) {
		console.error("Featured Campaigns API Error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function POST(req: Request) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		const body = await req.json();
		const items: { id: string; order: number }[] = Array.isArray(body?.items)
			? body.items
			: [];
		const wanted = new Set(items.map((i) => i.id));

		const campaigns = await prisma.campaign.findMany({
			where: { NOT: { slug: "donasi-cepat" } },
			select: { id: true, metadata: true as any },
			take: 500,
		});

		const previouslyFeatured = campaigns
			.filter((c: any) => {
				const m = c.metadata || {};
				return m?.featured === true || m?.featured === "true";
			})
			.map((c) => c.id);

		const toRemove = previouslyFeatured.filter((id) => !wanted.has(id));

		// Apply updates for selected items
		for (const it of items) {
			const curr = campaigns.find((c) => c.id === it.id);
			const m = (curr as any)?.metadata || {};
			await prisma.campaign.update({
				where: { id: it.id },
				data: {
					metadata: { ...m, featured: true, featuredOrder: it.order },
				},
			});
		}

		// Unset removed items
		for (const id of toRemove) {
			const curr = campaigns.find((c) => c.id === id);
			const m = (curr as any)?.metadata || {};
			await prisma.campaign.update({
				where: { id },
				data: {
					metadata: { ...m, featured: false, featuredOrder: null },
				},
			});
		}

		revalidatePath("/");
		revalidatePath("/admin/campaign-pilihan");
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Featured Campaigns Save API Error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
