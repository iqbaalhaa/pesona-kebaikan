
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "miqbalhanafi977@gmail.com";
  console.log(`Checking user: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, image: true },
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  if (user.image) {
    console.log(`Image length: ${user.image.length} characters`);
    if (user.image.startsWith("data:image")) {
      console.log("Image IS base64 encoded.");
      // console.log("Snippet:", user.image.substring(0, 50) + "...");
    } else {
      console.log("Image is likely a URL.");
      console.log("Value:", user.image);
    }
  } else {
    console.log("User has no image.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
