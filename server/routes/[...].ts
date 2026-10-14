import { consola as logger } from 'consola'
import { defineHandler, HTTPError } from 'nitro'
import { getRequestURL, redirect } from 'nitro/h3'
import { useActiveConfig } from '../utils/active-config'
import { buildLocation } from '../utils/location'

export default defineHandler((event) => {
  const config = useActiveConfig()
  if (!config)
    throw new HTTPError({ status: 503, message: 'The redirect has no valid configuration' })

  const location = buildLocation(config, getRequestURL(event, { xForwardedProto: true }))
  logger.info(`${config.statusCode} ${event.req.method} ${event.url.pathname}${event.url.search} → ${location}`)
  return redirect(location, config.statusCode)
})
