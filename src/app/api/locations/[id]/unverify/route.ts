import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.location.update({
      where: { id: resolvedParams.id },
      data: { isVerified: false, ownerId: null }
    });
    return NextResponse.json({ message: "Location unverified successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to unverify" }, { status: 500 });
  }
}
