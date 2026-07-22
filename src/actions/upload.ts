"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import sharp from "sharp"; // Remove static import to avoid crash if module is missing/broken

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const s3Client = new S3Client({
	region: process.env.S3_REGION,
	endpoint: process.env.S3_ENDPOINT,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
	},
	forcePathStyle: true,
});

async function bufferToWebP(input: Buffer, width = 1600, height = 1600, fit: "inside" | "cover" = "inside") {
	const sharpModule = await import("sharp");
	const sharp = sharpModule.default || sharpModule;
	// @ts-ignore
	return sharp(input).rotate().resize(width, height, { fit, withoutEnlargement: fit === "inside" }).webp({ quality: 80 }).toBuffer();
}

export async function uploadImage(formData: FormData) {
	return uploadFile(formData);
}

export async function uploadCoverFile(formData: FormData) {
	return uploadFile(formData, { width: 664, height: 357, fit: "cover" });
}

export async function uploadBannerFile(formData: FormData) {
	return uploadFile(formData, { width: 1228, height: 714, fit: "inside" });
}

export async function uploadFile(
	formData: FormData,
	imageOptions?: { width: number; height: number; fit: "inside" | "cover" },
) {
	try {
		const file = formData.get("file") as File;
		if (!file) {
			console.error("Upload error: No file provided in form data");
			throw new Error("No file uploaded");
		}

		console.log(
			`Processing upload: ${file.name} (${file.type}, ${file.size} bytes)`,
		);

		// Check environment variables
		if (!process.env.S3_BUCKET_NAME) {
			console.error("Upload error: S3_BUCKET_NAME is not set");
			throw new Error("Server configuration error: S3_BUCKET_NAME missing");
		}
		if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
			console.error("Upload error: S3 credentials are incomplete");
			throw new Error("Server configuration error: S3 credentials missing");
		}

		const isImage =
			typeof (file as any).type === "string" &&
			(file as any).type.startsWith("image/");

		if (isImage && typeof (file as any).size === "number") {
			if ((file as any).size > MAX_IMAGE_BYTES) {
				return { success: false, error: "Ukuran gambar maksimal 3MB" };
			}
		}

		const bytes = await file.arrayBuffer();
		const originalBuffer = Buffer.from(bytes);

		let buffer: any = originalBuffer;
		let contentType = (file as any).type || "application/octet-stream";
		let extension = file.name.split(".").pop();

		// Try to convert to WebP using sharp, fallback to original if fails
		if (isImage) {
			try {
				console.log("Attempting to convert image to WebP...");
				buffer = (await bufferToWebP(
					originalBuffer,
					imageOptions?.width,
					imageOptions?.height,
					imageOptions?.fit,
				)) as Buffer;
				contentType = "image/webp";
				extension = "webp";
				console.log("Image converted to WebP successfully");
			} catch (sharpError) {
				console.error(
					"Sharp conversion failed, using original file:",
					sharpError,
				);
				// Fallback to original buffer
				buffer = originalBuffer;
				// Keep original content type and extension
			}
		}

		if (isImage && buffer.length > MAX_IMAGE_BYTES) {
			return { success: false, error: "Ukuran gambar maksimal 3MB" };
		}

		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const baseName = file.name
			.replace(/\.[^/.]+$/, "")
			.replace(/[^a-zA-Z0-9]/g, "-");
		const filename = `${baseName}-${uniqueSuffix}.${extension}`;

		const rootDir = process.env.S3_ROOT_DIR || "";
		const key = rootDir
			? `${rootDir.replace(/\/$/, "")}/${filename}`
			: filename;

		// Bucket is already checked above, but safe to use variable
		const bucket = process.env.S3_BUCKET_NAME as string;

		await s3Client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: buffer,
				ContentType: contentType,
				ACL: "public-read",
			}),
		);

		const endpoint = process.env.S3_ENDPOINT;
		if (!endpoint) {
			console.warn("S3_ENDPOINT is not set in environment variables");
		}
		const base = (endpoint || "").replace(/\/$/, "");
		const url = `${base}/${bucket}/${key}`;

		return { success: true, url };
	} catch (error: any) {
		console.error("Upload error:", error);
		// Return detailed error in dev/test for debugging
		return { success: false, error: error.message || "Upload failed" };
	}
}
