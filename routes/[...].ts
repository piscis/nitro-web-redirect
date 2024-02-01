const {
  REDIRECT_TARGET,
  REDIRECT_STATUS_CODE
} = process.env

export default eventHandler((event) => {

  if(!REDIRECT_TARGET) {
    return createError({
      statusCode: 400,
      statusMessage: 'REDIRECT_TARGET is not defined'
    })
  }

   const statusCode = REDIRECT_STATUS_CODE ? parseInt(REDIRECT_STATUS_CODE) : 301
   const path = event.path
    const url = `${REDIRECT_TARGET}${path}`

  return sendRedirect(event, url, statusCode)
})
