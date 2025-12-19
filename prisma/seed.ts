import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create accounts
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      password: hashedPassword,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob",
      password: hashedPassword,
    },
  });

  // Create posts for accounts
  await prisma.post.create({
    data: {
      title: "Check out Prisma with Next.js",
      content: "https://www.prisma.io/nextjs",
      published: true,
      userId: alice.id,
    },
  });

  await prisma.post.createMany({
    data: [
      {
        title: "Follow Prisma on Twitter",
        content: "https://twitter.com/prisma",
        published: true,
        userId: bob.id,
      },
      {
        title: "Follow Nexus on Twitter",
        content: "https://twitter.com/nexusgql",
        published: true,
        userId: bob.id,
      },
    ],
  });

  console.log({ alice, bob });
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
