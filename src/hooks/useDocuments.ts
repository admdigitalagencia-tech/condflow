import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDocuments, fetchDocumentsByCondominium, fetchDocumentsByAssembly,
  createDocument, updateDocument, deleteDocument,
} from '@/services/documents';

export function useDocuments() {
  return useQuery({ queryKey: ['documents'], queryFn: fetchDocuments });
}

export function useDocumentsByCondominium(condominiumId: string) {
  return useQuery({
    queryKey: ['documents', 'condominium', condominiumId],
    queryFn: () => fetchDocumentsByCondominium(condominiumId),
    enabled: !!condominiumId,
  });
}

export function useDocumentsByAssembly(assemblyId: string) {
  return useQuery({
    queryKey: ['documents', 'assembly', assemblyId],
    queryFn: () => fetchDocumentsByAssembly(assemblyId),
    enabled: !!assemblyId,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, any> }) => updateDocument(id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); },
  });
}
