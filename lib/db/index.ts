import { NewsArticle, UniversalEventEnvelope } from "@/types/event";
import { eq } from "drizzle-orm";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbInstance: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return null;
  }

  if (!dbInstance) {
    try {
      const client = postgres(dbUrl, { max: 10 });
      dbInstance = drizzle(client, { schema });
    } catch (err) {
      console.warn("[Database Connection Warning] Failed to connect to PostgreSQL:", err);
      return null;
    }
  }

  return dbInstance;
}

/** Convert database row to UniversalEventEnvelope */
export function mapDbToEventEnvelope(row: typeof schema.eventsTable.$inferSelect): UniversalEventEnvelope {
  return {
    event_id: row.eventId,
    category: row.category as any,
    event_type: row.eventType as any,
    title: row.title,
    summary: row.summary,
    source_article_title: row.sourceArticleTitle,
    source_name: row.sourceName,
    source_url: row.sourceUrl || undefined,
    entities: row.entities,
    event_data: row.eventData,
    time: row.time,
    factuality: row.factuality,
    market_impact: row.marketImpact,
    affected: row.affected,
    economic_mechanism: row.economicMechanism,
    portfolio_impact: row.portfolioImpact,
    telegram_sent: row.telegramSent,
    telegram_sent_at: row.telegramSentAt || undefined,
  };
}

/** Retrieve all persisted events from PostgreSQL */
export async function getPersistedEvents(): Promise<UniversalEventEnvelope[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db.query.eventsTable.findMany({
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });
    return rows.map(mapDbToEventEnvelope);
  } catch (error) {
    console.error("[DB Query Error] Failed to fetch events:", error);
    return [];
  }
}

/** Retrieve a single event by event_id */
export async function getPersistedEventById(eventId: string): Promise<UniversalEventEnvelope | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const row = await db.query.eventsTable.findFirst({
      where: eq(schema.eventsTable.eventId, eventId),
    });
    return row ? mapDbToEventEnvelope(row) : null;
  } catch (error) {
    console.error(`[DB Query Error] Failed to fetch event ${eventId}:`, error);
    return null;
  }
}

/** Upsert news articles and extracted events to PostgreSQL */
export async function saveArticlesAndEvents(
  events: UniversalEventEnvelope[],
  articles: NewsArticle[]
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    // 1. Save / Upsert Articles
    for (const art of articles) {
      await db
        .insert(schema.articlesTable)
        .values({
          id: art.id,
          title: art.title,
          content: art.content,
          publishedAt: art.published_at,
          source: art.source,
          url: art.url || null,
          categoryHint: art.category_hint || null,
        })
        .onConflictDoUpdate({
          target: schema.articlesTable.id,
          set: {
            title: art.title,
            content: art.content,
            publishedAt: art.published_at,
            source: art.source,
            url: art.url || null,
            categoryHint: art.category_hint || null,
          },
        });
    }

    // 2. Save / Upsert Events
    for (const evt of events) {
      // Extract numeric suffix or standard ID
      const articleId = evt.event_id.replace(/^EVT-/, "news-idx-");

      await db
        .insert(schema.eventsTable)
        .values({
          eventId: evt.event_id,
          articleId: articles.some((a) => a.id === articleId) ? articleId : articles[0]?.id || null,
          category: evt.category,
          eventType: evt.event_type,
          title: evt.title,
          summary: evt.summary,
          sourceArticleTitle: evt.source_article_title,
          sourceName: evt.source_name,
          sourceUrl: evt.source_url || null,
          entities: evt.entities,
          eventData: evt.event_data,
          time: evt.time,
          factuality: evt.factuality,
          marketImpact: evt.market_impact,
          affected: evt.affected,
          economicMechanism: evt.economic_mechanism,
          portfolioImpact: evt.portfolio_impact,
          telegramSent: evt.telegram_sent ?? false,
          telegramSentAt: evt.telegram_sent_at || null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.eventsTable.eventId,
          set: {
            title: evt.title,
            summary: evt.summary,
            entities: evt.entities,
            eventData: evt.event_data,
            factuality: evt.factuality,
            marketImpact: evt.market_impact,
            affected: evt.affected,
            economicMechanism: evt.economic_mechanism,
            portfolioImpact: evt.portfolio_impact,
            telegramSent: evt.telegram_sent ?? false,
            telegramSentAt: evt.telegram_sent_at || null,
            updatedAt: new Date(),
          },
        });
    }
  } catch (error) {
    console.error("[DB Save Error] Failed to persist articles/events:", error);
  }
}

/** Update Telegram notification status in DB */
export async function markEventTelegramSentInDb(eventId: string, sentAt: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db
      .update(schema.eventsTable)
      .set({
        telegramSent: true,
        telegramSentAt: sentAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.eventsTable.eventId, eventId));
  } catch (error) {
    console.error(`[DB Update Error] Failed to update Telegram status for ${eventId}:`, error);
  }
}
