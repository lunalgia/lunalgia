#!/usr/bin/env node
/**
 * Snapshots for the hover cards on links (see src/scripts/previews.ts).
 *
 * A browser can't read other sites' pages, so cards for external links (and
 * for PDFs, which have no <head> to read) come from snapshots taken here and
 * committed with the site: a small picture plus a title and description.
 *
 *   npm run snapshots                 everything that has no snapshot yet
 *   npm run snapshots -- --force      retake every snapshot
 *   npm run snapshots -- --only upenn retake the links whose address contains "upenn"
 *
 * What gets a snapshot:
 *   - every external link (http/https) in src/content (Markdown links and href="…")
 *   - every PDF in public/ (the course files, the CV, …)
 * Web pages are photographed with Playwright (first time: `npx playwright install chromium`);
 * PDFs are drawn from page 1 with pdf.js.
 *
 * Writes the pictures to public/previews/ and the details to src/data/previews.json.
 * A snapshot that came out wrong (a cookie wall, a login page): delete its entry
 * from previews.json and its picture, and that link falls back to no card.
 */
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const CONTENT = path.join(ROOT, 'src/content')
const PUBLIC = path.join(ROOT, 'public')
const OUT = path.join(PUBLIC, 'previews')
const MANIFEST = path.join(ROOT, 'src/data/previews.json')
const WIDTH = 640 // cards are 320px wide; this is enough for 2× screens
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'

const args = process.argv.slice(2)
const force = args.includes('--force')
const onlyAt = args.indexOf('--only')
const only = onlyAt === -1 ? null : args[onlyAt + 1]

// ---------- what to snapshot ----------

async function walk(dir, test) {
  const out = []
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p, test)))
    else if (test(e.name)) out.push(p)
  }
  return out
}

async function externalLinks() {
  const files = await walk(CONTENT, (n) => /\.(md|mdx)$/.test(n))
  const urls = new Set()
  for (const f of files) {
    const text = await fs.readFile(f, 'utf8')
    for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)|href="(https?:\/\/[^"]+)"|<(https?:\/\/[^>\s]+)>/g))
      urls.add((m[1] ?? m[2] ?? m[3]).split('#')[0])
  }
  return [...urls]
}

/** local PDFs, keyed by their path on the site (decoded, as the hover script looks them up) */
async function localPdfs() {
  const files = await walk(PUBLIC, (n) => n.toLowerCase().endsWith('.pdf'))
  return files.map((f) => ({ key: '/' + path.relative(PUBLIC, f).split(path.sep).join('/'), file: f }))
}

// ---------- PDFs ----------

const require = createRequire(import.meta.url)
let pdfjs
async function renderPdf(bytes) {
  pdfjs ??= await import(require.resolve('pdfjs-dist/legacy/build/pdf.mjs'))
  const { createCanvas } = require('@napi-rs/canvas')
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), verbosity: 0 })
  const doc = await task.promise
  const page = await doc.getPage(1)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: WIDTH / base.width })
  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height))
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvasContext: ctx, canvas, viewport }).promise

  // a title: the document's own, else the largest text on page 1
  const info = (await doc.getMetadata().catch(() => null))?.info ?? {}
  let title = String(info.Title ?? '').trim()
  if (!title || /^(microsoft word|untitled|document)\b/i.test(title)) {
    const items = (await page.getTextContent()).items.filter((i) => i.str?.trim())
    const size = (i) => Math.hypot(i.transform[2], i.transform[3])
    const biggest = Math.max(0, ...items.map(size))
    // the largest text, line by line; a title may run over a few lines, but a heading set
    // in the same size as the text below must not run on into it, so stop near 80 characters
    const lines = []
    for (const i of items.filter((i) => size(i) >= biggest * 0.95)) {
      const last = lines.at(-1)
      if (last && Math.abs(last.y - i.transform[5]) < biggest * 0.5) last.text += ' ' + i.str.trim()
      else lines.push({ y: i.transform[5], text: i.str.trim() })
    }
    const clean = (s) => s.replace(/\s+/g, ' ').replace(/^(?:\S )+\S$/, (t) => t.replace(/ /g, '')).trim() // "L I L I A N"
    title = ''
    for (const line of lines.map((l) => clean(l.text))) {
      if (title && (title + ' ' + line).length > 80) break
      title = title ? `${title} ${line}` : line
    }
    title = title.slice(0, 120)
  }
  // a table of contents or the like says nothing; the caller falls back to the file name
  if (/^(contents|table of contents|index|abstract|preface)$/i.test(title)) title = ''
  const png = canvas.toBuffer('image/png')
  const pages = doc.numPages
  await task.destroy()
  return { png, title, pages }
}

