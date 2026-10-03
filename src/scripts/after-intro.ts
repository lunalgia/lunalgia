/**
 * Heavy setup work on the home page (splitting the letter into lines, sorting
 * the lily's pixels) waits until the hero has finished drawing, then runs in
 * small slices during idle time, so it never stalls an animation.
 */
const DONE = 'heroDone'

/** called by the hero when its drawing has finished (or was skipped) */
export function markIntroDone() {
  document.documentElement.dataset[DONE] = '1'
  document.dispatchEvent(new Event('lunalgia:intro-done'))
}

/** called by the hero when it starts drawing */
export function markIntroRunning() {
  document.documentElement.dataset[DONE] = '0'
}

/** resolves once the hero is done (immediately on pages without one, or after 8s at most) */
export function afterIntro(): Promise<void> {
  return new Promise((resolve) => {
    if (document.documentElement.dataset[DONE] !== '0') return resolve()
    const go = () => {
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(go, 8000)
    document.addEventListener('lunalgia:intro-done', go, { once: true })
  })
}

type Deadline = { timeRemaining: () => number }
const idle: (f: (d: Deadline) => void) => void =
  typeof requestIdleCallback === 'function'
    ? (f) => requestIdleCallback(f, { timeout: 400 })
    : (f) => setTimeout(() => f({ timeRemaining: () => 8 }), 16)

/** a function run once, in an idle moment */
export const whenIdle = (f: () => void) => idle(() => f())

/**
 * Run a generator in idle-time slices of a few milliseconds each; every
 * `yield` is a point where the work may pause until the next idle moment.
 */
export function inSlices(work: Generator<unknown, void>): Promise<void> {
  return new Promise((resolve) => {
    const step = (d: Deadline) => {
      const end = performance.now() + Math.min(Math.max(d.timeRemaining(), 4), 12)
      while (performance.now() < end) if (work.next().done) return resolve()
      idle(step)
    }
    idle(step)
  })
}
