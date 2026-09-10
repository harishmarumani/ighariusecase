import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log(
    "INSTAGRAM WEBHOOK FULL:",
    JSON.stringify(body, null, 2)
  );

  const messaging = body?.entry?.[0]?.messaging?.[0];

  if (messaging?.sender?.id) {
    console.log(
      "INSTAGRAM SENDER IGSID:",
      messaging.sender.id
    );
  }

  if (messaging?.recipient?.id) {
    console.log(
      "INSTAGRAM RECIPIENT IGSID:",
      messaging.recipient.id
    );
  }

  if (messaging?.message?.text) {
    console.log(
      "INSTAGRAM MESSAGE:",
      messaging.message.text
    );
  }

  return NextResponse.json({ received: true });
}
