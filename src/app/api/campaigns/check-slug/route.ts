import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const slugify = (value: string) =>
	(value || "")
		.toLowerCase()
		.trim()
		.replace(/[^\w\s]/g, "")
		.replace(/[\s_]+/g, "");

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const raw = searchParams.get("slug") || "";
	const excludeId = searchParams.get("excludeId") || "";

	const slug = slugify(raw);

	if (!slug) {
		return NextResponse.json({ available: false, slug: "" });
	}

	const existing = await prisma.campaign.findFirst({
		where: excludeId
			? { slug, id: { not: excludeId } }
			: { slug },
		select: { id: true },
	});

	return NextResponse.json({
		available: !existing,
		slug,
	});
}

