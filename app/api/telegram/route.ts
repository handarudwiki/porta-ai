import { formatTelegramMessage, sendTelegramNotification } from "@/lib/telegram";
import { UniversalEventEnvelope } from "@/types/event";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, botToken, chatId, previewOnly } = body;

    if (!event) {
      return NextResponse.json({ success: false, error: "Event data is required" }, { status: 400 });
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const formattedMessage = formatTelegramMessage(event as UniversalEventEnvelope, baseUrl);

    if (previewOnly) {
      return NextResponse.json({
        success: true,
        preview: formattedMessage
      });
    }

    const result = await sendTelegramNotification(
      event as UniversalEventEnvelope,
      botToken,
      chatId,
      baseUrl
    );

    return NextResponse.json({
      ...result,
      formattedMessage
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Telegram send failed" }, { status: 500 });
  }
}
