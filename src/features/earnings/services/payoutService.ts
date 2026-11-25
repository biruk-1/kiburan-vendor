import { supabase } from '@/lib/supabase/client';

export type PayoutDetails = {
  chapaSubaccountId: string | null;
  accountName: string | null;
  accountNumber: string | null;
  bankCode: string | null;
  splitType: string | null;
  splitValue: number | null;
};

export async function getVendorPayoutDetails(vendorId: string): Promise<PayoutDetails> {
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'chapa_subaccount_id, payout_account_name, payout_account_number, payout_bank_code, payout_split_type, payout_split_value',
    )
    .eq('id', vendorId)
    .maybeSingle();
  if (error) throw error;
  return {
    chapaSubaccountId: data?.chapa_subaccount_id ?? null,
    accountName: data?.payout_account_name ?? null,
    accountNumber: data?.payout_account_number ?? null,
    bankCode: data?.payout_bank_code ?? null,
    splitType: data?.payout_split_type ?? null,
    splitValue: data?.payout_split_value == null ? null : Number(data.payout_split_value),
  };
}

export async function registerChapaSubaccount(input: {
  vendorId: string;
  businessName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
}): Promise<{ chapaSubaccountId: string }> {
  const { data, error } = await supabase.functions.invoke('chapa-register-subaccount', {
    body: {
      vendorId: input.vendorId,
      businessName: input.businessName,
      accountName: input.accountName,
      accountNumber: input.accountNumber,
      bankCode: input.bankCode,
    },
  });
  if (error) throw error;
  if (!data || typeof data !== 'object') {
    throw new Error('Empty response from payout registration.');
  }
  if ('error' in data && data.error) {
    throw new Error(String(data.error));
  }
  const id = (data as { chapa_subaccount_id?: string }).chapa_subaccount_id;
  if (!id) throw new Error('Chapa did not return a subaccount id.');
  return { chapaSubaccountId: id };
}
