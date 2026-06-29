"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/rich-text-editor";

type OrganizerFormProps = {
  initialData?: any; // If provided, we are in Edit Mode
};

export function OrganizerForm({ initialData }: OrganizerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditMode = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logo = initialData?.logo || null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error("Upload failed");
        
        const uploadData = await uploadRes.json();
        logo = uploadData.url;
      }

      const url = isEditMode ? `/api/organizers/${initialData.id}` : "/api/organizers";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, logo }),
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(isEditMode ? "Veranstalter aktualisiert!" : "Veranstalter-Profil erfolgreich angelegt!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name des Veranstalters</Label>
        <Input 
          id="name" 
          required 
          placeholder="z.B. Kulturverein e.V." 
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo (optional)</Label>
        <Input 
          id="logo" 
          type="file" 
          accept="image/*"
          onChange={e => setImageFile(e.target.files?.[0] || null)}
        />
        {initialData?.logo && !imageFile && (
          <p className="text-xs text-muted-foreground">Aktuell ist ein Logo hinterlegt. Lade ein neues hoch, um es zu überschreiben.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Über uns (optional)</Label>
        <RichTextEditor value={description} onChange={setDescription} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Wird gespeichert..." : (isEditMode ? "Änderungen speichern" : "Profil speichern")}
      </Button>
    </form>
  );
}
