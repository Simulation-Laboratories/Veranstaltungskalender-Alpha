import prisma from "@/lib/prisma";
import Link from "next/link";
import { CalendarIcon, MapPinIcon, ArchiveIcon } from "lucide-react";

export default async function ArchivePage() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const archivedEvents = await prisma.event.findMany({
    where: {
      isDraft: false,
      OR: [
        { publishAt: null },
        { publishAt: { lte: now } }
      ],
      AND: [
        {
          OR: [
            {
              AND: [
                { endDate: { not: null } },
                { endDate: { lt: now } }
              ]
            },
            {
              AND: [
                { endDate: null },
                { startDate: { lt: startOfToday } }
              ]
            }
          ]
        }
      ]
    },
    orderBy: {
      startDate: 'desc', // Show newest past events first
    },
    include: {
      location: true,
      organizer: true,
    }
  });

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center gap-3">
        <ArchiveIcon className="w-8 h-8 text-muted-foreground" />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Event-Archiv</h1>
          <p className="text-muted-foreground">Erinnerungen an vergangene Veranstaltungen.</p>
        </div>
      </div>

      {archivedEvents.length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-xl text-muted-foreground bg-muted/20">
          Noch keine Events im Archiv.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-all hover:border-purple-500/50 cursor-pointer h-full flex flex-col opacity-80 hover:opacity-100">
                {/* Image Banner */}
                {event.imageBanner ? (
                  <div className="w-full h-48 overflow-hidden bg-muted">
                    <img
                      src={event.imageBanner}
                      alt={event.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-tr from-muted to-muted-foreground/20 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                    <span className="text-muted-foreground font-semibold">Kein Bild</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <h3 className="font-bold text-xl line-clamp-2 group-hover:text-purple-500 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-1 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{event.startDate.toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="truncate">{event.location.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
