import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Stakeholder = Database['public']['Tables']['stakeholders']['Row'];
export type StakeholderInsert = Database['public']['Tables']['stakeholders']['Insert'];
export type StakeholderUpdate = Database['public']['Tables']['stakeholders']['Update'];

export const STAKEHOLDER_TYPES = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'condomino', label: 'Condómino' },
  { value: 'advogado', label: 'Advogado' },
  { value: 'seguradora', label: 'Seguradora' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'entidade_publica', label: 'Entidade Pública' },
  { value: 'outro', label: 'Outro' },
] as const;

export type StakeholderType = typeof STAKEHOLDER_TYPES[number]['value'];

export async function fetchStakeholders() {
  const { data, error } = await supabase
    .from('stakeholders')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchStakeholder(id: string) {
  const { data, error } = await supabase
    .from('stakeholders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createStakeholder(values: StakeholderInsert) {
  const { data, error } = await supabase
    .from('stakeholders')
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStakeholder(id: string, values: StakeholderUpdate) {
  const { data, error } = await supabase
    .from('stakeholders')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStakeholder(id: string) {
  const { error } = await supabase.from('stakeholders').delete().eq('id', id);
  if (error) throw error;
}

// Stakeholder-Condominium relationships
export async function fetchStakeholdersByCondominium(condominiumId: string) {
  const { data, error } = await supabase
    .from('stakeholder_condominiums')
    .select('*, stakeholders(*)')
    .eq('condominium_id', condominiumId);
  if (error) throw error;
  return data;
}

export async function linkStakeholderToCondominium(stakeholderId: string, condominiumId: string, roleInCondominium?: string) {
  const { error } = await supabase
    .from('stakeholder_condominiums')
    .insert({ stakeholder_id: stakeholderId, condominium_id: condominiumId, role_in_condominium: roleInCondominium });
  if (error) throw error;
}

export async function unlinkStakeholderFromCondominium(stakeholderId: string, condominiumId: string) {
  const { error } = await supabase
    .from('stakeholder_condominiums')
    .delete()
    .eq('stakeholder_id', stakeholderId)
    .eq('condominium_id', condominiumId);
  if (error) throw error;
}
