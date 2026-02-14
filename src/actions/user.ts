"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role, NotificationType } from "@/generated/prisma";
import { auth } from "@/auth";
import { createNotification } from "@/actions/notification";

export async function getUsers(
	query?: string,
	role?: string,
	status?: string, // "verified", "unverified", "pending"
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

	if (status && status !== "all") {
		if (status === "verified") {
			where.verifiedAt = { not: null };
		} else if (status === "unverified") {
			where.verifiedAt = null;
			// And check if no pending request? Usually just verifiedAt: null covers both unverified and pending,
			// but if we want strictly unverified (no request), we'd need more logic.
			// However, usually "unverified" just means not verified.
			// The user requirement says: "pending", "unverified", "verified".
			// "pending" means verificationRequests with status "PENDING".
			// "unverified" means verifiedAt is null AND (no requests OR request status != PENDING).
		} else if (status === "pending") {
			where.verificationRequests = {
				some: {
					status: "PENDING",
				},
			};
		}
	}

	// Refined Logic for 'unverified':
	// If status is 'unverified', we want verifiedAt to be null AND NOT having any PENDING request.
	if (status === "unverified") {
		where.verifiedAt = null;
		where.verificationRequests = {
			none: {
				status: "PENDING",
			},
		};
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
					phoneVerified: true,
					role: true,
					createdAt: true,
					image: true,
					emailVerified: true,
					verifiedAt: true,
					verifiedAs: true,
					verificationRequests: {
						select: {
							status: true,
							ktpNumber: true,
							ktpPhotoUrl: true,
							type: true,
							createdAt: true,
						},
						orderBy: { createdAt: "desc" },
						take: 1,
					},
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

export async function getAllUserIds(
	query?: string,
	role?: string,
	status?: string,
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

	if (status && status !== "all") {
		if (status === "verified") {
			where.verifiedAt = { not: null };
		} else if (status === "pending") {
			where.verificationRequests = {
				some: {
					status: "PENDING",
				},
			};
		}
	}

	if (status === "unverified") {
		where.verifiedAt = null;
		where.verificationRequests = {
			none: {
				status: "PENDING",
			},
		};
	}

	try {
		const users = await prisma.user.findMany({
			where,
			select: { id: true },
		});
		return { success: true, ids: users.map((u) => u.id) };
	} catch (error) {
		console.error("Error fetching all user IDs:", error);
		return { success: false, error: "Failed to fetch all user IDs" };
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
		const isAdmin = data.role === "ADMIN";

		await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone || null,
				role: data.role,
				password: hashedPassword,
				emailVerified: isAdmin ? new Date() : null,
				verifiedAt: isAdmin ? new Date() : null,
				verifiedAs: isAdmin ? "personal" : null,
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

		if (data.role === "ADMIN") {
			updateData.emailVerified = new Date();
			updateData.verifiedAt = new Date();
			updateData.verifiedAs = "personal";
		}

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
		// 1. Check if user exists and email is verified
		const user = await prisma.user.findUnique({
			where: { id },
			select: { emailVerified: true },
		});

		if (!user) {
			return { success: false, error: "User not found" };
		}

		if (!user.emailVerified) {
			return {
				success: false,
				error:
					"Email user belum terverifikasi. User harus memverifikasi email terlebih dahulu.",
			};
		}

		await prisma.user.update({
			where: { id },
			data: {
				verifiedAt: new Date(),
				verifiedAs: "personal",
			},
		});
		await createNotification(
			id,
			"Akun Terverifikasi",
			"Selamat! Akun Anda telah berhasil diverifikasi.",
			NotificationType.KABAR,
		);

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error verifying user:", error);
		return { success: false, error: "Failed to verify user" };
	}
}

export async function unverifyUser(id: string) {
	try {
		await prisma.user.update({
			where: { id },
			data: {
				verifiedAt: null,
				verifiedAs: null,
			},
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error unverifying user:", error);
		return { success: false, error: "Failed to unverify user" };
	}
}

export async function rejectUserVerification(id: string) {
	try {
		// 1. Delete pending verification requests
		await prisma.verificationRequest.deleteMany({
			where: {
				userId: id,
			},
		});

		// 2. Ensure user is unverified
		await prisma.user.update({
			where: { id },
			data: {
				verifiedAt: null,
				verifiedAs: null,
			},
		});

		await createNotification(
			id,
			"Verifikasi Akun Ditolak",
			"Maaf, permohonan verifikasi akun Anda ditolak. Silakan periksa kelengkapan data dan ajukan ulang.",
			NotificationType.KABAR,
		);

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error) {
		console.error("Error rejecting user verification:", error);
		return { success: false, error: "Failed to reject verification" };
	}
}

export async function bulkUnverifyUsers(ids: string[]) {
	try {
		const result = await prisma.user.updateMany({
			where: {
				id: { in: ids },
			},
			data: {
				verifiedAt: null,
				verifiedAs: null,
			},
		});

		revalidatePath("/admin/users");
		return { success: true, count: result.count };
	} catch (error) {
		console.error("Error bulk unverifying users:", error);
		return { success: false, error: "Failed to bulk unverify users" };
	}
}

export async function bulkVerifyUsers(ids: string[]) {
	try {
		// Determine eligible users first
		const eligibleUsers = await prisma.user.findMany({
			where: {
				id: { in: ids },
				emailVerified: { not: null },
				verifiedAt: null,
			},
			select: { id: true },
		});

		// Only verify users who have verified emails
		const result = await prisma.user.updateMany({
			where: {
				id: { in: eligibleUsers.map((u) => u.id) },
				emailVerified: { not: null },
				verifiedAt: null, // Only update those not already verified
			},
			data: {
				verifiedAt: new Date(),
				verifiedAs: "personal",
			},
		});

		// Create notifications for all newly verified users
		if (eligibleUsers.length > 0) {
			await prisma.notification.createMany({
				data: eligibleUsers.map((u) => ({
					userId: u.id,
					title: "Akun Terverifikasi",
					message: "Selamat! Akun Anda telah berhasil diverifikasi.",
					type: NotificationType.KABAR,
				})),
			});
		}

		revalidatePath("/admin/users");
		return { success: true, count: result.count };
	} catch (error) {
		console.error("Error bulk verifying users:", error);
		return { success: false, error: "Failed to bulk verify users" };
	}
}

export async function bulkDeleteUsers(ids: string[]) {
	let successCount = 0;
	let failedCount = 0;

	// Process deletions sequentially or in parallel depending on needs.
	// Parallel is faster but we need to handle individual errors.
	const results = await Promise.all(
		ids.map(async (id) => {
			try {
				await prisma.user.delete({
					where: { id },
				});
				return { id, success: true };
			} catch (error) {
				// Log specific error if needed, but return failure
				console.error(`Failed to delete user ${id}:`, error);
				return { id, success: false, error };
			}
		}),
	);

	results.forEach((res) => {
		if (res.success) {
			successCount++;
		} else {
			failedCount++;
		}
	});

	if (successCount > 0) {
		revalidatePath("/admin/users");
	}

	return {
		success: successCount > 0, // Considered success if at least one was deleted
		count: successCount,
		failedCount,
		error:
			failedCount > 0
				? `Gagal menghapus ${failedCount} user karena memiliki data terkait (Campaign/Donasi).`
				: undefined,
	};
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
			verificationRequests: {
				select: { status: true },
				orderBy: { createdAt: "desc" },
				take: 1,
			},
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

	const updateData: Record<string, any> = {};
	if (data.name !== undefined) updateData.name = data.name;
	if (data.email !== undefined) updateData.email = data.email;
	if (data.phone !== undefined) updateData.phone = data.phone || null;
	if (data.image !== undefined) updateData.image = data.image;

	await prisma.user.update({
		where: { id: existing.id },
		data: updateData,
	});
	revalidatePath("/profil/akun");
	return { success: true };
}
