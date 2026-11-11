import { mapDataError, type ServiceResult } from '@/lib/query/queryError';
import { supabase } from '@/lib/supabase/client';

export type ServicePackage = {
  id: string;
  serviceId: string;
  name: string;
  description: string | null;
  inclusions: string[];
  price: number | null;
  currencyCode: string;
  isActive: boolean;
};

export type PackageInput = {
  name: string;
  description: string | null;
  inclusions: string[];
  price: number | null;
  isActive: boolean;
};

function parseInclusions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
}

function toPackage(row: {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  inclusions: unknown;
  price: number | null;
  currency_code: string;
  is_active: boolean;
}): ServicePackage {
  return {
    id: row.id,
    serviceId: row.service_id,
    name: row.name,
    description: row.description,
    inclusions: parseInclusions(row.inclusions),
    price: row.price === null ? null : Number(row.price),
    currencyCode: row.currency_code,
    isActive: row.is_active,
  };
}

export async function listPackages(serviceId: string): Promise<ServiceResult<ServicePackage[]>> {
  const { data, error } = await supabase
    .from('vendor_packages')
    .select('id, service_id, name, description, inclusions, price, currency_code, is_active')
    .eq('service_id', serviceId)
    .order('name', { ascending: true });
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: (data ?? []).map(toPackage) };
}

export async function getPackage(serviceId: string, packageId: string): Promise<ServiceResult<ServicePackage | null>> {
  const { data, error } = await supabase
    .from('vendor_packages')
    .select('id, service_id, name, description, inclusions, price, currency_code, is_active')
    .eq('service_id', serviceId)
    .eq('id', packageId)
    .maybeSingle();
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data: data ? toPackage(data) : null };
}

export async function createPackage(serviceId: string, input: PackageInput): Promise<ServiceResult<{ id: string }>> {
  const { data, error } = await supabase
    .from('vendor_packages')
    .insert({
      service_id: serviceId,
      name: input.name,
      description: input.description,
      inclusions: input.inclusions,
      price: input.price,
      currency_code: 'ETB',
      is_active: input.isActive,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: mapDataError(error) };
  return { ok: true, data };
}

export async function updatePackage(
  serviceId: string,
  packageId: string,
  input: PackageInput,
): Promise<ServiceResult<true>> {
  const { error, count } = await supabase
    .from('vendor_packages')
    .update(
      {
        name: input.name,
        description: input.description,
        inclusions: input.inclusions,
        price: input.price,
        is_active: input.isActive,
      },
      { count: 'exact' },
    )
    .eq('service_id', serviceId)
    .eq('id', packageId);
  if (error) return { ok: false, error: mapDataError(error) };
  if (count === 0) return { ok: false, error: { code: 'forbidden', message: "You can't edit this package." } };
  return { ok: true, data: true };
}

export async function deletePackage(serviceId: string, packageId: string): Promise<ServiceResult<true>> {
  const { error, count } = await supabase
    .from('vendor_packages')
    .delete({ count: 'exact' })
    .eq('service_id', serviceId)
    .eq('id', packageId);
  if (error?.code === '23503') {
    return {
      ok: false,
      error: {
        code: 'in_use',
        message: 'This package is linked to quotes, so it can’t be deleted. Deactivate it instead.',
      },
    };
  }
  if (error) return { ok: false, error: mapDataError(error) };
  if (count === 0) return { ok: false, error: { code: 'forbidden', message: "You can't delete this package." } };
  return { ok: true, data: true };
}
