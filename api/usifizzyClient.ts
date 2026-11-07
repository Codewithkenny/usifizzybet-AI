import { appParams } from "@/lib/app-params";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface FilterParams {
  sort?: string;
  limit?: number;
  [key: string]: any;
}

type Row = {
  id: string;
  owner_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
};

// Shape records like the old API did: own fields + id/created_date/etc.
function toRecord(row: Row) {
  return {
    ...row.data,
    id: row.id,
    created_date: row.created_at,
    updated_date: row.updated_at,
    created_by: row.owner_id,
  };
}

function fail(status: number, message: string): never {
  throw { status, message, data: {} };
}

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) fail(401, "Not authenticated");
  return data.user;
}

class EntityRepository {
  private entityName: string;

  constructor(entityName: string) {
    this.entityName = entityName;
  }

  // NOTE: only exact-match filters are supported, e.g. { sport: "football" }.
  // Operators like $gt / $in are not translated.
  async filter(query: Record<string, any> = {}, params: FilterParams = {}) {
    let q = supabase
      .from("entities")
      .select("*")
      .eq("entity", this.entityName)
      .contains("data", query);

    if (params.sort) {
      const desc = params.sort.startsWith("-");
      const field = params.sort.replace(/^[-+]/, "");
      const column =
        field === "created_date"
          ? "created_at"
          : field === "updated_date"
            ? "updated_at"
            : `data->${field}`;
      q = q.order(column, { ascending: !desc });
    } else {
      q = q.order("created_at", { ascending: false });
    }

    if (params.limit) q = q.limit(params.limit);

    const { data, error } = await q;
    if (error) fail(500, error.message);
    return (data as Row[]).map(toRecord);
  }

  async count(query: Record<string, any> = {}) {
    const { count, error } = await supabase
      .from("entities")
      .select("id", { count: "exact", head: true })
      .eq("entity", this.entityName)
      .contains("data", query);
    if (error) fail(500, error.message);
    return { count: count ?? 0 };
  }

  async bulkCreate(records: any[]) {
    const user = await requireUser();
    const rows = records.map((r) => {
      // strip fields that now live in real columns
      const { id, created_date, updated_date, created_by, ...rest } = r;
      return { entity: this.entityName, owner_id: user.id, data: rest };
    });
    const { data, error } = await supabase
      .from("entities")
      .insert(rows)
      .select();
    if (error) fail(500, error.message);
    return (data as Row[]).map(toRecord);
  }
}

export const usifizzyClient = {
  entities: {
    Pick: new EntityRepository("Pick"),
    Slip: new EntityRepository("Slip"),
  },

  auth: {
    async me() {
      const user = await requireUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return {
        ...(profile?.data ?? {}),
        id: user.id,
        email: user.email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        role: profile?.is_admin ? "admin" : "user",
      };
    },

    async updateMe(profileData: Record<string, any>) {
      const user = await requireUser();
      const { username, avatar_url, ...rest } = profileData;

      const { data: current } = await supabase
        .from("profiles")
        .select("data")
        .eq("id", user.id)
        .single();

      const update: Record<string, any> = {
        data: { ...(current?.data ?? {}), ...rest },
      };
      if (username !== undefined) update.username = username;
      if (avatar_url !== undefined) update.avatar_url = avatar_url;

      const { error } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", user.id);
      if (error) fail(500, error.message);
      return usifizzyClient.auth.me();
    },

    async logout(returnUrl?: string) {
      if (typeof window === "undefined") return;
      await supabase.auth.signOut();
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
    // There is no hosted platform anymore, so return a fixed settings object.
    // If app-index.tsx reads specific fields from this, add them here.
    async getPublicSettings() {
      return { id: appParams.appId, public_settings: {} };
    },
  },

  integrations: {
    Core: {
      async InvokeLLM(payload: {
        model: string;
        prompt: string;
        response_json_schema: any;
        add_context_from_internet?: boolean;
      }) {
        const res = await fetch("/api/llm/invoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) fail(res.status, data.error || "LLM request failed");
        return data;
      },
    },
  },
};
