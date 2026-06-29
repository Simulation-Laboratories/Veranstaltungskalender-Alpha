import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
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
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = (session.user as any).id;
    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
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
        subject: "Neue Nachricht auf EventHub",
        html: `<p>Hallo ${message.receiver.name},</p><p>du hast eine neue Nachricht von ${message.sender.name} erhalten.</p><p>Logge dich ein, um sie zu lesen.</p>`
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
