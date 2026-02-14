
import { PrismaClient } from "./src/generated/prisma";
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.campaign.count();
  console.log(`Total campaigns: ${count}`);
  
  const active = await prisma.campaign.count({
    where: { status: 'ACTIVE' }
  });
  console.log(`Active campaigns: ${active}`);

  if (active > 0) {
      const sample = await prisma.campaign.findMany({
          where: { status: 'ACTIVE' },
          take: 2,
          select: { id: true, title: true, target: true }
      });
      console.log('Sample campaigns:', JSON.stringify(sample, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
