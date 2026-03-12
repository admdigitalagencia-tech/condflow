import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTickets, fetchTicket, fetchTicketsByCondominium,
  createTicket, updateTicket, deleteTicket,
  fetchTicketUpdates, createTicketUpdate, changeTicketStatus,
  fetchTicketStats,
  type TicketInsert, type TicketUpdate, type TicketStatus,
} from '@/services/tickets';

export function useTickets() {
  return useQuery({ queryKey: ['tickets'], queryFn: fetchTickets });
}

export function useTicket(id: string) {
  return useQuery({ queryKey: ['tickets', id], queryFn: () => fetchTicket(id), enabled: !!id });
}

export function useTicketsByCondominium(condominiumId: string) {
  return useQuery({
    queryKey: ['tickets', 'condominium', condominiumId],
    queryFn: () => fetchTicketsByCondominium(condominiumId),
    enabled: !!condominiumId,
  });
}

export function useTicketStats() {
  return useQuery({ queryKey: ['ticket-stats'], queryFn: fetchTicketStats });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: TicketInsert) => createTicket(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: TicketUpdate }) => updateTicket(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets', id] });
      qc.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
  });
}

export function useTicketUpdates(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-updates', ticketId],
    queryFn: () => fetchTicketUpdates(ticketId),
    enabled: !!ticketId,
  });
}

export function useCreateTicketUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTicketUpdate,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ticket-updates', vars.ticket_id] });
      qc.invalidateQueries({ queryKey: ['tickets', vars.ticket_id] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useChangeTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, oldStatus, newStatus, comment }: {
      ticketId: string; oldStatus: TicketStatus; newStatus: TicketStatus; comment?: string;
    }) => changeTicketStatus(ticketId, oldStatus, newStatus, comment),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets', ticketId] });
      qc.invalidateQueries({ queryKey: ['ticket-updates', ticketId] });
      qc.invalidateQueries({ queryKey: ['ticket-stats'] });
    },
  });
}
