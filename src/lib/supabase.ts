import {
  createClient,
  type Session,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";

export type ProfileRecord = {
  id: string;
  full_name: string;
  avatar_url: string;
  education_stage: "elementary" | "high-school" | "higher-studies";
  preferred_study_duration: number;
  timezone: string;
  notifications_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

type Database = {
  public: {
    Tables: {
      mood_entries: {
        Row: {
          created_at?: string;
          id?: number;
          level: number;
          logged_for: string;
          note: string;
          updated_at?: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          level: number;
          logged_for: string;
          note?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<{
          created_at: string;
          id: number;
          level: number;
          logged_for: string;
          note: string;
          updated_at: string;
          user_id: string;
        }>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRecord;
        Insert: {
          avatar_url?: string;
          created_at?: string;
          education_stage?: "elementary" | "high-school" | "higher-studies";
          full_name?: string;
          id: string;
          notifications_enabled?: boolean;
          preferred_study_duration?: number;
          timezone?: string;
          updated_at?: string;
        };
        Update: Partial<{
          avatar_url: string;
          created_at: string;
          education_stage: "elementary" | "high-school" | "higher-studies";
          full_name: string;
          id: string;
          notifications_enabled: boolean;
          preferred_study_duration: number;
          timezone: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let cachedClient: SupabaseClient<Database> | null = null;

function getSupabaseConfig() {
  const windowConfig =
    typeof window === "undefined" ? undefined : window.RESYNC_SUPABASE_CONFIG;

  return {
    url: import.meta.env.VITE_SUPABASE_URL ?? windowConfig?.url ?? "",
    anonKey:
      import.meta.env.VITE_SUPABASE_ANON_KEY ?? windowConfig?.anonKey ?? "",
  };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return cachedClient;
}

export function getAvatarUrl(
  sessionUser: User | null,
  profile: Pick<ProfileRecord, "avatar_url"> | null,
) {
  return (
    profile?.avatar_url ||
    sessionUser?.user_metadata.avatar_url ||
    sessionUser?.user_metadata.picture ||
    ""
  );
}

export function getDisplayName(
  sessionUser: User | null,
  profile: Pick<ProfileRecord, "full_name"> | null,
) {
  const profileName = profile?.full_name?.trim();
  const metadataName = String(sessionUser?.user_metadata.full_name ?? "").trim();
  const emailName = sessionUser?.email?.split("@")[0];

  return profileName || metadataName || emailName || "Student";
}

export async function ensureProfile(
  client: SupabaseClient<Database>,
  sessionUser: User,
  seed: Partial<ProfileRecord> = {},
): Promise<ProfileRecord> {
  const defaults: ProfileRecord = {
    id: sessionUser.id,
    full_name:
      seed.full_name ??
      String(sessionUser.user_metadata.full_name ?? "").trim() ??
      "",
    avatar_url:
      seed.avatar_url ??
      String(
        sessionUser.user_metadata.avatar_url ??
          sessionUser.user_metadata.picture ??
          "",
      ),
    education_stage: seed.education_stage ?? "high-school",
    preferred_study_duration: seed.preferred_study_duration ?? 45,
    timezone:
      seed.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    notifications_enabled: seed.notifications_enabled ?? true,
  };

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", sessionUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data as ProfileRecord;
  }

  const { data: insertedProfile, error: insertError } = await client
    .from("profiles")
    .insert(defaults)
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return insertedProfile as ProfileRecord;
}

export async function loadSession(
  client: SupabaseClient<Database>,
): Promise<Session | null> {
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session satisfies Session | null;
}

export async function saveProfile(
  client: SupabaseClient<Database>,
  sessionUser: User,
  profile: Omit<ProfileRecord, "id" | "created_at" | "updated_at">,
): Promise<ProfileRecord> {
  const { error: authError } = await client.auth.updateUser({
    data: {
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    },
  });

  if (authError) {
    throw authError;
  }

  const { data, error } = await client
    .from("profiles")
    .upsert({
      ...profile,
      id: sessionUser.id,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRecord;
}
