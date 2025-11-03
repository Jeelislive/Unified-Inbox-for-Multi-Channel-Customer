import twilio from "twilio";
import { prisma } from "./prisma";
import { ChannelType, MessageStatus } from "@prisma/client";

/**
 * Get Twilio client for a specific team
 */
export async function getTwilioClient(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      twilioAccountSid: true,
      twilioAuthToken: true,
      twilioPhoneNumber: true,
      twilioWhatsappNumber: true,
    },
  });

  if (!team?.twilioAccountSid || !team?.twilioAuthToken) {
    throw new Error("Twilio credentials not configured for this team");
  }

  return twilio(team.twilioAccountSid, team.twilioAuthToken);
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(params: {
  teamId: string;
  to: string;
  content: string;
  messageId: string;
}) {
  const { teamId, to, content, messageId } = params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { twilioPhoneNumber: true },
  });

  if (!team?.twilioPhoneNumber) {
    throw new Error("Twilio phone number not configured");
  }

  const client = await getTwilioClient(teamId);

  try {
    const twilioMessage = await client.messages.create({
      body: content,
      from: team.twilioPhoneNumber,
      to: to,
    });

    // Update message with Twilio SID and status
    await prisma.message.update({
      where: { id: messageId },
      data: {
        externalId: twilioMessage.sid,
        status: MessageStatus.SENT,
        sentAt: new Date(),
      },
    });

    return twilioMessage;
  } catch (error) {
    // Update message status to failed
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: MessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsApp(params: {
  teamId: string;
  to: string;
  content: string;
  messageId: string;
}) {
  const { teamId, to, content, messageId } = params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { twilioWhatsappNumber: true },
  });

  if (!team?.twilioWhatsappNumber) {
    throw new Error("Twilio WhatsApp number not configured");
  }

  const client = await getTwilioClient(teamId);

  // WhatsApp numbers must be in E.164 format with 'whatsapp:' prefix
  const fromNumber = `whatsapp:${team.twilioWhatsappNumber}`;
  const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  try {
    const twilioMessage = await client.messages.create({
      body: content,
      from: fromNumber,
      to: toNumber,
    });

    // Update message with Twilio SID and status
    await prisma.message.update({
      where: { id: messageId },
      data: {
        externalId: twilioMessage.sid,
        status: MessageStatus.SENT,
        sentAt: new Date(),
      },
    });

    return twilioMessage;
  } catch (error) {
    // Update message status to failed
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: MessageStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

/**
 * Process inbound message from Twilio webhook
 */
export async function processInboundMessage(webhookData: {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
  NumMedia?: string;
  MediaUrl0?: string;
}) {
  const { From, To, Body, MessageSid, NumMedia, MediaUrl0 } = webhookData;

  // Determine channel type
  const isWhatsApp = From.startsWith("whatsapp:");
  const channel = isWhatsApp ? ChannelType.WHATSAPP : ChannelType.SMS;

  // Clean phone numbers
  const fromNumber = From.replace("whatsapp:", "");
  const toNumber = To.replace("whatsapp:", "");

  // Find or determine team based on the 'To' number
  const team = await prisma.team.findFirst({
    where: {
      OR: [{ twilioPhoneNumber: toNumber }, { twilioWhatsappNumber: toNumber }],
    },
  });

  if (!team) {
    console.error("No team found for number:", toNumber);
    return null;
  }

  // Find or create contact
  let contact = await prisma.contact.findFirst({
    where: {
      teamId: team.id,
      OR: [{ phoneNumber: fromNumber }, { whatsappNumber: fromNumber }],
    },
  });

  if (!contact) {
    // Auto-create contact from inbound message
    contact = await prisma.contact.create({
      data: {
        teamId: team.id,
        phoneNumber: isWhatsApp ? undefined : fromNumber,
        whatsappNumber: isWhatsApp ? fromNumber : undefined,
        lastContactedAt: new Date(),
      },
    });
  }

  // Handle media attachments
  const mediaUrls: string[] = [];
  if (NumMedia && parseInt(NumMedia) > 0 && MediaUrl0) {
    mediaUrls.push(MediaUrl0);
  }

  // Create inbound message
  const message = await prisma.message.create({
    data: {
      content: Body,
      channel,
      direction: "INBOUND",
      status: MessageStatus.DELIVERED,
      externalId: MessageSid,
      contactId: contact.id,
      teamId: team.id,
      mediaUrls,
      sentAt: new Date(),
      deliveredAt: new Date(),
    },
  });

  // Update contact's last contacted timestamp
  await prisma.contact.update({
    where: { id: contact.id },
    data: { lastContactedAt: new Date() },
  });

  return message;
}
