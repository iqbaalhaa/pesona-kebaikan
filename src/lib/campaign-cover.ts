import { prisma } from "@/lib/prisma";

// A campaign has exactly one cover row. Replacing it deletes the old row(s)
// instead of keeping them as non-thumbnail media, which the public page used
// to render as extra carousel slides. The S3 object itself is left in place.
export async function replaceCampaignCover(campaignId: string, url: string) {
	const [, media] = await prisma.$transaction([
		prisma.campaignMedia.deleteMany({ where: { campaignId, isThumbnail: true } }),
		prisma.campaignMedia.create({
			data: { campaignId, type: "IMAGE", url, isThumbnail: true },
		}),
	]);
	return media;
}
