import { LocationForm } from "@/components/forms/location-form";

export default function CreateLocationPage() {
  return (
    <div className="container max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Neue Location anlegen</h1>
        <p className="text-muted-foreground">Füge einen neuen Veranstaltungsort (z.B. Bar, Halle) hinzu.</p>
      </div>

      <LocationForm />
    </div>
  );
}
