// Patterns we never want to show to a user verbatim. These usually indicate
// the backend returned a raw DB / framework error that slipped past sanitization.
const RAW_ERROR_PATTERNS = [
  /Cast to .* failed/i,
  /ValidationError:/i,
  /E11000/i,
  /MongoError/i,
  /MongoServerError/i,
  /^ENOTFOUND/i,
  /^ECONNREFUSED/i,
  /Network Error$/i,
  /at .*\(.*\)/i, // looks like a stack frame
];

const looksRaw = (msg: string): boolean =>
  RAW_ERROR_PATTERNS.some(rx => rx.test(msg));

/**
 * Pull a user-friendly message out of an axios error.
 *
 * - Network failures → "Could not reach the server. Check your connection."
 * - 5xx → fallbackMessage
 * - 4xx → backend message if it looks user-friendly, else fallbackMessage
 * - Anything that smells like a raw DB / stack trace → fallbackMessage
 */
export function extractErrorMessage(
  err: any,
  fallbackMessage = 'Something went wrong. Please try again.',
): string {
  // No response → network/timeout
  if (err && !err.response) {
    if (err.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.';
    }
    return 'Could not reach the server. Check your connection.';
  }

  const status: number | undefined = err?.response?.status;
  const data = err?.response?.data;
  const backendMsg: string | undefined =
    typeof data?.message === 'string' ? data.message.trim() : undefined;

  // Server errors should never expose internals.
  if (status && status >= 500) return fallbackMessage;

  // 4xx with a sensible-looking backend message → use it
  if (backendMsg && !looksRaw(backendMsg)) return backendMsg;

  return fallbackMessage;
}
