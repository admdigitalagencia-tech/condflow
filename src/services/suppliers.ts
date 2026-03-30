import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { requireActiveOrganizationId } from '@/services/organization';

export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

export const SUPPLIER_CATEGORIES = [
  { value: 'elevadores', label: 'Elevadores' },
  { value: 'portoes', label: 'Portões' },
  { value: 'eletricidade', label: 'Eletricidade' },
  { value: 'canalizacao', label: 'Canalização' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'obras', label: 'Obras' },
  { value: 'seguros', label: 'Seguros' },
  { value: 'juridico', label: 'Jurídico' },
  { value: 'outros', label: 'Outros' },
] as const;

export type SupplierCategory = typeof SUPPLIER_CATEGORIES[number]['value'];

export async function fetchSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function createSupplier(values: SupplierInsert) {
  const organizationId = values.organization_id || await requireActiveOrganizationId();
  const { data, error } = await supabase
    .from('suppliers')
    .insert({ ...values, organization_id: organizationId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSupplier(id: string, values: SupplierUpdate) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) throw error;
}

// Supplier-Condominium relationships
export async function fetchSuppliersByCondominium(condominiumId: string) {
  const { data, error } = await supabase
    .from('supplier_condominiums')
    .select('*, suppliers(*)')
    .eq('condominium_id', condominiumId);
  if (error) throw error;
  return data;
}

export async function linkSupplierToCondominium(supplierId: string, condominiumId: string, serviceDescription?: string) {
  const organizationId = await requireActiveOrganizationId();
  const { error } = await supabase
    .from('supplier_condominiums')
    .insert({
      supplier_id: supplierId,
      condominium_id: condominiumId,
      service_description: serviceDescription,
      organization_id: organizationId,
    } as any);
  if (error) throw error;
}

export async function unlinkSupplierFromCondominium(supplierId: string, condominiumId: string) {
  const { error } = await supabase
    .from('supplier_condominiums')
    .delete()
    .eq('supplier_id', supplierId)
    .eq('condominium_id', condominiumId);
  if (error) throw error;
}
