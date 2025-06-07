import { consola as logger } from 'consola'

export default eventHandler((event) => {
  const {
    REDIRECT_TARGET,
    REDIRECT_STATUS_CODE,
  } = process.env

  if (!REDIRECT_TARGET || REDIRECT_TARGET === '' || REDIRECT_TARGET === 'undefined' || REDIRECT_TARGET === 'null') {
    setResponseHeader(event, 'Content-Type', 'application/json')
    logger.error('REDIRECT_TARGET is not defined')
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'REDIRECT_TARGET is not defined',
    }))
  }

  try {
    const statusCode = REDIRECT_STATUS_CODE ? Number.parseInt(`${REDIRECT_STATUS_CODE}`) : 301
    const path = event.path
    let proto = ''

    if (!REDIRECT_TARGET.startsWith('http'))
      proto = `${getRequestProtocol(event, { xForwardedProto: true })}://`

    const url = `${proto}${REDIRECT_TARGET}${path}`
    const requestUrl = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
    logger.info(`Redirecting to ${url} (${statusCode}) | "${REDIRECT_TARGET}" | "${REDIRECT_STATUS_CODE}" | ${proto} | ${path}`)
    logger.info(`Request URL: ${requestUrl}`)
    return sendRedirect(event, url, statusCode)
  }
  catch (err) {
    logger.error(err)
    setResponseHeader(event, 'Content-Type', 'application/json')
    return sendError(event, err)
  }
})
