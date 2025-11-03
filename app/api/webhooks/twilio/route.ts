import { NextRequest, NextResponse } from "next/server";
import { processInboundMessage } from "@/lib/twilio";
import twilio from "twilio";

/**
 * POST /api/webhooks/twilio - Handle inbound messages from Twilio
 * This endpoint receives webhooks for both SMS and WhatsApp messages
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract Twilio webhook parameters
    const webhookData = {
      From: formData.get("From") as string,
      To: formData.get("To") as string,
      Body: formData.get("Body") as string,
      MessageSid: formData.get("MessageSid") as string,
      NumMedia: formData.get("NumMedia") as string | undefined,
      MediaUrl0: formData.get("MediaUrl0") as string | undefined,
    };

    // Validate Twilio signature (optional but recommended for production)
    const twilioSignature = request.headers.get("x-twilio-signature");
    const url = request.url;

    // Note: In production, validate the signature using twilio.validateRequest()
    // For now, we'll process the webhook without validation for demo purposes

    console.log("Received Twilio webhook:", webhookData);

    // Process the inbound message
    const message = await processInboundMessage(webhookData);

    if (!message) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // Return TwiML response to acknowledge receipt
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("Twilio webhook error:", error);

    // Still return 200 to prevent Twilio from retrying
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }
}

/**
 * GET /api/webhooks/twilio - Health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Twilio webhook endpoint is active",
  });
}
