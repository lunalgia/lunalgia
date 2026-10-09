/**
 * Knuth–Plass line breaking for the running text of posts (tex-linebreak, with
 * TeX's US English hyphenation patterns): each paragraph is broken as a whole,
 * minimising uneven spacing, instead of line by line as browsers do.
 *
 * Applied to the post's own paragraphs only, and not to:
 * - the opening paragraph, whose floated drop cap the algorithm cannot see;
 * - paragraphs holding maths, images or code, which are not runs of text.
 * Re-run when the column's width changes (the result is fixed line breaks);
 * undone for printing, where the page width is different. Without JS, the
 * browser's own justification and hyphenation stay in place.
 */
import enUs from 'hyphenation.en-us'
import { createHyphenator, justifyContent, unjustifyContent } from 'tex-linebreak'

const hyphenate = createHyphenator(enUs)

const setup = (text: HTMLElement) => {
  let timer = 0
  const paras = [...text.querySelectorAll<HTMLElement>(':scope > p')].filter(
    (p, i) => i > 0 && !p.querySelector('math, img, code, svg'),
  )
  if (!paras.length) return () => {}

  let width = 0
  // while printing, the layout is left alone: undoing changes the column's height,
  // which the resize watcher would otherwise take as a reason to justify again
  let paused = false
  const run = () => {
    paused = false
    width = text.clientWidth
    paras.forEach((p) => unjustifyContent(p))
    justifyContent(paras, hyphenate)
    paras.forEach((p) => p.classList.add('is-tex'))
  }
  const undo = () => {
    paused = true
    clearTimeout(timer)
    paras.forEach((p) => {
      unjustifyContent(p)
      p.classList.remove('is-tex')
      p.style.removeProperty('white-space') // the library leaves its nowrap behind
    })
  }

  const ro = new ResizeObserver(() => {
    if (paused || text.clientWidth === width) return
    clearTimeout(timer)
    timer = window.setTimeout(run, 120)
  })
  document.fonts?.ready.then(() => {
    run()
    ro.observe(text)
  })
  // printing: undo before the browser lays out the paper, whichever way printing
  // starts (the PRINT buttons, Ctrl+P, or a print media change), redo after
  const printing = matchMedia('print')
  const onMedia = (e: MediaQueryListEvent) => (e.matches ? undo() : setTimeout(run, 300))
  const later = () => setTimeout(run, 300)
  printing.addEventListener('change', onMedia)
  addEventListener('beforeprint', undo)
  addEventListener('afterprint', later)
  document.addEventListener('lunalgia:print', undo)
  return () => {
    ro.disconnect()
    clearTimeout(timer)
    printing.removeEventListener('change', onMedia)
    removeEventListener('beforeprint', undo)
    removeEventListener('afterprint', later)
    document.removeEventListener('lunalgia:print', undo)
  }
}

let teardown: (() => void) | null = null
document.addEventListener('astro:page-load', () => {
  teardown?.()
  const text = document.querySelector<HTMLElement>('.ax__text')
  teardown = text ? setup(text) : null
})
