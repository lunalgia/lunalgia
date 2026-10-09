/**
 * Smooth scrolling (Lenis), driven by GSAP's ticker so ScrollTrigger-driven
 * animations read the same scroll position on the same frame.
 *
 * Wiring that matters:
 * - after a client-side navigation, Lenis is re-synced to wherever the router
 *   left the page (top for a new page, the old position on Back, the target for
 *   a #hash) instead of being forced to the top, which used to undo Back;
 * - wheel events over anything that scrolls on its own (code, wide maths,
 *   tables, panels) scroll that thing, natively;
 * - ScrollTrigger re-measures once fonts and images have settled, since both
 *   move everything below them;
 * - reduced motion: no smoothing at all.
 */
import 'lenis/dist/lenis.css'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
const tick = (t: number) => lenis?.raf(t * 1000)
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
    autoRaf: false,
  })
  ;(window as any).__lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  // keep GSAP from "catching up" after a dropped frame, so scroll and animation never drift
  gsap.ticker.lagSmoothing(0)
}

const settle = () => {
  // fonts and late images shift the layout; measure again once they are in
  const refresh = () => {
    lenis?.resize()
    ScrollTrigger.refresh()
  }
  document.fonts?.ready.then(refresh)
  if (document.readyState !== 'complete') addEventListener('load', refresh, { once: true })
}

document.addEventListener('astro:page-load', () => {
  start()
  // follow the router: it has already put the page where it belongs
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true })
  ScrollTrigger.refresh()
  settle()
})
document.addEventListener('astro:before-swap', () => {
  lenis?.stop()
  ScrollTrigger.getAll().forEach((t) => t.kill())
})
document.addEventListener('astro:after-swap', () => lenis?.start())

// someone turns on reduced motion mid-visit: hand scrolling back to the browser
reduced.addEventListener?.('change', (e) => {
  if (!e.matches) return start()
  gsap.ticker.remove(tick)
  lenis?.destroy()
  lenis = null
  ;(window as any).__lenis = undefined
})
