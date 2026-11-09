import { appParams } from "@/lib/app-params";
import type { PickRecord, SlipRecord } from "@/lib/entityTypes";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface FilterParams {
  sort?: string;
  limit?: number;
}

interface EntityRow {
  id: string;
  owner_id: string;
  data: unknown;
  created_at: string;
  updated_at: string;
}

class ClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ClientError";
    this.status = status;
  }
}

function fail(status: number, message: string): never {
  throw new ClientError(status, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRecord<T extends object>(row: EntityRow): T {
  if (!isRecord(row.data)) {
    fail(500, "The entity record has invalid data");
  }

  return {
    ...row.data,
    id: row.id,
    created_date: row.created_at,
    updated_date: row.updated_at,
    created_by: row.owner_id,
  } as T;
}

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) fail(401, "Not authenticated");
  return data.user;
}

class EntityRepository<T extends object> {
  private entityName: string;

  constructor(entityName: string) {
    this.entityName = entityName;
  }

  async filter(
    query: Record<string, unknown> = {},
    params: FilterParams = {},
  ): Promise<T[]> {
    const search = new URLSearchParams({
      entity: this.entityName,
      filters: JSON.stringify(query),
      sort: params.sort ?? "-created_date",
    });
    if (params.limit !== undefined) {
      search.set("limit", String(params.limit));
    }

    const response = await fetch(`/api/entities?${search.toString()}`);
    const result: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        isRecord(result) && typeof result.error === "string"
          ? result.error
          : "Unable to load records";
      fail(response.status, message);
    }
    if (!isRecord(result) || !Array.isArray(result.records)) {
      fail(502, "Data service returned an invalid response");
    }
    return result.records as T[];
  }

  async count(query: Record<string, unknown> = {}): Promise<{ count: number }> {
    const search = new URLSearchParams({
      entity: this.entityName,
      filters: JSON.stringify(query),
      count: "true",
    });
    const response = await fetch(`/api/entities?${search.toString()}`);
    const result: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        isRecord(result) && typeof result.error === "string"
          ? result.error
          : "Unable to count records";
      fail(response.status, message);
    }
    if (!isRecord(result) || typeof result.count !== "number") {
      fail(502, "Data service returned an invalid count");
    }
    return { count: result.count };
  }

  async bulkCreate(records: T[]): Promise<T[]> {
    const user = await requireUser();
    const rows = records.map((record) => {
      const data = { ...record } as Record<string, unknown>;
      delete data.id;
      delete data.created_date;
      delete data.updated_date;
      delete data.created_by;
      return { entity: this.entityName, owner_id: user.id, data };
    });

    const { data, error } = await supabase
      .from("entities")
      .insert(rows)
      .select("*");
    if (error) fail(500, error.message);
    return ((data ?? []) as EntityRow[]).map((row) => toRecord<T>(row));
  }
}

export const usifizzyClient = {
  entities: {
    Pick: new EntityRepository<PickRecord>("Pick"),
    Slip: new EntityRepository<SlipRecord>("Slip"),
  },

  auth: {
    async me() {
      const user = await requireUser();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) fail(500, error.message);

      return {
        ...(isRecord(profile?.data) ? profile.data : {}),
        id: user.id,
        email: user.email ?? "",
        username:
          typeof profile?.username === "string" ? profile.username : undefined,
        avatar_url:
          typeof profile?.avatar_url === "string"
            ? profile.avatar_url
            : undefined,
        role: profile?.is_admin === true ? "admin" : "user",
      };
    },

    async updateMe(profileData: Record<string, unknown>) {
      const user = await requireUser();
      const { username, avatar_url, ...rest } = profileData;
      const { data: current, error: currentError } = await supabase
        .from("profiles")
        .select("data")
        .eq("id", user.id)
        .maybeSingle();
      if (currentError) fail(500, currentError.message);

      const update: Record<string, unknown> = {
        id: user.id,
        data: { ...(isRecord(current?.data) ? current.data : {}), ...rest },
      };
      if (username !== undefined) update.username = username;
      if (avatar_url !== undefined) update.avatar_url = avatar_url;

      const { error } = await supabase.from("profiles").upsert(update);
      if (error) fail(500, error.message);
      return usifizzyClient.auth.me();
    },

    async logout(returnUrl?: string) {
      if (typeof window === "undefined") return;
      const { error } = await supabase.auth.signOut();
      if (error) fail(500, error.message);
      window.localStorage.removeItem("usifizzy_access_token");
      window.localStorage.removeItem("token");
      if (returnUrl) {
        window.location.href = `/auth/login?returnTo=${encodeURIComponent(returnUrl)}`;
      }
    },

    redirectToLogin(returnUrl: string) {
      if (typeof window === "undefined") return;
      window.location.href = `/auth/login?returnTo=${encodeURIComponent(returnUrl)}`;
    },
  },

  app: {
    async getPublicSettings() {
      return { id: appParams.appId, public_settings: {} };
    },
  },

  integrations: {
    Core: {
      async InvokeLLM(payload: {
        prompt: string;
        response_json_schema: unknown;
        add_context_from_internet?: boolean;
      }): Promise<unknown> {
        const response = await fetch("/api/llm/invoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let result: unknown;
        try {
          result = await response.json();
        } catch {
          result = {};
        }
        if (!response.ok) {
          const message =
            isRecord(result) && typeof result.error === "string"
              ? result.error
              : "LLM request failed";
          fail(response.status, message);
        }
        return result;
      },
    },
  },
};
