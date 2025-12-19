import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

async function ensureBlogCategory(name: string) {
  // name UNIQUE di schema
  return prisma.blogCategory.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function ensureBlogByTitle(params: {
  title: string;
  content: string;
  categoryId?: string | null;
  createdById: string;
  gallery?: Array<{
    type: "image" | "video" | "file";
    url: string;
    isThumbnail?: boolean;
  }>;
}) {
  // Blog tidak unique by title, jadi kita buat idempotent via findFirst
  const existing = await prisma.blog.findFirst({
    where: { title: params.title, createdById: params.createdById },
    include: { gallery: true },
  });

  if (!existing) {
    return prisma.blog.create({
      data: {
        title: params.title,
        content: params.content,
        categoryId: params.categoryId ?? null,
        createdById: params.createdById,
        gallery: params.gallery?.length
          ? {
              create: params.gallery.map((m) => ({
                type: m.type,
                url: m.url,
                isThumbnail: m.isThumbnail ?? false,
              })),
            }
          : undefined,
      },
    });
  }

  // update konten + category, dan reset gallery biar seed konsisten
  return prisma.blog.update({
    where: { id: existing.id },
    data: {
      content: params.content,
      categoryId: params.categoryId ?? null,
      gallery: params.gallery
        ? {
            deleteMany: {}, // hapus semua media lama
            create: params.gallery.map((m) => ({
              type: m.type,
              url: m.url,
              isThumbnail: m.isThumbnail ?? false,
            })),
          }
        : undefined,
    },
  });
}

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Users
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {
      name: "Alice",
      password: hashedPassword,
      role: "admin",
    },
    create: {
      email: "alice@example.com",
      name: "Alice",
      password: hashedPassword,
      role: "admin",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {
      name: "Bob",
      password: hashedPassword,
      role: "user",
    },
    create: {
      email: "bob@example.com",
      name: "Bob",
      password: hashedPassword,
      role: "user",
    },
  });

  // Categories
  const catTech = await ensureBlogCategory("Tech");
  const catUpdate = await ensureBlogCategory("Update");

  // Blogs + Gallery
  const blog1 = await ensureBlogByTitle({
    title: "Check out Prisma with Next.js",
    content: "https://www.prisma.io/nextjs",
    categoryId: catTech.id,
    createdById: alice.id,
    gallery: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
        isThumbnail: true,
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      },
    ],
  });

  const blog2 = await ensureBlogByTitle({
    title: "Follow Prisma on Twitter",
    content: "https://twitter.com/prisma",
    categoryId: catUpdate.id,
    createdById: bob.id,
    gallery: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107",
        isThumbnail: true,
      },
    ],
  });

  const blog3 = await ensureBlogByTitle({
    title: "Follow Nexus on Twitter",
    content: "https://twitter.com/nexusgql",
    categoryId: catUpdate.id,
    createdById: bob.id,
  });

  console.log({
    users: { alice: alice.email, bob: bob.email },
    categories: [catTech.name, catUpdate.name],
    blogs: [blog1.title, blog2.title, blog3.title],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
