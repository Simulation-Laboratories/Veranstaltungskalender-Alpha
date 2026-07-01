import { EventForm } from "@/components/forms/event-form";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateEventPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  const organizers = await prisma.organizer.findMany({
    where: { ownerId: userId },
    orderBy: { name: 'asc' }
  });

  const locations = await prisma.location.findMany({
    where: { ownerId: userId },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Neues Event anlegen</h1>
        <p className="text-muted-foreground">Fülle die Details für deine Veranstaltung aus.</p>
      </div>

      <EventForm organizers={organizers} locations={locations} />
    </div>
  );
}
