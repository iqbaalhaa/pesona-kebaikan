import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export const generateVerificationToken = async (email: string) => {
	// Generate 6 digit OTP code
	const token = Math.floor(100000 + Math.random() * 900000).toString();
	// Token expires in 1 hour
	const expires = new Date(new Date().getTime() + 3600 * 1000);

	const existingToken = await prisma.verificationToken.findFirst({
		where: {
			identifier: email,
		},
	});

	if (existingToken) {
		await prisma.verificationToken.delete({
			where: {
				identifier_token: {
					identifier: existingToken.identifier,
					token: existingToken.token,
				},
			},
		});
	}

	const verificationToken = await prisma.verificationToken.create({
		data: {
			identifier: email,
			token,
			expires,
		},
	});

	return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
	const token = randomUUID();
	// Token expires in 1 hour
	const expires = new Date(new Date().getTime() + 3600 * 1000);

	const existingToken = await prisma.passwordResetToken.findFirst({
		where: { email },
	});

	if (existingToken) {
		await prisma.passwordResetToken.delete({
			where: { id: existingToken.id },
		});
	}

	const passwordResetToken = await prisma.passwordResetToken.create({
		data: {
			email,
			token,
			expires,
		},
	});

	return passwordResetToken;
};
