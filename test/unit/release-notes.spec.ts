import { describe, expect, it } from 'vitest'
import { releaseNotes } from '../../scripts/release-notes'

const changelog = `# Changelog

## [1.9.0](https://github.com/piscis/nitro-web-redirect/compare/v1.8.0...v1.9.0) (2026-03-22)

### Bug Fixes

* skip GitHub-specific workflows on non-GitHub servers

## [1.8.0](https://github.com/piscis/nitro-web-redirect/compare/v1.7.0...v1.8.0) (2026-03-22)

### Features

* convert eslint config to typescript

### Bug Fixes

* removes unnessesary install step

## [1.7.0](https://github.com/piscis/nitro-web-redirect/compare/v1.6.0...v1.7.0) (2025-06-07)
`

describe('releaseNotes', () => {
  it('returns the body of the newest version section', () => {
    expect(releaseNotes(changelog, '1.9.0'))
      .toBe('### Bug Fixes\n\n* skip GitHub-specific workflows on non-GitHub servers')
  })

  it('rejects a version the changelog has no section for', () => {
    expect(() => releaseNotes(changelog, '2.0.0'))
      .toThrow('CHANGELOG.md has no section for 2.0.0')
  })

  it('reads a version by its tag name and stops at the next version', () => {
    expect(releaseNotes(changelog, 'v1.8.0')).toBe([
      '### Features',
      '',
      '* convert eslint config to typescript',
      '',
      '### Bug Fixes',
      '',
      '* removes unnessesary install step',
    ].join('\n'))
  })
})
