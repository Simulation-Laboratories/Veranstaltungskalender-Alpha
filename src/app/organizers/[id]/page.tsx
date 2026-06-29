import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, MapPinIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactButton } from "@/components/contact-button";

export default async function OrganizerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const organizer = await prisma.organizer.findUnique({
    where: { id: resolvedParams.id },
    include: {
      events: {
        where: {
          isDraft: false,
          // We could split into upcoming and past, but let's just fetch all and separate in JS
        },
        include: {
          location: true,
        },
        orderBy: {
          startDate: 'asc'
        }
      }
    }
  });

  if (!organizer) notFound();

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Separate events
  const upcomingEvents = organizer.events.filter(event => {
    if (event.publishAt && event.publishAt > now) return false; // Hide scheduled
    const isArchived = (event.endDate && event.endDate < now) || 
                       (!event.endDate && event.startDate < startOfToday);
    return !isArchived;
  });

  const pastEvents = organizer.events.filter(event => {
    if (event.publishAt && event.publishAt > now) return false;
    const isArchived = (event.endDate && event.endDate < now) || 
                       (!event.endDate && event.startDate < startOfToday);
    return isArchived;
  }).reverse(); // Newest past events first

  return (
    <div className="container mx-auto py-10 space-y-12 max-w-5xl px-4">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 bg-muted rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
          {organizer.logo ? (
            <img src={organizer.logo} alt={organizer.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl text-muted-foreground/30 font-bold">{organizer.name.charAt(0)}</span>
          )}
        </div>
        
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">{organizer.name}</h1>
            {organizer.isVerified && (
              <CheckCircle2Icon className="w-6 h-6 text-blue-500" title="Verifizierter Veranstalter" />
            )}
          </div>
          
          <div className="prose prose-purple dark:prose-invert max-w-none">
            {organizer.description ? (
              <p className="text-muted-foreground">{organizer.description}</p>
            ) : (
              <p className="text-muted-foreground italic">Keine Beschreibung vorhanden.</p>
            )}
          </div>
          
          {organizer.ownerId && (
            <div className="mt-4">
              <ContactButton receiverId={organizer.ownerId} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Zukünftige Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground">Aktuell sind keine zukünftigen Events geplant.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <Link href={`/events/${event.id}`} key={event.id} className="group flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all">
                <div className="h-40 bg-muted relative">
                  {event.imageBanner ? (
                    <img src={event.imageBanner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                      <span className="text-muted-foreground/50 font-medium">Event</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-purple-500 transition-colors">{event.title}</h3>
                  <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {event.startDate.toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="truncate">{event.location.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6 text-muted-foreground">Vergangene Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map(event => (
              <Link href={`/events/${event.id}`} key={event.id} className="group flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all opacity-75 hover:opacity-100 grayscale hover:grayscale-0">
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">{event.title}</h3>
                  <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {event.startDate.toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
