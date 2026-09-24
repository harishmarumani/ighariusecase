import { NextRequest, NextResponse } from "next/server";

/**
 * Shared Webhook Endpoint
 *
 * Instagram:
 *   INSTAGRAM_VERIFY_TOKEN
 *
 * Messenger:
 *   MESSENGER_VERIFY_TOKEN
 *
 * Endpoint:
 *   /api/instagram/webhook
 */

/* =========================================================
   GET — Instagram + Messenger Webhook Verification
   ========================================================= */

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const instagramToken = process.env.INSTAGRAM_VERIFY_TOKEN;
  const messengerToken = process.env.MESSENGER_VERIFY_TOKEN;

  const isInstagramToken =
    token && instagramToken && token === instagramToken;

  const isMessengerToken =
    token && messengerToken && token === messengerToken;

  const isValidToken = isInstagramToken || isMessengerToken;

  console.log("=================================");
  console.log("WEBHOOK VERIFICATION");
  console.log("=================================");
  console.log("Mode:", mode);
  console.log("Token received:", !!token);
  console.log("Instagram token exists:", !!instagramToken);
  console.log("Messenger token exists:", !!messengerToken);
  console.log("Instagram token matched:", !!isInstagramToken);
  console.log("Messenger token matched:", !!isMessengerToken);
  console.log("Token valid:", !!isValidToken);
  console.log("Challenge:", challenge);
  console.log("=================================");

  if (mode === "subscribe" && isValidToken) {
    return new NextResponse(challenge || "", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return new NextResponse("Forbidden", {
    status: 403,
  });
}


/* =========================================================
   POST — Instagram + Messenger Webhook Events
   ========================================================= */

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("=================================");
    console.log("WEBHOOK EVENT RECEIVED");
    console.log("=================================");

    console.log(
      "FULL WEBHOOK:",
      JSON.stringify(body, null, 2)
    );

    const objectType = body?.object;

    console.log("Webhook Object:", objectType);

    /* =====================================================
       MESSENGER WEBHOOK
       ===================================================== */

    if (objectType === "page") {
      console.log("---------------------------------");
      console.log("MESSENGER WEBHOOK");
      console.log("---------------------------------");

      const entries = body?.entry || [];

      for (const entry of entries) {
        const messagingEvents = entry?.messaging || [];

        for (const messaging of messagingEvents) {
          const senderId = messaging?.sender?.id;
          const recipientId = messaging?.recipient?.id;
          const messageText = messaging?.message?.text;

          if (senderId) {
            console.log(
              "MESSENGER SENDER PSID:",
              senderId
            );
          }

          if (recipientId) {
            console.log(
              "MESSENGER RECIPIENT PAGE ID:",
              recipientId
            );
          }

          if (messageText) {
            console.log(
              "MESSENGER MESSAGE:",
              messageText
            );
          }

          /* Quick Reply */

          const quickReplyPayload =
            messaging?.message?.quick_reply?.payload;

          if (quickReplyPayload) {
            console.log(
              "MESSENGER QUICK REPLY PAYLOAD:",
              quickReplyPayload
            );
          }

          /* Postback */

          const postbackPayload =
            messaging?.postback?.payload;

          if (postbackPayload) {
            console.log(
              "MESSENGER POSTBACK PAYLOAD:",
              postbackPayload
            );
          }

          /* Attachments */

          const attachments =
            messaging?.message?.attachments;

          if (attachments) {
            console.log(
              "MESSENGER ATTACHMENTS:",
              JSON.stringify(
                attachments,
                null,
                2
              )
            );
          }

          /* Sender Action */

          if (messaging?.sender_action) {
            console.log(
              "MESSENGER SENDER ACTION:",
              messaging.sender_action
            );
          }
        }
      }

      console.log("---------------------------------");
    }


    /* =====================================================
       INSTAGRAM WEBHOOK
       ===================================================== */

    else if (objectType === "instagram") {
      console.log("---------------------------------");
      console.log("INSTAGRAM WEBHOOK");
      console.log("---------------------------------");

      const entries = body?.entry || [];

      for (const entry of entries) {
        const messagingEvents =
          entry?.messaging || [];

        for (const messaging of messagingEvents) {
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

          const attachments =
            messaging?.message?.attachments;

          if (attachments) {
            console.log(
              "INSTAGRAM ATTACHMENTS:",
              JSON.stringify(
                attachments,
                null,
                2
              )
            );
          }
        }
      }

      console.log("---------------------------------");
    }


    /* =====================================================
       UNKNOWN WEBHOOK
       ===================================================== */

    else {
      console.log(
        "UNKNOWN WEBHOOK OBJECT:",
        objectType
      );
    }

    console.log("=================================");

    return NextResponse.json(
      {
        received: true,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        received: false,
        error: "Invalid webhook payload",
      },
      {
        status: 400,
      }
    );
  }
}
