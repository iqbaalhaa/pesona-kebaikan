import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function checkUser() {
	const user = await prisma.user.findUnique({
		where: { email: "miqbalhanafi977@gmail.com" },
		select: {
			id: true,
			email: true,
			phone: true,
			phoneVerified: true,
			emailVerified: true,
		},
	});
	console.log(JSON.stringify(user, null, 2));
}

checkUser()
	.catch((e) => console.error(e))
	.finally(async () => {
		await prisma.$disconnect();
	});
