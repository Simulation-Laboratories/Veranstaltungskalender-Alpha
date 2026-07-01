import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import * as tar from "tar";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbExport = {
      SystemSettings: await prisma.systemSettings.findMany(),
      User: await prisma.user.findMany(),
      Account: await prisma.account.findMany(),
      Session: await prisma.session.findMany(),
      Organizer: await prisma.organizer.findMany(),
      Location: await prisma.location.findMany(),
      Event: await prisma.event.findMany(),
      Review: await prisma.review.findMany(),
      Message: await prisma.message.findMany(),
      EventChatMessage: await prisma.eventChatMessage.findMany(),
    };

    const dbPath = path.join(process.cwd(), "database.json");
    await fs.writeFile(dbPath, JSON.stringify(dbExport, null, 2));

    const pathsToTar = ["database.json"];
    
    try {
      await fs.access(path.join(process.cwd(), "public/uploads"));
      pathsToTar.push("public/uploads");
    } catch (e) {
      // uploads dir might not exist yet, that's fine
    }

    const backupTarPath = path.join(process.cwd(), "backup.tar.gz");
    await tar.c({ gzip: true, file: backupTarPath, cwd: process.cwd() }, pathsToTar);

    const fileBuffer = await fs.readFile(backupTarPath);
    
    // Cleanup temp files
    await fs.unlink(dbPath).catch(() => {});
    await fs.unlink(backupTarPath).catch(() => {});

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename=backup-${new Date().toISOString().split('T')[0]}.tar.gz`
      }
    });

  } catch (error) {
    console.error("Backup generation failed:", error);
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const restoreTarPath = path.join(process.cwd(), "restore.tar.gz");
    await fs.writeFile(restoreTarPath, Buffer.from(await file.arrayBuffer()));

    // Extract the tarball. This will overwrite files in public/uploads and place database.json in root.
    await tar.x({ file: restoreTarPath, cwd: process.cwd() });

    const dbPath = path.join(process.cwd(), "database.json");
    const dbContent = await fs.readFile(dbPath, "utf-8");
    const db = JSON.parse(dbContent);

    // Wipe and restore DB
    await prisma.$transaction([
      // Deletions (reverse dependency order)
      prisma.eventChatMessage.deleteMany(),
      prisma.message.deleteMany(),
      prisma.review.deleteMany(),
      prisma.event.deleteMany(),
      prisma.location.deleteMany(),
      prisma.organizer.deleteMany(),
      prisma.session.deleteMany(),
      prisma.account.deleteMany(),
      prisma.user.deleteMany(),
      prisma.systemSettings.deleteMany(),

      // Insertions (dependency order)
      ...(db.SystemSettings?.length ? [prisma.systemSettings.createMany({ data: db.SystemSettings })] : []),
      ...(db.User?.length ? [prisma.user.createMany({ data: db.User })] : []),
      ...(db.Account?.length ? [prisma.account.createMany({ data: db.Account })] : []),
      ...(db.Session?.length ? [prisma.session.createMany({ data: db.Session })] : []),
      ...(db.Organizer?.length ? [prisma.organizer.createMany({ data: db.Organizer })] : []),
      ...(db.Location?.length ? [prisma.location.createMany({ data: db.Location })] : []),
      ...(db.Event?.length ? [prisma.event.createMany({ data: db.Event })] : []),
      ...(db.Review?.length ? [prisma.review.createMany({ data: db.Review })] : []),
      ...(db.Message?.length ? [prisma.message.createMany({ data: db.Message })] : []),
      ...(db.EventChatMessage?.length ? [prisma.eventChatMessage.createMany({ data: db.EventChatMessage })] : []),
    ]);

    // Force logout for everyone by rotating the JWT secret
    const newJwtSecret = crypto.randomUUID() + crypto.randomUUID();
    await prisma.systemSettings.upsert({
      where: { key: 'jwt_secret' },
      update: { value: JSON.stringify(newJwtSecret) },
      create: { key: 'jwt_secret', value: JSON.stringify(newJwtSecret) }
    });

    // Cleanup temp files
    await fs.unlink(dbPath).catch(() => {});
    await fs.unlink(restoreTarPath).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Restore failed:", error);
    // Cleanup on failure
    await fs.unlink(path.join(process.cwd(), "database.json")).catch(() => {});
    await fs.unlink(path.join(process.cwd(), "restore.tar.gz")).catch(() => {});
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}
