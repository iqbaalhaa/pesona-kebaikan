import { prisma } from "@/lib/prisma";
import { JSDOM } from "jsdom";
import { BlogMediaType } from "@prisma/client";

// Helper to extract media from HTML content
function extractMediaFromContent(content: string) {
  const dom = new JSDOM(content);
  const doc = dom.window.document;
  const media: { type: BlogMediaType; url: string }[] = [];

  // Images
  const images = doc.querySelectorAll("img");
  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      media.push({ type: "image", url: src });
    }
  });

  // Videos (video tag)
  const videos = doc.querySelectorAll("video");
  videos.forEach((video) => {
    const src = video.getAttribute("src");
    if (src) {
      media.push({ type: "video", url: src });
    } else {
        // check sources inside video
        const sources = video.querySelectorAll("source");
        sources.forEach(source => {
            const sourceSrc = source.getAttribute("src");
            if (sourceSrc) media.push({ type: "video", url: sourceSrc });
        });
    }
  });

  // Iframes (YouTube, Vimeo, etc.)
  const iframes = doc.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    const src = iframe.getAttribute("src");
    if (src) {
       // Naive check for video providers, or just accept all iframes as 'video' type or 'file' if generic?
       // Enum has: image, video, file.
       // Let's assume iframes are videos for now.
       media.push({ type: "video", url: src });
    }
  });

  return media;
}

export interface CreateBlogData {
  title: string;
  content: string;
  categoryId: string;
  createdById: string;
  heroImage?: string;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  categoryId?: string;
  heroImage?: string;
}

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export async function getBlogs({ page = 1, limit = 10, search, categoryId }: GetBlogsParams) {
  const skip = (page - 1) * limit;
  // Derive type from prisma instance to avoid importing Prisma namespace
  const where: NonNullable<Parameters<typeof prisma.blog.findMany>[0]>["where"] = {};

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        gallery: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.blog.count({ where }),
  ]);

  return {
    data: blogs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getBlogById(id: string) {
  return prisma.blog.findUnique({
    where: { id },
    include: {
      category: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gallery: true,
    },
  });
}

export async function createBlog(data: CreateBlogData) {
  const { title, content, categoryId, createdById, heroImage } = data;

  // Extract media from content
  const mediaItems = extractMediaFromContent(content);

  return prisma.$transaction(async (tx) => {
    const blog = await tx.blog.create({
      data: {
        title,
        content,
        categoryId,
        createdById,
        heroImage,
      },
    });

    if (mediaItems.length > 0) {
      await tx.blogMedia.createMany({
        data: mediaItems.map((item) => ({
          blogId: blog.id,
          type: item.type,
          url: item.url,
        })),
      });
    }

    return blog;
  });
}

export async function updateBlog(id: string, data: UpdateBlogData) {
  const { title, content, categoryId, heroImage } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Update basic fields
    const updatedBlog = await tx.blog.update({
      where: { id },
      data: {
        title,
        content,
        categoryId,
        heroImage,
      },
    });

    // 2. Extract media from new content
    if (content) {
      const mediaItems = extractMediaFromContent(content);
      
      // 3. Delete old media (simple approach: delete all and recreate)
      // Or smarter: diffing. For now, let's just keep appending or replace?
      // If we want to keep the gallery consistent with content, we should probably clear and re-add.
      // BUT, what if there are media items added manually not in content?
      // The current requirement seems to be auto-extraction.
      // Let's wipe and re-add for consistency with content.
      await tx.blogMedia.deleteMany({
        where: { blogId: id },
      });

      if (mediaItems.length > 0) {
        await tx.blogMedia.createMany({
          data: mediaItems.map((item) => ({
            blogId: id,
            type: item.type,
            url: item.url,
          })),
        });
      }
    }

    return updatedBlog;
  });
}

export async function deleteBlog(id: string) {
  return prisma.blog.delete({
    where: { id },
  });
}

export async function getBlogCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });
}

export const blogService = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogCategories,
};
