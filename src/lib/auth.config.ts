import type { NextAuthConfig } from "next-auth";
import { Role, AdminPermission } from "@prisma/client";

export const authConfig = {
	pages: {
		signIn: "/auth/login",
	},
	session: {
		strategy: "jwt",
	},
	callbacks: {
		authorized() {
			// Middleware logic is handled in middleware.ts
			return true;
		},
		session({ session, token }) {
			if (session.user) {
				if (token.sub) {
					session.user.id = token.sub;
				}
				if (token.role) {
					session.user.role = token.role as Role;
				}
				session.user.permissions = (token.permissions as AdminPermission[]) || [];
			}
			return session;
		},
		jwt({ token, user }) {
			if (user) {
				token.role = user.role as Role;
				token.permissions = (user as any).permissions;
			}
			return token;
		},
	},
	providers: [],
} satisfies NextAuthConfig;
