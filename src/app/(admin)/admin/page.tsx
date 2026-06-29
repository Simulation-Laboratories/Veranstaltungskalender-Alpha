import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const usersCount = await prisma.user.count();
  const eventsCount = await prisma.event.count();
  const locationsCount = await prisma.location.count();
  
  // Pending claims (Locations with ownerId but isVerified = false, or just messages sent to admin?)
  // Actually, our claim system currently sends a Message to the Admin.
  // Alternatively, we can just look for locations where isVerified is false and has an ownerId, or we can look for the messages.
  // We'll keep it simple for the overview.
  const unverifiedLocationsCount = await prisma.location.count({
    where: { isVerified: false }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">System Übersicht</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Benutzer</h3>
          <p className="text-3xl font-bold">{usersCount}</p>
        </div>
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Events</h3>
          <p className="text-3xl font-bold">{eventsCount}</p>
        </div>
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Locations</h3>
          <p className="text-3xl font-bold">{locationsCount}</p>
        </div>
        <div className="p-6 rounded-xl border bg-card shadow-sm border-purple-500/30 bg-purple-500/5">
          <h3 className="text-sm font-medium text-purple-600 mb-2">Offene Claims (Unverified)</h3>
          <p className="text-3xl font-bold text-purple-700">{unverifiedLocationsCount}</p>
        </div>
      </div>
    </div>
  );
}
