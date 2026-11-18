"use client";

import { SessionProvider } from "next-auth/react";

export default function NextAuthProvider({
	children,
	session,
}: {
	children: React.ReactNode;
	session: any;
}) {
	// Static pages (e.g. "/") are prerendered without cookies, so the layout's
	// auth() yields null there. SessionProvider treats null as "known logged
	// out" and never fetches, so pass undefined to make it load the session.
	return (
		<SessionProvider session={session ?? undefined}>{children}</SessionProvider>
	);
}
