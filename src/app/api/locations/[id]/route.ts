import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const resolvedParams = await params;
    const body = await req.json();
    const { name, address, description, logo, gallery } = body;

    const userRole = session.user.role;
    const isAdmin = userRole === "ADMIN" || userRole === "MODERATOR";

    const existingLocation = await prisma.location.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingLocation || (!isAdmin && existingLocation.ownerId !== userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedLocation = await prisma.location.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        address,
        description,
        logo,
        gallery: gallery || existingLocation.gallery,
      }
    });

    return NextResponse.json({ success: true, location: updatedLocation });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
