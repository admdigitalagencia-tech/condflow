import { useQuery } from '@tanstack/react-query';
import { fetchCondominiumContext } from '@/services/condominiumContext';

export function useCondominiumContext(condominiumId: string | null) {
  return useQuery({
    queryKey: ['condominium-context', condominiumId],
    queryFn: () => fetchCondominiumContext(condominiumId!),
    enabled: !!condominiumId,
    staleTime: 30_000,
  });
}
