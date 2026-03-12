import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotesByCondominium, createNote, updateNote, deleteNote } from '@/services/condominiumNotes';

export function useCondominiumNotes(condominiumId: string) {
  return useQuery({
    queryKey: ['condominium-notes', condominiumId],
    queryFn: () => fetchNotesByCondominium(condominiumId),
    enabled: !!condominiumId,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ condominiumId, content }: { condominiumId: string; content: string }) =>
      createNote(condominiumId, content),
    onSuccess: (_, { condominiumId }) =>
      qc.invalidateQueries({ queryKey: ['condominium-notes', condominiumId] }),
  });
}

export function useUpdateNote(condominiumId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateNote(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['condominium-notes', condominiumId] }),
  });
}

export function useDeleteNote(condominiumId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['condominium-notes', condominiumId] }),
  });
}
