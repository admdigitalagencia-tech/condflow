
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS sla_supplier_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_visit_done_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_quote_received_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_quote_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_in_construction_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_completed_at timestamptz;
