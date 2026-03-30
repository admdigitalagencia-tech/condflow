import { supabase } from '@/integrations/supabase/client';

export const ACTIVE_ORG_STORAGE_KEY = 'condflow.activeOrganizationId';

export interface OrganizationMembership {
  organization_id: string;
  role: string;
  is_active: boolean;
  organizations: {
    id: string;
    name: string;
    status: string | null;
  } | null;
}

export function getStoredActiveOrganizationId() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
}

export function setStoredActiveOrganizationId(organizationId: string | null) {
  if (typeof window === 'undefined') return;
  if (organizationId) {
    window.localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organizationId);
  } else {
    window.localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
  }
}

export async function fetchUserOrganizations() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const userId = authData.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('organization_users')
    .select('organization_id, role, is_active, organizations(id, name, status)')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) throw error;
  return (data || []) as unknown as OrganizationMembership[];
}

export async function getActiveOrganizationId() {
  const memberships = await fetchUserOrganizations();
  if (!memberships.length) return null;

  const storedId = getStoredActiveOrganizationId();
  const storedMembership = memberships.find(m => m.organization_id === storedId);
  if (storedMembership) return storedMembership.organization_id;

  const nextOrgId = memberships[0].organization_id;
  setStoredActiveOrganizationId(nextOrgId);
  return nextOrgId;
}

export async function requireActiveOrganizationId() {
  const organizationId = await getActiveOrganizationId();
  if (!organizationId) {
    throw new Error('Nenhuma organização ativa encontrada para a conta atual.');
  }
  return organizationId;
}

export async function createSignedDocumentUrl(path: string, expiresIn = 300) {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}
