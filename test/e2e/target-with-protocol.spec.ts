import { $fetchRaw, setup } from 'nitro-test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { withConfiguration } from './with-configuration'

describe('the built server with a redirect target that has a protocol', async () => {
  withConfiguration({ REDIRECT_TARGET: 'https://example.com' })
  await setup({ mode: 'production' })

  it('redirects with 301 and keeps the path and query', async () => {
    const { status, headers } = await $fetchRaw('/my-resource/with-a-dummy.html?q=123&b=456')
    expect(status).toBe(301)
    expect(headers.get('location')).toBe('https://example.com/my-resource/with-a-dummy.html?q=123&b=456')
  })
})
