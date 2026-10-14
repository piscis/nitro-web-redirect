import type { RedirectTarget } from './config'

/**
 * Builds the Location a request is redirected to: the Redirect Target followed
 * by the requested path and query. A target without a protocol takes the request's.
 */
export function buildLocation(target: RedirectTarget, requestUrl: URL): string {
  const protocol = target.protocol || `${requestUrl.protocol}//`
  return `${protocol}${target.host}${target.basePath}${requestUrl.pathname}${requestUrl.search}`
}
