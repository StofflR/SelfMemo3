import { prisma } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

export class BaseRepository {
    protected prisma: PrismaClient;
    constructor() {
        if (!prisma) {
            throw new Error("Prisma client not initialized. DATABASE_URL might not be configured.");
        }
        this.prisma = prisma;
    }
}