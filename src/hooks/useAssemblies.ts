import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAssemblies, fetchAssembly, fetchAssembliesByCondominium,
  createAssembly, updateAssembly, deleteAssembly,
  fetchAssemblyPoints, createAssemblyPoint, updateAssemblyPoint, deleteAssemblyPoint,
  fetchAssemblyAttendees, createAssemblyAttendee, deleteAssemblyAttendee,
  fetchTranscripts, createTranscript, updateTranscript,
  fetchMinutes, fetchMinute, createMinute, updateMinute,
  fetchMinuteSections, createMinuteSection, updateMinuteSection,
  fetchAssemblyStats,
  generateMinutesAI,
} from '@/services/assemblies';
import { toast } from 'sonner';

export function useAssemblies() {
  return useQuery({ queryKey: ['assemblies'], queryFn: fetchAssemblies });
}

export function useAssembly(id: string) {
  return useQuery({ queryKey: ['assemblies', id], queryFn: () => fetchAssembly(id), enabled: !!id });
}

export function useAssembliesByCondominium(condominiumId: string) {
  return useQuery({
    queryKey: ['assemblies', 'condominium', condominiumId],
    queryFn: () => fetchAssembliesByCondominium(condominiumId),
    enabled: !!condominiumId,
  });
}

export function useAssemblyStats() {
  return useQuery({ queryKey: ['assembly-stats'], queryFn: fetchAssemblyStats });
}

export function useCreateAssembly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAssembly,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assemblies'] }); qc.invalidateQueries({ queryKey: ['assembly-stats'] }); },
  });
}

export function useUpdateAssembly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, any> }) => updateAssembly(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['assemblies'] });
      qc.invalidateQueries({ queryKey: ['assemblies', id] });
      qc.invalidateQueries({ queryKey: ['assembly-stats'] });
    },
  });
}

export function useDeleteAssembly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAssembly,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assemblies'] }); qc.invalidateQueries({ queryKey: ['assembly-stats'] }); },
  });
}

// Points
export function useAssemblyPoints(assemblyId: string) {
  return useQuery({
    queryKey: ['assembly-points', assemblyId],
    queryFn: () => fetchAssemblyPoints(assemblyId),
    enabled: !!assemblyId,
  });
}

export function useCreateAssemblyPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAssemblyPoint,
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['assembly-points', vars.assembly_id] }); },
  });
}

export function useUpdateAssemblyPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values, assemblyId }: { id: string; values: Record<string, any>; assemblyId: string }) =>
      updateAssemblyPoint(id, values),
    onSuccess: (_, { assemblyId }) => { qc.invalidateQueries({ queryKey: ['assembly-points', assemblyId] }); },
  });
}

export function useDeleteAssemblyPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assemblyId }: { id: string; assemblyId: string }) => deleteAssemblyPoint(id),
    onSuccess: (_, { assemblyId }) => { qc.invalidateQueries({ queryKey: ['assembly-points', assemblyId] }); },
  });
}

// Attendees
export function useAssemblyAttendees(assemblyId: string) {
  return useQuery({
    queryKey: ['assembly-attendees', assemblyId],
    queryFn: () => fetchAssemblyAttendees(assemblyId),
    enabled: !!assemblyId,
  });
}

export function useCreateAssemblyAttendee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAssemblyAttendee,
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['assembly-attendees', vars.assembly_id] }); },
  });
}

export function useDeleteAssemblyAttendee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assemblyId }: { id: string; assemblyId: string }) => deleteAssemblyAttendee(id),
    onSuccess: (_, { assemblyId }) => { qc.invalidateQueries({ queryKey: ['assembly-attendees', assemblyId] }); },
  });
}

// Transcripts
export function useTranscripts(assemblyId: string) {
  return useQuery({
    queryKey: ['transcripts', assemblyId],
    queryFn: () => fetchTranscripts(assemblyId),
    enabled: !!assemblyId,
  });
}

export function useCreateTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTranscript,
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['transcripts', vars.assembly_id] }); },
  });
}

export function useUpdateTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values, assemblyId }: { id: string; values: Record<string, any>; assemblyId: string }) =>
      updateTranscript(id, values),
    onSuccess: (_, { assemblyId }) => { qc.invalidateQueries({ queryKey: ['transcripts', assemblyId] }); },
  });
}

// Minutes
export function useMinutes(assemblyId: string) {
  return useQuery({
    queryKey: ['minutes', assemblyId],
    queryFn: () => fetchMinutes(assemblyId),
    enabled: !!assemblyId,
  });
}

export function useMinute(id: string) {
  return useQuery({ queryKey: ['minute', id], queryFn: () => fetchMinute(id), enabled: !!id });
}

export function useCreateMinute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMinute,
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['minutes', vars.assembly_id] }); },
  });
}

export function useUpdateMinute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values, assemblyId }: { id: string; values: Record<string, any>; assemblyId: string }) =>
      updateMinute(id, values),
    onSuccess: (_, { assemblyId }) => { qc.invalidateQueries({ queryKey: ['minutes', assemblyId] }); qc.invalidateQueries({ queryKey: ['minute'] }); },
  });
}

// Minute sections
export function useMinuteSections(minuteId: string) {
  return useQuery({
    queryKey: ['minute-sections', minuteId],
    queryFn: () => fetchMinuteSections(minuteId),
    enabled: !!minuteId,
  });
}

export function useCreateMinuteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMinuteSection,
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['minute-sections', vars.minute_id] }); },
  });
}

export function useUpdateMinuteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values, minuteId }: { id: string; values: Record<string, any>; minuteId: string }) =>
      updateMinuteSection(id, values),
    onSuccess: (_, { minuteId }) => { qc.invalidateQueries({ queryKey: ['minute-sections', minuteId] }); },
  });
}
