import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/enums";
import { headers } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
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
					return null;
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email as string },
				});

				if (!user || !user.password) {
					return null;
				}

				const isPasswordValid = await bcrypt.compare(
					credentials.password as string,
					user.password
				);

				if (!isPasswordValid) {
					return null;
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
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role as Role;
				token.id = user.id as string;
			}
			return token;
		},
		async session({ session, token }) {
			if (token.sub && session.user) {
				session.user.id = token.sub;
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
