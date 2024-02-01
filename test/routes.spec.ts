import { describe, expect, it, vi } from 'vitest'
import { beforeAll } from 'vitest'
import { afterEach } from 'vitest';
import { beforeEach } from 'vitest';
import { setupContext, startServer, callHandler } from './setup/utils'

// eslint-disable-next-line test/prefer-lowercase-title
describe('Routes', () => {
  let close;
  let serverUrl;

  const setupServer = async () => {

    const ctx = await setupContext()
    // Start the server before all tests
    close = await startServer(ctx)
    serverUrl = ctx.server!.url
  }

  beforeEach(async (opts) => {
    vi.stubEnv('REDIRECT_TARGET', 'https://example.com')
    vi.stubEnv('REDIRECT_STATUS_CODE', "301")
  });

  afterEach(() => {
    vi.unstubAllEnvs()
    if(close) close()
  })

  it('None existing resources should return with a redirect', async () => {
    await setupServer()
    const endpoint = '/my-resource-endpoint/with-a-dummy.html';
    const { status, headers } = await callHandler(serverUrl, endpoint)
    expect(headers.location).toBe(`https://example.com${endpoint}`)
    expect(status).toBe(301)
  })

  it('Respect overwrite of REDIRECT_STATUS_CODE via environment', async () => {
    vi.stubEnv('REDIRECT_STATUS_CODE', "302")
    await setupServer()
    const { status } = await callHandler(serverUrl, '/blub')
    expect(status).toBe(parseInt(process.env.REDIRECT_STATUS_CODE))
  })

  it('should return 400 if REDIRECT_TARGET is undefined', async () => {
    vi.unstubAllEnvs()
    await setupServer()
    const { status } = await callHandler(serverUrl, '/blub')
    expect(status).toBe(400)
  })

  it('Rewrites http to https if specified in REDIRECT_TARGET', async () => {
    vi.stubEnv('REDIRECT_STATUS_CODE', "302")
    vi.stubEnv('REDIRECT_TARGET', 'https://example.com')
    await setupServer()
    const { status, headers } = await callHandler(serverUrl, '/blub')
    expect(status).toBe(302)
    expect(headers.location).toBe('https://example.com/blub')
  })

  it('enforces client request protocol if missing in REDIRECT_TARGET', async () => {
    vi.stubEnv('REDIRECT_STATUS_CODE', "301")
    vi.stubEnv('REDIRECT_TARGET', 'example.com')
    await setupServer()
    const { status, headers } = await callHandler(serverUrl, '/blub')
    expect(status).toBe(301)
    expect(headers.location).toBe('http://example.com/blub')
  })

  it('enforces client request protocol if missing in REDIRECT_TARGET', async () => {
    vi.stubEnv('REDIRECT_STATUS_CODE', "301")
    vi.stubEnv('REDIRECT_TARGET', 'https://example.com')
    await setupServer()
    const endpoint = '/my-resource-endpoint/with-a-dummy.html?q=123&b=456';
    const { status, headers } = await callHandler(serverUrl, endpoint)
    expect(status).toBe(301)
    expect(headers.location).toBe(`https://example.com${endpoint}`)
  })
})
