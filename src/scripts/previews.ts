/**
 * Link previews, after gwern.net's popups. Only for a mouse; touch screens just
 * follow the link. Two kinds:
 *
 * - Pages of this site, inside a post only: a live, scrollable copy of the
 *   target's text (its title and its article), fetched once and cached. Move
 *   the pointer into the card to scroll it; it stays open while you read.
 * - External links and PDFs, anywhere in running text: a small card from the
 *   snapshots taken by `npm run snapshots` (src/data/previews.json). That index
 *   is loaded on the first hover, not with every page.
 */
type Snapshot = { kind: 'pdf' | 'page'; title: string; description?: string; site?: string; pages?: number; image: string; w: number; h: number }
type Live = { title: string; section: string; body: DocumentFragment }
type Source = { path: string } | { snap: Snapshot }

const OPEN_DELAY = 350
const CLOSE_DELAY = 220
const IN_TEXT = 'p, li, blockquote, td, dd, figcaption, .sidenote__body'
const SKIP = 'nav, footer, .chrome, .row, .lp, [data-no-preview], a[data-footnote-ref], a[data-footnote-backref]'
/** the part of a fetched page worth reading in a card, first match wins */
const CONTENT = ['.ax__text', '.prose', '.rv__main', 'main']
/** never carried into a card */
const STRIP = 'script, style, noscript, nav, footer, .toc, .sidenote, .footnotes, [data-footnotes], button, form, iframe, video, audio'

let snaps: Record<string, Snapshot> | null = null
let snapsLoading: Promise<Record<string, Snapshot>> | null = null
const loadSnaps = () =>
  (snapsLoading ??= import('@/data/previews.json').then((m) => (snaps = m.default as Record<string, Snapshot>)))

const inPost = () => !!document.querySelector('.ax')

const pages = new Map<string, Promise<Live | null>>()
function readPage(path: string): Promise<Live | null> {
  let hit = pages.get(path)
  if (!hit) {
    hit = fetch(path, { headers: { accept: 'text/html' } })
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('text/html') ? r.text() : null))
      .then((html) => {
        if (!html) return null
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const meta = (name: string) => doc.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ?? ''
        const title = meta('preview:title') || doc.title.split(' · ')[0]
        const src = CONTENT.map((s) => doc.querySelector(s)).find(Boolean)
        if (!title || !src) return null
        const body = document.createDocumentFragment()
        const copy = src.cloneNode(true) as HTMLElement
        copy.querySelectorAll(STRIP).forEach((el) => el.remove())
        // ids would collide with this page's; transition names would animate
        copy.querySelectorAll('[id], [data-astro-transition-scope]').forEach((el) => {
          el.removeAttribute('id')
          el.removeAttribute('data-astro-transition-scope')
        })
        copy.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'))
        body.append(...Array.from(copy.childNodes))
        const section = path.split('/').filter(Boolean)[0] ?? 'home'
        return { title, section, body }
      })
      .catch(() => null)
    pages.set(path, hit)
  }
  return hit
}

/** where a link's card comes from; null for no card */
function target(a: HTMLAnchorElement): Source | null | 'maybe-snap' {
  if (a.hasAttribute('download')) return null
  if (!a.closest(IN_TEXT) || a.closest(SKIP)) return null
  let url: URL
  try {
    url = new URL(a.href, location.href)
  } catch {
    return null
  }
  const own = url.origin === location.origin
  // snapshots are keyed by full address (external) or decoded path (files on this site)
  const key = own ? decodeURIComponent(url.pathname) : url.href.split('#')[0]
  if (!snaps) return 'maybe-snap'
  const snap = snaps[key]
  if (snap) return { snap }
  if (!own || a.target === '_blank' || !inPost()) return null
  if (url.pathname === location.pathname) return null // same page, or an in-page anchor
  if (/\.[a-z0-9]{2,5}$/i.test(url.pathname) && !url.pathname.endsWith('.html')) return null // files, the feed
  return { path: url.pathname }
}

let card: HTMLElement | null = null
let current: HTMLAnchorElement | null = null
let openTimer = 0
let closeTimer = 0

function close() {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  current = null
  if (!card) return
  const old = card
  card = null
  old.classList.remove('is-open')
  old.addEventListener('transitionend', () => old.remove(), { once: true })
  setTimeout(() => old.remove(), 400)
}

