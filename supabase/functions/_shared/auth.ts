import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export function getAuthToken(req: Request) {
  return req.headers.get("Authorization");
}

export function createSupabaseClients(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not fully configured");
  }

  const authToken = getAuthToken(req);
  if (!authToken) {
    throw new Error("Authorization header is required");
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authToken,
      },
    },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  return { userClient, adminClient };
}

export async function requireAuthenticatedUser(req: Request) {
  const { userClient, adminClient } = createSupabaseClients(req);
  const { data, error } = await userClient.auth.getUser();

  if (error || !data.user) {
    throw new Error("Unauthorized");
  }

  return { user: data.user, userClient, adminClient };
}

export async function requireAnyActiveMembership(adminClient: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await adminClient
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1);

  if (error) throw error;
  if (!data?.length) {
    throw new Error("User does not belong to an active organization");
  }

  return data[0].organization_id as string;
}

export async function requireOrganizationMembership(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  organizationId: string | null | undefined,
) {
  if (!organizationId) {
    throw new Error("Entity does not belong to an organization");
  }

  const { data, error } = await adminClient
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error("Forbidden");
  }

  return organizationId;
}

export async function requireEntityAccess(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  table: string,
  idColumn: string,
  idValue: string,
) {
  const { data, error } = await adminClient
    .from(table)
    .select("organization_id")
    .eq(idColumn, idValue)
    .single();

  if (error || !data) {
    throw new Error("Entity not found");
  }

  await requireOrganizationMembership(adminClient, userId, data.organization_id);
  return data.organization_id as string;
}
