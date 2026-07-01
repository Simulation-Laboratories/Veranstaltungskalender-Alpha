import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPinIcon, CalendarIcon, CheckCircle2Icon } from "lucide-react";

import { ReviewSection } from "@/components/review-section";
import { ContactButton } from "@/components/contact-button";
import { ClaimButton } from "@/components/claim-button";

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const location = await prisma.location.findUnique({
    where: { id: resolvedParams.id },
    include: {
      events: {
        where: { isDraft: false, startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' }
      }
    }
  });

  if (!location) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-4xl">
      {/* Banner / Logo */}
      {location.logo ? (
        <div className="w-full h-[300px] relative rounded-xl overflow-hidden shadow-lg border">
          <Image 
            src={location.logo} 
            alt={location.name} 
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-[300px] relative rounded-xl overflow-hidden shadow-lg border bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-4xl text-muted-foreground/30 font-bold">{location.name}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{location.name}</h1>
          {location.isVerified && (
            <span title="Verifizierte Location"><CheckCircle2Icon className="w-6 h-6 text-blue-500" /></span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPinIcon className="w-5 h-5 text-cyan-500" />
            <span>{location.address}</span>
          </div>
          {!location.isVerified ? (
            <ClaimButton locationId={location.id} />
          ) : location.ownerId ? (
            <ContactButton receiverId={location.ownerId} label="Location kontaktieren" />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-8">
        <div className="md:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Über die Location</h2>
            {location.description ? (
              <div 
                className="prose prose-purple dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: location.description }}
              />
            ) : (
              <p className="text-muted-foreground">Keine Beschreibung verfügbar.</p>
            )}
          </section>

          {location.gallery && location.gallery.length > 0 && (
            <section className="space-y-6 pt-8 border-t">
              <h2 className="text-2xl font-bold">Galerie</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {location.gallery.map((url, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-xl overflow-hidden border shadow-sm relative">
                    <Image src={url} alt={`Galerie Bild ${i+1}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-6 pt-8 border-t">
            <ReviewSection locationId={location.id} canReview={true} />
          </section>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Zukünftige Events hier</h3>
            
            {location.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aktuell sind hier keine Events geplant.</p>
            ) : (
              <div className="space-y-4">
                {location.events.map(event => (
                  <div key={event.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <Link href={`/events/${event.id}`} className="hover:text-purple-500 transition-colors">
                      <p className="font-semibold text-sm">{event.title}</p>
                    </Link>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3 h-3" />
                      {event.startDate.toLocaleDateString('de-DE')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
