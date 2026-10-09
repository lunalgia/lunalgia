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
  const paras = [...text.querySelectorAll<HTMLElement>(':scope > p')].filter(
    (p, i) => i > 0 && !p.querySelector('math, img, code, svg'),
  )
  if (!paras.length) return () => {}

  let width = 0
  const run = () => {
    width = text.clientWidth
    paras.forEach((p) => unjustifyContent(p))
    justifyContent(paras, hyphenate)
    paras.forEach((p) => p.classList.add('is-tex'))
  }
  const undo = () => {
    paras.forEach((p) => {
      unjustifyContent(p)
      p.classList.remove('is-tex')
    })
    width = 0
  }

  let timer = 0
  const ro = new ResizeObserver(() => {
    if (text.clientWidth === width) return
    clearTimeout(timer)
    timer = window.setTimeout(run, 120)
  })
  document.fonts?.ready.then(() => {
    run()
    ro.observe(text)
  })
  addEventListener('beforeprint', undo)
  addEventListener('afterprint', run)
  return () => {
    ro.disconnect()
    clearTimeout(timer)
    removeEventListener('beforeprint', undo)
    removeEventListener('afterprint', run)
  }
}

let teardown: (() => void) | null = null
document.addEventListener('astro:page-load', () => {
  teardown?.()
  const text = document.querySelector<HTMLElement>('.ax__text')
  teardown = text ? setup(text) : null
})
