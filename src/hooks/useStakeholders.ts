import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStakeholders, createStakeholder, updateStakeholder, deleteStakeholder,
  fetchStakeholdersByCondominium, linkStakeholderToCondominium, unlinkStakeholderFromCondominium,
  type StakeholderInsert, type StakeholderUpdate,
} from '@/services/stakeholders';

export function useStakeholders() {
  return useQuery({ queryKey: ['stakeholders'], queryFn: fetchStakeholders });
}

export function useStakeholdersByCondominium(condominiumId: string) {
  return useQuery({
    queryKey: ['stakeholders', 'condominium', condominiumId],
    queryFn: () => fetchStakeholdersByCondominium(condominiumId),
    enabled: !!condominiumId,
  });
}

export function useCreateStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: StakeholderInsert) => createStakeholder(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stakeholders'] }),
  });
}

export function useUpdateStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: StakeholderUpdate }) => updateStakeholder(id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stakeholders'] }),
  });
}

export function useDeleteStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStakeholder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stakeholders'] }),
  });
}

export function useLinkStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stakeholderId, condominiumId, role }: { stakeholderId: string; condominiumId: string; role?: string }) =>
      linkStakeholderToCondominium(stakeholderId, condominiumId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stakeholders'] }),
  });
}

export function useUnlinkStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stakeholderId, condominiumId }: { stakeholderId: string; condominiumId: string }) =>
      unlinkStakeholderFromCondominium(stakeholderId, condominiumId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stakeholders'] }),
  });
}
