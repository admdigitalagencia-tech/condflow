
-- Create enums for task status and priority
CREATE TYPE public.task_status AS ENUM ('pendente', 'em_andamento', 'bloqueada', 'concluida', 'cancelada');
CREATE TYPE public.task_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Create tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  condominium_id uuid REFERENCES public.condominiums(id),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  assembly_id uuid REFERENCES public.assemblies(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  task_type text NOT NULL DEFAULT 'manual',
  status task_status NOT NULL DEFAULT 'pendente',
  priority task_priority NOT NULL DEFAULT 'media',
  due_date date,
  assigned_user_id uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow authenticated users full access
CREATE POLICY "Allow all select on tasks" ON public.tasks FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on tasks" ON public.tasks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on tasks" ON public.tasks FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on tasks" ON public.tasks FOR DELETE TO public USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
