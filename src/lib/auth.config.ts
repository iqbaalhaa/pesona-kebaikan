export const authConfig = {
	pages: {
		signIn: "/auth/login",
		signOut: "/auth/login",
	},
	callbacks: {
		authorized() {
			return true;
		},
		jwt({ token, user }: { token: unknown; user?: unknown }) {
			if (user && typeof (user as { id?: unknown }).id === "string") {
				(token as Record<string, unknown>).id = (user as { id: string }).id;
			}
			return token as unknown as import("next-auth/jwt").JWT;
		},
		session({ session, token }: { session: unknown; token: unknown }) {
			const s = session as { user?: { id?: string } };
			if (s.user) {
				const id = (token as Record<string, unknown>).id;
				if (typeof id === "string") s.user.id = id;
			}
			return session as unknown as import("next-auth").Session;
		},
	},
	providers: [], // Configured in auth.ts
};
