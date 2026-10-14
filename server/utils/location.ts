import type { Configuration } from './config'

const PROTOCOL = /^https?:\/\//i
const TRAILING_SLASHES = /\/+$/

/**
 * Builds the Location a request is redirected to: the Redirect Target, without
 * trailing slashes, followed by the requested path and query. A target without
 * a protocol takes the request's; a path in the target is a Base Path.
 */
export function buildLocation(config: Configuration, requestUrl: URL): string {
  const target = config.target.replace(TRAILING_SLASHES, '')
  const origin = PROTOCOL.test(target) ? target : `${requestUrl.protocol}//${target}`
  return `${origin}${requestUrl.pathname}${requestUrl.search}`
}
