"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role, AdminPermission, NotificationType, VerificationStatus } from "@prisma/client";
import { auth } from "@/auth";
import { createNotification } from "@/actions/notification";
import { subDays } from "date-fns";

function normalizePhone(phone?: string | null): string | null {
	if (!phone) return null;
	const digits = phone.replace(/\D/g, "");
	return digits || null;
}

export async function getUsers(
	query?: string,
	role?: string,
	status?: string, // "verified", "unverified", "pending"
	page: number = 1,
	limit: number = 10,
	scope?: "all" | "donor" | "administrator", // donor = role USER; administrator = role != USER
) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}

	const where: Record<string, unknown> = {};

	if (query) {
		where.OR = [
			{ name: { contains: query, mode: "insensitive" } },
			{ email: { contains: query, mode: "insensitive" } },
			{ phone: { contains: query, mode: "insensitive" } },
		];
	}

	if (scope === "donor") {
		where.role = "USER";
	} else if (scope === "administrator") {
		where.role = { not: "USER" };
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
					permissions: true,
					createdAt: true,
					image: true,
					emailVerified: true,
					verifiedAt: true,
					verifiedAs: true,
					verificationRequests: {
						select: {
							id: true,
							status: true,
							ktpNumber: true,
							ktpPhotoUrl: true,
							selfieUrl: true,
							organizationName: true,
							organizationDocUrl: true,
							notes: true,
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
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

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
	permissions?: AdminPermission[];
	password: string;
};

export async function createUser(data: CreateUserInput) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const hashedPassword = await bcrypt.hash(data.password, 10);
		const isAdmin = data.role === "ADMIN";
		const normalizedPhone = normalizePhone(data.phone);

		await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				phone: normalizedPhone,
				role: data.role,
				// Only STAFF actually uses granular permissions — keep them empty
				// for every other role so nothing lingers if role changes later.
				permissions: data.role === "STAFF" ? data.permissions || [] : [],
				password: hashedPassword,
				emailVerified: isAdmin ? new Date() : null,
				verifiedAt: isAdmin ? new Date() : null,
				verifiedAs: isAdmin ? "personal" : null,
			},
		});

		revalidatePath("/admin/users");
		return { success: true };
	} catch (error: any) {
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
	permissions?: AdminPermission[];
	password?: string;
};

export async function updateUser(id: string, data: UpdateUserInput) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const normalizedPhone = normalizePhone(data.phone);

		const updateData: Record<string, unknown> = {
			name: data.name,
			email: data.email,
			phone: normalizedPhone,
			role: data.role,
		};

		if (data.role !== undefined) {
			// Only STAFF actually uses granular permissions — clear them for
			// every other role so nothing lingers if role changes later.
			updateData.permissions = data.role === "STAFF" ? data.permissions || [] : [];
		}

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
	} catch (error: any) {
		console.error("Error updating user:", error);
		if ((error as { code?: string })?.code === "P2002") {
			return { success: false, error: "Email or phone already exists" };
		}
		return { success: false, error: "Failed to update user" };
	}
}

export async function resetPassword(userId: string, newPassword: string) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

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

	const normalizedPhone = normalizePhone(phone);
	if (!normalizedPhone) {
		return { success: false, error: "Nomor WhatsApp tidak boleh kosong" };
	}

	try {
		// Check if phone is already taken by another user
		const existing = await prisma.user.findFirst({
			where: {
				phone: normalizedPhone,
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
			data: { phone: normalizedPhone },
		});

		revalidatePath("/admin/pencairan");
		return { success: true };
	} catch (error) {
		console.error("Error updating phone:", error);
		return { success: false, error: "Gagal mengupdate nomor WhatsApp" };
	}
}

export async function deleteUser(id: string) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

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

export async function getPendingVerificationCount() {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return 0;

	try {
		return await prisma.verificationRequest.count({
			where: { status: VerificationStatus.PENDING },
		});
	} catch (error) {
		console.error("Error counting pending verifications:", error);
		return 0;
	}
}

export async function verifyUser(id: string) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

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

		// The pending request tells us WHICH type (individu/organisasi) is
		// actually being approved — verifiedAs must match it, not be assumed.
		const pendingRequest = await prisma.verificationRequest.findFirst({
			where: { userId: id, status: VerificationStatus.PENDING },
			orderBy: { createdAt: "desc" },
			select: { id: true, type: true },
		});

		if (!pendingRequest) {
			return {
				success: false,
				error: "Tidak ada pengajuan verifikasi yang menunggu untuk user ini.",
			};
		}

		await prisma.$transaction([
			prisma.user.update({
				where: { id },
				data: {
					verifiedAt: new Date(),
					verifiedAs: pendingRequest.type,
				},
			}),
			prisma.verificationRequest.update({
				where: { id: pendingRequest.id },
				data: {
					status: VerificationStatus.APPROVED,
					reviewedById: session.user.id,
					reviewedAt: new Date(),
				},
			}),
		]);

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
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

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

