import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    const reviews = await prisma.review.findMany({
      where: { eventId: resolvedParams.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } }
      }
    });

    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const resolvedParams = await params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event started (Reviews only allowed after start date)
    const now = new Date();
    if (event.startDate > now) {
      return NextResponse.json({ error: "Event has not started yet" }, { status: 403 });
    }

    // Prevent duplicate reviews from same user for same event
    const existingReview = await prisma.review.findFirst({
      where: { eventId: resolvedParams.id, userId }
    });

    if (existingReview) {
      return NextResponse.json({ error: "You already reviewed this event" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment?.trim()?.slice(0, 280),
        eventId: resolvedParams.id,
        userId,
      }
    });

    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
