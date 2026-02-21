"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3Client = new S3Client({
	region: process.env.S3_REGION,
	endpoint: process.env.S3_ENDPOINT,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
	},
	forcePathStyle: true,
});

async function bufferToWebP(input: Buffer) {
	return sharp(input).webp({ quality: 80 }).toBuffer();
}

export async function uploadImage(formData: FormData) {
	return uploadFile(formData);
}

export async function uploadFile(formData: FormData) {
	try {
		const file = formData.get("file") as File;
		if (!file) {
			throw new Error("No file uploaded");
		}

		const bytes = await file.arrayBuffer();
		const originalBuffer = Buffer.from(bytes);

		const isImage =
			typeof (file as any).type === "string" &&
			(file as any).type.startsWith("image/");

		const buffer = isImage ? await bufferToWebP(originalBuffer) : originalBuffer;

		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-");
		const ext = isImage ? "webp" : file.name.split(".").pop();
		const filename = `${baseName}-${uniqueSuffix}.${ext}`;

		const rootDir = process.env.S3_ROOT_DIR || "";
		const key = rootDir ? `${rootDir.replace(/\/$/, "")}/${filename}` : filename;

		const bucket = process.env.S3_BUCKET_NAME;
		if (!bucket) {
			throw new Error("S3 bucket is not configured");
		}

		await s3Client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: buffer,
				ContentType: isImage ? "image/webp" : (file as any).type || "application/octet-stream",
				ACL: "public-read",
			}),
		);

		const endpoint = process.env.S3_ENDPOINT || "";
		const base = endpoint.replace(/\/$/, "");
		const url = `${base}/${bucket}/${key}`;

		return { success: true, url };
	} catch (error) {
		console.error("Upload error:", error);
		return { success: false, error: "Upload failed" };
	}
}
