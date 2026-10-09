import { getCollection, type CollectionEntry } from 'astro:content'
import type { ImageMetadata } from 'astro'
import path from 'node:path'
import sharp from 'sharp'

export type MediaKind = 'books' | 'records' | 'films'
export type MediaEntry = CollectionEntry<'books'> | CollectionEntry<'records'> | CollectionEntry<'films'>

export const KINDS: Record<MediaKind, { one: string; heading: string; shelf: 'book' | 'record' | 'film'; verb: string }> = {
  books: { one: 'book', heading: 'THE BOOKSHELF', shelf: 'book', verb: 'FINISHED' },
  records: { one: 'record', heading: 'THE RECORD SHELF', shelf: 'record', verb: 'ON REPEAT SINCE' },
  films: { one: 'film', heading: 'THE FILM SHELF', shelf: 'film', verb: 'WATCHED' },
}

/** Spine colours for items without one: the site's palette, a few deep, a few pale. */
const PALETTE = ['#11135a', '#2233b8', '#5a5a9a', '#795663', '#d2d3dd', '#efe8d4', '#0b1e4b', '#a297cb', '#1d1d3a', '#c4b8e8']

const hash = (s: string) => {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}

/** dark ink on light spines, light ink on dark ones */
export const inkFor = (hex: string) => {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return lum > 0.6 ? '#11135a' : '#f1eff8'
}

/**
 * Covers by convention: src/content/<kind>/covers/<id>.<jpg|png|webp|avif>.
 * To change a cover, replace that file (or run `npm run covers -- <kind>/<id> ...`).
 * A `cover:` field in the frontmatter still wins, for a file named differently.
 */
const COVER_FILES = import.meta.glob<ImageMetadata>('/src/content/*/covers/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
})
const coverFile = (kind: MediaKind, id: string) => {
  const key = Object.keys(COVER_FILES).find((k) => k.startsWith(`/src/content/${kind}/covers/${id}.`))
  return key ? { meta: COVER_FILES[key], file: path.join(process.cwd(), key) } : undefined
}
export const coverOf = (e: MediaEntry, kind: MediaKind): ImageMetadata | undefined =>
  e.data.cover ?? coverFile(kind, e.id)?.meta

/** a spine colour picked from the cover: a well-represented colour, favouring saturated ones */
const pickColour = async (file: string) => {
  const { data, info } = await sharp(file).resize(96, 96, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>()
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const k = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5)
    const o = buckets.get(k) ?? { n: 0, r: 0, g: 0, b: 0 }
    o.n++, (o.r += r), (o.g += g), (o.b += b)
    buckets.set(k, o)
  }
  const total = data.length / info.channels
  let best: [number, number, number] = [17, 19, 90]
  let bestScore = -1
  for (const o of buckets.values()) {
    const share = o.n / total
    if (share < 0.04) continue
    const [r, g, b] = [o.r / o.n, o.g / o.n, o.b / o.n]
    const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255
    const l = (mx + mn) / 2
    const score = share * (0.35 + (mx - mn) * 2.2) * (l < 0.08 || l > 0.95 ? 0.4 : 1)
    if (score > bestScore) (bestScore = score), (best = [r, g, b])
  }
  // keep spines off pure black and pure white
  const [r, g, b] = best
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  const lift = lum < 0.1 ? 0.1 / Math.max(lum, 0.01) : lum > 0.93 ? 0.93 / lum : 1
  const hex = (v: number) => Math.round(Math.min(255, v * lift)).toString(16).padStart(2, '0')
  return `#${hex(r)}${hex(g)}${hex(b)}`
}
const spineCache = new Map<string, Promise<string>>()
/** `spine:` in the frontmatter, else picked from the cover, else from the palette */
export const spineOf = (e: MediaEntry, kind: MediaKind): Promise<string> => {
  if (e.data.spine) return Promise.resolve(e.data.spine)
  const file = coverFile(kind, e.id)?.file ?? (e.data.cover as any)?.fsPath
  if (!file) return Promise.resolve(PALETTE[hash(e.id) % PALETTE.length])
  if (!spineCache.has(file)) spineCache.set(file, pickColour(file).catch(() => PALETTE[hash(e.id) % PALETTE.length]))
  return spineCache.get(file)!
}

/** spine thickness, stable per item */
export const depthOf = (e: MediaEntry, kind: MediaKind) => {
  const h = hash(e.id + e.data.title)
  // records and films are uniform cases; only books vary
  if (kind === 'records') return 30
  if (kind === 'films') return 32
  return 34 + (h % 30)
}

export async function getMedia(kind: MediaKind): Promise<MediaEntry[]> {
  const all = (await getCollection(kind, ({ data }) => import.meta.env.DEV || !data.draft)) as MediaEntry[]
  return all.sort(
    (a, b) =>
      a.data.order - b.data.order ||
      (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0) ||
      (b.data.year ?? 0) - (a.data.year ?? 0),
  )
}

/** the entry's facts, minus any that just repeat the year */
export const factsOf = (e: MediaEntry): [string, string][] =>
  Object.entries(e.data.meta ?? {})
    .map(([k, v]) => [k, String(v)] as [string, string])
    .filter(([, v]) => v !== String(e.data.year ?? ''))

/** where to listen, read or watch: the entry's own `link` (named after its site) and its other links, listening services first */
export const linksOf = (e: MediaEntry): [string, string][] => {
  const own = e.data.link
  const site = (u: string) =>
    /music\.apple\.com/.test(u) ? 'Apple Music' : /bandcamp\.com/.test(u) ? 'Bandcamp' : /spotify\.com/.test(u) ? 'Spotify' : /letterboxd\.com/.test(u) ? 'Letterboxd' : new URL(u).hostname.replace(/^www\./, '')
  const all: [string, string][] = [...(own ? [[site(own), own] as [string, string]] : []), ...Object.entries(e.data.links ?? {})]
  // places to listen or watch first, in this order, then everything else as written
  const LISTEN = ['Apple Music', 'Spotify', 'YouTube Music', 'Bandcamp', 'Letterboxd']
  const rank = (k: string) => (LISTEN.includes(k) ? LISTEN.indexOf(k) : LISTEN.length)
  return all.map((l, i) => [l, i] as const).sort((a, b) => rank(a[0][0]) - rank(b[0][0]) || a[1] - b[1]).map(([l]) => l)
}

/** plain-text paragraphs from a Markdown body, for previews */
export const paragraphs = (body?: string) =>
  (body ?? '')
    .replace(/^---[\s\S]*?---/, '')
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .replace(/\[\^[^\]]+\]/g, '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_`>#]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((p) => p && !p.startsWith('[^'))

export const words = (body?: string) => paragraphs(body).join(' ').split(/\s+/).filter(Boolean).length

export const whenLabel = (d?: Date) =>
  d ? d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''
