import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma";
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
					image: user.image,
					role: user.role,
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
				token.id = user.id as string;
				token.phone = user.phone;
				token.emailVerified = user.emailVerified;
				token.phoneVerified = user.phoneVerified;
			}

			if (trigger === "update") {
				const freshUser = await prisma.user.findUnique({
					where: { id: token.id as string },
				});
				if (freshUser) {
					token.phone = freshUser.phone;
					token.emailVerified = freshUser.emailVerified;
					token.phoneVerified = freshUser.phoneVerified;
					token.role = freshUser.role;
				}
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				if (token.sub) {
					session.user.id = token.sub;
				} else if (token.id) {
					session.user.id = token.id as string;
				}
				session.user.phone = token.phone as string | null | undefined;
				session.user.emailVerified = (token.emailVerified as Date | null) || null;
				session.user.phoneVerified = (token.phoneVerified as Date | null) || null;
			}

			if (token.role && session.user) {
				session.user.role = token.role as Role;
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth/login",
	},
});
