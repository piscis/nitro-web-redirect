import { consola as logger } from 'consola'
import { defineHandler } from 'nitro'
import { getRequestProtocol, getRequestURL, HTTPError, redirect } from 'nitro/h3'

export default defineHandler((event) => {
  const {
    REDIRECT_TARGET,
    REDIRECT_STATUS_CODE,
  } = process.env

  if (!REDIRECT_TARGET || REDIRECT_TARGET === '' || REDIRECT_TARGET === 'undefined' || REDIRECT_TARGET === 'null') {
    event.res.headers.set('Content-Type', 'application/json')
    logger.error('REDIRECT_TARGET is not defined')
    throw new HTTPError('REDIRECT_TARGET is not defined', { status: 400 })
  }

  try {
    const statusCode = REDIRECT_STATUS_CODE ? Number.parseInt(`${REDIRECT_STATUS_CODE}`) : 301
    const path = event.url.pathname + event.url.search
    let proto = ''

    if (!REDIRECT_TARGET.startsWith('http'))
      proto = `${getRequestProtocol(event, { xForwardedProto: true })}://`

    const url = `${proto}${REDIRECT_TARGET}${path}`
    const requestUrl = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
    logger.info(`Redirecting to ${url} (${statusCode}) | "${REDIRECT_TARGET}" | "${REDIRECT_STATUS_CODE}" | ${proto} | ${path}`)
    logger.info(`Request URL: ${requestUrl}`)
    return redirect(url, statusCode)
  }
  catch (err) {
    logger.error(err)
    event.res.headers.set('Content-Type', 'application/json')
    throw new HTTPError(err as string, { status: 500 })
  }
})
