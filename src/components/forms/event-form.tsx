"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { getSafeUrl } from "@/lib/utils";

import type { Event } from "@prisma/client";

type Organizer = { id: string; name: string };
type Location = { id: string; name: string };

type EventFormProps = {
  initialData?: Partial<Event>; // If provided, we are in Edit Mode
  organizers: Organizer[];
  locations: Location[];
  isAdmin?: boolean;
};

export function EventForm({ initialData, organizers, locations, isAdmin = false }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Format dates for the datetime-local input
  const defaultDate = initialData?.startDate 
    ? new Date(initialData.startDate).toISOString().slice(0, 16) 
    : "";
    
  const defaultPublishAt = initialData?.publishAt 
    ? new Date(initialData.publishAt).toISOString().slice(0, 16) 
    : "";

  const defaultEndDate = initialData?.endDate 
    ? new Date(initialData.endDate).toISOString().slice(0, 16) 
    : "";

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [publishAt, setPublishAt] = useState(defaultPublishAt);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [chatEnabled, setChatEnabled] = useState(initialData?.chatEnabled ?? false);
  const [recurrence, setRecurrence] = useState("none");
  const [categories, setCategories] = useState<string[]>(initialData?.categories || []);
  
  const [selectedOrganizer, setSelectedOrganizer] = useState(initialData?.organizerId || (organizers.length > 0 ? organizers[0].id : ""));
  const [selectedLocation, setSelectedLocation] = useState(initialData?.locationId || (locations.length > 0 ? locations[0].id : ""));

  const isEditMode = !!initialData;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // If user is admin, they are never "archived" locked
  const isArchived = initialData && !isAdmin ? (
    (initialData.endDate && new Date(initialData.endDate) < now) || 
    (!initialData.endDate && initialData.startDate && new Date(initialData.startDate) < startOfToday)
  ) : false;

  const handleSubmit = async (e: React.FormEvent, isDraftAction: boolean = false) => {
    e.preventDefault();
    
    if (isArchived) return;

    if (!selectedOrganizer || !selectedLocation) {
      toast.error("Bitte wähle Veranstalter und Location aus!");
      return;
    }

    setLoading(true);
    try {
      let imageBanner = initialData?.imageBanner || null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error("Upload failed");
        
        const uploadData = await uploadRes.json();
        imageBanner = uploadData.url;
      }

      const url = isEditMode ? `/api/events/${initialData.id}` : "/api/events";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startDate,
          endDate: endDate ? endDate : null,
          publishAt: publishAt ? publishAt : null,
          imageBanner,
          organizerId: selectedOrganizer,
          locationId: selectedLocation,
          chatEnabled,
          recurrence,
          categories,
          isDraft: isDraftAction,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(isEditMode ? "Event aktualisiert!" : "Event erfolgreich angelegt!");
      router.push("/dashboard");
      router.refresh();
      
    } catch (error) {
      console.error(error);
      toast.error("Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  if (organizers.length === 0 || locations.length === 0) {
    return (
      <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
        <p className="text-muted-foreground">
          Du benötigst mindestens ein Veranstalter-Profil und eine Location, um ein Event anzulegen.
        </p>
        <div className="flex gap-4 justify-center">
          {organizers.length === 0 && (
            <Link href="/dashboard/organizers/create"><Button>Veranstalter anlegen</Button></Link>
          )}
          {locations.length === 0 && (
            <Link href="/dashboard/locations/create"><Button>Location anlegen</Button></Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isArchived && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/50 rounded-lg text-orange-600 dark:text-orange-400">
          <strong>Archiviert:</strong> Dieses Event liegt in der Vergangenheit und kann nicht mehr bearbeitet werden.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Titel des Events</Label>
          <Input 
            id="title" 
            required 
            placeholder="z.B. Sommerfest 2026" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isArchived}
          />
        </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Veranstalter</Label>
          <Select value={selectedOrganizer} onValueChange={(val) => setSelectedOrganizer(val || "")} disabled={isArchived}>
            <SelectTrigger>
              <SelectValue placeholder="Wähle Veranstalter">
                {organizers.find(o => o.id === selectedOrganizer)?.name || "Wähle Veranstalter"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {organizers.map(org => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Location</Label>
          <Select value={selectedLocation} onValueChange={(val) => setSelectedLocation(val || "")} disabled={isArchived}>
            <SelectTrigger>
              <SelectValue placeholder="Wähle Location">
                {locations.find(l => l.id === selectedLocation)?.name || "Wähle Location"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Startdatum & Zeit</Label>
          <Input 
            id="startDate" 
            type="datetime-local" 
            required 
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            disabled={isArchived}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Enddatum & Zeit (optional)</Label>
          <Input 
            id="endDate" 
            type="datetime-local" 
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            disabled={isArchived}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="publishAt">Geplante Veröffentlichung (Optional)</Label>
          <Input 
            id="publishAt" 
            type="datetime-local" 
            value={publishAt}
            onChange={e => setPublishAt(e.target.value)}
            disabled={isArchived}
          />
          <p className="text-xs text-muted-foreground">Wenn leer, geht das Event sofort live (außer es ist ein Entwurf).</p>
        </div>

        {!isEditMode && (
          <div className="space-y-2 col-span-2">
            <Label>Wiederholung (nur bei Neuanlage)</Label>
            <Select value={recurrence} onValueChange={(val) => setRecurrence(val || "none")} disabled={isArchived}>
              <SelectTrigger>
                <SelectValue placeholder="Einmalig" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Einmaliges Event</SelectItem>
                <SelectItem value="daily">Täglich (für 7 Tage)</SelectItem>
                <SelectItem value="weekly">Wöchentlich (für 4 Wochen)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Erstellt automatisch mehrere unabhängige Events in der Zukunft.</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Kategorien</Label>
        <div className="flex flex-wrap gap-2">
          {["Party", "Kultur", "Sport", "Business", "Kinder", "Essen & Trinken"].map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={categories.includes(cat) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCategories(prev => 
                  prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                );
              }}
              disabled={isArchived}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="banner">Event Banner Bild (optional)</Label>
        <Input 
          id="banner" 
          type="file" 
          accept="image/*"
          onChange={e => setImageFile(e.target.files?.[0] || null)}
          disabled={isArchived}
        />
        {initialData?.imageBanner && !imageFile && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">Aktuell ist ein Banner hinterlegt. Lade ein neues hoch, um es zu überschreiben.</p>
            <Image src={getSafeUrl(initialData.imageBanner) || ""} alt="Aktuelles Banner" width={128} height={64} className="object-cover rounded border" />
          </div>
        )}
        {imageFile && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">Neues Banner zum Upload ausgewählt:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(imageFile)} alt="Neues Banner" className="w-32 h-16 object-cover rounded border" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Beschreibung (Rich Text)</Label>
        {isArchived ? (
          <div className="p-4 border rounded-md bg-muted/50 prose prose-purple dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <RichTextEditor value={description} onChange={setDescription} />
        )}
      </div>

      <div className="flex items-center space-x-2 border p-4 rounded-lg">
        <input 
          type="checkbox" 
          id="chatEnabled" 
          checked={chatEnabled} 
          onChange={(e) => setChatEnabled(e.target.checked)} 
          disabled={isArchived}
          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
        />
        <div className="space-y-0.5">
          <Label htmlFor="chatEnabled">Event-Chat (Gästebuch) aktivieren</Label>
          <p className="text-xs text-muted-foreground">Erlaubt es Besuchern, sich auf der Event-Seite (auch pseudonym) auszutauschen.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline"
          className="w-full" 
          disabled={loading || isArchived}
          onClick={(e) => handleSubmit(e, true)}
        >
          Als Entwurf speichern
        </Button>
        <Button 
          type="button" 
          className="w-full" 
          disabled={loading || isArchived}
          onClick={(e) => handleSubmit(e, false)}
        >
          {loading ? "Wird gespeichert..." : (isEditMode ? "Änderungen veröffentlichen" : "Event veröffentlichen")}
        </Button>
      </div>
    </form>
    </div>
  );
}
