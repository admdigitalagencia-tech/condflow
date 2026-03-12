
-- =============================================
-- TICKET ENUMS
-- =============================================
CREATE TYPE public.ticket_category AS ENUM (
  'infiltracao', 'portao', 'elevador', 'eletricidade',
  'canalizacao', 'limpeza', 'estrutural', 'administrativo', 'sinistro'
);

CREATE TYPE public.ticket_priority AS ENUM ('baixa', 'media', 'alta', 'critica');

CREATE TYPE public.ticket_status AS ENUM (
  'aberto', 'em_analise', 'orcamento_solicitado',
  'aguardando_aprovacao', 'em_execucao', 'resolvido', 'encerrado'
);

CREATE TYPE public.ticket_update_type AS ENUM (
  'comment', 'status_change', 'assignment', 'cost_update', 'system'
);

-- =============================================
-- TICKETS (sequence for ticket codes)
-- =============================================
CREATE SEQUENCE public.ticket_code_seq START 1;

CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  code TEXT NOT NULL DEFAULT 'OC-' || lpad(nextval('public.ticket_code_seq')::text, 5, '0'),
  title TEXT NOT NULL,
  description TEXT,
  category public.ticket_category NOT NULL DEFAULT 'administrativo',
  subcategory TEXT,
  location_text TEXT,
  source_channel TEXT,
  priority public.ticket_priority NOT NULL DEFAULT 'media',
  status public.ticket_status NOT NULL DEFAULT 'aberto',
  severity_score INTEGER,
  assigned_user_id UUID REFERENCES auth.users(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date DATE,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_cost NUMERIC(12, 2) DEFAULT 0,
  approved_cost NUMERIC(12, 2) DEFAULT 0,
  closed_at TIMESTAMP WITH TIME ZONE,
  closure_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow all insert on tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on tickets" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on tickets" ON public.tickets FOR DELETE USING (true);

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_tickets_condominium ON public.tickets(condominium_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_category ON public.tickets(category);
CREATE INDEX idx_tickets_org ON public.tickets(organization_id);
CREATE INDEX idx_tickets_due_date ON public.tickets(due_date);

-- =============================================
-- TICKET UPDATES (timeline)
-- =============================================
CREATE TABLE public.ticket_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  update_type public.ticket_update_type NOT NULL DEFAULT 'comment',
  body TEXT,
  old_status public.ticket_status,
  new_status public.ticket_status,
  visibility TEXT NOT NULL DEFAULT 'internal',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on ticket_updates" ON public.ticket_updates FOR SELECT USING (true);
CREATE POLICY "Allow all insert on ticket_updates" ON public.ticket_updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on ticket_updates" ON public.ticket_updates FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on ticket_updates" ON public.ticket_updates FOR DELETE USING (true);

CREATE INDEX idx_ticket_updates_ticket ON public.ticket_updates(ticket_id);

-- =============================================
-- TICKET COSTS
-- =============================================
CREATE TABLE public.ticket_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost_type TEXT NOT NULL DEFAULT 'estimate',
  supplier_id UUID REFERENCES public.suppliers(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on ticket_costs" ON public.ticket_costs FOR SELECT USING (true);
CREATE POLICY "Allow all insert on ticket_costs" ON public.ticket_costs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on ticket_costs" ON public.ticket_costs FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on ticket_costs" ON public.ticket_costs FOR DELETE USING (true);

CREATE INDEX idx_ticket_costs_ticket ON public.ticket_costs(ticket_id);

-- =============================================
-- Function to auto-update last_activity_at on ticket_updates insert
-- =============================================
CREATE OR REPLACE FUNCTION public.update_ticket_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tickets SET last_activity_at = now() WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_update_ticket_last_activity
  AFTER INSERT ON public.ticket_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_ticket_last_activity();
