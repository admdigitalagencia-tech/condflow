
-- =============================================
-- CONDOMINIUMS
-- =============================================
CREATE TABLE public.condominiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address_line TEXT,
  postal_code TEXT,
  city TEXT,
  district TEXT,
  nif TEXT,
  year_built INTEGER,
  fractions_count INTEGER DEFAULT 0,
  floors_count INTEGER DEFAULT 0,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;

-- Dev-friendly policies (open for now, will tighten with auth)
CREATE POLICY "Allow all select on condominiums" ON public.condominiums FOR SELECT USING (true);
CREATE POLICY "Allow all insert on condominiums" ON public.condominiums FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on condominiums" ON public.condominiums FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on condominiums" ON public.condominiums FOR DELETE USING (true);

CREATE TRIGGER update_condominiums_updated_at
  BEFORE UPDATE ON public.condominiums
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_condominiums_org ON public.condominiums(organization_id);
CREATE INDEX idx_condominiums_active ON public.condominiums(active);

-- =============================================
-- STAKEHOLDERS
-- =============================================
CREATE TYPE public.stakeholder_type AS ENUM (
  'administrador', 'condomino', 'advogado', 'seguradora',
  'tecnico', 'entidade_publica', 'outro'
);

CREATE TABLE public.stakeholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stakeholder_type public.stakeholder_type NOT NULL DEFAULT 'outro',
  role_title TEXT,
  email TEXT,
  phone TEXT,
  preferred_contact_channel TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on stakeholders" ON public.stakeholders FOR SELECT USING (true);
CREATE POLICY "Allow all insert on stakeholders" ON public.stakeholders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on stakeholders" ON public.stakeholders FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on stakeholders" ON public.stakeholders FOR DELETE USING (true);

CREATE TRIGGER update_stakeholders_updated_at
  BEFORE UPDATE ON public.stakeholders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_stakeholders_org ON public.stakeholders(organization_id);

-- =============================================
-- STAKEHOLDER <-> CONDOMINIUM (many-to-many)
-- =============================================
CREATE TABLE public.stakeholder_condominiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  role_in_condominium TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (stakeholder_id, condominium_id)
);

ALTER TABLE public.stakeholder_condominiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on stakeholder_condominiums" ON public.stakeholder_condominiums FOR SELECT USING (true);
CREATE POLICY "Allow all insert on stakeholder_condominiums" ON public.stakeholder_condominiums FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on stakeholder_condominiums" ON public.stakeholder_condominiums FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on stakeholder_condominiums" ON public.stakeholder_condominiums FOR DELETE USING (true);

-- =============================================
-- SUPPLIERS
-- =============================================
CREATE TYPE public.supplier_category AS ENUM (
  'elevadores', 'portoes', 'eletricidade', 'canalizacao',
  'limpeza', 'obras', 'seguros', 'juridico', 'outros'
);

CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  supplier_category public.supplier_category NOT NULL DEFAULT 'outros',
  nif TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow all insert on suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on suppliers" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on suppliers" ON public.suppliers FOR DELETE USING (true);

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_suppliers_org ON public.suppliers(organization_id);

-- =============================================
-- SUPPLIER <-> CONDOMINIUM (many-to-many)
-- =============================================
CREATE TABLE public.supplier_condominiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  service_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (supplier_id, condominium_id)
);

ALTER TABLE public.supplier_condominiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on supplier_condominiums" ON public.supplier_condominiums FOR SELECT USING (true);
CREATE POLICY "Allow all insert on supplier_condominiums" ON public.supplier_condominiums FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on supplier_condominiums" ON public.supplier_condominiums FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on supplier_condominiums" ON public.supplier_condominiums FOR DELETE USING (true);

-- =============================================
-- CONDOMINIUM NOTES (internal notes)
-- =============================================
CREATE TABLE public.condominium_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.condominium_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all select on condominium_notes" ON public.condominium_notes FOR SELECT USING (true);
CREATE POLICY "Allow all insert on condominium_notes" ON public.condominium_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on condominium_notes" ON public.condominium_notes FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on condominium_notes" ON public.condominium_notes FOR DELETE USING (true);

CREATE TRIGGER update_condominium_notes_updated_at
  BEFORE UPDATE ON public.condominium_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_condominium_notes_condo ON public.condominium_notes(condominium_id);
