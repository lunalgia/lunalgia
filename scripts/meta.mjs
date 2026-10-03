#!/usr/bin/env node
/**
 * Fill in genres, facts and outside links for the media shelves, from Wikidata
 * (with Apple Music and Open Library filling gaps). Writes `genres`, `meta`,
 * `links` and `wikidata` into each entry's frontmatter. Everything it writes
 * is plain YAML you can edit or delete afterwards; it won't overwrite an entry
 * that already has a `wikidata:` line unless you pass --force.
 *
 *   npm run meta                                   every entry without metadata yet
 *   npm run meta -- films                          only films (or books, records)
 *   npm run meta -- books/kafka-on-the-shore       one entry
 *   npm run meta -- books/1984 --qid Q208460       use this Wikidata item (fixes a wrong match)
 *   add --force to redo entries that already have metadata
 *   add --dry to print what would be written without touching files
 *
 * Your own `genres` on an entry are kept; Wikidata's only fill an empty list.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'content')
const KINDS = ['books', 'records', 'films']
const UA = { 'User-Agent': 'lunalgia-meta/1.0 (personal site; https://lunalgia.com)' }
const ORDER = ['title', 'short', 'by', 'year', 'rating', 'favourite', 'liked', 'date', 'genres', 'tags', 'meta', 'links', 'wikidata', 'order', 'warning', 'link', 'cover', 'spine', 'draft']

const args = process.argv.slice(2)
const flag = (n) => {
  const i = args.indexOf(`--${n}`)
  return i === -1 ? undefined : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true
}
const target = args.find((a) => !a.startsWith('--') && a.includes('/'))
const only = args.find((a) => KINDS.includes(a))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function json(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: UA })
    if (res.ok) return res.json()
    if (res.status === 429 || res.status >= 500) await sleep(2000 * (i + 1))
    else throw new Error(`${res.status} for ${url}`)
  }
  throw new Error(`gave up on ${url}`)
}

const norm = (s = '') => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim()
const surname = (by) => norm(by.split(/\s+(?:and|&)\s+/)[0]).split(' ').at(-1)

/* ---------------- Wikidata ---------------- */
const WD = 'https://www.wikidata.org/w/api.php?format=json&origin=*'
const entities = async (ids, props = 'labels|claims|sitelinks') => {
  const out = {}
  for (let i = 0; i < ids.length; i += 50) {
    const r = await json(`${WD}&action=wbgetentities&ids=${ids.slice(i, i + 50).join('|')}&props=${props}&languages=en&sitefilter=enwiki`)
    Object.assign(out, r.entities)
  }
  return out
}
const search = async (q) => (await json(`${WD}&action=query&list=search&srlimit=10&srsearch=${encodeURIComponent(q)}`)).query.search.map((s) => s.title)
const ids = (e, p) => (e.claims?.[p] ?? []).filter((c) => c.rank !== 'deprecated').map((c) => c.mainsnak.datavalue?.value).filter(Boolean)
const qids = (e, p) => ids(e, p).map((v) => v.id).filter(Boolean)
const label = (e) => e?.labels?.en?.value

const FILM = ['Q11424', 'Q506240', 'Q24862', 'Q202866', 'Q93204', 'Q24869'] // film, TV film, short, animated, documentary, feature
const ALBUM = ['Q482994', 'Q208569', 'Q169930', 'Q209939'] // album, studio album, EP, live album
const WORK = ['Q7725634', 'Q47461344', 'Q571', 'Q8261', 'Q1279564', 'Q49084', 'Q112983'] // literary work, written work, book, novel, short story collection, short story, novella