function place(el: HTMLElement, a: HTMLAnchorElement) {
  const r = a.getClientRects()[0] ?? a.getBoundingClientRect()
  const w = el.offsetWidth
  const h = el.offsetHeight
  const left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12)
  const below = r.bottom + 10
  const top = below + h > innerHeight - 12 && r.top - h - 10 > 12 ? r.top - h - 10 : Math.min(below, innerHeight - h - 12)
  el.style.left = `${left}px`
  el.style.top = `${Math.max(12, top)}px`
}

const p = (cls: string, text: string) => {
  const el = document.createElement('p')
  el.className = cls
  el.textContent = text
  return el
}

function snapCard(s: Snapshot): HTMLElement {
  const el = document.createElement('div')
  el.className = 'lp'
  el.setAttribute('role', 'tooltip')
  const img = document.createElement('img')
  img.className = 'lp__img'
  img.src = s.image
  img.alt = ''
  // snapshots keep their shape, but a tall page shows only its top
  img.style.aspectRatio = String(Math.max(s.w / s.h, 4 / 3))
  el.append(img)
  const pages = s.pages ? `${s.pages} ${s.pages === 1 ? 'page' : 'pages'}` : ''
  const section = s.kind === 'pdf' ? ['pdf', pages, s.site].filter(Boolean).join(' · ') : (s.site ?? '')
  const body = document.createElement('div')
  body.className = 'lp__body'
  body.append(p('lp__k', section), p('lp__t', s.title))
  if (s.description) body.append(p('lp__d', s.description))
  el.append(body)
  return el
}

function liveCard(page: Live, href: string): HTMLElement {
  const el = document.createElement('div')
  el.className = 'lp lp--live'
  el.setAttribute('role', 'dialog')
  el.setAttribute('aria-label', `Preview: ${page.title}`)
  el.dataset.lenisPrevent = '' // the wheel scrolls the card, not the page under it
  const head = document.createElement('div')
  head.className = 'lp__head'
  const open = document.createElement('a')
  open.className = 'lp__open'
  open.href = href
  open.textContent = 'open ↗'
  head.append(p('lp__k', page.section), open)
  const scroller = document.createElement('div')
  scroller.className = 'lp__scroll'
  scroller.tabIndex = 0
  const title = p('lp__t', page.title)
  const text = document.createElement('div')
  text.className = 'lp__text'
  text.append(page.body.cloneNode(true))
  scroller.append(title, text)
  el.append(head, scroller)
  return el
}

async function open(a: HTMLAnchorElement, source: Source) {
  let el: HTMLElement | null = null
  if ('snap' in source) el = snapCard(source.snap)
  else {
    const page = await readPage(source.path)
    if (page) el = liveCard(page, a.href)
  }
  if (!el || current !== a) return
  card?.remove()
  card = el
  el.addEventListener('mouseenter', () => clearTimeout(closeTimer))
  el.addEventListener('mouseleave', () => (closeTimer = window.setTimeout(close, CLOSE_DELAY)))
  document.body.append(el)
  place(el, a)
  // images change the card's height once they arrive: keep it on screen
  el.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => card === el && current === a && place(el, a), { once: true }))
  requestAnimationFrame(() => el.classList.add('is-open'))
}

if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('mouseover', async (e) => {
    const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href]')
    if (!a || a === current) {
      if (a) clearTimeout(closeTimer)
      return
    }
    let source = target(a)
    if (source === 'maybe-snap') {
      current = a
      await loadSnaps()
      if (current !== a) return
      source = target(a)
    }
    if (!source || source === 'maybe-snap') {
      if (current === a) current = null
      return
    }
    close()
    current = a
    openTimer = window.setTimeout(() => open(a, source as Source), OPEN_DELAY)
  })
  document.addEventListener('mouseout', (e) => {
    if (!current) return
    const from = (e.target as Element).closest?.('a[href]')
    if (from !== current) return
    const to = e.relatedTarget as Node | null
    if (to && (current.contains(to) || card?.contains(to))) return
    clearTimeout(openTimer)
    closeTimer = window.setTimeout(close, CLOSE_DELAY)
  })
  document.addEventListener('mousedown', (e) => !card?.contains(e.target as Node) && close())
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close())
  // the page scrolling away from the link closes the card; scrolling inside it does not
  addEventListener('scroll', () => card && close(), { passive: true })
  document.addEventListener('astro:before-swap', close)
}
