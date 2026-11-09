import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership, hasActiveMembership } from "@/lib/membership";
import { enforceRateLimit, rateLimitIdentity } from "@/lib/rateLimit";

interface EntityRow {
  id: string;
  owner_id: string;
  entity: string;
  data: unknown;
  created_at: string;
  updated_at: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function pickFields(
  data: Record<string, unknown>,
  fields: string[],
): Record<string, unknown> {
  return Object.fromEntries(
    fields
      .filter((field) => field in data)
      .map((field) => [field, data[field]]),
  );
}

export async function GET(request: NextRequest) {
  const entity = request.nextUrl.searchParams.get("entity");
  if (entity !== "Pick" && entity !== "Slip") {
    return jsonError("Unsupported entity", 400);
  }

  let filters: unknown = {};
  const filtersText = request.nextUrl.searchParams.get("filters");
  if (filtersText) {
    if (filtersText.length > 4096) {
      return jsonError("Filters are too large", 413);
    }
    try {
      filters = JSON.parse(filtersText);
    } catch {
      return jsonError("Invalid filters", 400);
    }
  }
  if (!isRecord(filters)) {
    return jsonError("Filters must be an object", 400);
  }

  let limit = 100;
  const limitText = request.nextUrl.searchParams.get("limit");
  if (limitText !== null) {
    limit = Number(limitText);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return jsonError("Limit must be between 1 and 100", 400);
    }
  }

  const sort = request.nextUrl.searchParams.get("sort") || "-created_date";
  if (!/^[-+]?[a-zA-Z_][a-zA-Z0-9_]*$/.test(sort)) {
    return jsonError("Invalid sort field", 400);
  }

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const rateLimit = await enforceRateLimit(
    request,
    "entities",
    rateLimitIdentity(request, user?.id),
    90,
    60,
  );
  if (rateLimit) return rateLimit;

  let canAccess = false;
  try {
    const membership = user ? await getMembership(user.id) : null;
    canAccess = hasActiveMembership(membership);
  } catch {
    return jsonError("Membership service is unavailable", 503);
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return jsonError("Data service is not configured", 503);
  }
  const { data: adminProfiles, error: adminsError } = await admin
    .from("profiles")
    .select("id")
    .eq("is_admin", true);
  if (adminsError) {
    console.error("Failed to load publishing accounts:", adminsError.message);
    return jsonError("Unable to load records", 500);
  }
  const adminIds = (adminProfiles ?? []).map((profile) => profile.id);

  if (!adminIds.length) {
    return request.nextUrl.searchParams.get("count") === "true"
      ? NextResponse.json({ count: 0 })
      : NextResponse.json({ records: [] });
  }

  if (request.nextUrl.searchParams.get("count") === "true") {
    let countQuery = admin
      .from("entities")
      .select("id", { count: "exact", head: true })
      .eq("entity", entity)
      .in("owner_id", adminIds);

    for (const [field, value] of Object.entries(filters)) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
        return jsonError(`Invalid filter field "${field}"`, 400);
      }
      if (isRecord(value) && "$in" in value) {
        if (!Array.isArray(value.$in) || value.$in.length > 20) {
          return jsonError(`Invalid $in filter for "${field}"`, 400);
        }
        countQuery = countQuery.in(`data->>${field}`, value.$in);
      } else {
        countQuery = countQuery.contains("data", { [field]: value });
      }
    }

    const { count, error } = await countQuery;
    if (error) {
      console.error("Failed to count entities:", error.message);
      return jsonError("Unable to count records", 500);
    }
    return NextResponse.json({ count: count ?? 0 });
  }

  let query = admin
    .from("entities")
    .select("*")
    .eq("entity", entity)
    .in("owner_id", adminIds);

  const exactFilters: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(filters)) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
      return jsonError(`Invalid filter field "${field}"`, 400);
    }

    if (isRecord(value) && "$in" in value) {
      if (!Array.isArray(value.$in) || value.$in.length > 20) {
        return jsonError(`Invalid $in filter for "${field}"`, 400);
      }
      query = query.in(`data->>${field}`, value.$in);
    } else {
      exactFilters[field] = value;
    }
  }
  if (Object.keys(exactFilters).length) {
    query = query.contains("data", exactFilters);
  }

  const descending = sort.startsWith("-");
  const field = sort.replace(/^[-+]/, "");
  const orderColumn =
    field === "created_date"
      ? "created_at"
      : field === "updated_date"
        ? "updated_at"
        : `data->>${field}`;
  query = query.order(orderColumn, { ascending: !descending }).limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load public entities:", error.message);
    return jsonError("Unable to load records", 500);
  }

  const records = ((data ?? []) as EntityRow[]).map((row) => {
    let record = isRecord(row.data) ? { ...row.data } : {};
    const isSettled = ["Won", "Lost", "Void"].includes(
      typeof record.status === "string" ? record.status : "",
    );

    if (!canAccess && entity === "Pick") {
      record = pickFields(
        record,
        isSettled
          ? [
              "sport",
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
              "status",
              "publish_date",
              "home_score",
              "away_score",
            ]
          : [
              "sport",
              "league",
              "home_team",
              "away_team",
              "kickoff",
              "status",
              "publish_date",
            ],
      );
    }
    if (!canAccess && entity === "Slip" && !isSettled) {
      const legs = Array.isArray(record.legs) ? record.legs : [];
      record = {
        ...pickFields(record, [
          "title",
          "target_odds",
          "total_odds",
          "sport",
          "status",
          "publish_date",
        ]),
        legs_count: legs.length,
        legs: [],
      };
    }

    return {
      ...record,
      id: row.id,
      created_date: row.created_at,
      updated_date: row.updated_at,
    };
  });

  return NextResponse.json({ records });
}
