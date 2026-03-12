import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCondominiums, fetchCondominium, createCondominium, updateCondominium, deleteCondominium, type CondominiumInsert, type CondominiumUpdate } from '@/services/condominiums';

export function useCondominiums() {
  return useQuery({ queryKey: ['condominiums'], queryFn: fetchCondominiums });
}

export function useCondominium(id: string) {
  return useQuery({ queryKey: ['condominiums', id], queryFn: () => fetchCondominium(id), enabled: !!id });
}

export function useCreateCondominium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CondominiumInsert) => createCondominium(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['condominiums'] }),
  });
}

export function useUpdateCondominium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CondominiumUpdate }) => updateCondominium(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['condominiums'] });
      qc.invalidateQueries({ queryKey: ['condominiums', id] });
    },
  });
}

export function useDeleteCondominium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCondominium,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['condominiums'] }),
  });
}
