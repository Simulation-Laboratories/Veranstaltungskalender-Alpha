import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, description, logo } = await req.json();

    const organizer = await prisma.organizer.create({
      data: {
        name,
        description,
        logo,
        ownerId: userId,
        isVerified: true, // Auto verify for MVP as requested
      }
    });

    return NextResponse.json({ success: true, organizer });
  } catch (error) {
    console.error("Create organizer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizers = await prisma.organizer.findMany({
      where: { ownerId: session.user.id },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(organizers);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
