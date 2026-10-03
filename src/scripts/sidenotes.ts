/**
 * Sidenotes, after gwern.net/sidenote and The Latecomer.
 *
 * The page ships ordinary footnotes (they work without JS and in reader mode).
 * On wide screens each note is copied into the margin column beside its
 * reference; notes stack so they never overlap, and long ones start folded.
 * On narrow screens a tapped reference opens its note in a card under the line.
 * Clicking a reference never jumps the page.
 */
const WIDE = '(min-width: 1180px)'
const LONG_NOTE = 220
const GAP = 18

type Note = { ref: HTMLAnchorElement; li: HTMLElement; aside: HTMLElement; n: string }

function noteBody(li: HTMLElement): DocumentFragment {
  const frag = document.createDocumentFragment()
  for (const child of li.children) frag.append(child.cloneNode(true))
  frag.querySelectorAll('[data-footnote-backref]').forEach((a) => a.remove())
  frag.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
  return frag
}

function setup(article: HTMLElement) {
  const refs = [...article.querySelectorAll<HTMLAnchorElement>('a[data-footnote-ref]')]
  const rail = article.querySelector<HTMLElement>('.sidenote-rail')
  if (!refs.length || !rail) return () => {}

  const notes: Note[] = refs.flatMap((ref) => {
    const li = document.getElementById(decodeURIComponent(ref.hash.slice(1)))
    if (!li) return []
    const n = ref.textContent?.trim() ?? ''
    const aside = document.createElement('aside')
    aside.className = 'sidenote'
    aside.setAttribute('aria-hidden', 'true')
    aside.innerHTML = `<span class="sidenote__no">${n}</span><div class="sidenote__body"></div>`
    aside.querySelector('.sidenote__body')!.append(noteBody(li))
    return [{ ref, li, aside, n }]
  })

  const light = (note: Note, on: boolean) => {
    note.ref.classList.toggle('is-active', on)
    note.aside.classList.toggle('is-active', on)
  }
  for (const note of notes)
    for (const el of [note.ref, note.aside]) {
      el.addEventListener('mouseenter', () => light(note, true))
      el.addEventListener('mouseleave', () => light(note, false))
    }

  const mq = matchMedia(WIDE)
  const layout = () => {
    const wide = mq.matches
    article.classList.toggle('has-sidenotes', wide)
    if (!wide) return notes.forEach(({ aside }) => aside.remove())
    const top0 = rail.getBoundingClientRect().top
    let floor = -Infinity
    for (const note of notes) {
      const { ref, aside } = note
      if (!aside.isConnected) rail.append(aside)
      if (!aside.dataset.measured) {
        aside.dataset.measured = '1'
        if (aside.offsetHeight > LONG_NOTE) {
          aside.classList.add('is-collapsed')
          const more = document.createElement('button')
          more.type = 'button'
          more.className = 'sidenote__more'
          more.textContent = 'more'
          more.addEventListener('click', () => {
            more.textContent = aside.classList.toggle('is-collapsed') ? 'more' : 'less'
            layout()
          })
          aside.append(more)
        }
      }
      const anchor = ref.getBoundingClientRect().top - top0 - 3
      const top = Math.max(anchor, floor + GAP)
      aside.style.top = `${top}px`
      floor = top + aside.offsetHeight
    }
  }

  // ---- clicks: never jump; flash the margin note, or open a card on phones ----
  let pop: HTMLElement | null = null
  const closePop = () => {
    pop?.remove()
    pop = null
    notes.forEach((n) => light(n, false))
  }
  const onRefClick = (e: MouseEvent) => {
    const note = notes.find((x) => x.ref === e.currentTarget)
    if (!note) return
    // stop here so smooth-scroll libraries don't treat it as an anchor jump
    e.preventDefault()
    e.stopImmediatePropagation()
    if (mq.matches) {
      note.aside.classList.remove('is-flash')
      void note.aside.offsetWidth
      note.aside.classList.add('is-flash')
      return
    }
    const wasOpen = pop?.dataset.n === note.n
    closePop()
    if (wasOpen) return
    pop = document.createElement('div')
    pop.className = 'fn-pop'
    pop.dataset.n = note.n
    pop.setAttribute('role', 'note')
    pop.innerHTML = `<div class="fn-pop__head"><span class="sidenote__no">${note.n}</span><button type="button" class="sidenote__more">close</button></div><div class="sidenote__body"></div>`
    pop.querySelector('.sidenote__body')!.append(noteBody(note.li))
    pop.querySelector('button')!.addEventListener('click', closePop)
    article.append(pop)
    const box = article.getBoundingClientRect()
    const rr = note.ref.getBoundingClientRect()
    const width = pop.offsetWidth
    pop.style.left = `${Math.min(Math.max(8, rr.left - box.left - width / 2), box.width - width - 8)}px`
    pop.style.top = `${rr.bottom - box.top + 10}px`
    light(note, true)
  }
  // capture phase, so this runs before any document-level anchor handler
  notes.forEach(({ ref }) => ref.addEventListener('click', onRefClick, { capture: true }))
  const onDocClick = (e: MouseEvent) => {
    if (pop && !pop.contains(e.target as Node) && !(e.target as Element).closest?.('a[data-footnote-ref]')) closePop()
  }
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePop()
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)

  let raf = 0
  const schedule = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(layout)
  }
  const ro = new ResizeObserver(schedule)
  ro.observe(article)
  mq.addEventListener('change', schedule)
  document.fonts?.ready.then(schedule)
  article.querySelectorAll('img').forEach((img) => img.addEventListener('load', schedule))
  layout()

  return () => {
    ro.disconnect()
    mq.removeEventListener('change', schedule)
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
  }
}

let teardown: (() => void) | null = null
document.addEventListener('astro:page-load', () => {
  teardown?.()
  const article = document.querySelector<HTMLElement>('[data-sidenotes]')
  teardown = article ? setup(article) : null
})