async function findItem(e) {
  if (flag('qid')) return flag('qid')
  const t = norm(e.title)
  let candidates = []
  if (e.kind === 'films') {
    const imdb = await json(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(e.title.toLowerCase())}.json`).catch(() => ({ d: [] }))
    const hit = (imdb.d ?? []).find((x) => ['movie', 'tvMovie'].includes(x.qid) && (norm(x.l) === t || norm(x.l).startsWith(t + ' ')) && (!e.year || Math.abs(x.y - e.year) <= 1))
    if (hit) candidates = await search(`haswbstatement:P345=${hit.id}`)
    if (!candidates.length) candidates = await search(`${e.title} haswbstatement:P57`)
  } else if (e.kind === 'books') {
    candidates = await search(`${e.title} ${e.by} haswbstatement:P50`)
    if (!candidates.length) candidates = await search(`${e.title} haswbstatement:P50`)
  } else {
    candidates = await search(`${e.title} haswbstatement:P175`)
  }
  if (!candidates.length) return null
  const ents = await entities(candidates, 'labels|claims')
  const people = await entities([...new Set(Object.values(ents).flatMap((x) => [...qids(x, 'P50'), ...qids(x, 'P175'), ...qids(x, 'P57')]))], 'labels')
  const by = surname(e.by)
  const score = (x) => {
    const types = qids(x, 'P31')
    const okType = e.kind === 'films' ? types.some((q) => FILM.includes(q)) : e.kind === 'records' ? types.some((q) => ALBUM.includes(q)) : types.some((q) => WORK.includes(q)) && !types.includes('Q3331189')
    if (!okType) return -1
    const who = [...qids(x, 'P50'), ...qids(x, 'P175'), ...qids(x, 'P57')].map((q) => norm(label(people[q])))
    const whoOk = e.kind === 'films' || who.some((w) => w.includes(by) || norm(e.by).includes(w))
    if (!whoOk) return -1
    const lt = norm(label(x))
    return (lt === t ? 3 : lt.startsWith(t) || t.startsWith(lt) ? 2 : 0) + (e.kind === 'books' && types.includes('Q7725634') ? 0.5 : 0)
  }
  const best = candidates.map((q) => [q, score(ents[q])]).filter(([, s]) => s >= 0).sort((a, b) => b[1] - a[1])[0]
  return best?.[0] ?? null
}

/** Wikidata genres that read badly on a shelf */
const SKIP = /^(flashback|hopecore|teen|speculative fiction|.*television program.*|lgbt.*related)$/i
const cleanGenre = (g) =>
  g
    .replace(/ (film|novel|music|album|fiction novel)$/i, '')
    .replace(/^film /i, '')
    .trim()
    .toLowerCase()

const minutes = (v) => {
  const amt = Math.abs(parseFloat(v.amount))
  const unit = v.unit?.split('/').at(-1)
  const m = unit === 'Q11574' ? amt / 60 : unit === 'Q25235' ? amt * 60 : amt // seconds, hours, minutes
  return `${Math.round(m)} min`
}
const monthYear = (v) => {
  const [y, m] = v.time.slice(1, 8).split('-').map(Number)
  if (v.precision >= 10 && m) return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return String(y)
}

const FORMAT = { P345: 'https://www.imdb.com/title/$1/' }
async function formatter(prop) {
  if (FORMAT[prop]) return FORMAT[prop]
  const p = (await entities([prop], 'claims'))[prop]
  const all = ids(p, 'P1630')
  return all.find((f) => !f.includes('toolforge')) ?? all[0]
}

async function fromWikidata(e, qid) {
  const item = (await entities([qid]))[qid]
  if (!item || item.missing !== undefined) throw new Error(`no Wikidata item ${qid}`)
  const P = {
    films: { genre: 'P136', fields: [['runtime', 'P2047'], ['country', 'P495', 2], ['language', 'P364', 2], ['written by', 'P58', 2], ['starring', 'P161', 3], ['music', 'P86', 2], ['cinematography', 'P344', 1]], links: [['IMDb', 'P345'], ['Letterboxd', 'P6127']] },
    books: { genre: 'P136', fields: [['original title', 'P1476'], ['form', 'P7937', 1], ['language', 'P407', 1], ['country', 'P495', 1], ['pages', 'P1104'], ['awards', 'P166', 2]], links: [['Open Library', 'P648'], ['Goodreads', 'P8383']] },
    records: { genre: 'P136', fields: [['released', 'P577'], ['label', 'P264', 2], ['length', 'P2047'], ['tracks', 'P658'], ['producer', 'P162', 2]], links: [['MusicBrainz', 'P436'], ['Rate Your Music', 'P8392']] },
  }[e.kind]
  // labels for every referenced item
  const refs = [...new Set([P.genre, ...P.fields.map((f) => f[1])].flatMap((p) => qids(item, p)))]
  const L = await entities(refs, 'labels')
  const names = (p, n = 9) => qids(item, p).map((q) => label(L[q])).filter((s) => s && !/^Q\d+$/.test(s)).slice(0, n)

  const meta = {}
  for (const [key, p, n] of P.fields) {
    const vals = ids(item, p)
    if (!vals.length) continue
    if (p === 'P2047') meta[key] = minutes(vals[0])
    else if (p === 'P577') meta[key] = monthYear(vals.sort((a, b) => a.time.localeCompare(b.time))[0])
    else if (p === 'P1476') {
      const orig = vals.find((v) => v.language !== 'en') ?? vals[0]
      if (norm(orig.text) !== norm(e.title)) meta[key] = orig.text
    } else if (p === 'P1104') meta[key] = String(Math.round(parseFloat(vals[0].amount)))
    else if (p === 'P658') meta[key] = String(vals.length)
    else {
      const ns = names(p, n)
      if (ns.length) meta[key] = ns.join(', ')
    }
  }
  if (meta.form === 'novel') delete meta.form

  const links = {}
  const wiki = item.sitelinks?.enwiki?.title
  if (wiki) links.Wikipedia = `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.replace(/ /g, '_'))}`
  for (const [name, p] of P.links) {
    const v = ids(item, p)[0]
    const f = v && (await formatter(p))
    if (f) links[name] = f.replace('$1', encodeURIComponent(v).replace(/%2F/g, '/')).replace(/\?mode=all$/, '')
  }
  return { genres: [...new Set(names(P.genre, 8).map(cleanGenre))].filter((g) => !SKIP.test(g)).slice(0, 4), meta, links }
}

/* gaps: page counts from Open Library, album facts from Apple Music */
async function fill(e, out) {
  if (e.kind === 'books' && !out.meta.pages) {
    const r = await json(`https://openlibrary.org/search.json?q=${encodeURIComponent(`${e.title} ${e.by}`)}&limit=8&fields=title,number_of_pages_median,key`).catch(() => null)
    const known = out.links['Open Library']?.match(/OL\d+W/)?.[0]
    const docs = (r?.docs ?? []).filter((x) => !/study guide|summary|analysis|sparknotes/i.test(x.title))
    const d = docs.find((x) => known && x.key.endsWith(known)) ?? docs[0]
    if (d?.number_of_pages_median) out.meta.pages = String(d.number_of_pages_median)
    if (d?.key && !out.links['Open Library']) out.links['Open Library'] = `https://openlibrary.org${d.key}`
  }
  if (e.kind === 'books' && !out.genres.length) {
    const r = await json(`https://itunes.apple.com/search?term=${encodeURIComponent(`${e.title} ${e.by}`)}&entity=ebook&limit=5&country=gb`).catch(() => null)
    const b = r?.results?.find((x) => norm(x.trackName).startsWith(norm(e.title)))
    out.genres = (b?.genres ?? []).filter((g) => !/^(books|fiction & literature)$/i.test(g)).map((g) => g.toLowerCase()).slice(0, 3)
  }
  if (e.kind === 'records' && (!out.meta.tracks || !out.meta.released || !out.meta.label)) {
    // an Apple Music link on the entry pins the exact album
    const am = String(e.data.link ?? '').match(/music\.apple\.com\/.*\/(\d+)/)?.[1]
    const r = am
      ? await json(`https://itunes.apple.com/lookup?id=${am}&country=gb`).catch(() => null)
      : await json(`https://itunes.apple.com/search?term=${encodeURIComponent(`${e.title} ${e.by}`)}&entity=album&limit=10&country=gb`).catch(() => null)
    const a = am ? r?.results?.[0] : r?.results?.find((x) => norm(x.artistName).includes(norm(e.by).split(' ')[0]) && norm(x.collectionName).startsWith(norm(e.title).split(' ').slice(0, 2).join(' ')))
    if (a) {
      out.meta.released ??= new Date(a.releaseDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      out.meta.tracks ??= String(a.trackCount)
      const lab = a.copyright?.replace(/^[℗©]\s*\d{4}\s*/, '').trim()
      // skip DistroKid's placeholder labels ("3972512 Records DK")
      if (lab && !/^\d+ Records DK$/.test(lab) && !out.meta.label) out.meta.label = lab
      if (!out.genres.length && a.primaryGenreName) out.genres = [a.primaryGenreName.toLowerCase()]
    }
  }
  return out
}

