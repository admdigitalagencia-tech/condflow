import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchActivityLogs, createActivityLog, CreateActivityLogData } from '@/services/activityLogs';

export function useActivityLogs(condominiumId: string) {
  return useQuery({
    queryKey: ['activity-logs', condominiumId],
    queryFn: () => fetchActivityLogs(condominiumId),
    enabled: !!condominiumId,
  });
}

export function useCreateActivityLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityLogData) => createActivityLog(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['activity-logs', variables.condominium_id] });
    },
  });
}
