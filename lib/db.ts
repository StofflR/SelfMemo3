// import { PrismaClient } from "@prisma/client"
// //import "server-only";
//
// declare global {
//   // eslint-disable-next-line no-var
//   var cachedPrisma: PrismaClient
// }
//
// export let prisma: PrismaClient
// if (process.env.NODE_ENV === "production") {
//   prisma = new PrismaClient()
// } else {
//   if (!global.cachedPrisma) {
//     global.cachedPrisma = new PrismaClient()
//   }
//   prisma = global.cachedPrisma
// }
import { PrismaClient } from "@prisma/client"

declare global {
  var cachedPrisma: PrismaClient | undefined
}

export let prisma: PrismaClient | undefined

// Only initialize Prisma if DATABASE_URL is configured
const isDatabaseConfigured = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "";

if (isDatabaseConfigured) {
  if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient()
  } else {
    if (!globalThis.cachedPrisma) {
      globalThis.cachedPrisma = new PrismaClient()
    }
    prisma = globalThis.cachedPrisma
  }
} else {
  console.log("DATABASE_URL not configured, using local file-based storage");
  prisma = undefined;
}