const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatMoney(amount: number, currencyCode = 'ETB'): string {
  return `${currencyCode} ${numberFormat.format(Math.round(amount))}`;
}

/** Compact form for tight spaces: ETB 245,000 → ETB 245K. */
export function formatMoneyCompact(amount: number, currencyCode = 'ETB'): string {
  if (Math.abs(amount) >= 1_000_000) return `${currencyCode} ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (Math.abs(amount) >= 10_000) return `${currencyCode} ${Math.round(amount / 1000)}K`;
  return formatMoney(amount, currencyCode);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses a Postgres `date` (YYYY-MM-DD) as a local calendar day, never shifting across time zones. */
export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatDay(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export function formatMonthShort(date: Date): string {
  return MONTHS[date.getMonth()];
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDay(new Date(iso));
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(displayName: string | null | undefined): string | null {
  const first = displayName?.trim().split(/\s+/)[0];
  return first ? first : null;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
