"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MessageSquareIcon, XIcon, SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function ContactButton({ receiverId, label = "Nachricht senden" }: { receiverId: string, label?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Du musst angemeldet sein.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, content }),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");
      
      toast.success("Nachricht erfolgreich gesendet!");
      setOpen(false);
      setContent("");
      router.refresh();
    } catch (error) {
      toast.error("Die Nachricht konnte nicht gesendet werden.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Button variant="outline" onClick={() => toast.error("Bitte melde dich an, um Nachrichten zu senden.")}>
        <MessageSquareIcon className="w-4 h-4 mr-2" />
        {label}
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <MessageSquareIcon className="w-4 h-4 mr-2" />
        {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Nachricht verfassen</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                className="w-full flex min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Hallo, ich habe eine Frage zu..."
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Wird gesendet..." : (
                    <>
                      <SendIcon className="w-4 h-4 mr-2" />
                      Senden
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
