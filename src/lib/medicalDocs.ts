/**
 * `medicalDocs.resume_medis` / `.surat_rs` (inside Campaign.metadata JSON)
 * used to be a single URL string; the intake wizard now stores an array to
 * support multiple files per field. Existing campaigns still have the old
 * scalar shape, so every reader must normalize through this instead of
 * assuming either shape.
 */
export function toUrlArray(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.filter((v): v is string => typeof v === "string" && v.length > 0);
	}
	if (typeof value === "string" && value.length > 0) return [value];
	return [];
}
