import { afterAll, beforeAll, vi } from 'vitest'

/**
 * The value each Configuration variable takes unless the spec names its own.
 * Without these, a variable in the surrounding environment -- a `.env`, a shell
 * export, a `phase run` -- would decide what the server under test does.
 */
const DEFAULTS = {
  REDIRECT_STATUS_CODE: '301',
} as const

/**
 * Sets the environment the built server reads its Configuration from.
 * Call it before `setup()`: the startup plugin reads the environment once.
 */
export function withConfiguration(env: Record<string, string>): void {
  beforeAll(() => {
    for (const [name, value] of Object.entries({
      ...DEFAULTS,
      ...env,
    }))
      vi.stubEnv(name, value)
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })
}
