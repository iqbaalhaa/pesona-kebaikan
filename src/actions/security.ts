"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function changePassword(prevState: any, formData: FormData) {
	const currentPassword = formData.get("currentPassword") as string;
	const newPassword = formData.get("newPassword") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	if (!currentPassword || !newPassword || !confirmPassword) {
		return { error: "Semua field harus diisi" };
	}

	if (newPassword !== confirmPassword) {
		return { error: "Konfirmasi password tidak cocok" };
	}

	if (newPassword.length < 8) {
		return { error: "Password baru minimal 8 karakter" };
	}

	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
	});

	if (!user || !user.password) {
		return { error: "User tidak ditemukan" };
	}

	const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

	if (!isPasswordValid) {
		return { error: "Password saat ini salah" };
	}

	const hashedPassword = await bcrypt.hash(newPassword, 10);

	await prisma.user.update({
		where: { id: session.user.id },
		data: { password: hashedPassword },
	});

	return { success: "Password berhasil diubah" };
}

export async function getLoginActivities() {
	const session = await auth();
	if (!session?.user?.id) {
		return [];
	}

	const activities = await prisma.loginActivity.findMany({
		where: { userId: session.user.id },
		orderBy: { createdAt: "desc" },
		take: 10,
	});

	return activities;
}

export async function checkUserCanDeleteAccount() {
	const session = await auth();
	if (!session?.user?.id) {
		return { canDelete: false, error: "Unauthorized" };
	}

	const campaignCount = await prisma.campaign.count({
		where: { createdById: session.user.id },
	});

	if (campaignCount > 0) {
		return {
			canDelete: false,
			error:
				"Akun tidak dapat dihapus karena Anda memiliki campaign yang terdaftar.",
		};
	}

	return { canDelete: true };
}

export async function deleteAccount(prevState: any, formData: FormData) {
	const currentPassword = formData.get("currentPassword") as string;

	if (!currentPassword) {
		return { error: "Password wajib diisi untuk konfirmasi" };
	}

	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	// Double check campaign existence
	const campaignCount = await prisma.campaign.count({
		where: { createdById: session.user.id },
	});

	if (campaignCount > 0) {
		return {
			error:
				"Gagal: Akun memiliki campaign. Silakan hubungi admin jika ingin menonaktifkan akun.",
		};
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
	});

	if (!user || !user.password) {
		return { error: "User tidak ditemukan" };
	}

	const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

	if (!isPasswordValid) {
		return { error: "Password salah" };
	}

	try {
		// Delete related data that might not cascade automatically if not set in schema
		// Note: Schema has some cascades, but we want to be sure or rely on DB.
		// Given the prompt "hapus semua data yang ada seperti email dll", deleting the user record
		// usually triggers cascades for relations defined with onDelete: Cascade in schema.
		// For relations without Cascade (like Campaign), we already blocked it.

		await prisma.user.delete({
			where: { id: session.user.id },
		});
	} catch (error) {
		console.error("Failed to delete user:", error);
		return { error: "Gagal menghapus akun. Silakan coba lagi." };
	}

	return { success: "Akun berhasil dihapus" };
}
