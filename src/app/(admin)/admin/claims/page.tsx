import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { sendEmail } from "@/lib/email";

export default async function AdminClaimsPage() {
  const unverifiedLocations = await prisma.location.findMany({
    where: { isVerified: false },
    orderBy: { name: 'asc' }
  });

  // Also fetch the messages sent to the admin regarding claims
  // (In our MVP, claiming just sends a message to the first admin)

  async function approveLocation(locationId: string) {
    "use server";
    const location = await prisma.location.update({
      where: { id: locationId },
      data: { isVerified: true },
      include: { owner: true }
    });
    
    if (location.owner?.email) {
      await sendEmail({
        to: location.owner.email,
        subject: "Deine Location wurde verifiziert!",
        html: `<p>Hallo ${location.owner.name},</p><p>gute Neuigkeiten! Deine Location <strong>${location.name}</strong> wurde erfolgreich verifiziert.</p>`
      });
    }

    revalidatePath("/admin/claims");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Location Claims</h1>
      <p className="text-muted-foreground">Orte, die noch nicht verifiziert sind.</p>
      
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {unverifiedLocations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Es gibt aktuell keine unbestätigten Locations.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 font-semibold">Location</th>
                <th className="px-6 py-3 font-semibold">Adresse</th>
                <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {unverifiedLocations.map(loc => (
                <tr key={loc.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <Link href={`/locations/${loc.id}`} className="font-medium hover:underline text-purple-600">
                      {loc.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{loc.address}</td>
                  <td className="px-6 py-4 text-right">
                    <form action={approveLocation.bind(null, loc.id)}>
                      <Button size="sm" type="submit" variant="default" className="gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Verifizieren
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
