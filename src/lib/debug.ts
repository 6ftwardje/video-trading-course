/**
 * Debug logging only when NEXT_PUBLIC_DEBUG_AUTH=1 or localStorage.debugAuth=1.
 */
export function debugLog(scope: string, data?: unknown): void {
  const enabledByEnv = process.env.NEXT_PUBLIC_DEBUG_AUTH === '1'
  const enabledByStorage =
    typeof window !== 'undefined' && window.localStorage?.getItem('debugAuth') === '1'

  if (enabledByEnv || enabledByStorage) {
    console.log(`[${scope}]`, data !== undefined ? data : '')
  }
}
