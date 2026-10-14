import { readFileSync } from 'node:fs'

/**
 * Returns the body of one version's section in CHANGELOG.md, without its heading.
 * `version` is either the version (`2.0.0`) or its tag name (`v2.0.0`).
 */
export function releaseNotes(changelog: string, version: string): string {
  const bare = version.replace(/^v/, '')
  const lines = changelog.split('\n')
  const start = lines.findIndex(line => line.startsWith(`## [${bare}]`))
  if (start === -1)
    throw new Error(`CHANGELOG.md has no section for ${bare}`)
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '))
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n').trim()
}

// Usage: node scripts/release-notes.ts v2.0.0 > notes.md
if (import.meta.main) {
  const [version] = process.argv.slice(2)
  if (!version) {
    console.error('Usage: node scripts/release-notes.ts <version or tag>')
    process.exit(1)
  }
  console.log(releaseNotes(readFileSync('CHANGELOG.md', 'utf8'), version))
}
