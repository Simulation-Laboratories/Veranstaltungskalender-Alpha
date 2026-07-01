import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { receiverId: userId },
          { senderId: userId }
        ]
      },
      include: {
        sender: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

const messageSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID ist erforderlich"),
  content: z.string().min(1, "Nachricht darf nicht leer sein").max(1000, "Nachricht zu lang"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = session.user.id;
    const body = await req.json();
    
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    
    const { receiverId, content } = result.data;
    
    const receiverExists = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiverExists) {
      return NextResponse.json({ error: "Empfänger nicht gefunden" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        receiver: true,
        sender: true
      }
    });

    if (message.receiver?.email) {
      await sendEmail({
        to: message.receiver.email,
        subject: "Neue Nachricht vom inoffiziellen Veranstaltungskalender Österreich",
        html: `<p>Hallo ${message.receiver.name},</p><p>du hast eine neue Nachricht von ${message.sender.name} erhalten.</p><p>Logge dich ein, um sie zu lesen.</p>`
      });
    }

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
