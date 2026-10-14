import { consola as logger } from 'consola'
import { definePlugin } from 'nitro'

export default definePlugin((nitroApp) => {
  nitroApp.hooks?.hook('error', (error) => {
    logger.error(error)
  })
})
