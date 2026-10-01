import { EntityRef, PortfolioImpactSummary, TransmissionStep } from "@/types/event";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const articlesTable = pgTable("articles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  publishedAt: text("published_at").notNull(),
  source: text("source").notNull(),
  url: text("url"),
  categoryHint: text("category_hint"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventsTable = pgTable("events", {
  eventId: text("event_id").primaryKey(),
  articleId: text("article_id").references(() => articlesTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  eventType: text("event_type").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sourceArticleTitle: text("source_article_title").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url"),

  entities: jsonb("entities").$type<EntityRef[]>().notNull(),
  eventData: jsonb("event_data").$type<Record<string, any>>().notNull(),
  time: jsonb("time").$type<{ occurred_at: string; effective_at?: string }>().notNull(),
  factuality: jsonb("factuality").$type<{ status: "CONFIRMED" | "UNCONFIRMED" | "RUMOR"; confidence: number }>().notNull(),
  marketImpact: jsonb("market_impact").$type<{ materiality: number; level: "HIGH" | "MEDIUM" | "LOW" }>().notNull(),
  affected: jsonb("affected").$type<{ sectors: string[]; companies: string[] }>().notNull(),
  economicMechanism: jsonb("economic_mechanism").$type<TransmissionStep[]>().notNull(),
  portfolioImpact: jsonb("portfolio_impact").$type<PortfolioImpactSummary>().notNull(),

  telegramSent: boolean("telegram_sent").default(false).notNull(),
  telegramSentAt: text("telegram_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
