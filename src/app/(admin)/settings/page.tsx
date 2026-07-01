import fs from "fs/promises";
import path from "path";
import { readDbConfig } from "@/lib/config";
import prisma from "@/lib/prisma";

export default async function SettingsOverviewPage() {
  const pkgPath = path.join(process.cwd(), "package.json");
  let pkg: any = {};
  try {
    const pkgData = await fs.readFile(pkgPath, "utf-8");
    pkg = JSON.parse(pkgData);
  } catch (e) {}

  const config = await readDbConfig();
  const dbConfigured = !!config?.DATABASE_URL;
  let dbConnected = false;

  if (dbConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (e) {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground">System status and version information.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 border rounded-lg bg-card space-y-4">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">System Status</h4>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <dt>Environment</dt>
              <dd className="font-mono">{process.env.NODE_ENV || 'development'}</dd>
            </div>
            <div className="flex justify-between border-b pb-2">
              <dt>Database Setup</dt>
              <dd className="font-mono">{dbConfigured ? 'Configured' : 'Missing'}</dd>
            </div>
            <div className="flex justify-between border-b pb-2">
              <dt>Database Connection</dt>
              <dd className="font-mono flex items-center gap-2">
                {dbConnected ? (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
                {dbConnected ? 'Online' : 'Offline'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="p-6 border rounded-lg bg-card space-y-4">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Software Versions</h4>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <dt>App Version</dt>
              <dd className="font-mono">{pkg.version?.replace(/^[^\d]/, '') || 'Unknown'}</dd>
            </div>
            <div className="flex justify-between border-b pb-2">
              <dt>Next.js</dt>
              <dd className="font-mono">{pkg.dependencies?.['next']?.replace(/^[^\d]/, '') || 'Unknown'}</dd>
            </div>
            <div className="flex justify-between border-b pb-2">
              <dt>React</dt>
              <dd className="font-mono">{pkg.dependencies?.['react']?.replace(/^[^\d]/, '') || 'Unknown'}</dd>
            </div>
            <div className="flex justify-between border-b pb-2">
              <dt>Prisma</dt>
              <dd className="font-mono">{pkg.dependencies?.['@prisma/client']?.replace(/^[^\d]/, '') || 'Unknown'}</dd>
            </div>
            <div className="flex justify-between border-b pb-2">
              <dt>NextAuth</dt>
              <dd className="font-mono">{pkg.dependencies?.['next-auth']?.replace(/^[^\d]/, '') || 'Unknown'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
