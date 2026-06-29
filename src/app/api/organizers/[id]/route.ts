import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const resolvedParams = await params;
    const { name, description, logo } = await req.json();

    const existingOrganizer = await prisma.organizer.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingOrganizer || existingOrganizer.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedOrganizer = await prisma.organizer.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        description,
        logo,
      }
    });

    return NextResponse.json({ success: true, organizer: updatedOrganizer });
  } catch (error) {
    console.error("Update organizer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
