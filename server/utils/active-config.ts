import type { Configuration } from './config'

let activeConfig: Configuration | undefined

/** Stores the Configuration the startup plugin has validated. */
export function setActiveConfig(config: Configuration): void {
  activeConfig = config
}

/** The validated Configuration, or `undefined` if startup did not provide one. */
export function getActiveConfig(): Configuration | undefined {
  return activeConfig
}
