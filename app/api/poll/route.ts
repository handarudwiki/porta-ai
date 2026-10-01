import { getPersistedEvents, markEventTelegramSentInDb, saveArticlesAndEvents } from "@/lib/db";
import { extractEventFromNewsDynamic } from "@/lib/event-extractor";
import { fetchSectorsNews } from "@/lib/sectors-api";
import { sendTelegramNotification } from "@/lib/telegram";
import { UniversalEventEnvelope } from "@/types/event";
import { NextResponse } from "next/server";

// In-memory fallback tracking for sent Telegram alerts
const SENT_EVENT_IDS = new Set<string>();

async function processArticlesAndEvents(autoSendTelegram: boolean, botToken?: string, chatId?: string) {
  const articles = await fetchSectorsNews();

  // 1. Fetch existing DB events to avoid re-extracting already processed articles
  const dbEvents = await getPersistedEvents();
  const existingEventsMap = new Map<string, UniversalEventEnvelope>();

  for (const evt of dbEvents) {
    existingEventsMap.set(evt.event_id, evt);
    if (evt.telegram_sent) {
      SENT_EVENT_IDS.add(evt.event_id);
    }
  }

  // 2. Concurrently extract events for articles that aren't already in DB/cache
  const events = await Promise.all(
    articles.map(async (art) => {
      const expectedEventId = `EVT-${art.id.replace(/[^0-9]/g, "").padStart(3, "0") || Math.floor(100 + Math.random() * 900)}`;

      // Reuse existing DB extraction if available
      const existing = existingEventsMap.get(expectedEventId);
      if (existing) {
        return existing;
      }

      // Extract dynamically with Gemini AI (or fallback)
      return await extractEventFromNewsDynamic(art);
    })
  );

  // 3. Persist articles and extracted events to PostgreSQL via Drizzle
  await saveArticlesAndEvents(events, articles);

  let telegramSentCount = 0;

  // 4. Handle automated Telegram alerts
  if (autoSendTelegram) {
    for (const evt of events) {
      if (
        (evt.portfolio_impact.relevance === "HIGH" || evt.market_impact.materiality >= 0.85) &&
        !SENT_EVENT_IDS.has(evt.event_id)
      ) {
        const res = await sendTelegramNotification(evt, botToken, chatId);
        if (res.success) {
          evt.telegram_sent = true;
          evt.telegram_sent_at = new Date().toISOString();
          SENT_EVENT_IDS.add(evt.event_id);
          telegramSentCount++;
          await markEventTelegramSentInDb(evt.event_id, evt.telegram_sent_at);
        }
      }
    }
  }

  return { articles, events, telegramSentCount };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const autoSendTelegram = searchParams.get("autoSendTelegram") === "true";
    const authHeader = request.headers.get("authorization");
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";
    const isCronSecretValid = process.env.CRON_SECRET ? authHeader === `Bearer ${process.env.CRON_SECRET}` : false;

    const shouldAutoSend = autoSendTelegram || isVercelCron || isCronSecretValid;

    const { articles, events, telegramSentCount } = await processArticlesAndEvents(shouldAutoSend);

    return NextResponse.json({
      success: true,
      polled_at: new Date().toISOString(),
      article_count: articles.length,
      events_extracted: events.length,
      telegram_alerts_sent: telegramSentCount,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Polling failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { autoSendTelegram, botToken, chatId } = body;

    const { articles, events, telegramSentCount } = await processArticlesAndEvents(
      Boolean(autoSendTelegram),
      botToken,
      chatId
    );

    return NextResponse.json({
      success: true,
      polled_at: new Date().toISOString(),
      article_count: articles.length,
      events_extracted: events.length,
      telegram_alerts_sent: telegramSentCount,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Polling execution failed" },
      { status: 500 }
    );
  }
}


