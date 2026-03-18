import { supabase } from '@/integrations/supabase/client';
import { categoryLabel, statusLabel, priorityLabel } from './tickets';
import { assemblyStatusLabel, assemblyTypeLabel, minutesStatusLabel } from './assemblies';

export interface CondominiumContext {
  condominium: {
    id: string;
    name: string;
    address: string;
    nif: string | null;
    fractions_count: number | null;
    floors_count: number | null;
    year_built: number | null;
    notes: string | null;
  };
  stats: {
    openTickets: number;
    totalTickets: number;
    totalAssemblies: number;
    totalDocuments: number;
    pendingTasks: number;
    lastAssemblyDate: string | null;
    lastMinuteStatus: string | null;
  };
  tickets: Array<{
    id: string;
    code: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    description: string | null;
    opened_at: string;
    due_date: string | null;
  }>;
  assemblies: Array<{
    id: string;
    title: string;
    assembly_type: string;
    scheduled_date: string;
    status: string;
    minutes_status: string;
    agenda_text: string | null;
    location: string | null;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string | null;
    description: string | null;
  }>;
  documents: Array<{
    id: string;
    title: string;
    document_type: string;
    created_at: string;
    extracted_text: string | null;
    ai_summary: string | null;
    metadata_json: any;
  }>;
}

export async function fetchCondominiumContext(condominiumId: string): Promise<CondominiumContext> {
  const [condoRes, ticketsRes, assembliesRes, tasksRes, docsRes] = await Promise.all([
    supabase.from('condominiums').select('*').eq('id', condominiumId).single(),
    supabase.from('tickets').select('id, code, title, category, priority, status, description, opened_at, due_date').eq('condominium_id', condominiumId).order('last_activity_at', { ascending: false }).limit(50),
    supabase.from('assemblies').select('id, title, assembly_type, scheduled_date, status, minutes_status, agenda_text, location').eq('condominium_id', condominiumId).order('scheduled_date', { ascending: false }).limit(20),
    supabase.from('tasks').select('id, title, status, priority, due_date, description').eq('condominium_id', condominiumId).order('created_at', { ascending: false }).limit(50),
    supabase.from('documents').select('id, title, document_type, created_at').eq('condominium_id', condominiumId).order('created_at', { ascending: false }).limit(30),
  ]);

  if (condoRes.error) throw condoRes.error;
  const condo = condoRes.data;
  const tickets = ticketsRes.data || [];
  const assemblies = assembliesRes.data || [];
  const tasks = tasksRes.data || [];
  const documents = docsRes.data || [];

  const openTickets = tickets.filter(t => !['resolvido', 'encerrado'].includes(t.status));
  const pendingTasks = tasks.filter(t => !['concluida', 'cancelada'].includes(t.status));
  const lastAssembly = assemblies[0] || null;

  return {
    condominium: {
      id: condo.id,
      name: condo.name,
      address: [condo.address_line, condo.postal_code, condo.city].filter(Boolean).join(', '),
      nif: condo.nif,
      fractions_count: condo.fractions_count,
      floors_count: condo.floors_count,
      year_built: condo.year_built,
      notes: condo.notes,
    },
    stats: {
      openTickets: openTickets.length,
      totalTickets: tickets.length,
      totalAssemblies: assemblies.length,
      totalDocuments: documents.length,
      pendingTasks: pendingTasks.length,
      lastAssemblyDate: lastAssembly?.scheduled_date || null,
      lastMinuteStatus: lastAssembly?.minutes_status || null,
    },
    tickets,
    assemblies,
    tasks,
    documents,
  };
}

