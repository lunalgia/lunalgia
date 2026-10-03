#!/usr/bin/env node
/**
 * Fetch covers for the media shelves.
 *
 * Covers live at src/content/<kind>/covers/<id>.<ext>, where <id> is the
 * Markdown file's name. The site picks them up by that name, and the spine
 * colour is taken from the cover at build time. To override a cover by hand,
 * just replace that file.
 *
 *   npm run covers                                 every entry that has no cover yet
 *   npm run covers -- films --force                refetch every film (or books, records)
 *   npm run covers -- books/kafka-on-the-shore     refetch one (best match)
 *   npm run covers -- books/kafka-on-the-shore --list      show the candidates
 *   npm run covers -- books/kafka-on-the-shore --pick 3    use candidate 3 from --list
 *   npm run covers -- books/1984 --isbn 9780141036144      a specific edition (books)
 *   npm run covers -- films/dune --url https://…/poster.jpg   any image
 *   add --store us (or gb, in, fr…) to search another Apple store; default gb
 *
 * Sources: Apple Books (books), Apple Music (records), IMDb posters (films),
 * with Open Library and Wikipedia as fallbacks. All are free and keyless.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'content')
const KINDS = ['books', 'records', 'films']
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif']
const UA = { 'User-Agent': 'lunalgia-covers/1.0 (personal site)' }

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : (args[i + 1] ?? true)
}
const target = args.find((a) => !a.startsWith('--') && a.includes('/'))
const only = args.find((a) => KINDS.includes(a))
const store = flag('store') ?? 'gb'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: UA })
    if (res.ok) return res
    if (res.status === 429 || res.status >= 500) await sleep(1500 * (i + 1))
    else throw new Error(`${res.status} for ${url}`)
  }
  throw new Error(`gave up on ${url}`)
}
const json = async (url) => (await get(url)).json()

/** frontmatter fields we need: title, by, year */
async function readEntry(kind, id) {
  const text = await fs.readFile(path.join(ROOT, kind, `${id}.md`), 'utf8')
  const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const field = (k) => fm.match(new RegExp(`^${k}:\\s*['"]?(.*?)['"]?\\s*$`, 'm'))?.[1]?.replace(/''/g, "'")
  return { kind, id, title: field('title') ?? id, by: field('by') ?? '', year: Number(field('year')) || undefined }
}

