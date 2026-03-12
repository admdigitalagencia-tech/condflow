import { supabase } from '@/integrations/supabase/client';

export type ActionType =
  | 'ticket_created' | 'ticket_updated' | 'ticket_closed'
  | 'assembly_created' | 'assembly_completed'
  | 'task_created' | 'task_completed'
  | 'document_uploaded' | 'minutes_generated';

export interface ActivityLog {
  id: string;
  organization_id: string | null;
  condominium_id: string;
  related_entity_type: string;
  related_entity_id: string | null;
  action_type: ActionType;
  description: string;
  metadata_json: Record<string, any> | null;
  created_at: string;
  created_by: string | null;
}

export interface CreateActivityLogData {
  condominium_id: string;
  related_entity_type: string;
  related_entity_id?: string;
  action_type: ActionType;
  description: string;
  metadata_json?: Record<string, any>;
}

export async function fetchActivityLogs(condominiumId: string) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('condominium_id', condominiumId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as ActivityLog[];
}

export async function createActivityLog(log: CreateActivityLogData) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      condominium_id: log.condominium_id,
      related_entity_type: log.related_entity_type,
      related_entity_id: log.related_entity_id || null,
      action_type: log.action_type,
      description: log.description,
      metadata_json: log.metadata_json || null,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const actionTypeConfig: Record<ActionType, { label: string; icon: string; variant: 'default' | 'warning' | 'critical' | 'success' }> = {
  ticket_created: { label: 'Ocorrência criada', icon: 'alert-triangle', variant: 'warning' },
  ticket_updated: { label: 'Ocorrência atualizada', icon: 'alert-triangle', variant: 'default' },
  ticket_closed: { label: 'Ocorrência encerrada', icon: 'check-circle', variant: 'success' },
  assembly_created: { label: 'Assembleia criada', icon: 'calendar', variant: 'default' },
  assembly_completed: { label: 'Assembleia realizada', icon: 'calendar', variant: 'success' },
  task_created: { label: 'Tarefa criada', icon: 'list-checks', variant: 'default' },
  task_completed: { label: 'Tarefa concluída', icon: 'check-circle', variant: 'success' },
  document_uploaded: { label: 'Documento carregado', icon: 'file-text', variant: 'default' },
  minutes_generated: { label: 'Ata gerada', icon: 'book-open', variant: 'success' },
};
