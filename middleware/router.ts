export default eventHandler((event) => {
  const {
    REDIRECT_TARGET,
    REDIRECT_STATUS_CODE,
  } = process.env

  if (!REDIRECT_TARGET || REDIRECT_TARGET === '' || REDIRECT_TARGET === 'undefined' || REDIRECT_TARGET === 'null') {
    setResponseHeader(event, 'Content-Type', 'application/json')
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'REDIRECT_TARGET is not defined',
    }))
  }

  try {
    const statusCode = REDIRECT_STATUS_CODE ? Number.parseInt(REDIRECT_STATUS_CODE) : 301
    const path = event.path
    let proto = ''

    if (!REDIRECT_TARGET.startsWith('http'))
      proto = `${getRequestProtocol(event)}://`

    const url = `${proto}${REDIRECT_TARGET}${path}`

    return sendRedirect(event, url, statusCode)
  }
  catch (err) {
    setResponseHeader(event, 'Content-Type', 'application/json')
    return sendError(event, err)
  }
})
