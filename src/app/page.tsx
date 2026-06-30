import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { EventFilterBar } from "@/components/event-filter-bar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const view = typeof resolvedParams.view === 'string' ? resolvedParams.view : 'grid';

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Build the dynamic where clause
  const whereClause: any = {
    isDraft: false,
    OR: [
      { publishAt: null },
      { publishAt: { lte: now } }
    ],
    AND: [
      {
        OR: [
          { endDate: { gte: now } },
          {
            AND: [
              { endDate: null },
              { startDate: { gte: startOfToday } }
            ]
          }
        ]
      }
    ]
  };

  if (query) {
    whereClause.AND.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { location: { name: { contains: query, mode: "insensitive" } } },
        { organizer: { name: { contains: query, mode: "insensitive" } } },
      ]
    });
  }

  if (category) {
    // Check if the categories array contains the given category string
    whereClause.AND.push({
      categories: {
        has: category
      }
    });
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      location: true,
      organizer: true,
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  return (
    <div className="container mx-auto py-10 space-y-8">
      <section className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Entdecke, was <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">heute</span> passiert.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Finde die besten lokalen Events, Konzerte und Partys. Von der Community, für die Community.
        </p>
      </section>
      
      <EventFilterBar />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Kommende Events</h2>
          {events.length > 0 && <span className="text-sm text-muted-foreground">{events.length} Events gefunden</span>}
        </div>
        
        {events.length === 0 ? (
          <div className="p-12 border border-dashed rounded-xl text-center text-muted-foreground">
            {query || category ? "Keine Events für diese Filter gefunden." : "Noch keine Events geplant. Sei der Erste!"}
          </div>
        ) : view === "list" ? (
          <div className="flex flex-col gap-4">
            {events.map((event, index) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row gap-4">
                  {event.imageBanner ? (
                    <div className="h-24 w-full sm:w-40 shrink-0 bg-muted rounded-md overflow-hidden relative">
                      <Image 
                        src={event.imageBanner} 
                        alt={event.title} 
                        fill
                        priority={index === 0}
                        sizes="(max-width: 640px) 100vw, 160px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-full sm:w-40 shrink-0 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 rounded-md flex items-center justify-center text-muted-foreground/30 font-bold group-hover:from-purple-500/20 group-hover:to-cyan-500/20 transition-colors">
                      Event
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-500 flex items-center gap-1 mb-1">
                        <CalendarIcon className="w-3 h-3" />
                        {event.startDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}
                      </div>
                      <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors truncate">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1" dangerouslySetInnerHTML={{ __html: event.description.replace(/<[^>]*>?/gm, '') }} />
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 truncate pr-2">
                        <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.location.name}, {event.location.address.split(',')[0]}</span>
                      </div>
                      {event.categories && event.categories.length > 0 && (
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap shrink-0">
                          {event.categories[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="h-full rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4 hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col">
                  {event.imageBanner ? (
                    <div className="h-40 bg-muted rounded-md overflow-hidden relative">
                      <Image 
                        src={event.imageBanner} 
                        alt={event.title} 
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 rounded-md flex items-center justify-center text-muted-foreground/30 font-bold text-xl group-hover:from-purple-500/20 group-hover:to-cyan-500/20 transition-colors">
                      {event.title}
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <div className="text-xs font-bold text-purple-500 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {event.startDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-xl group-hover:text-purple-400 transition-colors">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: event.description.replace(/<[^>]*>?/gm, '') }} />
                  </div>

                  <div className="text-xs text-muted-foreground pt-4 border-t flex items-center justify-between mt-auto gap-2">
                    <div className="flex items-center gap-1 truncate">
                      <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{event.location.name}, {event.location.address.split(',')[0]}</span>
                    </div>
                    {event.categories && event.categories.length > 0 && (
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">
                        {event.categories[0]}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
