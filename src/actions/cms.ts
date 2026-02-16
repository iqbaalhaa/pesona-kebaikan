"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// --- FAQ Actions ---

export async function getFaqs() {
	return await prisma.faq.findMany({
		orderBy: { createdAt: "desc" },
	});
}

export async function createFaq(data: { question: string; answer: string }) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

	await prisma.faq.create({
		data,
	});
	revalidatePath("/admin/bantuan");
	revalidatePath("/profil/bantuan");
	return { success: true };
}

export async function updateFaq(
	id: string,
	data: { question: string; answer: string }
) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

	await prisma.faq.update({
		where: { id },
		data,
	});
	revalidatePath("/admin/bantuan");
	revalidatePath("/profil/bantuan");
	return { success: true };
}

export async function deleteFaq(id: string) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

	await prisma.faq.delete({
		where: { id },
	});
	revalidatePath("/admin/bantuan");
	revalidatePath("/profil/bantuan");
	return { success: true };
}

// --- Page Content Actions ---

export async function getPageContent(key: string) {
	return await prisma.pageContent.findUnique({
		where: { key },
	});
}

export async function updatePageContent(
	key: string,
	data: { title: string; content: string; data?: unknown }
) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

	const jsonData =
		data.data === undefined
			? undefined
			: data.data === null
			? Prisma.DbNull
			: (data.data as Prisma.InputJsonValue);

	const upsertData = {
		title: data.title,
		content: data.content,
		data: jsonData,
	};

	await prisma.pageContent.upsert({
		where: { key },
		update: upsertData,
		create: { key, ...upsertData },
	});

	// Revalidate admin and public pages based on key
	const publicPath =
		key === "about"
			? "/profil/tentang"
			: key === "terms"
			? "/profil/syarat-ketentuan"
			: key === "accountability"
			? "/profil/akuntabilitas"
			: key === "fundraise_guide"
			? "/galang-dana/panduan"
			: "";

	if (publicPath) revalidatePath(publicPath);

	// Revalidate admin path
	const adminPath =
		key === "about"
			? "/admin/tentang"
			: key === "terms"
			? "/admin/syarat-ketentuan"
			: key === "accountability"
			? "/admin/akuntabilitas"
			: key === "fundraise_guide"
			? "/admin/panduan-galang-dana"
			: "";

	if (adminPath) revalidatePath(adminPath);

	return { success: true };
}
