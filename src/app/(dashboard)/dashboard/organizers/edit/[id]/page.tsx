import { OrganizerForm } from "@/components/forms/organizer-form";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function EditOrganizerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const userId = session.user.id;
  const resolvedParams = await params;

  const organizer = await prisma.organizer.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!organizer) notFound();

  if (organizer.ownerId !== userId) {
    redirect("/dashboard");
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil bearbeiten</h1>
        <p className="text-muted-foreground">Aktualisiere die Details deines Veranstalter-Profils.</p>
      </div>

      <OrganizerForm initialData={organizer} />
    </div>
  );
}
