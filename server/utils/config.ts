export const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308] as const

export type RedirectStatusCode = typeof REDIRECT_STATUS_CODES[number]

/** The Redirect Target and Redirect Status Code a running instance serves. */
export interface Configuration {
  target: string
  statusCode: RedirectStatusCode
}

const UNSET_TARGETS = new Set(['', 'undefined', 'null'])
const DEFAULT_STATUS_CODE: RedirectStatusCode = 301

/**
 * Reads the Configuration from environment variables.
 * Throws with a message naming the offending variable if it is not valid.
 */
export function loadConfig(env: Record<string, string | undefined>): Configuration {
  const target = env.REDIRECT_TARGET
  if (target === undefined || UNSET_TARGETS.has(target))
    throw new Error('REDIRECT_TARGET is not set: give the host to redirect to, e.g. REDIRECT_TARGET=https://example.com')

  return { target, statusCode: parseStatusCode(env.REDIRECT_STATUS_CODE) }
}

function parseStatusCode(value: string | undefined): RedirectStatusCode {
  if (value === undefined || value === '')
    return DEFAULT_STATUS_CODE

  const statusCode = REDIRECT_STATUS_CODES.find(code => String(code) === value)
  if (statusCode === undefined)
    throw new Error(`REDIRECT_STATUS_CODE "${value}" is not one of ${REDIRECT_STATUS_CODES.join(', ')}`)

  return statusCode
}
