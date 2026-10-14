import process from 'node:process'
import { consola as logger } from 'consola'
import { definePlugin } from 'nitro'
import { setActiveConfig } from '../utils/active-config'
import { loadConfig } from '../utils/config'

export default definePlugin((nitroApp) => {
  try {
    const config = loadConfig(process.env)
    setActiveConfig(config)
    logger.info(`Redirecting to ${config.target} with ${config.statusCode}`)
  }
  catch (error) {
    logger.error(`Invalid configuration: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }

  nitroApp.hooks?.hook('error', (error) => {
    logger.error(error)
  })
})