export function buildCondominiumPromptContext(ctx: CondominiumContext): string {
  const { condominium: c, stats, tickets, assemblies, tasks, documents } = ctx;

  const openTickets = tickets.filter(t => !['resolvido', 'encerrado'].includes(t.status));
  const pendingTasks = tasks.filter(t => !['concluida', 'cancelada'].includes(t.status));

  let prompt = `## CONTEXTO DO CONDOMÍNIO: ${c.name}\n`;
  prompt += `Morada: ${c.address || 'N/A'}\n`;
  if (c.nif) prompt += `NIF: ${c.nif}\n`;
  if (c.fractions_count) prompt += `Frações: ${c.fractions_count}\n`;
  if (c.floors_count) prompt += `Pisos: ${c.floors_count}\n`;
  if (c.year_built) prompt += `Ano de construção: ${c.year_built}\n`;
  if (c.notes) prompt += `Observações: ${c.notes}\n`;

  prompt += `\n### INDICADORES\n`;
  prompt += `- Ocorrências abertas: ${stats.openTickets} (total: ${stats.totalTickets})\n`;
  prompt += `- Assembleias registadas: ${stats.totalAssemblies}\n`;
  prompt += `- Documentos: ${stats.totalDocuments}\n`;
  prompt += `- Tarefas pendentes: ${stats.pendingTasks}\n`;
  if (stats.lastAssemblyDate) prompt += `- Última assembleia: ${new Date(stats.lastAssemblyDate).toLocaleDateString('pt-PT')}\n`;

  if (openTickets.length > 0) {
    prompt += `\n### OCORRÊNCIAS ABERTAS\n`;
    openTickets.slice(0, 15).forEach(t => {
      prompt += `- [${t.code}] ${t.title} | ${categoryLabel(t.category)} | ${priorityLabel(t.priority)} | ${statusLabel(t.status)}`;
      if (t.description) prompt += ` — ${t.description.slice(0, 100)}`;
      prompt += `\n`;
    });
  }

  if (assemblies.length > 0) {
    prompt += `\n### ASSEMBLEIAS RECENTES\n`;
    assemblies.slice(0, 5).forEach(a => {
      prompt += `- ${a.title} | ${assemblyTypeLabel(a.assembly_type)} | ${new Date(a.scheduled_date).toLocaleDateString('pt-PT')} | ${assemblyStatusLabel(a.status)} | Ata: ${minutesStatusLabel(a.minutes_status)}\n`;
    });
  }

  if (pendingTasks.length > 0) {
    prompt += `\n### TAREFAS PENDENTES\n`;
    pendingTasks.slice(0, 10).forEach(t => {
      prompt += `- ${t.title} | Prioridade: ${t.priority} | Estado: ${t.status}`;
      if (t.due_date) prompt += ` | Prazo: ${new Date(t.due_date).toLocaleDateString('pt-PT')}`;
      prompt += `\n`;
    });
  }

  if (documents.length > 0) {
    prompt += `\n### DOCUMENTOS RECENTES\n`;
    documents.slice(0, 10).forEach(d => {
      prompt += `- ${d.title} (${d.document_type}) — ${new Date(d.created_at).toLocaleDateString('pt-PT')}\n`;
    });
  }

  return prompt;
}

export async function fetchTicketContext(ticketId: string) {
  const [ticketRes, updatesRes] = await Promise.all([
    supabase.from('tickets').select('*, condominiums(name), suppliers(name)').eq('id', ticketId).single(),
    supabase.from('ticket_updates').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
  ]);
  if (ticketRes.error) throw ticketRes.error;
  return { ticket: ticketRes.data, updates: updatesRes.data || [] };
}

export async function fetchAssemblyContext(assemblyId: string) {
  const [assemblyRes, pointsRes, attendeesRes] = await Promise.all([
    supabase.from('assemblies').select('*, condominiums(name)').eq('id', assemblyId).single(),
    supabase.from('assembly_points').select('*').eq('assembly_id', assemblyId).order('point_order'),
    supabase.from('assembly_attendees').select('*').eq('assembly_id', assemblyId),
  ]);
  if (assemblyRes.error) throw assemblyRes.error;
  return { assembly: assemblyRes.data, points: pointsRes.data || [], attendees: attendeesRes.data || [] };
}
