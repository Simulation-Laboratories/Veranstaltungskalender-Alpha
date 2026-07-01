import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

import fs from "fs"
import path from "path"

const configPath = path.join(process.cwd(), 'data', 'config.json')
let connectionString = process.env.DATABASE_URL || ''

try {
  const data = fs.readFileSync(configPath, 'utf8')
  const config = JSON.parse(data)
  if (config.DATABASE_URL) {
    connectionString = config.DATABASE_URL
  }
} catch (error) {
  // Config not found or invalid
}

let prisma: PrismaClient

if (!connectionString) {
  // Dummy client for setup phase
  prisma = new PrismaClient()
} else {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  const prismaClientSingleton = () => {
    return new PrismaClient({ adapter })
  }

  declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
  } & typeof global;

  prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

  if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma
}

export default prisma
