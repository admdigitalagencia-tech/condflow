import { supabase } from '@/integrations/supabase/client';

export const DOCUMENT_TYPES = [
  { value: 'ata', label: 'Ata' },
  { value: 'convocatoria', label: 'Convocatória' },
  { value: 'lista_presenca', label: 'Lista de Presença' },
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'relatorio_tecnico', label: 'Relatório Técnico' },
  { value: 'fatura', label: 'Fatura' },
  { value: 'email_exportado', label: 'Email Exportado' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'audio', label: 'Áudio' },
  { value: 'transcricao', label: 'Transcrição' },
  { value: 'apolice', label: 'Apólice' },
] as const;

export const documentTypeLabel = (v: string) => DOCUMENT_TYPES.find(d => d.value === v)?.label || v;

export async function fetchDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*, condominiums(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchDocumentsByCondominium(condominiumId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*, condominiums(name)')
    .eq('condominium_id', condominiumId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchDocumentsByAssembly(assemblyId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*, condominiums(name)')
    .eq('assembly_id', assemblyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createDocument(values: {
  title: string;
  document_type: string;
  file_path: string;
  mime_type?: string;
  file_size?: number;
  condominium_id?: string;
  ticket_id?: string;
  assembly_id?: string;
  supplier_id?: string;
  issue_date?: string;
}) {
  const { data, error } = await supabase
    .from('documents')
    .insert(values as any)
    .select('*, condominiums(name)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, values: Record<string, any>) {
  const { data, error } = await supabase
    .from('documents')
    .update(values)
    .eq('id', id)
    .select('*, condominiums(name)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(data.path);
  return { path: data.path, url: urlData.publicUrl };
}
