/**
 * Writing pages: the contents follow you (current part, progress, minutes left),
 * and code blocks get a copy button.
 */
const setup = () => {
  const ax = document.querySelector<HTMLElement>('.ax')
  if (!ax || ax.dataset.ready) return
  ax.dataset.ready = '1'
  const text = ax.querySelector<HTMLElement>('.ax__text')!

  // ---- contents ----
  const items = [...ax.querySelectorAll<HTMLElement>('.toc__list li')]
  const targets = items.map((li) => document.getElementById(li.dataset.target!))
  const bar = ax.querySelector<HTMLElement>('.toc__bar i')
  const left = ax.querySelector<HTMLElement>('.toc__left')
  const minutes = Number(ax.dataset.minutes) || 1
  let raf = 0
  const update = () => {
    raf = 0
    const line = innerHeight * 0.3
    let on = 0
    targets.forEach((t, i) => {
      if (t && t.getBoundingClientRect().top <= line) on = i
    })
    items.forEach((li, i) => li.classList.toggle('is-on', i === on))
    const r = text.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight * 0.6)))
    bar?.style.setProperty('--p', String(p))
    if (left) left.textContent = p > 0.98 ? 'THE END' : `${Math.max(1, Math.ceil(minutes * (1 - p)))} MIN LEFT`
  }
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update)
  }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  update()
  // smooth scrolling to a part, through Lenis when it is running
  ax.querySelectorAll<HTMLAnchorElement>('.toc__list a').forEach((a) =>
    a.addEventListener(
      'click',
      (e) => {
        const el = document.getElementById(a.hash.slice(1))
        const lenis = (window as any).__lenis
        if (!el || !lenis) return
        e.preventDefault()
        e.stopImmediatePropagation()
        lenis.scrollTo(el, { offset: -40, duration: 1.1 })
        history.replaceState(history.state, '', a.hash)
      },
      { capture: true },
    ),
  )

  // ---- print: the button, and fold-out answers printed open ----
  // white for paper, or the site's lavender for a PDF read on screen
  document.querySelectorAll<HTMLElement>('[data-print]').forEach((b) =>
    b.addEventListener('click', async () => {
      // lazy images further down haven't loaded yet and would print blank
      await Promise.all(eager().map((img) => img.decode().catch(() => {})))
      document.documentElement.dataset.print = b.dataset.print
      print()
    }),
  )
  // ---- code: a header with the language, file name and a copy button ----
  text.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
    const box = document.createElement('div')
    box.className = 'codebox'
    const bar = document.createElement('div')
    bar.className = 'codebox__bar'
    const lang = pre.dataset.language && pre.dataset.language !== 'plaintext' ? pre.dataset.language : 'text'
    bar.innerHTML = `<span class="codebox__lang"></span>${pre.dataset.title ? '<span class="codebox__file"></span>' : ''}`
    bar.querySelector('.codebox__lang')!.textContent = lang
    if (pre.dataset.title) bar.querySelector('.codebox__file')!.textContent = pre.dataset.title
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'code-copy'
    b.textContent = 'copy'
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText)
        b.textContent = 'copied'
      } catch {
        b.textContent = 'press ⌘C'
      }
      setTimeout(() => (b.textContent = 'copy'), 1600)
    })
    bar.append(b)
    pre.replaceWith(box)
    box.append(bar, pre)
  })
}
document.addEventListener('astro:page-load', setup)

/** start loading every lazy image in the text */
const eager = () => {
  const imgs = [...document.querySelectorAll<HTMLImageElement>('.ax__text img')]
  imgs.forEach((img) => (img.loading = 'eager'))
  return imgs
}

// fold-out answers can't be opened on paper, so print them open and close them again after
addEventListener('beforeprint', () => {
  eager()
  document.querySelectorAll<HTMLDetailsElement>('.ax__text details:not([open])').forEach((d) => {
    d.open = true
    d.dataset.printOpened = ''
  })
})
addEventListener('afterprint', () => {
  delete document.documentElement.dataset.print
  document.querySelectorAll<HTMLDetailsElement>('.ax__text details[data-print-opened]').forEach((d) => {
    d.open = false
    delete d.dataset.printOpened
  })
})
