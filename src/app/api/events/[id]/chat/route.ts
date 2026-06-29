import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    // Check if event exists and has chat enabled
    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!event || !event.chatEnabled) {
      return NextResponse.json({ error: "Chat disabled or event not found" }, { status: 404 });
    }

    const messages = await prisma.eventChatMessage.findMany({
      where: { eventId: resolvedParams.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(messages.reverse()); // Client expects oldest first (top to bottom)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { content, authorName } = body;

    if (!content || !authorName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!event || !event.chatEnabled) {
      return NextResponse.json({ error: "Chat disabled" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const isArchived = (event.endDate && event.endDate < now) || 
                       (!event.endDate && event.startDate < startOfToday);

    if (isArchived) {
      return NextResponse.json({ error: "Chat is closed for archived events" }, { status: 403 });
    }

    const message = await prisma.eventChatMessage.create({
      data: {
        content: content.trim().slice(0, 280),
        authorName: authorName.trim(),
        eventId: resolvedParams.id,
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
