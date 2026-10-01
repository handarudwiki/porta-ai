import { UniversalEventEnvelope } from "@/types/event";

/**
 * Formats a Universal Event Envelope into a rich Telegram HTML / Markdown message
 */
export function formatTelegramMessage(event: UniversalEventEnvelope, baseUrl: string = "http://localhost:3000"): string {
  const isHighRelevance = event.portfolio_impact.relevance === "HIGH";
  const icon = isHighRelevance ? "🚨" : "📊";
  const badge = isHighRelevance ? "[HIGH PORTFOLIO IMPACT]" : "[MARKET EVENT]";
  
  const impactVal = event.portfolio_impact.netEstValueImpactIdr;
  const impactSign = impactVal > 0 ? "+" : "";
  const formattedVal = `${impactSign}Rp ${Math.abs(impactVal).toLocaleString("id-ID")}`;
  const pctStr = `${impactSign}${event.portfolio_impact.netEstPctImpact}%`;

  const linkUrl = `${baseUrl}/event/${event.event_id}`;

  const transmissionChain = event.economic_mechanism
    .map((step) => `• <b>Step ${step.step}:</b> ${step.label}`)
    .join("\n");

  const affectedStocks = event.portfolio_impact.affectedHoldings
    .map((h) => `${h.ticker} (${h.sentiment === "BULLISH" ? "🟢" : h.sentiment === "BEARISH" ? "🔴" : "⚪"} ${h.estChangePct > 0 ? "+" : ""}${h.estChangePct}%)`)
    .join(", ");

  return `
${icon} <b>PORTA FLASH ALERT</b> ${badge}

<b>${event.title}</b>

🏷️ <b>Category:</b> ${event.category} (${event.event_type})
🎯 <b>Portfolio Relevance:</b> ${event.portfolio_impact.relevance} (${event.portfolio_impact.exposurePct}% exposure)
💥 <b>Est. Portfolio Impact:</b> <b>${pctStr}</b> (${formattedVal})

💡 <b>Transmission Mechanism:</b>
${transmissionChain}

📈 <b>Affected Holdings:</b> ${affectedStocks || "None directly"}

⚡ <b>Action Plan:</b>
<i>${event.portfolio_impact.actionRecommendation}</i>

🔗 <b>Interactive Analysis & Scenario Simulator:</b>
<a href="${linkUrl}">${linkUrl}</a>
`.trim();
}

/**
 * Sends a Telegram notification using Telegram Bot API
 */
export async function sendTelegramNotification(
  event: UniversalEventEnvelope,
  customToken?: string,
  customChatId?: string,
  baseUrl: string = "http://localhost:3000"
): Promise<{ success: boolean; message: string }> {
  const botToken = customToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      success: false,
      message: "Telegram Bot Token or Chat ID not configured. Message simulated."
    };
  }

  const text = formatTelegramMessage(event, baseUrl);

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
        disable_web_page_preview: false
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: "Telegram notification sent successfully!" };
    } else {
      return { success: false, message: `Telegram API Error: ${data.description || "Failed to send"}` };
    }
  } catch (error: any) {
    console.error("[Telegram Dispatch Error]", error);
    return { success: false, message: `Telegram network error: ${error?.message || "Error"}` };
  }
}
