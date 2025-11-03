import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authUtils";
import { ChannelType, MessageDirection, MessageStatus } from "@prisma/client";

/**
 * GET /api/messages - Fetch messages for a contact
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required" },
        { status: 400 }
      );
    }

    // Verify contact belongs to user's team
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        teamId: user.teamId!,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { contactId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages - Create a new outbound message
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contactId, content, channel = ChannelType.SMS } = body;

    if (!contactId || !content) {
      return NextResponse.json(
        { error: "contactId and content are required" },
        { status: 400 }
      );
    }

    // Verify contact belongs to user's team
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        teamId: user.teamId!,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        channel,
        direction: MessageDirection.OUTBOUND,
        status: MessageStatus.PENDING,
        contactId,
        teamId: user.teamId!,
        userId: user.id,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Update contact's lastContactedAt
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastContactedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
