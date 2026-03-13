import { useState } from 'react';
import { FileText, Upload, Search, X, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useDocuments, useCreateDocument, useDeleteDocument, useUpdateDocument } from '@/hooks/useDocuments';
import { useCondominiums } from '@/hooks/useCondominiums';
import { DOCUMENT_TYPES, documentTypeLabel, uploadFile, validateDocumentFile, sanitizeStorageFileName, ALLOWED_DOCUMENT_EXTENSIONS_LABEL } from '@/services/documents';
import { toast } from 'sonner';

export default function Documentos() {
  const { data: documents, isLoading } = useDocuments();
  const { data: condominiums } = useCondominiums();
  const createDoc = useCreateDocument();
  const deleteDoc = useDeleteDocument();
  const updateDoc = useUpdateDocument();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCondo, setFilterCondo] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);
  const [dragging, setDragging] = useState(false);

  // Upload state
  const [uploadFile_, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('fotografia');
  const [uploadCondo, setUploadCondo] = useState('');
  const [uploading, setUploading] = useState(false);
  const FILE_INPUT_ACCEPT = '.pdf,.doc,.jpeg,.jpg,.png,.txt';

  const filtered = (documents || []).filter(d => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && d.document_type !== filterType) return false;
    if (filterCondo !== 'all' && d.condominium_id !== filterCondo) return false;
    return true;
  });

  const handleSelectFile = (file: File) => {
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      toast.error(validation.reason || `Formato não suportado. Permitidos: ${ALLOWED_DOCUMENT_EXTENSIONS_LABEL}.`);
      return false;
    }

    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && handleSelectFile(files[0])) {
      setUploadOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile_ || !uploadTitle) return;
    setUploading(true);

    const validation = validateDocumentFile(uploadFile_);
    if (!validation.valid) {
      toast.error(validation.reason || `Formato não suportado. Permitidos: ${ALLOWED_DOCUMENT_EXTENSIONS_LABEL}.`);
      setUploading(false);
      return;
    }

    try {
      const safeFileName = sanitizeStorageFileName(uploadFile_.name);
      const path = `${Date.now()}_${safeFileName}`;
      const { path: storedPath } = await uploadFile(uploadFile_, path);
      await createDoc.mutateAsync({
        title: uploadTitle,
        document_type: uploadType,
        file_path: storedPath,
        mime_type: uploadFile_.type,
        file_size: uploadFile_.size,
        condominium_id: uploadCondo || undefined,
      });
      toast.success('Documento carregado com sucesso');
      setUploadOpen(false);
      resetUploadForm();
    } catch (err: any) {
      const message = err?.message || err?.error_description || String(err);
      if (message.includes('Invalid key')) {
        toast.error('Nome do ficheiro inválido. Remova caracteres especiais e tente novamente.');
      } else if (message.includes('Payload too large') || message.includes('413')) {
        toast.error('Ficheiro demasiado grande. Reduza o tamanho e tente novamente.');
      } else if (message.includes('mime') || message.includes('type')) {
        toast.error(`Tipo de ficheiro não suportado. Permitidos: ${ALLOWED_DOCUMENT_EXTENSIONS_LABEL}.`);
      } else if (message.includes('duplicate') || message.includes('already exists')) {
        toast.error('Já existe um ficheiro com este nome. Renomeie e tente novamente.');
      } else if (message.includes('permission') || message.includes('policy') || message.includes('403')) {
        toast.error('Sem permissão para carregar ficheiros. Verifique a sua sessão.');
      } else {
        toast.error(`Erro ao carregar documento: ${message}`);
      }
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadType('fotografia');
    setUploadCondo('');
  };

  const handleEditSave = async () => {
    if (!editDoc) return;
    try {
      await updateDoc.mutateAsync({
        id: editDoc.id,
        values: { title: editDoc.title, document_type: editDoc.document_type, condominium_id: editDoc.condominium_id || null },
      });
      toast.success('Documento atualizado');
      setEditDoc(null);
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getPublicUrl = (path: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/documents/${path}`;
  };

  return (
    <div
      className="space-y-4"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <PageHeader
        title="Documentos"
        description="Biblioteca documental centralizada"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
        }
      />

      {/* Drag overlay */}
      {dragging && (
        <div className="fixed inset-0 z-50 bg-accent/10 border-4 border-dashed border-accent flex items-center justify-center pointer-events-none">
          <div className="bg-card rounded-xl p-8 shadow-lg text-center">
            <Upload className="h-12 w-12 text-accent mx-auto mb-3" />
            <p className="text-lg font-semibold">Solte o ficheiro aqui</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar documentos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCondo} onValueChange={setFilterCondo}>
          <SelectTrigger className="w-[200px] h-9"><SelectValue placeholder="Condomínio" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(condominiums || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Sem documentos" description="Carregue documentos arrastando ficheiros ou clicando em Upload." actionLabel="Carregar documento" onAction={() => setUploadOpen(true)} />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{documentTypeLabel(doc.document_type)}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{(doc as any).condominiums?.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatSize(doc.file_size)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDate(doc.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(getPublicUrl(doc.file_path), '_blank')}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditDoc({ ...doc })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { deleteDoc.mutate(doc.id); toast.success('Documento eliminado'); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={v => { if (!v) resetUploadForm(); setUploadOpen(v); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Carregar Documento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {!uploadFile_ ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-accent transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique ou arraste um ficheiro</p>
                <input type="file" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setUploadFile(f); setUploadTitle(f.name.replace(/\.[^/.]+$/, '')); }
                }} />
              </label>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1 truncate">{uploadFile_.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setUploadFile(null)}><X className="h-3 w-3" /></Button>
              </div>
            )}
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de documento</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condomínio (opcional)</Label>
              <Select value={uploadCondo} onValueChange={setUploadCondo}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {(condominiums || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleUpload} disabled={!uploadFile_ || !uploadTitle || uploading}>
              {uploading ? 'A carregar...' : 'Carregar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDoc} onOpenChange={v => { if (!v) setEditDoc(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Metadados</DialogTitle></DialogHeader>
          {editDoc && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={editDoc.title} onChange={e => setEditDoc({ ...editDoc, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
                <Select value={editDoc.document_type} onValueChange={v => setEditDoc({ ...editDoc, document_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condomínio</Label>
                <Select value={editDoc.condominium_id || ''} onValueChange={v => setEditDoc({ ...editDoc, condominium_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    {(condominiums || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleEditSave}>Guardar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
