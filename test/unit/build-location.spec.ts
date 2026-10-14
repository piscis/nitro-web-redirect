import { describe, expect, it } from 'vitest'
import { loadConfig } from '../../server/utils/config'
import { buildLocation } from '../../server/utils/location'

function locationFor(target: string, requestUrl: string): string {
  return buildLocation(loadConfig({ REDIRECT_TARGET: target }).target, new URL(requestUrl))
}

describe('buildLocation', () => {
  it('appends the requested path to a redirect target with a protocol', () => {
    expect(locationFor('https://example.com', 'http://redirect.test/foo/bar.html'))
      .toBe('https://example.com/foo/bar.html')
  })

  it('keeps the query string unchanged', () => {
    expect(locationFor('https://example.com', 'http://redirect.test/search?q=123&b=456&empty=&q=again'))
      .toBe('https://example.com/search?q=123&b=456&empty=&q=again')
  })

  it('keeps an encoded path unchanged', () => {
    expect(locationFor('https://example.com', 'http://redirect.test/caf%C3%A9/a%20b%2Fc?x=%26'))
      .toBe('https://example.com/caf%C3%A9/a%20b%2Fc?x=%26')
  })

  it('uses the protocol of an http request when the redirect target has none', () => {
    expect(locationFor('example.com', 'http://redirect.test/foo'))
      .toBe('http://example.com/foo')
  })

  it('uses the protocol of an https request when the redirect target has none', () => {
    expect(locationFor('example.com', 'https://redirect.test/foo'))
      .toBe('https://example.com/foo')
  })

  it.each(['httpbin.org', 'https-proxy.example.com', 'http.example.com'])(
    'treats %s as a redirect target without protocol',
    (target) => {
      expect(locationFor(target, 'https://redirect.test/get'))
        .toBe(`https://${target}/get`)
    },
  )

  it('detects the protocol of a redirect target regardless of case', () => {
    expect(locationFor('HTTPS://example.com', 'http://redirect.test/foo'))
      .toBe('HTTPS://example.com/foo')
  })

  it('keeps the protocol of a redirect target over the request protocol', () => {
    expect(locationFor('http://example.com', 'https://redirect.test/foo'))
      .toBe('http://example.com/foo')
  })

  it('places the base path in front of the requested path', () => {
    expect(locationFor('https://example.com/base', 'http://redirect.test/foo?x=1'))
      .toBe('https://example.com/base/foo?x=1')
  })

  it('places the base path in front of the root path', () => {
    expect(locationFor('example.com/base', 'http://redirect.test/'))
      .toBe('http://example.com/base/')
  })

  it.each([
    ['https://example.com/', 'https://example.com/foo'],
    ['https://example.com//', 'https://example.com/foo'],
    ['example.com/', 'http://example.com/foo'],
    ['https://example.com/base/', 'https://example.com/base/foo'],
  ])('trims trailing slashes on the redirect target %s', (target, location) => {
    expect(locationFor(target, 'http://redirect.test/foo')).toBe(location)
  })

  it('redirects the root path to the redirect target with a single slash', () => {
    expect(locationFor('https://example.com/', 'http://redirect.test/'))
      .toBe('https://example.com/')
  })
})
