import process from 'node:process'
import { consola as logger } from 'consola'
import { definePlugin } from 'nitro'
import { setActiveConfig } from '../utils/active-config'
import { loadConfig } from '../utils/config'

export default definePlugin(() => {
  try {
    const config = loadConfig(process.env)
    setActiveConfig(config)
    const { protocol, host, basePath } = config.target
    logger.info(`Redirecting to ${protocol}${host}${basePath} with ${config.statusCode}`)
  }
  catch (error) {
    logger.error(`Invalid configuration: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
})
