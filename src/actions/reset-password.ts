"use server";

import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export const requestPasswordReset = async (email: string) => {
	if (!email) return { error: "Email wajib diisi" };

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		return { error: "Email tidak terdaftar" };
	}

	try {
		const passwordResetToken = await generatePasswordResetToken(email);
		const result = await sendPasswordResetEmail(
			passwordResetToken.email,
			passwordResetToken.token,
		);

		if (!result.ok) {
			return { error: "Gagal mengirim email. Silakan coba lagi." };
		}

		return { success: "Email reset password telah dikirim! Cek kotak masuk (Inbox), jika tidak ada periksa folder Spam/Promosi." };
	} catch (error) {
		console.error(error);
		return { error: "Terjadi kesalahan sistem" };
	}
};

export const resetPassword = async (token: string, password: string) => {
	if (!token) return { error: "Token tidak valid" };
	if (!password) return { error: "Password wajib diisi" };

	const passwordCriteria = {
		minLength: password.length >= 8,
		hasUppercase: /[A-Z]/.test(password),
		hasNumber: /[0-9]/.test(password),
		hasSymbol: /[!@#$%^&*(),.?":{}|<>]|[^a-zA-Z0-9]/.test(password),
	};

	if (
		!passwordCriteria.minLength ||
		!passwordCriteria.hasUppercase ||
		!passwordCriteria.hasNumber ||
		!passwordCriteria.hasSymbol
	) {
		return {
			error:
				"Password harus minimal 8 karakter, mengandung huruf besar, angka, dan simbol",
		};
	}

	const existingToken = await prisma.passwordResetToken.findUnique({
		where: { token },
	});

	if (!existingToken) {
		return { error: "Token tidak valid atau sudah kedaluwarsa" };
	}

	const hasExpired = new Date(existingToken.expires) < new Date();

	if (hasExpired) {
		return { error: "Token sudah kedaluwarsa" };
	}

	const existingUser = await prisma.user.findUnique({
		where: { email: existingToken.email },
	});

	if (!existingUser) {
		return { error: "User tidak ditemukan" };
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	await prisma.user.update({
		where: { id: existingUser.id },
		data: { password: hashedPassword },
	});

	await prisma.passwordResetToken.delete({
		where: { id: existingToken.id },
	});

	return { success: "Password berhasil diubah!" };
};
