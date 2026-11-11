import { formatMoney } from '@/utils/format';

const UNIT_SUFFIX: Record<string, string> = {
  hour: ' / hour',
  day: ' / day',
  person: ' / person',
  item: ' / item',
};

/** "ETB 15,000+" for packages (as designed); unit prices show their unit. */
export function formatServicePrice(service: { basePrice: number | null; currencyCode: string; priceUnit: string }): string {
  if (service.basePrice === null) return 'Price on request';
  const amount = formatMoney(service.basePrice, service.currencyCode);
  const suffix = UNIT_SUFFIX[service.priceUnit];
  return suffix ? `${amount}${suffix}` : `${amount}+`;
}
