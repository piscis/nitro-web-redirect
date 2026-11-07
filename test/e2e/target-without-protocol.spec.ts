import { $serverFetch, setup } from 'nitro-test-utils'
import { describe, expect, it } from 'vitest'
import { withConfiguration } from './with-configuration'

describe('the built server with a redirect target without protocol and status code 302', async () => {
  withConfiguration({ REDIRECT_TARGET: 'example.com', REDIRECT_STATUS_CODE: '302' })
  await setup({ mode: 'production', preset: 'node-server' })

  it('redirects with the overridden redirect status code 302', async () => {
    const { status } = await $serverFetch('/foo')
    expect(status).toBe(302)
  })

  it('takes the protocol from the request', async () => {
    const { headers } = await $serverFetch('/foo?x=1')
    expect(headers.get('location')).toBe('http://example.com/foo?x=1')
  })

  it('honours X-Forwarded-Proto when taking the protocol from the request', async () => {
    const { headers } = await $serverFetch('/foo', {
      headers: { 'x-forwarded-proto': 'https' },
    })
    expect(headers.get('location')).toBe('https://example.com/foo')
  })
})
