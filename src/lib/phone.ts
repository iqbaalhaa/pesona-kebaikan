/**
 * Canonical form for comparing Indonesian phone numbers written in different
 * styles ("081234567890", "+6281234567890", "6281234567890", "81234567890")
 * as the same number. Always returns digits-only, leading-0 form — or ""
 * for empty/unparsable input.
 *
 * Not a substitute for the various local `normalizePhone()` helpers used
 * for storage (those just strip non-digits) — this is specifically for
 * matching two phone strings that may have been typed in different formats.
 */
export function canonicalPhone(raw: string | null | undefined): string {
	if (!raw) return "";
	const digits = raw.replace(/\D/g, "");
	if (!digits) return "";
	if (digits.startsWith("62")) return "0" + digits.slice(2);
	if (digits.startsWith("0")) return digits;
	return "0" + digits;
}
