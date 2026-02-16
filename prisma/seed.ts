import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedUsers } from "./seeds/user.seed";
import { seedPageContent } from "./seeds/page-content.seed";
import { seedBlogs } from "./seeds/blog.seed";
import { seedCampaigns } from "./seeds/campaign.seed";
import { seedAddress } from "./seeds/address.seed";
import { seedFundraisers } from "./seeds/fundraiser.seed";

async function main() {
  try {
    console.log("Starting seed...");

    // 1. Address (Must be first for User address relations)
    await seedAddress();
    console.log("Address seeded.");

    // 2. Users
    const admin = await seedUsers();
    console.log("Users seeded.");

    // 3. Page Content
    await seedPageContent();
    console.log("Page Content seeded.");

    // 4. Blogs
    await seedBlogs(admin.id);
    console.log("Blogs seeded.");

    // 5. Campaigns
    await seedCampaigns();
    console.log("Campaigns seeded.");

    // 6. Fundraisers
    await seedFundraisers();
    console.log("Fundraisers seeded.");

    console.log("Seeding completed.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
