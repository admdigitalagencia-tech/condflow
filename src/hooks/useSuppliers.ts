import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSuppliers, createSupplier, updateSupplier, deleteSupplier,
  fetchSuppliersByCondominium, linkSupplierToCondominium, unlinkSupplierFromCondominium,
  type SupplierInsert, type SupplierUpdate,
} from '@/services/suppliers';

export function useSuppliers() {
  return useQuery({ queryKey: ['suppliers'], queryFn: fetchSuppliers });
}

export function useSuppliersByCondominium(condominiumId: string) {
  return useQuery({
    queryKey: ['suppliers', 'condominium', condominiumId],
    queryFn: () => fetchSuppliersByCondominium(condominiumId),
    enabled: !!condominiumId,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: SupplierInsert) => createSupplier(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: SupplierUpdate }) => updateSupplier(id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useLinkSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, condominiumId, serviceDescription }: { supplierId: string; condominiumId: string; serviceDescription?: string }) =>
      linkSupplierToCondominium(supplierId, condominiumId, serviceDescription),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUnlinkSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierId, condominiumId }: { supplierId: string; condominiumId: string }) =>
      unlinkSupplierFromCondominium(supplierId, condominiumId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}
