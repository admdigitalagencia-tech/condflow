import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Ticket = Database['public']['Tables']['tickets']['Row'];
export type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
export type TicketUpdate = Database['public']['Tables']['tickets']['Update'];
export type TicketUpdateEntry = Database['public']['Tables']['ticket_updates']['Row'];

export type TicketCategory = Database['public']['Enums']['ticket_category'];
export type TicketPriority = Database['public']['Enums']['ticket_priority'];
export type TicketStatus = Database['public']['Enums']['ticket_status'];

export const TICKET_CATEGORIES = [
  { value: 'infiltracao', label: 'Infiltração' },
  { value: 'portao', label: 'Portão' },
  { value: 'elevador', label: 'Elevador' },
  { value: 'eletricidade', label: 'Eletricidade' },
  { value: 'canalizacao', label: 'Canalização' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'estrutural', label: 'Estrutural' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'sinistro', label: 'Sinistro' },
] as const;

export const TICKET_PRIORITIES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
] as const;

export const TICKET_STATUSES = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'orcamento_solicitado', label: 'Orçamento Solicitado' },
  { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'encerrado', label: 'Encerrado' },
] as const;

export const priorityLabel = (v: string) => TICKET_PRIORITIES.find(p => p.value === v)?.label || v;
export const statusLabel = (v: string) => TICKET_STATUSES.find(s => s.value === v)?.label || v;
export const categoryLabel = (v: string) => TICKET_CATEGORIES.find(c => c.value === v)?.label || v;

// Ticket with joined condominium name and supplier name
export type TicketWithRelations = Ticket & {
  condominiums?: { name: string } | null;
  suppliers?: { name: string } | null;
};

export async function fetchTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, condominiums(name), suppliers(name)')
    .order('last_activity_at', { ascending: false });
  if (error) throw error;
  return data as TicketWithRelations[];
}

export async function fetchTicket(id: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, condominiums(name), suppliers(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as TicketWithRelations;
}

export async function fetchTicketsByCondominium(condominiumId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, condominiums(name), suppliers(name)')
    .eq('condominium_id', condominiumId)
    .order('last_activity_at', { ascending: false });
  if (error) throw error;
  return data as TicketWithRelations[];
}

export async function createTicket(values: TicketInsert) {
  const { data, error } = await supabase
    .from('tickets')
    .insert(values)
    .select('*, condominiums(name), suppliers(name)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateTicket(id: string, values: TicketUpdate) {
  const { data, error } = await supabase
    .from('tickets')
    .update(values)
    .eq('id', id)
    .select('*, condominiums(name), suppliers(name)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTicket(id: string) {
  const { error } = await supabase.from('tickets').delete().eq('id', id);
  if (error) throw error;
}

// Ticket Updates (timeline)
export async function fetchTicketUpdates(ticketId: string) {
  const { data, error } = await supabase
    .from('ticket_updates')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createTicketUpdate(values: {
  ticket_id: string;
  update_type: string;
  body?: string;
  old_status?: string;
  new_status?: string;
}) {
  const { data, error } = await supabase
    .from('ticket_updates')
    .insert(values as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Change status with automatic timeline entry
export async function changeTicketStatus(ticketId: string, oldStatus: TicketStatus, newStatus: TicketStatus, comment?: string) {
  const updateValues: TicketUpdate = { status: newStatus };
  if (newStatus === 'encerrado' || newStatus === 'resolvido') {
    updateValues.closed_at = new Date().toISOString();
  }

  const { error: ticketError } = await supabase
    .from('tickets')
    .update(updateValues)
    .eq('id', ticketId);
  if (ticketError) throw ticketError;

  await createTicketUpdate({
    ticket_id: ticketId,
    update_type: 'status_change',
    body: comment || `Estado alterado de "${statusLabel(oldStatus)}" para "${statusLabel(newStatus)}"`,
    old_status: oldStatus,
    new_status: newStatus,
  });
}

// Stats helpers
export async function fetchTicketStats() {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, status, priority, due_date');
  if (error) throw error;
  
  const today = new Date().toISOString().split('T')[0];
  const open = data.filter(t => !['resolvido', 'encerrado'].includes(t.status));
  const critical = open.filter(t => t.priority === 'critica');
  const overdue = open.filter(t => t.due_date && t.due_date < today);

  return { total: data.length, open: open.length, critical: critical.length, overdue: overdue.length };
}
