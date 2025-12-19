import { NextResponse } from "next/server";

export default function authProxy() {
	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*"],
};
