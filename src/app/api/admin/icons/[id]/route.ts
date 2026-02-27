import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function DELETE(
	request: Request,
	props: { params: Promise<{ id: string }> },
) {
	try {
		const params = await props.params;
		const { id } = params;

		const icon = await prisma.categoryIcon.findUnique({
			where: { id },
		});

		if (!icon) {
			return NextResponse.json(
				{ success: false, message: "Icon not found" },
				{ status: 404 },
			);
		}

		// Check usage in CampaignCategory
		const usageCount = await prisma.campaignCategory.count({
			where: { icon: icon.url },
		});

		if (usageCount > 0) {
			return NextResponse.json(
				{
					success: false,
					message: "Icon is currently used by a category. Cannot delete.",
				},
				{ status: 400 },
			);
		}

		// Delete file
		const filePath = path.join(process.cwd(), "public", icon.url);
		if (existsSync(filePath)) {
			await unlink(filePath);
		}

		// Delete DB record
		await prisma.categoryIcon.delete({
			where: { id },
		});

		return NextResponse.json({ success: true, message: "Icon deleted" });
	} catch (error) {
		console.error("Delete error:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete icon" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	props: { params: Promise<{ id: string }> },
) {
	try {
		const params = await props.params;
		const { id } = params;
		const body = await request.json();
		const { name } = body;

		if (!name) {
			return NextResponse.json(
				{ success: false, message: "Name is required" },
				{ status: 400 },
			);
		}

		const icon = await prisma.categoryIcon.update({
			where: { id },
			data: { name },
		});

		return NextResponse.json({ success: true, icon });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: "Failed to update icon" },
			{ status: 500 },
		);
	}
}
