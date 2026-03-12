
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  condominium_id uuid REFERENCES public.condominiums(id) ON DELETE CASCADE NOT NULL,
  related_entity_type text NOT NULL,
  related_entity_id uuid,
  action_type text NOT NULL,
  description text NOT NULL,
  metadata_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on activity_logs" ON public.activity_logs FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on activity_logs" ON public.activity_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on activity_logs" ON public.activity_logs FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on activity_logs" ON public.activity_logs FOR DELETE TO public USING (true);

CREATE INDEX idx_activity_logs_condominium ON public.activity_logs(condominium_id, created_at DESC);
