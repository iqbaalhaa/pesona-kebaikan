"use server";

import { signIn } from "@/auth";
import { InvalidEmailError, InvalidPasswordError } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(
	prevState: string | undefined,
	formData: FormData,
) {
	try {
		const email = formData.get("email") as string | null;

		await signIn("credentials", {
			email,
			password: formData.get("password"),
			redirect: false,
		});

		let role: string | null = null;
		let permissions: string[] = [];
		if (email) {
			try {
				const user = await prisma.user.findUnique({
					where: { email },
					select: { role: true, permissions: true },
				});
				role = user?.role ?? null;
				permissions = user?.permissions ?? [];
			} catch (e) {}
		}

		return { success: true, role, permissions };
	} catch (error) {
		if (
			error instanceof InvalidEmailError ||
			(error as any).code === "InvalidEmail"
		) {
			return { error: "InvalidEmail" };
		}
		if (
			error instanceof InvalidPasswordError ||
			(error as any).code === "InvalidPassword"
		) {
			return { error: "InvalidPassword" };
		}
		if (error instanceof AuthError) {
			// Catch generic CredentialsSignin if the specific class is lost but type is preserved
			if (error.type === "CredentialsSignin") {
				// We can try to infer or just return generic
				// However, since we throw specific errors, we expect to catch them above.
				// If NextAuth serializes them, we might lose the instance check.
				// Let's check the 'code' property if available on AuthError in some versions,
				// but usually it's better to rely on the error object structure.
				// For now, let's return a generic error if it falls here.
				return { error: "CredentialsSignin" };
			}
			return { error: error.type };
		}
		throw error;
	}
}
