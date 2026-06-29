import { OrganizerForm } from "@/components/forms/organizer-form";

export default function CreateOrganizerPage() {
  return (
    <div className="container max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Neues Veranstalter-Profil</h1>
        <p className="text-muted-foreground">Erstelle ein Profil für dich als Veranstalter oder deine Organisation.</p>
      </div>

      <OrganizerForm />
    </div>
  );
}
