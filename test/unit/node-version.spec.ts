import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Every place that names the Node.js version must agree with `.nvmrc`, which
// CI and local development run on. Renovate groups them into one pull
// request (renovate.json), and this test catches the drift when it doesn't.

function read(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
}

function parts(version: string): number[] {
  return version.split('.').map(Number)
}

const nvmrc = read('.nvmrc').trim()
const [major] = parts(nvmrc)

describe('the Node.js version', () => {
  it('.nvmrc pins an exact version', () => {
    expect(nvmrc).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('every Dockerfile stage builds FROM node:<.nvmrc>-alpine', () => {
    const tags = [
      ...read('Dockerfile').matchAll(/^FROM node:(\S+)/gm),
    ].map(match => match[1])
    expect(tags.length).toBeGreaterThan(0)
    expect(tags).toEqual(tags.map(() => `${nvmrc}-alpine`))
  })

  it('engines.node is a >= range on the .nvmrc major that .nvmrc satisfies', () => {
    const engines: string = JSON.parse(read('package.json')).engines.node
    const floor = engines.match(/^>=(\d+(?:\.\d+){0,2})$/)?.[1]
    expect(floor, `engines.node "${engines}"`).toBeDefined()
    const floorParts = parts(floor!)
    expect(floorParts[0]).toBe(major)
    const nvmrcParts = parts(nvmrc)
    const firstDiff = floorParts.findIndex((part, i) => part !== nvmrcParts[i])
    expect(firstDiff === -1 || floorParts[firstDiff]! < nvmrcParts[firstDiff]!, `${engines} admits ${nvmrc}`).toBe(true)
  })

  it('the README names the .nvmrc major', () => {
    expect(read('README.md')).toContain(`- Node.js ${major} (see \`.nvmrc\`)`)
  })
})
