import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedLocations: {
        orderBy: { name: 'asc' }
      },
      ownedOrganizers: {
        orderBy: { name: 'asc' }
      },
    }
  });

  // Fetch events where the user is the owner of the organizer
  const events = await prisma.event.findMany({
    where: {
      organizer: {
        ownerId: user?.id
      }
    },
    include: {
      location: true,
      organizer: true
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Veranstalter Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/messages">
            <Button variant="outline">Posteingang</Button>
          </Link>
          <Link href="/dashboard/events/create">
            <Button>Neues Event anlegen</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Events Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Meine Events</h2>
            <Link href="/dashboard/events/create">
              <Button variant="outline" size="sm">Neues Event</Button>
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
              Du hast noch keine Events angelegt.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.isDraft && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                          Entwurf
                        </span>
                      )}
                      {!event.isDraft && event.publishAt && event.publishAt > new Date() && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500 rounded-full">
                          Geplant für {event.publishAt.toLocaleDateString('de-DE')} {event.publishAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.startDate.toLocaleDateString('de-DE')} • {event.location.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">Ansehen</Button>
                    </Link>
                    <Link href={`/dashboard/events/edit/${event.id}`}>
                      <Button variant="secondary" size="sm">Bearbeiten</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Locations Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Meine Locations</h2>
            <Link href="/dashboard/locations/create">
              <Button variant="outline" size="sm">Neue Location</Button>
            </Link>
          </div>
          {user?.ownedLocations.length === 0 ? (
            <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
              Du hast noch keine Locations angelegt.
            </div>
          ) : (
            <div className="space-y-4">
              {user?.ownedLocations.map(location => (
                <div key={location.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/locations/edit/${location.id}`}>
                      <Button variant="secondary" size="sm">Bearbeiten</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Organizers Section */}
        <section className="space-y-4 md:col-span-2">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Meine Veranstalter-Profile</h2>
            <Link href="/dashboard/organizers/create">
              <Button variant="outline" size="sm">Neues Profil</Button>
            </Link>
          </div>
          {user?.ownedOrganizers.length === 0 ? (
            <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
              Du hast noch keine Veranstalter-Profile angelegt.
            </div>
          ) : (
            <div className="space-y-4">
              {user?.ownedOrganizers.map(organizer => (
                <div key={organizer.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold">{organizer.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/organizers/edit/${organizer.id}`}>
                      <Button variant="secondary" size="sm">Bearbeiten</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
