import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ContactButton } from "@/components/contact-button";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function MessagesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const receivedMessages = await prisma.message.findMany({
    where: { receiverId: userId },
    include: {
      sender: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const sentMessages = await prisma.message.findMany({
    where: { senderId: userId },
    include: {
      receiver: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  async function deleteMessage(messageId: string) {
    "use server";
    const session = await auth();
    if (!session) return;
    
    await prisma.message.deleteMany({
      where: {
        id: messageId,
        OR: [
          { receiverId: session.user.id },
          { senderId: session.user.id }
        ]
      }
    });
    revalidatePath("/dashboard/messages");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Posteingang</h1>
        <p className="text-muted-foreground">Deine direkten Nachrichten.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Erhaltene Nachrichten</h2>
          {receivedMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Nachrichten empfangen.</p>
          ) : (
            receivedMessages.map(msg => (
              <div key={msg.id} className="bg-card p-4 rounded-xl border shadow-sm">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-semibold">{msg.sender.name || 'Unbekannt'}</span>
                  <span className="text-xs text-muted-foreground">{msg.createdAt.toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                  <ContactButton receiverId={msg.sender.id} label="Antworten" />
                  <form action={deleteMessage.bind(null, msg.id)}>
                    <Button variant="ghost" size="icon" type="submit" title="Löschen">
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Gesendete Nachrichten</h2>
          {sentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Nachrichten gesendet.</p>
          ) : (
            sentMessages.map(msg => (
              <div key={msg.id} className="bg-muted/30 p-4 rounded-xl border shadow-sm opacity-80">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-muted-foreground">An: {msg.receiver.name || 'Unbekannt'}</span>
                  <span className="text-xs text-muted-foreground">{msg.createdAt.toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                <div className="mt-4 pt-3 border-t flex justify-end">
                  <form action={deleteMessage.bind(null, msg.id)}>
                    <Button variant="ghost" size="sm" type="submit">
                      Löschen
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
