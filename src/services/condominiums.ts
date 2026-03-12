import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Condominium = Database['public']['Tables']['condominiums']['Row'];
export type CondominiumInsert = Database['public']['Tables']['condominiums']['Insert'];
export type CondominiumUpdate = Database['public']['Tables']['condominiums']['Update'];

export async function fetchCondominiums() {
  const { data, error } = await supabase
    .from('condominiums')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchCondominium(id: string) {
  const { data, error } = await supabase
    .from('condominiums')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createCondominium(values: CondominiumInsert) {
  const { data, error } = await supabase
    .from('condominiums')
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCondominium(id: string, values: CondominiumUpdate) {
  const { data, error } = await supabase
    .from('condominiums')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCondominium(id: string) {
  const { error } = await supabase
    .from('condominiums')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
