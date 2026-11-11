export const REQUEST_TIMEOUT_MS = 15_000;

export class RequestTimeoutError extends Error {
  readonly code = 'timeout';

  constructor() {
    super('Request timed out');
    this.name = 'RequestTimeoutError';
  }
}

/**
 * `fetch` that aborts after `timeoutMs` and still honours a caller-provided AbortSignal
 * (React Query passes one so obsolete requests are cancelled).
 */
export function createFetchWithTimeout(
  baseFetch: typeof fetch = fetch,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const upstream = init?.signal;
    const onUpstreamAbort = () => controller.abort();
    if (upstream) {
      if (upstream.aborted) controller.abort();
      else upstream.addEventListener('abort', onUpstreamAbort);
    }

    try {
      return await baseFetch(input, { ...init, signal: controller.signal });
    } catch (error) {
      if (timedOut) throw new RequestTimeoutError();
      throw error;
    } finally {
      clearTimeout(timer);
      upstream?.removeEventListener('abort', onUpstreamAbort);
    }
  };
}
