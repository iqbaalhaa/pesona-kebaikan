
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "miqbalhanafi977@gmail.com";
  console.log(`Fixing user image for: ${email}...`);

  const user = await prisma.user.update({
    where: { email },
    data: { image: null }, // Or set to a default URL if you prefer
  });

  console.log("User image cleared.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
