import type { Role, AdminPermission } from "@prisma/client";

/**
 * Single source of truth for "which /admin/* paths does this permission
 * unlock". Used by BOTH src/proxy.ts (route guard, edge runtime) and
 * src/components/admin/AdminSidebar.tsx (menu filtering, client) so they can
 * never drift apart.
 *
 * To add a new granular admin capability later: add one AdminPermission enum
 * value in prisma/schema.prisma, then one entry here. No changes needed in
 * proxy.ts or AdminSidebar.tsx themselves.
 */
export const PERMISSION_ROUTES: Record<AdminPermission, string[]> = {
	MANAGE_BLOG: ["/admin/blog"],
	MANAGE_WITHDRAWALS: ["/admin/pencairan"],
	APPROVE_CAMPAIGNS: ["/admin/campaign/verifikasi", "/admin/pengajuan-campaign"],
};

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
	MANAGE_BLOG: "Kelola Blog",
	MANAGE_WITHDRAWALS: "Kelola Pencairan Dana",
	APPROVE_CAMPAIGNS: "Verifikasi & Approval Campaign",
};

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
	"MANAGE_BLOG",
	"MANAGE_WITHDRAWALS",
	"APPROVE_CAMPAIGNS",
];

/**
 * Returns the list of /admin/* path prefixes this user may access.
 * "ALL" means unrestricted (full ADMIN). Empty array means no admin access
 * at all (plain USER).
 */
export function getAllowedAdminPaths(
	role: Role | undefined,
	permissions: AdminPermission[] | undefined,
): string[] | "ALL" {
	if (role === "ADMIN") return "ALL";
	if (role === "STAFF") {
		return (permissions || []).flatMap((p) => PERMISSION_ROUTES[p] ?? []);
	}
	return [];
}

export function isAdminPathAllowed(
	pathname: string,
	role: Role | undefined,
	permissions: AdminPermission[] | undefined,
): boolean {
	const allowed = getAllowedAdminPaths(role, permissions);
	if (allowed === "ALL") return true;
	return allowed.some((prefix) => pathname.startsWith(prefix));
}

/** Where to send a restricted admin user who lands somewhere they can't access. */
export function defaultAdminPathFor(
	role: Role | undefined,
	permissions: AdminPermission[] | undefined,
): string {
	const allowed = getAllowedAdminPaths(role, permissions);
	if (allowed === "ALL") return "/admin";
	return allowed[0] || "/profil";
}

/** Does this user have ANY admin-scope access at all (used to split the users list). */
export function isAdminScopeRole(role: Role | undefined): boolean {
	return role === "ADMIN" || role === "STAFF";
}

/** Does this user have access to the blog-management area (ADMIN or STAFF with MANAGE_BLOG)? */
export function hasBlogAccess(
	role: Role | undefined,
	permissions: AdminPermission[] | undefined,
): boolean {
	return isAdminPathAllowed("/admin/blog", role, permissions);
}
