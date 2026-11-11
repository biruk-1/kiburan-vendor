export type UserMessage = { code: string; message: string };

export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: UserMessage };

/** Error thrown from query functions so React Query can track failures and retries. */
export class QueryError extends Error {
  readonly code: string;

  constructor(error: UserMessage) {
    super(error.message);
    this.name = 'QueryError';
    this.code = error.code;
  }
}

export function unwrap<T>(result: ServiceResult<T>): T {
  if (!result.ok) throw new QueryError(result.error);
  return result.data;
}

const RETRYABLE_CODES = new Set(['network', 'timeout']);

/** Only transient transport failures are retried; RLS, validation and not-found errors are not. */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof QueryError) return RETRYABLE_CODES.has(error.code);
  if (error && typeof error === 'object' && 'code' in error) {
    return RETRYABLE_CODES.has(String((error as { code: unknown }).code));
  }
  return false;
}

export const MAX_QUERY_RETRIES = 2;

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  return failureCount < MAX_QUERY_RETRIES && isRetryableError(error);
}

export function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 8000);
}

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function transportErrorCode(
  error: { message?: string; code?: string; name?: string } | Error | null,
): 'network' | 'timeout' | null {
  if (!error) return null;
  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  const name = 'name' in error && typeof error.name === 'string' ? error.name : '';
  const message = (('message' in error ? error.message : '') ?? '').toLowerCase();
  if (code === 'timeout' || name === 'RequestTimeoutError' || message.includes('timed out')) {
    return 'timeout';
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('aborted') || code === 'network') {
    return 'network';
  }
  return null;
}

export const TRANSPORT_MESSAGES = {
  network: 'Network error. Check your connection and try again.',
  timeout: 'The server took too long to respond. Check your connection and try again.',
} as const;

/** Maps a PostgREST / Postgres error to safe copy. Feature mappers may refine specific codes first. */
export function mapDataError(
  error: { message?: string; code?: string; name?: string } | Error | null,
): UserMessage {
  const transport = transportErrorCode(error);
  if (transport) return { code: transport, message: TRANSPORT_MESSAGES[transport] };
  const code = error && 'code' in error && typeof error.code === 'string' ? error.code : '';
  if (code === '42501' || code === 'PGRST301') {
    return { code: 'forbidden', message: "You don't have access to this business data." };
  }
  return { code: 'unknown', message: 'Something went wrong. Please try again.' };
}
