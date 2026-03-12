import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type CondominiumNote = Database['public']['Tables']['condominium_notes']['Row'];

export async function fetchNotesByCondominium(condominiumId: string) {
  const { data, error } = await supabase
    .from('condominium_notes')
    .select('*')
    .eq('condominium_id', condominiumId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createNote(condominiumId: string, content: string) {
  const { data, error } = await supabase
    .from('condominium_notes')
    .insert({ condominium_id: condominiumId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote(id: string, content: string) {
  const { data, error } = await supabase
    .from('condominium_notes')
    .update({ content })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('condominium_notes').delete().eq('id', id);
  if (error) throw error;
}
