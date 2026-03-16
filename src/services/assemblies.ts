import { supabase } from '@/integrations/supabase/client';

export const ASSEMBLY_TYPES = [
  { value: 'ordinaria', label: 'Ordinária' },
  { value: 'extraordinaria', label: 'Extraordinária' },
] as const;

export const ASSEMBLY_STATUSES = [
  { value: 'planeada', label: 'Planeada' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'em_transcricao', label: 'Em Transcrição' },
  { value: 'em_minuta', label: 'Em Minuta' },
  { value: 'finalizada', label: 'Finalizada' },
] as const;

export const MINUTES_STATUSES = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_revisao', label: 'Em Revisão' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'publicada', label: 'Publicada' },
] as const;

export const assemblyTypeLabel = (v: string) => ASSEMBLY_TYPES.find(t => t.value === v)?.label || v;
export const assemblyStatusLabel = (v: string) => ASSEMBLY_STATUSES.find(s => s.value === v)?.label || v;
export const minutesStatusLabel = (v: string) => MINUTES_STATUSES.find(s => s.value === v)?.label || v;

export async function fetchAssemblies() {
  const { data, error } = await supabase
    .from('assemblies')
    .select('*, condominiums(name)')
    .order('scheduled_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAssembly(id: string) {
  const { data, error } = await supabase
    .from('assemblies')
    .select('*, condominiums(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAssembliesByCondominium(condominiumId: string) {
  const { data, error } = await supabase
    .from('assemblies')
    .select('*, condominiums(name)')
    .eq('condominium_id', condominiumId)
    .order('scheduled_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAssembly(values: {
  condominium_id: string;
  title: string;
  assembly_type: string;
  scheduled_date: string;
  scheduled_time?: string;
  location?: string;
  agenda_text?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('assemblies')
    .insert(values as any)
    .select('*, condominiums(name)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateAssembly(id: string, values: Record<string, any>) {
  const { data, error } = await supabase
    .from('assemblies')
    .update(values)
    .eq('id', id)
    .select('*, condominiums(name)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAssembly(id: string) {
  const { error } = await supabase.from('assemblies').delete().eq('id', id);
  if (error) throw error;
}

// Assembly points
export async function fetchAssemblyPoints(assemblyId: string) {
  const { data, error } = await supabase
    .from('assembly_points')
    .select('*')
    .eq('assembly_id', assemblyId)
    .order('point_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createAssemblyPoint(values: {
  assembly_id: string;
  point_order: number;
  title: string;
  description?: string;
}) {
  const { data, error } = await supabase
    .from('assembly_points')
    .insert(values as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAssemblyPoint(id: string, values: Record<string, any>) {
  const { data, error } = await supabase
    .from('assembly_points')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAssemblyPoint(id: string) {
  const { error } = await supabase.from('assembly_points').delete().eq('id', id);
  if (error) throw error;
}

// Assembly attendees
export async function fetchAssemblyAttendees(assemblyId: string) {
  const { data, error } = await supabase
    .from('assembly_attendees')
    .select('*, stakeholders(name, stakeholder_type)')
    .eq('assembly_id', assemblyId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createAssemblyAttendee(values: {
  assembly_id: string;
  attendee_name: string;
  unit_code?: string;
  permillage?: number;
  attendance_type?: string;
  represented_by?: string;
  stakeholder_id?: string;
}) {
  const { data, error } = await supabase
    .from('assembly_attendees')
    .insert(values as any)
    .select('*, stakeholders(name, stakeholder_type)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAssemblyAttendee(id: string) {
  const { error } = await supabase.from('assembly_attendees').delete().eq('id', id);
  if (error) throw error;
}

// Transcripts
export async function fetchTranscripts(assemblyId: string) {
  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .eq('assembly_id', assemblyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTranscript(values: {
  assembly_id: string;
  source_type?: string;
  language?: string;
  raw_text?: string;
  processing_status?: string;
}) {
  const { data, error } = await supabase
    .from('transcripts')
    .insert(values as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTranscript(id: string, values: Record<string, any>) {
  const { data, error } = await supabase
    .from('transcripts')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Minutes
export async function fetchMinutes(assemblyId: string) {
  const { data, error } = await supabase
    .from('minutes')
    .select('*')
    .eq('assembly_id', assemblyId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchMinute(id: string) {
  const { data, error } = await supabase
    .from('minutes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createMinute(values: {
  assembly_id: string;
  title: string;
  content_longtext?: string;
  version_number?: number;
  minute_type?: string;
  generation_source?: string;
}) {
  const { data, error } = await supabase
    .from('minutes')
    .insert(values as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMinute(id: string, values: Record<string, any>) {
  const { data, error } = await supabase
    .from('minutes')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Minute sections
export async function fetchMinuteSections(minuteId: string) {
  const { data, error } = await supabase
    .from('minute_sections')
    .select('*')
    .eq('minute_id', minuteId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createMinuteSection(values: {
  minute_id: string;
  section_key: string;
  section_title: string;
  content?: string;
}) {
  const { data, error } = await supabase
    .from('minute_sections')
    .insert(values as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMinuteSection(id: string, values: Record<string, any>) {
  const { data, error } = await supabase
    .from('minute_sections')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Assembly stats
export async function fetchAssemblyStats() {
  const { data, error } = await supabase
    .from('assemblies')
    .select('id, status, minutes_status, scheduled_date');
  if (error) throw error;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const thisMonth = data.filter(a => a.scheduled_date >= monthStart && a.scheduled_date <= monthEnd);
  const pendingMinutes = data.filter(a => a.minutes_status === 'pendente' && a.status !== 'planeada');

  return {
    total: data.length,
    thisMonth: thisMonth.length,
    pendingMinutes: pendingMinutes.length,
  };
}

// AI Minutes Generation
export async function generateMinutesAI(assemblyId: string) {
  const { data, error } = await supabase.functions.invoke('generate-minutes', {
    body: { assembly_id: assemblyId },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
