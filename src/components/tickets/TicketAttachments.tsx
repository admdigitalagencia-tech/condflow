import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Upload, Trash2, Download, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  ticketId: string;
  condominiumId: string;
}

export function TicketAttachments({ ticketId, condominiumId }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: docs, isLoading } = useQuery({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: { id: string; file_path: string }) => {
      await supabase.storage.from('documents').remove([doc.file_path]);
      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      toast.success('Anexo eliminado');
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const allowed = ['pdf', 'doc', 'docx', 'jpeg', 'jpg', 'png', 'txt'];
        if (!allowed.includes(ext)) {
          toast.error(`Formato não suportado: ${ext}`);
          continue;
        }
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`Ficheiro muito grande: ${file.name}`);
          continue;
        }

        const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `tickets/${ticketId}/${Date.now()}_${safeName}`;

        const { error: uploadError } = await supabase.storage.from('documents').upload(path, file);
        if (uploadError) { toast.error(`Erro ao carregar ${file.name}`); continue; }

        const { error: dbError } = await supabase.from('documents').insert({
          title: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type,
          document_type: 'fotografia' as any,
          ticket_id: ticketId,
          condominium_id: condominiumId,
        });
        if (dbError) { toast.error(`Erro ao registar ${file.name}`); continue; }
      }
      qc.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      toast.success('Anexo(s) carregado(s)');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const getDownloadUrl = (path: string) => {
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const getIcon = (mime: string | null) => {
    if (mime?.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
    if (mime?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Anexos ({docs?.length || 0})</p>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'A carregar...' : 'Carregar'}
        </Button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.jpeg,.jpg,.png,.txt" className="hidden" onChange={handleUpload} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : !docs?.length ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Sem anexos. Clique em carregar para adicionar ficheiros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 rounded-md border p-2.5 text-sm">
              {getIcon(doc.mime_type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.title}</p>
                <p className="text-[11px] text-muted-foreground">{formatSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString('pt-PT')}</p>
              </div>
              <a href={getDownloadUrl(doc.file_path)} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
              </a>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm('Eliminar anexo?')) deleteMutation.mutate({ id: doc.id, file_path: doc.file_path }); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
