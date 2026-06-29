import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    const reviews = await prisma.review.findMany({
      where: { locationId: resolvedParams.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } }
      }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const resolvedParams = await params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Prevent duplicate reviews from same user for same location
    const existingReview = await prisma.review.findFirst({
      where: { locationId: resolvedParams.id, userId }
    });

    if (existingReview) {
      return NextResponse.json({ error: "You already reviewed this location" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment?.trim()?.slice(0, 280),
        locationId: resolvedParams.id,
        userId,
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
