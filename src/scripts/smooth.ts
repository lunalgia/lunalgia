/**
 * Smooth scrolling (Lenis), on its own requestAnimationFrame loop. GSAP is no
 * longer loaded on every page: only the home page uses it, and it hooks its
 * ScrollTrigger into Lenis itself (see Writings.astro).
 *
 * Wiring that matters:
 * - after a client-side navigation, Lenis is re-synced to wherever the router
 *   left the page (top for a new page, the old position on Back, the target for
 *   a #hash) instead of being forced to the top, which used to undo Back;
 * - wheel events over anything that scrolls on its own (code, wide maths,
 *   tables, panels, link previews) scroll that thing, natively;
 * - Lenis re-measures once fonts and images have settled, since both move
 *   everything below them;
 * - reduced motion: no smoothing at all.
 */
import 'lenis/dist/lenis.css'
import Lenis from 'lenis'

let lenis: Lenis | null = null
const reduced = matchMedia('(prefers-reduced-motion: reduce)')

const start = () => {
  if (lenis || reduced.matches) return
  lenis = new Lenis({
    // the share of the remaining distance covered each frame: 1 is native, 0.1 floaty
    lerp: 0.18,
    wheelMultiplier: 1,
    anchors: true,
    // let nested scrollers (code blocks, wide maths, the media panels) have the wheel
    allowNestedScroll: true,
    prevent: (node) => node.matches?.('pre, .math-display, [data-lenis-prevent]') ?? false,
    // a click on an internal link stops any glide still running
    stopInertiaOnNavigate: true,
    autoRaf: true,
  })
  ;(window as any).__lenis = lenis
  document.dispatchEvent(new Event('lunalgia:lenis'))
}

const settle = () => {
  // fonts and late images shift the layout; measure again once they are in
  const refresh = () => lenis?.resize()
  document.fonts?.ready.then(refresh)
  if (document.readyState !== 'complete') addEventListener('load', refresh, { once: true })
}

document.addEventListener('astro:page-load', () => {
  start()
  // follow the router: it has already put the page where it belongs
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true })
  settle()
})
document.addEventListener('astro:before-swap', () => lenis?.stop())
document.addEventListener('astro:after-swap', () => lenis?.start())

// someone turns on reduced motion mid-visit: hand scrolling back to the browser
reduced.addEventListener?.('change', (e) => {
  if (!e.matches) return start()
  lenis?.destroy()
  lenis = null
  ;(window as any).__lenis = undefined
})
