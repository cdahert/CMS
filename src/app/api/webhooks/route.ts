import { NextRequest, NextResponse } from "next/server";

// MOCK DATA - placeholder for ERP integration
// This endpoint will handle incoming webhooks from external ERP systems.
// Replace validation and processing logic once ERP integration is finalized.

export async function POST(request: NextRequest) {
  try {
    // Validate content type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    // Parse body to validate it is valid JSON
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // MOCK DATA - placeholder: log the webhook payload
    // In production, this would:
    // 1. Verify a signature/secret from the ERP provider
    // 2. Route to the appropriate handler based on event type
    // 3. Process inventory updates, order syncs, etc.
    // 4. Store the event in an activity log
    console.log("[Webhook] Received ERP webhook:", {
      event: body.event ?? "unknown",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { received: true, message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Webhook] Error processing webhook:", err);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
