import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;
	const userRole = req.auth?.user?.role;

	const buildLoginRedirect = () => {
		const loginUrl = nextUrl.clone();
		loginUrl.pathname = "/auth/login";
		const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;
		loginUrl.searchParams.set("callbackUrl", callbackUrl);
		return NextResponse.redirect(loginUrl);
	};

	const publicProfileRoutes = [
		"/profil/tentang",
		"/profil/syarat-ketentuan",
		"/profil/bantuan",
	];

	const isPublicProfileRoute = publicProfileRoutes.some((path) =>
		nextUrl.pathname.startsWith(path),
	);

	const isAdminRoute = nextUrl.pathname.startsWith("/admin");
	const isPrivateRoute =
		(!isPublicProfileRoute && nextUrl.pathname.startsWith("/profil")) ||
		nextUrl.pathname.startsWith("/donasi-saya") ||
		nextUrl.pathname.startsWith("/galang-dana/buat");

	if (isAdminRoute) {
		if (!isLoggedIn) {
			return buildLoginRedirect();
		}
		if (userRole !== "ADMIN") {
			return NextResponse.redirect(new URL("/profil", nextUrl));
		}
		return NextResponse.next();
	}

	if (isPrivateRoute) {
		if (!isLoggedIn) {
			return buildLoginRedirect();
		}
		return NextResponse.next();
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
