import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id },
      include: {
        location: true,
        organizer: true,
      }
    });

    if (!event) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const start = event.startDate;
    // Default duration if no endDate: 2 hours
    const end = event.endDate || new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Strip HTML from description for ICS
    const plainDescription = event.description.replace(/<[^>]+>/g, '');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Veranstaltungskalender//DE
BEGIN:VEVENT
UID:${event.id}@veranstaltungskalender
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${event.title}
DESCRIPTION:${plainDescription.slice(0, 500)}${plainDescription.length > 500 ? '...' : ''}
LOCATION:${event.location.name}, ${event.location.address}
END:VEVENT
END:VCALENDAR`;

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics"`,
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
