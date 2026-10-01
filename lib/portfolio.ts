import { HoldingImpact, ImpactLevel, PortfolioImpactSummary } from "@/types/event";

export interface PortfolioPosition {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  valueIdr: number;
  weightPct: number;
  sector: string;
  subSector?: string;
}

export const USER_PORTFOLIO: PortfolioPosition[] = [
  {
    ticker: "BBCA",
    name: "Bank Central Asia Tbk",
    shares: 14700,
    avgPrice: 9800,
    currentPrice: 10200,
    valueIdr: 150000000,
    weightPct: 30.0,
    sector: "Banking",
    subSector: "Financials"
  },
  {
    ticker: "BMRI",
    name: "Bank Mandiri (Persero) Tbk",
    shares: 11000,
    avgPrice: 6500,
    currentPrice: 6818,
    valueIdr: 75000000,
    weightPct: 15.0,
    sector: "Banking",
    subSector: "Financials"
  },
  {
    ticker: "INCO",
    name: "Vale Indonesia Tbk",
    shares: 18750,
    avgPrice: 4200,
    currentPrice: 4000,
    valueIdr: 75000000,
    weightPct: 15.0,
    sector: "Mining",
    subSector: "Nickel Exporters"
  },
  {
    ticker: "ANTM",
    name: "Aneka Tambang Tbk",
    shares: 33333,
    avgPrice: 1450,
    currentPrice: 1500,
    valueIdr: 50000000,
    weightPct: 10.0,
    sector: "Mining",
    subSector: "Gold & Nickel"
  },
  {
    ticker: "ASII",
    name: "Astra International Tbk",
    shares: 9615,
    avgPrice: 5000,
    currentPrice: 5200,
    valueIdr: 50000000,
    weightPct: 10.0,
    sector: "Automotive",
    subSector: "Consumer Cyclicals"
  },
  {
    ticker: "CTRA",
    name: "Ciputra Development Tbk",
    shares: 38461,
    avgPrice: 1200,
    currentPrice: 1300,
    valueIdr: 50000000,
    weightPct: 10.0,
    sector: "Property",
    subSector: "Real Estate"
  },
  {
    ticker: "CASH",
    name: "IDR Liquid Cash & Money Market",
    shares: 1,
    avgPrice: 50000000,
    currentPrice: 50000000,
    valueIdr: 50000000,
    weightPct: 10.0,
    sector: "Cash",
    subSector: "Risk Free"
  }
];

export const TOTAL_PORTFOLIO_VALUE = USER_PORTFOLIO.reduce((sum, p) => sum + p.valueIdr, 0);

/**
 * Evaluates how an event impacts the user's hardcoded portfolio based on affected sectors/companies
 * and economic event parameters.
 */
