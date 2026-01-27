"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma";
import { auth } from "@/auth";

export async function getUsers(
	query?: string,
	role?: string,
	page: number = 1,
	limit: number = 10,
) {
	const where: Record<string, unknown> = {};

	if (query) {
		where.OR = [
			{ name: { contains: query, mode: "insensitive" } },
			{ email: { contains: query, mode: "insensitive" } },
			{ phone: { contains: query, mode: "insensitive" } },
		];
	}

	if (role && role !== "all") {
		where.role = role.toUpperCase() as Role;
	}

	try {
		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					role: true,
					createdAt: true,
					image: true,
					emailVerified: true,
				},
			}),
			prisma.user.count({ where }),
		]);

		return { users, total, totalPages: Math.ceil(total / limit) };
	} catch (error) {
		console.error("Error fetching users:", error);
		throw new Error("Failed to fetch users");
	}
}

type CreateUserInput = {
	name: string;
	email: string;
	phone?: string;
	role: Role;
	password: string;
};

export async function createUser(data: CreateUserInput) {
	try {
		const hashedPassword = await bcrypt.hash(data.password, 10);

		await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone || null,
				role: data.role,
				password: hashedPassword,
			},
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error: unknown) {
		console.error("Error creating user:", error);
		if ((error as { code?: string })?.code === "P2002") {
			return { success: false, error: "Email or phone already exists" };
		}
		return { success: false, error: "Failed to create user" };
	}
}

type UpdateUserInput = {
	name?: string;
	email?: string;
	phone?: string;
	role?: Role;
	password?: string;
};

export async function updateUser(id: string, data: UpdateUserInput) {
	try {
		const updateData: Record<string, unknown> = {
			name: data.name,
			email: data.email,
			phone: data.phone || null,
			role: data.role,
		};

		// Only update password if provided
		if (data.password && data.password.trim() !== "") {
			updateData.password = await bcrypt.hash(data.password, 10);
		}

		await prisma.user.update({
			where: { id },
			data: updateData,
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error: unknown) {
		console.error("Error updating user:", error);
		if ((error as { code?: string })?.code === "P2002") {
			return { success: false, error: "Email or phone already exists" };
		}
		return { success: false, error: "Failed to update user" };
	}
}

export async function updateCurrentUserPhone(phone: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		// Check if phone is already taken by another user
		const existing = await prisma.user.findFirst({
			where: {
				phone,
				id: { not: session.user.id },
			},
		});

		if (existing) {
			return {
				success: false,
				error: "Nomor WhatsApp sudah digunakan oleh pengguna lain",
			};
		}

		await prisma.user.update({
			where: { id: session.user.id },
			data: { phone },
		});

		revalidatePath("/admin/pencairan");
		return { success: true };
	} catch (error) {
		console.error("Error updating phone:", error);
		return { success: false, error: "Gagal mengupdate nomor WhatsApp" };
	}
}

export async function deleteUser(id: string) {
	try {
		await prisma.user.delete({
			where: { id },
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error deleting user:", error);
		return { success: false, error: "Failed to delete user" };
	}
}

export async function verifyUser(id: string) {
	try {
		await prisma.user.update({
			where: { id },
			data: {
				emailVerified: new Date(),
			},
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error verifying user:", error);
		return { success: false, error: "Failed to verify user" };
	}
}

export async function resetPassword(userId: string, newPassword: string) {
	try {
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("eeror memperbarui password:", error);
		return { success: false, error: "Failed to reset password" };
	}
}

export async function getUserStats() {
	try {
		const [total, admins, users] = await Promise.all([
			prisma.user.count(),
			prisma.user.count({ where: { role: "ADMIN" } }),
			prisma.user.count({ where: { role: "USER" } }),
		]);

		// Mocking "active" vs "inactive" since we don't have that status field yet,
		// maybe check loginActivity later? For now, assume all are active.

		return { total, admins, users };
	} catch (error) {
		return { total: 0, admins: 0, users: 0 };
	}
}

export async function getMyProfile() {
	const session = await auth();
	if (!session?.user?.email) return null;
	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			image: true,
			createdAt: true,
			verifiedAs: true,
			verifiedAt: true,
		},
	});
	if (!user) return null;
	return user;
}

export async function updateMyProfile(data: {
	name?: string;
	email?: string;
	phone?: string;
	image?: string | null;
}) {
	const session = await auth();
	if (!session?.user?.email) return { success: false, error: "Unauthorized" };
	const existing = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: { id: true },
	});
	if (!existing) return { success: false, error: "User not found" };
	await prisma.user.update({
		where: { id: existing.id },
		data: {
			name: data.name,
			email: data.email,
			phone: data.phone ?? null,
			image: data.image ?? undefined,
		},
	});
	revalidatePath("/profil/akun");
	return { success: true };
}
