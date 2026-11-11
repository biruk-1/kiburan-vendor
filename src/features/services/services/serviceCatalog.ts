import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';
import { one } from '@/lib/supabase/embed';

export type VendorService = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  basePrice: number | null;
  currencyCode: string;
  priceUnit: string;
  isActive: boolean;
};

export type ServiceInput = {
  title: string;
  categoryId: string;
  description: string | null;
  basePrice: number;
};

export type Category = { id: string; name: string };

const SERVICE_SELECT =
  'id, title, description, category_id, base_price, currency_code, price_unit, is_active, category:vendor_categories ( name_en )';

type ServiceRow = {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  base_price: number | null;
  currency_code: string;
  price_unit: string;
  is_active: boolean;
  category: unknown;
};

function toService(row: ServiceRow): VendorService {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    categoryName: one(row.category as { name_en: string } | { name_en: string }[] | null)?.name_en ?? null,
    basePrice: row.base_price === null ? null : Number(row.base_price),
    currencyCode: row.currency_code,
    priceUnit: row.price_unit,
    isActive: row.is_active,
  };
}

export async function listServices(vendorId: string): Promise<ServiceResult<VendorService[]>> {
  const { data, error } = await supabase
    .from('vendor_services')
    .select(SERVICE_SELECT)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: true });
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: ((data ?? []) as ServiceRow[]).map(toService) };
}

export async function getService(vendorId: string, serviceId: string): Promise<ServiceResult<VendorService | null>> {
  const { data, error } = await supabase
    .from('vendor_services')
    .select(SERVICE_SELECT)
    .eq('vendor_id', vendorId)
    .eq('id', serviceId)
    .maybeSingle();
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: data ? toService(data as ServiceRow) : null };
}

/** Writes are allowed by RLS only for the owner and managers (`private.can_manage_vendor`). */
export async function createService(vendorId: string, input: ServiceInput): Promise<ServiceResult<{ id: string }>> {
  const { data, error } = await supabase
    .from('vendor_services')
    .insert({
      vendor_id: vendorId,
      title: input.title,
      category_id: input.categoryId,
      description: input.description,
      base_price: input.basePrice,
      currency_code: 'ETB',
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data };
}

export async function updateService(
  vendorId: string,
  serviceId: string,
  input: ServiceInput,
): Promise<ServiceResult<true>> {
  const { error, count } = await supabase
    .from('vendor_services')
    .update(
      {
        title: input.title,
        category_id: input.categoryId,
        description: input.description,
        base_price: input.basePrice,
      },
      { count: 'exact' },
    )
    .eq('vendor_id', vendorId)
    .eq('id', serviceId);
  if (error) return { ok: false, error: mapDataError(error) };
  if (count === 0) return { ok: false, error: { code: 'forbidden', message: "You can't edit this service." } };
  return { ok: true, data: true };
}

export async function setServiceActive(vendorId: string, serviceId: string, isActive: boolean): Promise<ServiceResult<true>> {
  const { error, count } = await supabase
    .from('vendor_services')
    .update({ is_active: isActive }, { count: 'exact' })
    .eq('vendor_id', vendorId)
    .eq('id', serviceId);
  if (error) return { ok: false, error: mapDataError(error) };
  if (count === 0) return { ok: false, error: { code: 'forbidden', message: "You can't change this service." } };
  return { ok: true, data: true };
}

/**
 * Cascades to the service's packages and availability; its photos stay in the portfolio.
 * Inquiries and quotes reference services/packages without cascade, so those block deletion (23503).
 */
export async function deleteService(vendorId: string, serviceId: string): Promise<ServiceResult<true>> {
  const { error, count } = await supabase
    .from('vendor_services')
    .delete({ count: 'exact' })
    .eq('vendor_id', vendorId)
    .eq('id', serviceId);
  if (error?.code === '23503') {
    return {
      ok: false,
      error: { code: 'in_use', message: 'This service has inquiries or quotes, so it can’t be deleted. Deactivate it instead.' },
    };
  }
  if (error) return { ok: false, error: mapDataError(error) };
  if (count === 0) return { ok: false, error: { code: 'forbidden', message: "You can't delete this service." } };
  return { ok: true, data: true };
}

export async function listCategories(): Promise<ServiceResult<Category[]>> {
  const { data, error } = await supabase.from('vendor_categories').select('id, name_en').order('name_en');
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: (data ?? []).map((row) => ({ id: row.id, name: row.name_en })) };
}
