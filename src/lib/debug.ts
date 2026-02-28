/**
 * Debug logging only when NEXT_PUBLIC_DEBUG_AUTH=1
 */
export function debugLog(scope: string, data?: unknown): void {
  if (process.env.NEXT_PUBLIC_DEBUG_AUTH === '1') {
    console.log(`[${scope}]`, data !== undefined ? data : '')
  }
}
