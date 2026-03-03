import { PrismaClient } from "@prisma/client";
import {PrismaPg} from "@prisma/adapter-pg"; // Import the PrismaPg class for Postgre
import {env} from "../config/env.js"; // Import the env configuration

const adapter = new PrismaPg({
    url: env.DATABASE_URL, // Use the DATABASE_URL from environment variables
});


export const prisma = new PrismaClient({adapter});  