const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N} ]/gu, '').trim()
const surname = (by) => norm(by.split(/\s+(?:and|&)\s+/)[0]).split(' ').at(-1) ?? ''
const JUNK = /study guide|summary|analysis|sparknotes|cliffsnotes|lessons inspired|reading .* ['’]|screenplay|workbook|quiz/i
const big = (art, w, h) => art.replace(/\/\d+x\d+bb\.(jpg|png)$/, `/${w}x${h}bb.jpg`)

/** candidates, best first: [{ label, url }] */
async function candidates(e) {
  const out = []
  const term = encodeURIComponent(`${e.title} ${e.by.split(/\s+(?:and|&)\s+/)[0]}`)
  const sn = surname(e.by)
  const t = norm(e.title)
  if (e.kind === 'books') {
    const isbn = flag('isbn')
    if (isbn) {
      const r = await json(`https://itunes.apple.com/lookup?isbn=${isbn}&country=${store}`).catch(() => ({ results: [] }))
      for (const x of r.results) out.push({ label: `Apple Books ISBN ${isbn}: ${x.trackName}`, url: big(x.artworkUrl100, 1200, 1800) })
      out.push({ label: `Open Library ISBN ${isbn}`, url: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false` })
    }
    const r = await json(`https://itunes.apple.com/search?term=${term}&entity=ebook&limit=25&country=${store}`)
    for (const x of r.results)
      if (!JUNK.test(x.trackName) && norm(x.artistName).includes(sn) && norm(x.trackName).includes(t.split(' ').slice(0, 3).join(' ')))
        out.push({ label: `Apple Books: ${x.trackName} (${x.artistName}, ${x.releaseDate?.slice(0, 4)})`, url: big(x.artworkUrl100, 1200, 1800) })
    const ol = await json(`https://openlibrary.org/search.json?title=${encodeURIComponent(e.title)}&author=${encodeURIComponent(e.by)}&language=eng&limit=5&fields=title,cover_i,first_publish_year`).catch(() => ({ docs: [] }))
    for (const d of ol.docs) if (d.cover_i) out.push({ label: `Open Library: ${d.title}`, url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` })
  }
  if (e.kind === 'records') {
    const r = await json(`https://itunes.apple.com/search?term=${term}&entity=album&limit=15&country=${store}`)
    for (const x of r.results)
      if (norm(x.artistName).includes(norm(e.by).split(' ')[0]))
        out.push({ label: `Apple Music: ${x.collectionName} (${x.artistName}, ${x.releaseDate?.slice(0, 4)})`, url: big(x.artworkUrl100, 1400, 1400) })
  }
  if (e.kind === 'films') {
    // IMDb's search suggestions carry the full-size poster (no key needed)
    const q = encodeURIComponent(e.title.toLowerCase())
    const r = await json(`https://v3.sg.media-imdb.com/suggestion/x/${q}.json`).catch(() => ({ d: [] }))
    for (const x of r.d ?? [])
      if (['movie', 'tvMovie'].includes(x.qid) && x.i?.imageUrl && (norm(x.l) === t || norm(x.l).startsWith(t + ' ')) && (!e.year || Math.abs(x.y - e.year) <= 1))
        out.push({ label: `IMDb: ${x.l} (${x.y}, ${x.id})`, url: x.i.imageUrl.replace(/\._V1_\.jpg$/, '._V1_QL90_UX1200_.jpg') })
    for (const page of [`${e.title} (${e.year} film)`, `${e.title} (film)`, e.title]) {
      const s = await json(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.replace(/ /g, '_'))}`).catch(() => null)
      if (s?.originalimage?.source && /film/i.test(s.description ?? '')) {
        out.push({ label: `Wikipedia: ${s.title}`, url: s.originalimage.source })
        break
      }
    }
  }
  return out
}

async function save(e, url) {
  const res = await get(url)
  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) throw new Error(`not an image (${type}): ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 4000) throw new Error(`image too small (${buf.length} bytes), probably a placeholder`)
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'
  const dir = path.join(ROOT, e.kind, 'covers')
  await fs.mkdir(dir, { recursive: true })
  for (const x of EXTS) await fs.rm(path.join(dir, `${e.id}.${x}`), { force: true })
  await fs.writeFile(path.join(dir, `${e.id}.${ext}`), buf)
  // an explicit cover: line would shadow the new file
  const md = path.join(ROOT, e.kind, `${e.id}.md`)
  const text = await fs.readFile(md, 'utf8')
  await fs.writeFile(md, text.replace(/^cover:.*\n/m, ''))
  console.log(`  saved ${e.kind}/covers/${e.id}.${ext} (${Math.round(buf.length / 1024)} kB)`)
}

async function hasCover(kind, id) {
  for (const x of EXTS) if (await fs.access(path.join(ROOT, kind, 'covers', `${id}.${x}`)).then(() => true, () => false)) return true
  return false
}

async function run(e) {
  console.log(`${e.kind}/${e.id}: ${e.title}, ${e.by}`)
  const url = flag('url')
  if (url) return save(e, url)
  const list = await candidates(e)
  if (!list.length) return console.log('  no candidates found; try --store us, --isbn, or --url')
  if (flag('list')) return list.forEach((c, i) => console.log(`  ${i + 1}. ${c.label}\n     ${c.url}`))
  const pick = Number(flag('pick') ?? 1)
  for (const c of list.slice(pick - 1)) {
    try {
      console.log(`  using: ${c.label}`)
      return await save(e, c.url)
    } catch (err) {
      console.log(`  ${err.message}; trying the next one`)
    }
  }
}

if (target) {
  const [kind, id] = target.replace(/\.md$/, '').split('/')
  if (!KINDS.includes(kind)) throw new Error(`kind must be one of ${KINDS.join(', ')}`)
  await run(await readEntry(kind, id))
} else {
  for (const kind of only ? [only] : KINDS) {
    for (const f of (await fs.readdir(path.join(ROOT, kind))).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
      const id = f.slice(0, -3)
      if (!flag('force') && (await hasCover(kind, id))) continue
      await run(await readEntry(kind, id)).catch((err) => console.log(`  failed: ${err.message}`))
      await sleep(400)
    }
  }
}
