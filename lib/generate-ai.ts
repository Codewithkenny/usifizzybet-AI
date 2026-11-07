import { usifizzyClient } from "@/api/usifizzyClient";
import { todayISO } from "@/lib/format";

export interface AIPickItem {
  sport?: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  market: string;
  selection: string;
  odds: number | string | null;
  confidence: number | string;
  risk_level: "Low" | "Medium" | "High" | string;
  reasoning: string;
  status?: string;
  publish_date?: string;
}

export interface AISlipLeg {
  match: string;
  league?: string;
  market?: string;
  selection: string;
  odds: number | string | null;
  kickoff?: string;
  status?: string;
}

export interface AISlipItem {
  title: string;
  target_odds: number | string | null;
  total_odds: number | string | null;
  sport?: string;
  legs: AISlipLeg[];
  status?: string;
  publish_date?: string;
}

const picksSchema = {
  type: "object",
  properties: {
    picks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sport: { type: "string" },
          league: { type: "string" },
          home_team: { type: "string" },
          away_team: { type: "string" },
          kickoff: { type: "string" },
          market: { type: "string" },
          selection: { type: "string" },
          odds: { type: "number" },
          confidence: { type: "number" },
          risk_level: { type: "string" },
          reasoning: { type: "string" },
        },
        required: [
          "league",
          "home_team",
          "away_team",
          "kickoff",
          "market",
          "selection",
          "odds",
          "confidence",
          "risk_level",
          "reasoning",
        ],
      },
    },
  },
  required: ["picks"],
};

const slipsSchema = {
  type: "object",
  properties: {
    slips: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          target_odds: { type: "number" },
          total_odds: { type: "number" },
          sport: { type: "string" },
          legs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                match: { type: "string" },
                league: { type: "string" },
                market: { type: "string" },
                selection: { type: "string" },
                odds: { type: "number" },
                kickoff: { type: "string" },
              },
              required: ["match", "selection", "odds"],
            },
          },
        },
        required: ["title", "target_odds", "total_odds", "legs"],
      },
    },
  },
  required: ["slips"],
};

export async function generatePicks(count: number = 6): Promise<AIPickItem[]> {
  const date = todayISO();
  const result = await usifizzyClient.integrations.Core.InvokeLLM({
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: picksSchema,
    prompt: `You are the analyst engine behind a sports prediction desk. Today is ${date}.

Search the web for ${count} real football or basketball fixtures that kick off within the next 48 hours and have not started yet.

For each fixture pick ONE selection from a low-variance market: Double Chance (Home/Draw or Draw/Away), Goals Over/Under (Over 1.5, Under 2.5, Under 3.5) or a goals handicap. Avoid outright match winners unless the favourite is overwhelming.

Base the probability on recent form, head-to-head history, goals for and against, and any team news you find. Convert that probability into realistic decimal odds. Only keep selections priced between 1.15 and 2.60. This is a tipping desk: never mention staking, deposits or bookmaker accounts.

Return for every pick:
- sport: "Football" or "Basketball"
- league: competition name
- home_team, away_team
- kickoff: ISO 8601 date-time
- market: market label, e.g. "Double Chance"
- selection: exact pick, e.g. "Draw/Away"
- odds: decimal odds as a number
- confidence: whole number 55-92, your probability the selection wins
- risk_level: "Low", "Medium" or "High"
- reasoning: two concise sentences citing concrete numbers

Never invent fixtures — include only games you actually found. Do not output bet codes or bookmaker names.`,
  });

  const rows: AIPickItem[] = ((result?.picks || []) as AIPickItem[])
    .map((pick) => ({
      ...pick,
      odds: Number(pick.odds) || null,
      confidence: Math.round(Number(pick.confidence) || 0),
      risk_level: ["Low", "Medium", "High"].includes(pick.risk_level)
        ? pick.risk_level
        : "Medium",
      status: "Pending",
      publish_date: date,
    }))
    .filter(
      (pick) => pick.home_team && pick.away_team && pick.selection && pick.odds,
    );

  if (!rows.length) {
    throw new Error("No fixtures could be analysed. Try generating again.");
  }
  await usifizzyClient.entities.Pick.bulkCreate(rows);
  return rows;
}

export async function generateSlips(): Promise<AISlipItem[]> {
  const date = todayISO();
  const result = await usifizzyClient.integrations.Core.InvokeLLM({
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: slipsSchema,
    prompt: `You are building SafeBets multi-leg tips for a sports prediction desk. Today is ${date}.

Search the web for real football fixtures kicking off in the next 48 hours. Build exactly three multi-leg tips: one targeting 5.00 total odds, one targeting 10.00 and one targeting 50.00.

Rules:
- Use only safe legs: Double Chance, Over 1.5, Under 3.5 or goals handicap.
- Never repeat the same match twice inside a slip.
- The 5.00 slip needs roughly 2-4 legs, the 10.00 slip 3-6 legs, the 50.00 slip 6-10 legs.
- total_odds must be the product of the leg odds and close to the target.
- Title each slip "<target> Odds SafeBet".

Return each slip with: title, target_odds, total_odds, sport, and legs (match, league, market, selection, odds, kickoff as ISO date-time). Do not output bet codes.`,
  });

  const rows: AISlipItem[] = ((result?.slips || []) as AISlipItem[])
    .map((slip) => ({
      ...slip,
      target_odds: Number(slip.target_odds) || null,
      total_odds: Number(slip.total_odds) || null,
      legs: (slip.legs || []).map((leg) => ({
        ...leg,
        odds: Number(leg.odds) || null,
        status: "Pending",
      })),
      status: "Pending",
      publish_date: date,
    }))
    .filter((slip) => slip.title && slip.target_odds && slip.legs.length);

  if (!rows.length) {
    throw new Error("No slips could be built. Try generating again.");
  }
  await usifizzyClient.entities.Slip.bulkCreate(rows);
  return rows;
}
