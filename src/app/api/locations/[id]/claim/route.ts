import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const resolvedParams = await params;
    
    // Find an admin user to send the message to
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!admin) {
      return NextResponse.json({ error: "No admin found" }, { status: 500 });
    }

    await prisma.message.create({
      data: {
        senderId: userId,
        receiverId: admin.id,
        content: `System: Der User möchte die Location ${resolvedParams.id} claimen. Bitte prüfen.`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
