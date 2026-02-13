"use server";

import { signIn } from "@/auth";
import { InvalidEmailError, InvalidPasswordError } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(
	prevState: string | undefined,
	formData: FormData,
) {
	try {
		await signIn("credentials", {
			email: formData.get("email"),
			password: formData.get("password"),
			redirect: false,
		});
		return { success: true };
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
