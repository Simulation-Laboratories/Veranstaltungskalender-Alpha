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
    const body = await req.json();

    const { 
      title,
      description,
      startDate,
      endDate,
      publishAt,
      imageBanner,
      organizerId,
      locationId,
      chatEnabled,
      externalLink,
      recurrence,
      isDraft,
      categories,
    } = body;
    
    // Validate if the event belongs to an organizer owned by the user
    // For MVP, assuming the user is editing an event they own or are admin
    const userRole = (session.user as any).role;
    const isAdmin = userRole === "ADMIN" || userRole === "MODERATOR";
    
    const existingEvent = await prisma.event.findUnique({
      where: { id: resolvedParams.id },
      include: { organizer: true }
    });
    
    if (!existingEvent || (!isAdmin && existingEvent.organizer.ownerId !== userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Block if archived (unless admin)
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const isArchived = (existingEvent.endDate && existingEvent.endDate < now) || 
                       (!existingEvent.endDate && existingEvent.startDate < startOfToday);

    if (isArchived && !isAdmin) {
      return NextResponse.json({ error: "Event is archived and read-only" }, { status: 403 });
    }

    // Verify new organizer ownership
    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId }
    });
    if (!organizer || organizer.ownerId !== userId) {
      return NextResponse.json({ error: "Invalid organizer" }, { status: 403 });
    }

    // Verify new location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });
    if (!location) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        publishAt: publishAt ? new Date(publishAt) : null,
        imageBanner,
        organizerId,
        locationId,
        externalLink: externalLink || null,
        chatEnabled: chatEnabled ?? true,
        recurrenceRule: recurrence !== "none" ? recurrence : null,
        isDraft: isDraft ?? false,
        categories: categories || [],
      }
    });

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
