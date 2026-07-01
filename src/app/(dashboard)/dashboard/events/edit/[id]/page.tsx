import { EventForm } from "@/components/forms/event-form";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const userId = session.user.id;
  const resolvedParams = await params;

  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    include: { organizer: true, location: true }
  });

  if (!event) notFound();

  const userRole = session.user.role;
  const isAdmin = userRole === "ADMIN" || userRole === "MODERATOR";

  // Verify ownership via organizer
  if (!isAdmin && event.organizer.ownerId !== userId) {
    redirect("/dashboard");
  }

  // Load all organizers/locations for admins, or just owned for users
  const organizers = await prisma.organizer.findMany({
    where: isAdmin ? undefined : { ownerId: userId },
    orderBy: { name: 'asc' }
  });

  const locations = await prisma.location.findMany({
    where: isAdmin ? undefined : { ownerId: userId },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event bearbeiten</h1>
        <p className="text-muted-foreground">Aktualisiere die Details deiner Veranstaltung.</p>
      </div>

      <EventForm initialData={event} organizers={organizers} locations={locations} isAdmin={isAdmin} />
    </div>
  );
}
