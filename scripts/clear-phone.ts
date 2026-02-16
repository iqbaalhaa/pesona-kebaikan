import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const phone = "082280955152";

  const result = await prisma.user.updateMany({
    where: { phone },
    data: {
      phone: null,
      phoneVerified: null,
    },
  });

  console.log(
    `Cleared phone for ${result.count} user(s) with phone ${phone}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

