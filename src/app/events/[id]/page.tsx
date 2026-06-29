import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, MapPinIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EventChat } from "@/components/event-chat";
import { ReviewSection } from "@/components/review-section";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    include: {
      location: true,
      organizer: true,
    }
  });

  if (!event) notFound();

  // Visibility Check: Draft or Scheduled
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "MODERATOR";
  const isOwner = event.organizer.ownerId === userId;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  const isArchived = (event.endDate && event.endDate < now) || 
                     (!event.endDate && event.startDate < startOfToday);
                     
  const isScheduled = event.publishAt && event.publishAt > now;

  if ((event.isDraft || isScheduled) && !isAdmin && !isOwner) {
    notFound(); // Hide it from public
  }

  // Very simple ICS generator for MVP
  const generateICS = () => {
    // In a real Server Component, this would ideally be a separate API route.
    // For demonstration, we'll let the user download it via a client-side blob if it were a client component.
    // Since this is a server component, we'd link to `/api/events/${event.id}/ics`.
    // Let's just render the link for now.
  };

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-4xl">
      {/* Banner */}
      {event.imageBanner ? (
        <div className="w-full h-64 md:h-96 overflow-hidden bg-muted rounded-xl shadow-lg border">
          <img
            src={event.imageBanner}
            alt={event.title}
            className={`w-full h-full object-cover ${isArchived ? 'grayscale' : ''}`}
          />
        </div>
      ) : (
        <div className={`w-full h-64 md:h-96 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 flex items-center justify-center rounded-xl shadow-lg border ${isArchived ? 'grayscale' : ''}`}>
          <span className="text-muted-foreground font-semibold text-xl">{event.title}</span>
        </div>
      )}

      {/* Draft / Scheduled Banner */}
      {(event.isDraft || isScheduled) && (
        <div className="container mx-auto px-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg text-blue-600 dark:text-blue-400">
            <strong>Vorschau-Modus:</strong> Dieses Event ist noch nicht öffentlich sichtbar. 
            {event.isDraft ? " Es ist ein Entwurf." : ` Es geht am ${event.publishAt?.toLocaleDateString('de-DE')} um ${event.publishAt?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} online.`}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{event.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-500" />
            <span>{event.startDate.toLocaleString('de-DE')} Uhr</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-cyan-500" />
            <Link href={`/locations/${event.location.id}`} className="hover:text-cyan-500 transition-colors">
              <span>{event.location.name}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-8">
        <div className="md:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Über dieses Event</h2>
            <div 
              className="prose prose-purple dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </section>

          {/* Chat Section */}
          {event.chatEnabled && (
            <section className="space-y-6 pt-8 border-t">
              <h2 className="text-2xl font-bold">Event-Chat</h2>
              <EventChat eventId={event.id} isArchived={isArchived} />
            </section>
          )}

          {/* Review Section */}
          <section className="space-y-6 pt-8 border-t">
            <ReviewSection eventId={event.id} canReview={event.startDate <= now} />
          </section>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Details</h3>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <Link href={`/locations/${event.location.id}`} className="text-purple-500 hover:underline font-semibold block mt-1">
                {event.location.name}
              </Link>
              <p className="text-sm text-muted-foreground mt-1">{event.location.address}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Veranstalter</p>
              <Link href={`/organizers/${event.organizer.id}`} className="hover:text-purple-500 transition-colors">
                <p className="font-semibold">{event.organizer.name}</p>
              </Link>
            </div>

            <Link href={`/api/events/${event.id}/ics`} prefetch={false} target="_blank">
              <Button className="w-full">
                Zum Kalender hinzufügen (ICS)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
