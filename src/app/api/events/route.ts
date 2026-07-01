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

    // Security check: Make sure the user owns the organizer
    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId }
    });

    let finalOrganizerId = organizerId;
    if (!organizer || organizer.ownerId !== userId) {
       // If no organizer is passed or owned, auto-create one for this user for the MVP
       const newOrg = await prisma.organizer.create({
         data: {
           name: "Mein Veranstalter-Profil",
           ownerId: userId,
         }
       });
       finalOrganizerId = newOrg.id;
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });
    if (!location) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }

    const baseStart = new Date(startDate);
    const basePublish = publishAt ? new Date(publishAt) : null;
    let iterations = 1;
    let daysToAdd = 0;

    if (recurrence === "daily") {
      iterations = 7;
      daysToAdd = 1;
    } else if (recurrence === "weekly") {
      iterations = 4;
      daysToAdd = 7;
    }

    const createdEvents = [];

    for (let i = 0; i < iterations; i++) {
      const currentStart = new Date(baseStart.getTime());
      currentStart.setDate(currentStart.getDate() + (i * daysToAdd));
      
      let currentPublish = null;
      if (basePublish) {
        currentPublish = new Date(basePublish.getTime());
        currentPublish.setDate(currentPublish.getDate() + (i * daysToAdd));
      }

      let currentEnd = null;
      if (endDate) {
        currentEnd = new Date(new Date(endDate).getTime());
        currentEnd.setDate(currentEnd.getDate() + (i * daysToAdd));
      }

      const event = await prisma.event.create({
        data: {
          title: title,
          description,
          startDate: currentStart,
          endDate: currentEnd,
          publishAt: currentPublish,
          imageBanner,
          chatEnabled: chatEnabled || false,
          isDraft: isDraft || false,
          organizerId: finalOrganizerId,
          locationId,
          categories: categories || [],
        }
      });
      createdEvents.push(event);
    }

    return NextResponse.json({ success: true, event: createdEvents[0] });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { isDraft: false },
      include: {
        location: true,
        organizer: true,
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
