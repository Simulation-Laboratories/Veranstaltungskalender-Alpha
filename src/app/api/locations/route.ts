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
    const { name, description, address, logo, gallery } = await req.json();

    const location = await prisma.location.create({
      data: {
        name,
        description,
        address,
        logo,
        gallery: gallery || [],
        ownerId: userId,
        isVerified: true, // Auto verify for MVP as requested
      }
    });

    return NextResponse.json({ success: true, location });
  } catch (error) {
    console.error("Create location error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locations = await prisma.location.findMany({
      where: { ownerId: session.user.id },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
