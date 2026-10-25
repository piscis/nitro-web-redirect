export const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308] as const

export type RedirectStatusCode = typeof REDIRECT_STATUS_CODES[number]

/**
 * The Redirect Target, split once at startup and with trailing slashes trimmed:
 * `protocol + host` is its origin, `basePath` goes in front of the requested path.
 */
export interface RedirectTarget {
  /** The protocol with its slashes as given, e.g. `https://`; empty to take the request's. */
  protocol: string
  /** The host, with a port if one is given. */
  host: string
  /** The Base Path without a trailing slash; empty for none. */
  basePath: string
}

/** The Redirect Target and Redirect Status Code a running instance serves. */
export interface Configuration {
  target: RedirectTarget
  statusCode: RedirectStatusCode
}

const UNSET_TARGETS = new Set(['', 'undefined', 'null'])
const PROTOCOL = /^https?:\/\//i
const TRAILING_SLASHES = /\/+$/
const DEFAULT_STATUS_CODE: RedirectStatusCode = 301

/**
 * Reads the Configuration from environment variables.
 * Throws with a message naming the offending variable if it is not valid.
 */
export function loadConfig(env: Record<string, string | undefined>): Configuration {
  const target = env.REDIRECT_TARGET
  if (target === undefined || UNSET_TARGETS.has(target))
    throw new Error('REDIRECT_TARGET is not set: give the host to redirect to, e.g. REDIRECT_TARGET=https://example.com')

  return {
    target: parseTarget(target),
    statusCode: parseStatusCode(env.REDIRECT_STATUS_CODE),
  }
}

function parseTarget(value: string): RedirectTarget {
  const target = value.replace(TRAILING_SLASHES, '')
  const protocol = PROTOCOL.exec(target)?.[0] ?? ''
  const rest = target.slice(protocol.length)
  const pathStart = rest.indexOf('/')
  return pathStart === -1
    ? { protocol, host: rest, basePath: '' }
    : {
        protocol,
        host: rest.slice(0, pathStart),
        basePath: rest.slice(pathStart),
      }
}

function parseStatusCode(value: string | undefined): RedirectStatusCode {
  if (value === undefined || value === '')
    return DEFAULT_STATUS_CODE

  const statusCode = REDIRECT_STATUS_CODES.find(code => String(code) === value)
  if (statusCode === undefined)
    throw new Error(`REDIRECT_STATUS_CODE "${value}" is not one of ${REDIRECT_STATUS_CODES.join(', ')}`)

  return statusCode
}
