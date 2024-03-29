import { fileURLToPath } from 'node:url'
import { resolve } from 'pathe'
import { joinURL } from 'ufo'
import destr from 'destr'
import { listen } from 'listhen'
import { fetch } from 'ofetch'
import {
  build,
  copyPublicAssets,
  createDevServer,
  createNitro,
  prepare,
  prerender,
} from 'nitropack'
import type { Listener } from 'listhen'
import type { Nitro } from 'nitropack'

export interface Context {
  preset: string
  nitro?: Nitro
  rootDir: string
  outDir: string
  server?: Listener
  isDev: boolean
}

const rootDir = fileURLToPath(new URL('../../', import.meta.url))

export async function setupContext({ preset = 'node' } = {}) {
  const ctx: Context = {
    preset,
    isDev: preset === 'nitro-dev',
    rootDir,
    outDir: resolve(rootDir, '.output'),
  }

  const nitro = (ctx.nitro = await createNitro({
    preset: ctx.preset,
    dev: ctx.isDev,
    rootDir: ctx.rootDir,
    buildDir: resolve(ctx.outDir, '.nitro'),
    serveStatic:
      preset !== 'cloudflare'
      && preset !== 'cloudflare-module'
      && preset !== 'cloudflare-pages'
      && preset !== 'vercel-edge'
      && !ctx.isDev,
    output: {
      dir: ctx.outDir,
    },
    timing:
      preset !== 'cloudflare'
      && preset !== 'cloudflare-pages'
      && preset !== 'vercel-edge',
  }))

  if (ctx.isDev) {
    // Setup development server
    const devServer = createDevServer(ctx.nitro)
    ctx.server = await devServer.listen({})
    await prepare(ctx.nitro)
    const ready = new Promise<void>((resolve) => {
      ctx.nitro!.hooks.hook('dev:reload', () => resolve())
    })
    await build(ctx.nitro)
    await ready
  }
  else {
    // Production build
    await prepare(nitro)
    await copyPublicAssets(nitro)
    await prerender(nitro)
    await build(nitro)
  }

  return ctx
}

export async function startServer(ctx: Context) {
  const entryPath = resolve(ctx.outDir, 'server/index.mjs')
  const { listener } = await import(entryPath)
  ctx.server = await listen(listener)

  // console.log('>', ctx.server!.url)

  return async function () {
    if (ctx.server)
      await ctx.server.close()
    if (ctx.nitro)
      await ctx.nitro.close()
  }
}

export async function callHandler(serverUrl: string, url: string, init?: RequestInit) {
  const result = await fetch(joinURL(serverUrl, url), {
    ...init,
    redirect: 'manual',
    headers: {
      // Enforce JSON response when routes fail
      accept: 'application/json',
      ...init?.headers,
    },
  })

  return {
    data: destr(await result.text()),
    status: result.status,
    headers: Object.fromEntries(result.headers.entries()),
  }
}
