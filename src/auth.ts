import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { headers } from "next/headers";

export class InvalidEmailError extends CredentialsSignin {
	code = "InvalidEmail";
}

export class InvalidPasswordError extends CredentialsSignin {
	code = "InvalidPassword";
}

console.log("Initializing NextAuth...");

export const { handlers, auth, signIn, signOut } = NextAuth({
	debug: true,
	adapter: PrismaAdapter(prisma) as any,
	session: { strategy: "jwt" },
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new InvalidEmailError();
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email as string },
				});

				if (!user || !user.password) {
					throw new InvalidEmailError();
				}

				const isPasswordValid = await bcrypt.compare(
					credentials.password as string,
					user.password,
				);

				if (!isPasswordValid) {
					throw new InvalidPasswordError();
				}

				// Log activity
				try {
					const headersList = await headers();
					const ip = headersList.get("x-forwarded-for") || "Unknown IP";
					const userAgent = headersList.get("user-agent") || "Unknown Device";

					const existingActivity = await prisma.loginActivity.findFirst({
						where: {
							userId: user.id,
							ipAddress: ip,
							userAgent: userAgent,
						},
					});

					if (existingActivity) {
						await prisma.loginActivity.update({
							where: { id: existingActivity.id },
							data: { createdAt: new Date() },
						});
					} else {
						await prisma.loginActivity.create({
							data: {
								userId: user.id,
								ipAddress: ip,
								userAgent: userAgent,
							},
						});
					}
				} catch (error) {
					console.error("Failed to log login activity:", error);
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					// Avoid sending image in token to prevent cookie bloat if base64
					image: user.image?.startsWith("http") ? user.image : null,
					role: user.role,
					permissions: user.permissions,
					phone: user.phone,
					emailVerified: user.emailVerified,
					phoneVerified: user.phoneVerified,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger }) {
			if (user) {
				token.role = user.role as Role;
				token.permissions = (user as any).permissions;
				token.id = user.id as string;
				// Explicitly delete picture from token if it comes from default user object
				// to ensure we don't carry large base64 strings
				if (user.image && !user.image.startsWith("http")) {
					delete token.picture;
				}
			}

			if (trigger === "update") {
				const freshUser = await prisma.user.findUnique({
					where: { id: token.id as string },
				});
				if (freshUser) {
					token.role = freshUser.role;
					token.permissions = freshUser.permissions;
				}
			}

			return token;
		},
		async session({ session, token }) {
			if (!session.user?.email) return session;
			const user = await prisma.user.findUnique({
				where: { email: session.user.email },
				select: {
					id: true,
					role: true,
					permissions: true,
					phone: true,
					emailVerified: true,
					phoneVerified: true,
				},
			});
			if (user && session.user) {
				session.user.id = user.id;
				session.user.role = user.role as Role;
				session.user.permissions = user.permissions;
				session.user.phone = user.phone;
				session.user.emailVerified = user.emailVerified;
				session.user.phoneVerified = user.phoneVerified;
			} else if (token?.sub && session.user) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth/login",
	},
});
