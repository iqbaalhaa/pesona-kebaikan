/**
 * Manually rotate an image file by a multiple of 90 degrees (clockwise) on the
 * client. Used for the "putar" (rotate) controls in upload fields so the user
 * can fix sideways phone photos themselves before the file is uploaded.
 *
 * Returns the original file untouched if the browser cannot process it.
 */
export async function rotateImageFile(
	file: File,
	degrees: number,
): Promise<File> {
	if (typeof window === "undefined") return file;
	if (!file.type.startsWith("image/")) return file;

	const norm = ((degrees % 360) + 360) % 360;
	if (norm === 0) return file;

	try {
		const bitmap = await createImageBitmap(file);

		const swap = norm === 90 || norm === 270;
		const canvas = document.createElement("canvas");
		canvas.width = swap ? bitmap.height : bitmap.width;
		canvas.height = swap ? bitmap.width : bitmap.height;

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			bitmap.close?.();
			return file;
		}

		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate((norm * Math.PI) / 180);
		ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
		bitmap.close?.();

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, "image/jpeg", 0.92),
		);
		if (!blob) return file;

		const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
		return new File([blob], newName, {
			type: "image/jpeg",
			lastModified: file.lastModified,
		});
	} catch {
		return file;
	}
}