export function evaluatePortfolioImpact(
  affectedSectors: string[],
  affectedCompanies: string[],
  category: string,
  eventData: Record<string, any>
): PortfolioImpactSummary {
  const affectedHoldings: HoldingImpact[] = [];
  let totalExposurePct = 0;
  let netValueImpact = 0;

  // Standardize sector names matching user's portfolio
  const normalizedSectors = affectedSectors.map((s) => s.toUpperCase());
  const normalizedCompanies = affectedCompanies.map((c) => c.toUpperCase());

  for (const pos of USER_PORTFOLIO) {
    if (pos.ticker === "CASH") continue;

    const isCompanyDirect = normalizedCompanies.includes(pos.ticker);
    const isSectorAffected = normalizedSectors.some(
      (sec) =>
        pos.sector.toUpperCase().includes(sec) ||
        (pos.subSector && pos.subSector.toUpperCase().includes(sec))
    );

    if (isCompanyDirect || isSectorAffected) {
      totalExposurePct += pos.weightPct;

      let sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
      let sensitivityScore = 0; // -1 to +1
      let estChangePct = 0;
      let reasoning = "";

      // Logic tailored per category & prompt.txt rules
      if (category === "MONETARY_POLICY") {
        const direction = eventData.direction || (eventData.change_bps > 0 ? "INCREASE" : "DECREASE");
        const changeBps = Math.abs(eventData.change_bps || 25);

        if (pos.sector === "Banking") {
          if (direction === "INCREASE" || direction === "HOLD") {
            sentiment = direction === "INCREASE" ? "BEARISH" : "NEUTRAL";
            sensitivityScore = direction === "INCREASE" ? -0.4 : 0;
            estChangePct = direction === "INCREASE" ? -(changeBps / 20) : 0;
            reasoning = `Rising interest rates increase borrowing costs and potential credit loss risk for bank borrowers.`;
          } else {
            sentiment = "BULLISH";
            sensitivityScore = 0.5;
            estChangePct = changeBps / 20;
            reasoning = `Rate cuts reduce cost of funds and stimulate loan demand.`;
          }
        } else if (pos.sector === "Property") {
          if (direction === "INCREASE") {
            sentiment = "BEARISH";
            sensitivityScore = -0.8;
            estChangePct = -(changeBps / 15);
            reasoning = `Higher mortgage (KPR) rates directly suppress homebuyer demand and property sales.`;
          } else if (direction === "DECREASE") {
            sentiment = "BULLISH";
            sensitivityScore = 0.7;
            estChangePct = changeBps / 15;
            reasoning = `Lower interest rates make mortgages more affordable, driving housing pre-sales.`;
          }
        }
      } else if (category === "FISCAL_POLICY") {
        const action = eventData.action || "INCREASE";
        if (pos.subSector?.includes("Nickel") || pos.ticker === "INCO" || pos.ticker === "ANTM") {
          if (action === "INCREASE") {
            sentiment = "BEARISH";
            sensitivityScore = -0.7;
            estChangePct = -3.5;
            reasoning = `Higher commodity export taxes directly reduce net export margins for mining producers.`;
          } else {
            sentiment = "BULLISH";
            sensitivityScore = 0.6;
            estChangePct = 3.0;
            reasoning = `Lower export taxes boost operating margins and international competitiveness.`;
          }
        }
      } else if (category === "COMMODITY") {
        const changePct = eventData.change_percent || (eventData.direction === "DOWN" ? -5 : 5);
        if (pos.sector === "Mining") {
          sentiment = changePct >= 0 ? "BULLISH" : "BEARISH";
          sensitivityScore = Math.max(-1, Math.min(1, changePct / 10));
          estChangePct = changePct * 0.75;
          reasoning = `Direct revenue correlation to nickel/metal commodity spot price movements.`;
        }
      } else if (category === "CORPORATE") {
        const earningsSurprise = eventData.earnings_surprise || 0;
        const growthYoY = eventData.net_income_growth_yoy || 0;
        if (pos.ticker === eventData.company) {
          if (earningsSurprise > 0 || growthYoY > 10) {
            sentiment = "BULLISH";
            sensitivityScore = 0.8;
            estChangePct = Math.min(6, Math.max(1.5, earningsSurprise * 0.8 || growthYoY * 0.3));
            reasoning = `Earnings beat consensus expectations (+${growthYoY}% YoY growth, +${earningsSurprise}% surprise).`;
          } else {
            sentiment = "BEARISH";
            sensitivityScore = -0.7;
            estChangePct = -3.5;
            reasoning = `Earnings fell below market expectations.`;
          }
        }
      } else if (category === "CORPORATE_ACTION") {
        if (pos.ticker === eventData.company && eventData.action === "DIVIDEND") {
          const dps = eventData.dividend_per_share || 250;
          const estDividend = pos.shares * dps;
          sentiment = "BULLISH";
          sensitivityScore = 0.6;
          estChangePct = 1.8;
          reasoning = `Declared interim dividend of Rp${dps}/share. Direct income cash flow: Rp ${estDividend.toLocaleString('id-ID')}.`;
        }
      } else if (category === "REGULATION") {
        if (pos.sector === "Banking") {
          sentiment = "NEUTRAL";
          sensitivityScore = -0.2;
          estChangePct = -0.8;
          reasoning = `Regulatory compliance changes may introduce short-term operational overhead.`;
        }
      } else {
        // Fallback default
        sentiment = isCompanyDirect ? "BEARISH" : "NEUTRAL";
        sensitivityScore = isCompanyDirect ? -0.5 : -0.2;
        estChangePct = isCompanyDirect ? -2.5 : -1.0;
        reasoning = `General sector sentiment adjustment due to macro/industry event.`;
      }

      const estValueChangeIdr = Math.round((pos.valueIdr * estChangePct) / 100);
      netValueImpact += estValueChangeIdr;

      affectedHoldings.push({
        ticker: pos.ticker,
        companyName: pos.name,
        weightPct: pos.weightPct,
        currentValueIdr: pos.valueIdr,
        sentiment,
        sensitivityScore,
        estChangePct: parseFloat(estChangePct.toFixed(2)),
        estValueChangeIdr,
        reasoning
      });
    }
  }

  const netEstPctImpact = parseFloat(((netValueImpact / TOTAL_PORTFOLIO_VALUE) * 100).toFixed(2));

  // Determine Relevance
  let relevance: ImpactLevel = "LOW";
  if (totalExposurePct >= 30 || Math.abs(netEstPctImpact) >= 1.0) {
    relevance = "HIGH";
  } else if (totalExposurePct >= 15 || Math.abs(netEstPctImpact) >= 0.4) {
    relevance = "MEDIUM";
  }

  // Summary Text & Action Recommendation
  let summaryText = `This event touches ${affectedHoldings.length} of your holdings representing ${totalExposurePct}% of total portfolio value.`;
  let actionRecommendation = `Monitor price action during market hours. No immediate rebalancing required.`;

  if (relevance === "HIGH") {
    if (netEstPctImpact < 0) {
      actionRecommendation = `High portfolio sensitivity detected (${totalExposurePct}% exposure). Consider defensive hedging or reviewing exposure to affected sector.`;
    } else {
      actionRecommendation = `Positive catalyst for ${totalExposurePct}% of your portfolio. Reiterate overweight position.`;
    }
  }

  return {
    relevance,
    exposurePct: totalExposurePct,
    affectedHoldings,
    netEstPctImpact,
    netEstValueImpactIdr: netValueImpact,
    summaryText,
    actionRecommendation
  };
}
