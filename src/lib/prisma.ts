import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
	return new PrismaClient({ adapter });
};
declare const globalThis: {
	prismaGlobalV6: ReturnType<typeof prismaClientSingleton>;
} & typeof global;
export const prisma = globalThis.prismaGlobalV6 ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobalV6 = prisma;