export async function rejectUserVerification(id: string, reason?: string) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const pendingRequest = await prisma.verificationRequest.findFirst({
			where: { userId: id, status: VerificationStatus.PENDING },
			orderBy: { createdAt: "desc" },
			select: { id: true },
		});

		if (!pendingRequest) {
			return {
				success: false,
				error: "Tidak ada pengajuan verifikasi yang menunggu untuk user ini.",
			};
		}

		// Mark REJECTED (keep the submitted docs + a reason) instead of
		// deleting the request — deleting destroyed the audit trail and
		// the notes the user needs to see why they were rejected.
		await prisma.verificationRequest.update({
			where: { id: pendingRequest.id },
			data: {
				status: VerificationStatus.REJECTED,
				reviewedById: session.user.id,
				reviewedAt: new Date(),
				notes: reason || null,
			},
		});

		// Ensure user stays unverified (no-op if they never were).
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
			reason
				? `Maaf, permohonan verifikasi akun Anda ditolak. Alasan: ${reason}`
				: "Maaf, permohonan verifikasi akun Anda ditolak. Silakan periksa kelengkapan data dan ajukan ulang.",
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
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

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
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

	try {
		// Determine eligible users first, along with their pending request —
		// verifiedAs has to match what was actually requested (personal vs
		// organization), not be assumed, so each user's request type is
		// looked up individually rather than bulk-set to one value.
		const eligibleUsers = await prisma.user.findMany({
			where: {
				id: { in: ids },
				emailVerified: { not: null },
				verifiedAt: null,
				verificationRequests: { some: { status: VerificationStatus.PENDING } },
			},
			select: {
				id: true,
				verificationRequests: {
					where: { status: VerificationStatus.PENDING },
					orderBy: { createdAt: "desc" },
					take: 1,
					select: { id: true, type: true },
				},
			},
		});

		if (eligibleUsers.length === 0) {
			return { success: true, count: 0 };
		}

		await prisma.$transaction(
			eligibleUsers.flatMap((u) => {
				const request = u.verificationRequests[0];
				if (!request) return [];
				return [
					prisma.user.update({
						where: { id: u.id },
						data: { verifiedAt: new Date(), verifiedAs: request.type },
					}),
					prisma.verificationRequest.update({
						where: { id: request.id },
						data: {
							status: VerificationStatus.APPROVED,
							reviewedById: session.user!.id,
							reviewedAt: new Date(),
						},
					}),
				];
			}),
		);

		await prisma.notification.createMany({
			data: eligibleUsers.map((u) => ({
				userId: u.id,
				title: "Akun Terverifikasi",
				message: "Selamat! Akun Anda telah berhasil diverifikasi.",
				type: NotificationType.KABAR,
			})),
		});

		revalidatePath("/admin/users");
		return { success: true, count: eligibleUsers.length };
	} catch (error) {
		console.error("Error bulk verifying users:", error);
		return { success: false, error: "Failed to bulk verify users" };
	}
}

export async function bulkDeleteUsers(ids: string[]) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return {
			success: false,
			count: 0,
			failedCount: ids.length,
			error: "Unauthorized",
		};
	}

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
	const session = await auth();
	if (session?.user?.role !== "ADMIN") {
		return {
			totalUsers: 0,
			activeUsers: 0,
			newUsersLast30Days: 0,
			growthRate: 0,
		};
	}

	try {
		const now = new Date();
		const thirtyDaysAgo = subDays(now, 30);

		const [totalUsers, newUsersLast30Days] = await Promise.all([
			prisma.user.count({ where: { role: "USER" } }),
			prisma.user.count({
				where: {
					role: "USER",
					createdAt: { gte: thirtyDaysAgo },
				},
			}),
		]);

		const activeUsers = totalUsers;
		const previousPeriodUsers = Math.max(totalUsers - newUsersLast30Days, 1);
		const growthRate = (newUsersLast30Days / previousPeriodUsers) * 100;

		return {
			totalUsers,
			activeUsers,
			newUsersLast30Days,
			growthRate,
		};
	} catch {
		return {
			totalUsers: 0,
			activeUsers: 0,
			newUsersLast30Days: 0,
			growthRate: 0,
		};
	}
}

export type UserStats = Awaited<ReturnType<typeof getUserStats>>;

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
				select: { status: true, notes: true },
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
	if (data.phone !== undefined) {
		updateData.phone = normalizePhone(data.phone);
	}
	if (data.image !== undefined) updateData.image = data.image;

	await prisma.user.update({
		where: { id: existing.id },
		data: updateData,
	});
	revalidatePath("/profil/akun");
	return { success: true };
}
