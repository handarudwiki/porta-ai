export type EventCategory =
  | "MONETARY_POLICY"
  | "FISCAL_POLICY"
  | "REGULATION"
  | "MACROECONOMIC"
  | "CORPORATE"
  | "COMMODITY"
  | "GEOPOLITICAL"
  | "MARKET"
  | "CORPORATE_ACTION";

export type EventType =
  // MONETARY_POLICY
  | "RATE_CHANGE"
  | "RATE_HOLD"
  | "RATE_CUT"
  | "QE_QT"
  | "CENTRAL_BANK_GUIDANCE"
  // FISCAL_POLICY
  | "TAX_CHANGE"
  | "SUBSIDY_CHANGE"
  | "EXPORT_TAX"
  | "GOVERNMENT_SPENDING"
  | "TRADE_POLICY"
  // REGULATION
  | "NEW_REGULATION"
  | "CAPITAL_REQUIREMENT"
  | "LICENSING"
  | "COMPLIANCE"
  // MACROECONOMIC
  | "CPI_INFLATION"
  | "GDP"
  | "UNEMPLOYMENT"
  | "TRADE_BALANCE"
  // CORPORATE
  | "EARNINGS"
  | "EARNINGS_GUIDANCE"
  | "MANAGEMENT_GUIDANCE"
  | "MAJOR_CONTRACT"
  | "M_AND_A"
  | "DEBT_DEFAULT"
  | "LEGAL_EVENT"
  | "MANAGEMENT_CHANGE"
  // COMMODITY
  | "COMMODITY_PRICE_CHANGE"
  | "SUPPLY_DISRUPTION"
  // GEOPOLITICAL
  | "CONFLICT_ESCALATION"
  | "SANCTIONS"
  | "TRADE_WAR"
  // MARKET
  | "LARGE_PRICE_MOVE"
  | "VOLUME_SPIKE"
  | "VOLATILITY_SPIKE"
  | "MARKET_STRESS"
  | "SECTOR_ROTATION"
  // CORPORATE_ACTION
  | "DIVIDEND"
  | "BUYBACK"
  | "RIGHTS_ISSUE"
  | "STOCK_SPLIT"
  | "IPO"
  | "TENDER_OFFER";

export type ImpactLevel = "HIGH" | "MEDIUM" | "LOW";

export interface EntityRef {
  type: "CENTRAL_BANK" | "GOVERNMENT" | "REGULATOR" | "COMPANY" | "COMMODITY" | "COUNTRY" | "INDEX";
  id: string;
  name: string;
}

export interface TransmissionStep {
  step: number;
  label: string;
  description: string;
  icon?: string;
  nodeType: "EVENT" | "MECHANISM" | "SECTOR" | "PORTFOLIO";
}

export interface HoldingImpact {
  ticker: string;
  companyName: string;
  weightPct: number;
  currentValueIdr: number;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  sensitivityScore: number; // -1.0 to +1.0
  estChangePct: number;
  estValueChangeIdr: number;
  reasoning: string;
}

export interface PortfolioImpactSummary {
  relevance: ImpactLevel;
  exposurePct: number;
  affectedHoldings: HoldingImpact[];
  netEstPctImpact: number;
  netEstValueImpactIdr: number;
  summaryText: string;
  actionRecommendation: string;
}

export interface UniversalEventEnvelope {
  event_id: string;
  category: EventCategory;
  event_type: EventType;
  title: string;
  summary: string;
  source_article_title: string;
  source_name: string;
  source_url?: string;
  
  entities: EntityRef[];
  
  // Dynamic JSON payload extracted based on prompt.txt
  event_data: Record<string, any>;
  
  time: {
    occurred_at: string;
    effective_at?: string;
  };
  
  factuality: {
    status: "CONFIRMED" | "UNCONFIRMED" | "RUMOR";
    confidence: number; // 0.0 to 1.0
  };
  
  market_impact: {
    materiality: number; // 0.0 to 1.0
    level: ImpactLevel;
  };
  
  affected: {
    sectors: string[];
    companies: string[];
  };

  economic_mechanism: TransmissionStep[];

  portfolio_impact: PortfolioImpactSummary;

  telegram_sent?: boolean;
  telegram_sent_at?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  published_at: string;
  source: string;
  url?: string;
  category_hint?: string;
}
