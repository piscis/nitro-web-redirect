import { afterAll, beforeAll, vi } from 'vitest'

/**
 * Sets the environment the built server reads its Configuration from.
 * Call it before `setup()`: the startup plugin reads the environment once.
 */
export function withConfiguration(env: Record<string, string>): void {
  beforeAll(() => {
    for (const [name, value] of Object.entries(env))
      vi.stubEnv(name, value)
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })
}
