import { NextResponse } from 'next/server';
import { readDbConfig, writeDbConfig } from '@/lib/config';
import { Pool } from 'pg';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const config = await readDbConfig();
    if (config?.DATABASE_URL) {
      return NextResponse.json({ error: "Already setup" }, { status: 400 });
    }

    const { dbUrl, adminUsername, adminPassword } = await req.json();
    if (!dbUrl || !adminUsername || !adminPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Test DB connection
    const pool = new Pool({ connectionString: dbUrl });
    try {
      const client = await pool.connect();
      client.release();
    } catch (e: any) {
      return NextResponse.json({ error: `Database connection failed: ${e.message}` }, { status: 400 });
    }

    // 2. Initialize temporary prisma client with this DB URL
    const adapter = new PrismaPg(pool);
    const tempPrisma = new PrismaClient({ adapter });

    try {
      // 3. Create Admin User
      await tempPrisma.user.upsert({
        where: { email: `${adminUsername}@localhost` },
        update: { role: "ADMIN" },
        create: {
          id: "admin-setup-" + Date.now(),
          name: "System Admin",
          email: `${adminUsername}@localhost`,
          role: "ADMIN",
        }
      });

      // 4. Store admin credentials in SystemSettings
      const creds = JSON.stringify({ adminUsername, adminPassword });
      await tempPrisma.systemSettings.upsert({
        where: { key: 'admin_credentials' },
        update: { value: creds },
        create: { key: 'admin_credentials', value: creds }
      });
      
    } catch(e: any) {
       console.error("Setup DB Write Error:", e);
       return NextResponse.json({ 
         error: `Failed to write to database. Have you run Prisma migrations? Details: ${e.message}` 
       }, { status: 500 });
    }

    // 5. Save config
    await writeDbConfig({ DATABASE_URL: dbUrl });

    // 6. Cleanup
    await tempPrisma.$disconnect();
    await pool.end();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
