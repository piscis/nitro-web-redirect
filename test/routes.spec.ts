import { $fetchRaw, setup } from 'nitro-test-utils/e2e'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// eslint-disable-next-line test/prefer-lowercase-title
describe('Routes', async () => {
  await setup({
    mode: 'production',
  })

  beforeEach(async () => {
    vi.stubEnv('REDIRECT_TARGET', 'https://example.com')
    vi.stubEnv('REDIRECT_STATUS_CODE', '301')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('none existing resources should return with a redirect', async () => {
    const endpoint = '/my-resource-endpoint/with-a-dummy.html'
    const { status, headers } = await $fetchRaw(endpoint)
    expect(headers.get('location')).toBe(`https://example.com${endpoint}`)
    expect(status).toBe(301)
  })

  it('respect overwrite of REDIRECT_STATUS_CODE via environment', async () => {
    vi.stubEnv('REDIRECT_STATUS_CODE', '302')
    const { status } = await $fetchRaw('/blub')
    expect(status).toBe(Number.parseInt(process.env.REDIRECT_STATUS_CODE))
  })

  it('should return 400 if REDIRECT_TARGET is undefined', async () => {
    vi.unstubAllEnvs()
    const { status } = await $fetchRaw('/blub')
    expect(status).toBe(400)
  })

  it('rewrites http to https if specified in REDIRECT_TARGET', async () => {
    vi.stubEnv('REDIRECT_STATUS_CODE', '302')
    vi.stubEnv('REDIRECT_TARGET', 'https://example.com')
    const { status, headers } = await $fetchRaw('/blub')
    expect(status).toBe(302)
    expect(headers.get('location')).toBe('https://example.com/blub')
  })

  it('enforces client request protocol if missing in REDIRECT_TARGET', async () => {
    vi.stubEnv('REDIRECT_STATUS_CODE', '301')
    vi.stubEnv('REDIRECT_TARGET', 'example.com')
    const { status, headers } = await $fetchRaw('/blub')
    expect(status).toBe(301)
    expect(headers.get('location')).toBe('http://example.com/blub')
  })

  it('respect url redirects with query parameter', async () => {
    vi.stubEnv('REDIRECT_STATUS_CODE', '301')
    vi.stubEnv('REDIRECT_TARGET', 'https://example.com')
    const endpoint = '/my-resource-endpoint/with-a-dummy.html?q=123&b=456'
    const { status, headers } = await $fetchRaw(endpoint)
    expect(status).toBe(301)
    expect(headers.get('location')).toBe(`https://example.com${endpoint}`)
  })
})
