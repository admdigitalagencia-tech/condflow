
-- Enums for assemblies and documents
CREATE TYPE public.document_type AS ENUM (
  'ata', 'convocatoria', 'lista_presenca', 'orcamento', 'contrato',
  'relatorio_tecnico', 'fatura', 'email_exportado', 'fotografia',
  'audio', 'transcricao', 'apolice'
);

CREATE TYPE public.assembly_status AS ENUM (
  'planeada', 'realizada', 'em_transcricao', 'em_minuta', 'finalizada'
);

CREATE TYPE public.minutes_status AS ENUM (
  'pendente', 'rascunho', 'em_revisao', 'aprovada', 'publicada'
);

CREATE TYPE public.transcript_status AS ENUM (
  'pendente', 'em_processamento', 'concluida', 'erro'
);

-- Documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  condominium_id UUID REFERENCES public.condominiums(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  assembly_id UUID,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  document_type public.document_type NOT NULL DEFAULT 'fotografia',
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  issue_date DATE,
  extracted_text TEXT,
  ai_summary TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on documents" ON public.documents FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on documents" ON public.documents FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on documents" ON public.documents FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on documents" ON public.documents FOR DELETE TO public USING (true);

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assemblies table
CREATE TABLE public.assemblies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  assembly_type TEXT NOT NULL DEFAULT 'ordinaria',
  title TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  location TEXT,
  status public.assembly_status NOT NULL DEFAULT 'planeada',
  agenda_text TEXT,
  notes TEXT,
  quorum_info TEXT,
  chaired_by TEXT,
  minutes_status public.minutes_status NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.assemblies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on assemblies" ON public.assemblies FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on assemblies" ON public.assemblies FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on assemblies" ON public.assemblies FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on assemblies" ON public.assemblies FOR DELETE TO public USING (true);

CREATE TRIGGER update_assemblies_updated_at BEFORE UPDATE ON public.assemblies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add FK from documents to assemblies now
ALTER TABLE public.documents ADD CONSTRAINT documents_assembly_id_fkey FOREIGN KEY (assembly_id) REFERENCES public.assemblies(id) ON DELETE SET NULL;

-- Assembly points (ordem de trabalhos)
CREATE TABLE public.assembly_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  assembly_id UUID NOT NULL REFERENCES public.assemblies(id) ON DELETE CASCADE,
  point_order INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  discussion_summary TEXT,
  proposal_text TEXT,
  voting_result_text TEXT,
  deliberation_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assembly_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on assembly_points" ON public.assembly_points FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on assembly_points" ON public.assembly_points FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on assembly_points" ON public.assembly_points FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on assembly_points" ON public.assembly_points FOR DELETE TO public USING (true);

-- Assembly attendees
CREATE TABLE public.assembly_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  assembly_id UUID NOT NULL REFERENCES public.assemblies(id) ON DELETE CASCADE,
  stakeholder_id UUID REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  attendee_name TEXT NOT NULL,
  unit_code TEXT,
  permillage NUMERIC,
  attendance_type TEXT NOT NULL DEFAULT 'presencial',
  represented_by TEXT,
  signature_status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assembly_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on assembly_attendees" ON public.assembly_attendees FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on assembly_attendees" ON public.assembly_attendees FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on assembly_attendees" ON public.assembly_attendees FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on assembly_attendees" ON public.assembly_attendees FOR DELETE TO public USING (true);

-- Transcripts
CREATE TABLE public.transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  assembly_id UUID NOT NULL REFERENCES public.assemblies(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'audio_upload',
  language TEXT DEFAULT 'pt',
  raw_text TEXT,
  confidence_score NUMERIC,
  processing_status public.transcript_status NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on transcripts" ON public.transcripts FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on transcripts" ON public.transcripts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on transcripts" ON public.transcripts FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on transcripts" ON public.transcripts FOR DELETE TO public USING (true);

CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON public.transcripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transcript segments
CREATE TABLE public.transcript_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  transcript_id UUID NOT NULL REFERENCES public.transcripts(id) ON DELETE CASCADE,
  segment_order INTEGER NOT NULL DEFAULT 1,
  speaker TEXT,
  started_at_seconds NUMERIC,
  ended_at_seconds NUMERIC,
  text TEXT NOT NULL,
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transcript_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on transcript_segments" ON public.transcript_segments FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on transcript_segments" ON public.transcript_segments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on transcript_segments" ON public.transcript_segments FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on transcript_segments" ON public.transcript_segments FOR DELETE TO public USING (true);

-- Minutes (atas)
CREATE TABLE public.minutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  assembly_id UUID NOT NULL REFERENCES public.assemblies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  minute_type TEXT NOT NULL DEFAULT 'formal',
  title TEXT NOT NULL,
  content_longtext TEXT,
  generation_source TEXT DEFAULT 'manual',
  status public.minutes_status NOT NULL DEFAULT 'rascunho',
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.minutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on minutes" ON public.minutes FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on minutes" ON public.minutes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on minutes" ON public.minutes FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on minutes" ON public.minutes FOR DELETE TO public USING (true);

-- Minute sections
CREATE TABLE public.minute_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  minute_id UUID NOT NULL REFERENCES public.minutes(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_title TEXT NOT NULL,
  content TEXT,
  source_evidence_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.minute_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on minute_sections" ON public.minute_sections FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on minute_sections" ON public.minute_sections FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on minute_sections" ON public.minute_sections FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on minute_sections" ON public.minute_sections FOR DELETE TO public USING (true);

CREATE TRIGGER update_minute_sections_updated_at BEFORE UPDATE ON public.minute_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI runs
CREATE TABLE public.ai_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  feature_name TEXT NOT NULL,
  related_entity_type TEXT NOT NULL,
  related_entity_id UUID NOT NULL,
  input_snapshot_json JSONB,
  output_snapshot_json JSONB,
  confidence_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on ai_runs" ON public.ai_runs FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on ai_runs" ON public.ai_runs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on ai_runs" ON public.ai_runs FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on ai_runs" ON public.ai_runs FOR DELETE TO public USING (true);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

CREATE POLICY "Allow public upload to documents" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Allow public read from documents" ON storage.objects FOR SELECT TO public USING (bucket_id = 'documents');
CREATE POLICY "Allow public delete from documents" ON storage.objects FOR DELETE TO public USING (bucket_id = 'documents');
