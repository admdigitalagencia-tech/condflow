import { supabase } from '@/integrations/supabase/client';
import { createSignedDocumentUrl, requireActiveOrganizationId } from '@/services/organization';

// Extract text from uploaded document using AI
export async function extractDocumentText(documentId: string, action?: 'parse_attendance') {
  const { data, error } = await supabase.functions.invoke('extract-document', {
    body: { document_id: documentId, action },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { success: boolean; extracted_text: string; attendees_count: number; attendees: any[] };
}

// Process document: extract text, generate AI summary, extract metadata
export async function processDocument(documentId: string) {
  const { data, error } = await supabase.functions.invoke('process-document', {
    body: { document_id: documentId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { success: boolean; ai_summary: string; metadata: Record<string, any>; has_extracted_text: boolean };
}

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

export const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'jpeg', 'jpg', 'png', 'txt'] as const;
export const ALLOWED_DOCUMENT_EXTENSIONS_LABEL = 'PDF, DOC, JPEG, JPG, PNG e TXT';

const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'image/jpeg',
  'image/png',
  'text/plain',
]);

export const documentTypeLabel = (v: string) => DOCUMENT_TYPES.find(d => d.value === v)?.label || v;

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';

export function sanitizeStorageFileName(fileName: string) {
  const normalized = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const extension = getFileExtension(normalized);
  const baseName = extension ? normalized.slice(0, -(extension.length + 1)) : normalized;

  const safeBase = baseName
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

  const fallbackName = safeBase || 'documento';
  const safeExtension = ALLOWED_DOCUMENT_EXTENSIONS.includes(extension as (typeof ALLOWED_DOCUMENT_EXTENSIONS)[number])
    ? extension
    : extension.replace(/[^a-z0-9]/g, '').slice(0, 8);

  return safeExtension ? `${fallbackName}.${safeExtension}` : fallbackName;
}

export function validateDocumentFile(file: File, maxSizeMb = 50) {
  const maxSize = maxSizeMb * 1024 * 1024;

  if (file.size > maxSize) {
    return {
      valid: false,
      reason: `Ficheiro demasiado grande (${(file.size / 1048576).toFixed(1)} MB). Máximo permitido: ${maxSizeMb} MB.`,
    };
  }

  const extension = getFileExtension(file.name);
  const validByExtension = ALLOWED_DOCUMENT_EXTENSIONS.includes(extension as (typeof ALLOWED_DOCUMENT_EXTENSIONS)[number]);
  const validByMime = ALLOWED_DOCUMENT_MIME_TYPES.has(file.type);

  if (!validByExtension && !validByMime) {
    return {
      valid: false,
      reason: `Formato não suportado. Permitidos: ${ALLOWED_DOCUMENT_EXTENSIONS_LABEL}.`,
    };
  }

  return { valid: true };
}

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
  const organizationId = await requireActiveOrganizationId();
  const { data, error } = await supabase
    .from('documents')
    .insert({ ...values, organization_id: organizationId } as any)
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
  const organizationId = await requireActiveOrganizationId();
  const pathSegments = path.split('/').filter(Boolean);
  const safePath = pathSegments
    .map((segment, index) => {
      const isFileName = index === pathSegments.length - 1;
      if (isFileName) return sanitizeStorageFileName(segment);

      return segment
        .replace(/[^a-zA-Z0-9-_]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    })
    .filter(Boolean)
    .join('/');

  const finalPath = `${organizationId}/${safePath}`;

  if (!safePath) {
    throw new Error('Nome de ficheiro inválido.');
  }

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(finalPath, file, { upsert: true });

  if (error) throw error;

  const signedUrl = await createSignedDocumentUrl(data.path);
  return { path: data.path, url: signedUrl };
}

export async function openDocument(path: string) {
  const signedUrl = await createSignedDocumentUrl(path);
  window.open(signedUrl, '_blank', 'noopener,noreferrer');
}