// ---------- web pages ----------

let browser
async function page() {
  if (!browser) {
    const { chromium } = await import('playwright')
    try {
      browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
    } catch (e) {
      throw new Error(`no browser for web snapshots; run \`npx playwright install chromium\` once (${e.message.split('\n')[0]})`)
    }
  }
  return browser.newPage({ viewport: { width: 1280, height: 800 }, userAgent: UA, locale: 'en-GB' })
}

async function snapWeb(url) {
  const p = await page()
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await p.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    // best effort: close the usual cookie banners
    for (const name of [/^accept all/i, /^accept/i, /^i agree/i, /^agree/i, /^allow all/i, /^got it/i, /^ok$/i]) {
      const b = p.getByRole('button', { name }).first()
      if (await b.isVisible({ timeout: 300 }).catch(() => false)) {
        await b.click({ timeout: 1000 }).catch(() => {})
        await p.waitForTimeout(500)
        break
      }
    }
    const meta = await p.evaluate(() => {
      const m = (sel) => document.querySelector(sel)?.getAttribute('content')?.trim() || ''
      return {
        title: m('meta[property="og:title"]') || document.title.trim(),
        description: m('meta[property="og:description"]') || m('meta[name="description"]'),
        site: m('meta[property="og:site_name"]'),
      }
    })
    return { png: await p.screenshot({ type: 'png' }), ...meta }
  } finally {
    await p.close()
  }
}

// ---------- main ----------

const slug = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12)
const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8').catch(() => '{}'))
await fs.mkdir(OUT, { recursive: true })

async function save(key, png, entry) {
  const name = `${slug(key)}.webp`
  const { data, info } = await sharp(png)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: 74 })
    .toBuffer({ resolveWithObject: true })
  await fs.writeFile(path.join(OUT, name), data)
  manifest[key] = { ...entry, image: `/previews/${name}`, w: info.width, h: info.height, taken: new Date().toISOString().slice(0, 10) }
}

const wanted = (key) => (only ? key.includes(only) : force || !manifest[key])
let done = 0
const failed = []

for (const { key, file } of await localPdfs()) {
  if (!wanted(key)) continue
  try {
    const { png, title, pages } = await renderPdf(await fs.readFile(file))
    await save(key, png, { kind: 'pdf', title: title || path.basename(key, '.pdf'), pages })
    console.log(`pdf   ${key}`)
    done++
  } catch (e) {
    failed.push(`${key}: ${e.message}`)
  }
}

for (const url of await externalLinks()) {
  if (!wanted(url)) continue
  const site = new URL(url).hostname.replace(/^www\./, '')
  try {
    // a PDF is drawn, anything else photographed
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) })
    const type = res.headers.get('content-type') ?? ''
    if (type.includes('pdf') || /\.pdf$/i.test(new URL(url).pathname)) {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { png, title, pages } = await renderPdf(Buffer.from(await res.arrayBuffer()))
      await save(url, png, { kind: 'pdf', title: title || decodeURIComponent(path.basename(new URL(url).pathname, '.pdf')), pages, site })
    } else {
      res.body?.cancel()
      const { png, title, description, site: name } = await snapWeb(url)
      await save(url, png, { kind: 'page', title: title || site, description, site: name || site })
    }
    console.log(`link  ${url}`)
    done++
  } catch (e) {
    failed.push(`${url}: ${e.message}`)
  }
}

await browser?.close()
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
await fs.writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + '\n')
console.log(`\n${done} snapshot(s) taken, ${Object.keys(sorted).length} in src/data/previews.json`)
if (failed.length) console.log(`could not take ${failed.length}:\n  ` + failed.join('\n  '))
