"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/rich-text-editor";
import { getSafeUrl } from "@/lib/utils";
import Image from "next/image";

import type { Location } from "@prisma/client";

type LocationFormProps = {
  initialData?: Partial<Location>; // If provided, we are in Edit Mode
};

export function LocationForm({ initialData }: LocationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

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
      
      let gallery = initialData?.gallery || [];
      if (galleryFiles.length > 0) {
        const newGalleryUrls = [];
        for (const file of galleryFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            newGalleryUrls.push(uploadData.url);
          }
        }
        gallery = [...gallery, ...newGalleryUrls];
      }

      const url = isEditMode ? `/api/locations/${initialData.id}` : "/api/locations";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, description, logo, gallery }),
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(isEditMode ? "Location aktualisiert!" : "Location erfolgreich angelegt!");
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
        <Label htmlFor="name">Name der Location</Label>
        <Input 
          id="name" 
          required 
          placeholder="z.B. Stadthalle Musterstadt" 
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Vollständige Adresse</Label>
        <Input 
          id="address" 
          required 
          placeholder="Musterstraße 1, 12345 Musterstadt" 
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo / Titelbild (optional)</Label>
        <Input 
          id="logo" 
          type="file" 
          accept="image/*"
          onChange={e => setImageFile(e.target.files?.[0] || null)}
        />
        {initialData?.logo && !imageFile && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">Aktuell ist ein Logo hinterlegt. Lade ein neues hoch, um es zu überschreiben.</p>
            <Image src={getSafeUrl(initialData.logo) || ""} alt="Aktuelles Logo" width={64} height={64} className="object-cover rounded border" />
          </div>
        )}
        {imageFile && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">Neues Logo zum Upload ausgewählt:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(imageFile)} alt="Neues Logo" className="w-16 h-16 object-cover rounded border" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gallery">Galerie Bilder (bis zu 5)</Label>
        <Input 
          id="gallery" 
          type="file" 
          accept="image/*"
          multiple
          onChange={e => {
            const files = Array.from(e.target.files || []);
            if (files.length > 5) {
              toast.error("Maximal 5 Bilder erlaubt.");
              setGalleryFiles(files.slice(0, 5));
            } else {
              setGalleryFiles(files);
            }
          }}
        />
        {(initialData?.gallery?.length ?? 0) > 0 && galleryFiles.length === 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">Aktuell sind {initialData?.gallery?.length} Bilder hinterlegt. Neue Uploads werden hinzugefügt.</p>
            <div className="flex gap-2 flex-wrap">
              {initialData?.gallery?.map((url: string, i: number) => (
                <Image key={i} src={getSafeUrl(url) || ""} alt="Vorschau" width={64} height={64} className="object-cover rounded border" />
              ))}
            </div>
          </div>
        )}
        {galleryFiles.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">{galleryFiles.length} neue Bilder zum Upload ausgewählt:</p>
            <div className="flex gap-2 flex-wrap">
              {galleryFiles.map((f, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={i} src={URL.createObjectURL(f)} alt="Vorschau neu" className="w-16 h-16 object-cover rounded border" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Beschreibung (optional)</Label>
        <RichTextEditor value={description} onChange={setDescription} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Wird gespeichert..." : (isEditMode ? "Änderungen speichern" : "Location speichern")}
      </Button>
    </form>
  );
}
