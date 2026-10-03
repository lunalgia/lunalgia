/**
 * Smooth scrolling (Lenis) wired into GSAP's ticker so ScrollTrigger-driven
 * animations stay in step with it. Off for anyone who prefers reduced motion.
 */
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

const start = () => {
  if (lenis || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, anchors: true })
  ;(window as any).__lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

document.addEventListener('astro:page-load', () => {
  start()
  lenis?.scrollTo(0, { immediate: true })
  ScrollTrigger.refresh()
})
document.addEventListener('astro:before-swap', () => {
  ScrollTrigger.getAll().forEach((t) => t.kill())
})
