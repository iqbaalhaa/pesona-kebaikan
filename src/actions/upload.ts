"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
	region: process.env.S3_REGION,
	endpoint: process.env.S3_ENDPOINT,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
	},
	forcePathStyle: true,
});

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
		const buffer = Buffer.from(bytes);

		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = file.name.split(".").pop();
		const cleanName = file.name
			.replace(/\.[^/.]+$/, "")
			.replace(/[^a-zA-Z0-9]/g, "-");
		const filename = `${cleanName}-${uniqueSuffix}.${ext}`;

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
				ContentType: (file as any).type || "application/octet-stream",
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
