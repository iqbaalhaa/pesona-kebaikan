import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type BlogWithRelations = Prisma.BlogGetPayload<{
  include: {
    category: true;
    gallery: true;
    createdBy: {
      select: {
        name: true;
      };
    };
  };
}>;

export const getBlogs = async (
  page = 1,
  limit = 10,
  categoryId?: string,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.BlogWhereInput = {
    AND: [
      categoryId ? { categoryId } : {},
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        category: true,
        gallery: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.blog.count({ where }),
  ]);

  return {
    blogs,
    metadata: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getBlogById = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      category: true,
      gallery: true,
      createdBy: {
        select: {
          name: true,
        },
      },
    },
  });

  return blog;
};

export const getBlogCategories = async () => {
  const categories = await prisma.blogCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};
