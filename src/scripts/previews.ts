/**
 * Link previews, after gwern.net's popups.
 *
 * Hovering a link to another page of this site (in running text, not in menus
 * or lists of rows that already say what they point at) opens a small card
 * with that page's title, description and picture. The page is fetched once
 * and read from its <head>: `preview:title`, `description`, `preview:image`
 * (see Base.astro). Only for a mouse; touch screens just follow the link.
 */
const OPEN_DELAY = 350
const CLOSE_DELAY = 180
const IN_TEXT = 'p, li, blockquote, td, dd, figcaption, .sidenote__body'
const SKIP = 'nav, footer, .chrome, .row, .lp, [data-no-preview], a[data-footnote-ref], a[data-footnote-backref]'

type Preview = { title: string; description: string; image?: string; section: string }

const cache = new Map<string, Promise<Preview | null>>()

function read(path: string): Promise<Preview | null> {
  let hit = cache.get(path)
  if (!hit) {
    hit = fetch(path, { headers: { accept: 'text/html' } })
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('text/html') ? r.text() : null))
      .then((html) => {
        if (!html) return null
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const meta = (name: string) => doc.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ?? ''
        const title = meta('preview:title') || doc.title.split(' · ')[0]
        if (!title) return null
        const section = path.split('/').filter(Boolean)[0] ?? 'home'
        return { title, description: meta('description'), image: meta('preview:image') || undefined, section }
      })
      .catch(() => null)
    cache.set(path, hit)
  }
  return hit
}

/** the link's path if it points at another page of this site worth previewing */
function target(a: HTMLAnchorElement): string | null {
  if (a.target === '_blank' || a.hasAttribute('download')) return null
  if (!a.closest(IN_TEXT) || a.closest(SKIP)) return null
  let url: URL
  try {
    url = new URL(a.href, location.href)
  } catch {
    return null
  }
  if (url.origin !== location.origin) return null
  if (url.pathname === location.pathname) return null // same page, or an in-page anchor
  if (/\.[a-z0-9]{2,5}$/i.test(url.pathname) && !url.pathname.endsWith('.html')) return null // files, the feed
  return url.pathname
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
  const top = below + h > innerHeight - 12 && r.top - h - 10 > 12 ? r.top - h - 10 : below
  el.style.left = `${left}px`
  el.style.top = `${top}px`
}

function build(p: Preview): HTMLElement {
  const el = document.createElement('div')
  el.className = 'lp'
  el.setAttribute('role', 'tooltip')
  if (p.image) {
    const img = document.createElement('img')
    img.className = 'lp__img'
    img.src = p.image
    img.alt = ''
    el.append(img)
  }
  const body = document.createElement('div')
  body.className = 'lp__body'
  const k = document.createElement('p')
  k.className = 'lp__k'
  k.textContent = p.section
  const t = document.createElement('p')
  t.className = 'lp__t'
  t.textContent = p.title
  body.append(k, t)
  if (p.description) {
    const d = document.createElement('p')
    d.className = 'lp__d'
    d.textContent = p.description
    body.append(d)
  }
  el.append(body)
  el.addEventListener('mouseenter', () => clearTimeout(closeTimer))
  el.addEventListener('mouseleave', () => (closeTimer = window.setTimeout(close, CLOSE_DELAY)))
  return el
}

async function open(a: HTMLAnchorElement, path: string) {
  const p = await read(path)
  if (!p || current !== a) return
  card?.remove()
  card = build(p)
  document.body.append(card)
  place(card, a)
  card.querySelector('img')?.addEventListener('load', () => card && current === a && place(card, a))
  requestAnimationFrame(() => card?.classList.add('is-open'))
}

if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener('mouseover', (e) => {
    const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href]')
    if (!a || a === current) {
      if (a) clearTimeout(closeTimer)
      return
    }
    const path = target(a)
    if (!path) return
    close()
    current = a
    openTimer = window.setTimeout(() => open(a, path), OPEN_DELAY)
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
  addEventListener('scroll', () => card && close(), { passive: true })
  document.addEventListener('astro:before-swap', close)
}
