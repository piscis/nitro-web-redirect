import { describe, expect, it } from 'vitest'
import { loadConfig } from '../../server/utils/config'

describe('loadConfig', () => {
  it('reads the redirect target and defaults the redirect status code to 301', () => {
    expect(loadConfig({ REDIRECT_TARGET: 'https://example.com' }))
      .toEqual({
        target: { protocol: 'https://', host: 'example.com', basePath: '' },
        statusCode: 301,
      })
  })

  it.each([
    [
      'example.com',
      { protocol: '', host: 'example.com', basePath: '' },
    ],
    [
      'HTTP://example.com:8080',
      { protocol: 'HTTP://', host: 'example.com:8080', basePath: '' },
    ],
    [
      'httpbin.org',
      { protocol: '', host: 'httpbin.org', basePath: '' },
    ],
    [
      'https://example.com/base/',
      { protocol: 'https://', host: 'example.com', basePath: '/base' },
    ],
    [
      'example.com/a/b//',
      { protocol: '', host: 'example.com', basePath: '/a/b' },
    ],
    [
      'https://example.com//',
      { protocol: 'https://', host: 'example.com', basePath: '' },
    ],
  ])('splits the redirect target %s into protocol, host and base path', (REDIRECT_TARGET, target) => {
    expect(loadConfig({ REDIRECT_TARGET }).target).toEqual(target)
  })

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['the string "undefined"', 'undefined'],
    ['the string "null"', 'null'],
  ])('rejects a redirect target that is %s', (_, REDIRECT_TARGET) => {
    expect(() => loadConfig({ REDIRECT_TARGET }))
      .toThrow('REDIRECT_TARGET is not set')
  })

  it.each(['301', '302', '303', '307', '308'])('accepts the redirect status code %s', (REDIRECT_STATUS_CODE) => {
    expect(loadConfig({ REDIRECT_TARGET: 'example.com', REDIRECT_STATUS_CODE }))
      .toEqual({
        target: { protocol: '', host: 'example.com', basePath: '' },
        statusCode: Number(REDIRECT_STATUS_CODE),
      })
  })

  it('defaults an empty redirect status code to 301', () => {
    expect(loadConfig({ REDIRECT_TARGET: 'example.com', REDIRECT_STATUS_CODE: '' }).statusCode)
      .toBe(301)
  })

  it.each([
    '200',
    '300',
    '304',
    '305',
    '306',
    '404',
    '500',
    'abc',
    '301abc',
    '301.5',
    '0x12d',
    ' ',
  ])(
    'rejects the redirect status code "%s"',
    (REDIRECT_STATUS_CODE) => {
      expect(() => loadConfig({ REDIRECT_TARGET: 'example.com', REDIRECT_STATUS_CODE }))
        .toThrow(`REDIRECT_STATUS_CODE "${REDIRECT_STATUS_CODE}" is not one of 301, 302, 303, 307, 308`)
    },
  )
})