/* ---------------- files ---------------- */
async function readEntry(kind, id) {
  const file = path.join(ROOT, kind, `${id}.md`)
  const text = await fs.readFile(file, 'utf8')
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
  const data = yaml.load(m[1]) ?? {}
  return { kind, id, file, data, body: text.slice(m[0].length), title: data.title ?? id, by: data.by ?? '', year: data.year }
}
async function writeEntry(e, data) {
  const out = {}
  for (const k of [...ORDER, ...Object.keys(data)]) if (k in data && !(k in out)) out[k] = data[k]
  for (const k of ['genres', 'tags']) if (Array.isArray(out[k]) && !out[k].length) delete out[k]
  for (const k of ['meta', 'links']) if (out[k] && !Object.keys(out[k]).length) delete out[k]
  const text = `---\n${yaml.dump(out, { lineWidth: 200, flowLevel: 2, quotingType: "'" })}---\n${e.body}`
  if (flag('dry')) return console.log(text.split('\n---\n')[0] + '\n---')
  await fs.writeFile(e.file, text)
}

async function run(e) {
  process.stdout.write(`${e.kind}/${e.id}: `)
  const qid = await findItem(e)
  let out = { genres: [], meta: {}, links: {} }
  if (qid) out = await fromWikidata(e, qid)
  out = await fill(e, out)
  const data = { ...e.data }
  if (!data.genres?.length) data.genres = out.genres
  data.meta = { ...out.meta, ...(flag('force') ? {} : data.meta) }
  data.links = { ...out.links, ...(flag('force') ? {} : data.links) }
  if (qid) data.wikidata = qid
  await writeEntry(e, data)
  console.log(`${qid ?? 'no Wikidata match'} · ${data.genres.join(', ') || 'no genres'} · ${Object.keys(data.meta).join(', ') || 'no facts'}`)
}

if (target) {
  const [kind, id] = target.replace(/\.md$/, '').split('/')
  await run(await readEntry(kind, id))
} else {
  for (const kind of only ? [only] : KINDS) {
    for (const f of (await fs.readdir(path.join(ROOT, kind))).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
      const e = await readEntry(kind, f.slice(0, -3))
      if (e.data.wikidata && !flag('force')) continue
      await run(e).catch((err) => console.log(`failed: ${err.message}`))
      await sleep(300)
    }
  }
}
