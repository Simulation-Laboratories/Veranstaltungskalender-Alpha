"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SendIcon, MessageSquareIcon } from "lucide-react";

type Message = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
};

export function EventChat({ eventId, isArchived }: { eventId: string, isArchived: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to load chat", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
    // Optional: Set up a polling interval for live chat MVP
    const interval = setInterval(fetchMessages, 10000); // refresh every 10s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, authorName }),
      });

      if (!res.ok) throw new Error("Failed to post message");

      const newMessage = await res.json();
      setMessages([...messages, newMessage]);
      setContent("");
      toast.success("Nachricht gesendet!");
    } catch {
      toast.error("Fehler beim Senden");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
        <MessageSquareIcon className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold">Event-Gästebuch</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground mt-4">Lädt...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Noch keine Nachrichten. {isArchived ? "Das Gästebuch ist geschlossen." : "Schreib die erste!"}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-muted/40 p-3 rounded-lg text-sm">
              <div className="flex justify-between items-baseline mb-1">
                <strong className="text-foreground">{msg.authorName}</strong>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-muted-foreground break-words">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      {!isArchived ? (
        <form onSubmit={handleSubmit} className="p-3 border-t bg-muted/20">
          <div className="flex flex-col gap-2">
            <Input 
              placeholder="Dein Name (Pseudonym erlaubt)" 
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="h-8 text-sm"
            />
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Input 
                  placeholder="Deine Nachricht..." 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  maxLength={280}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={submitting}>
                  <SendIcon className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {content.length}/280 Zeichen
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-3 border-t bg-muted/20 text-center text-sm text-muted-foreground">
          Das Event ist vergangen. Der Chat ist nun geschlossen.
        </div>
      )}
    </div>
  );
}
