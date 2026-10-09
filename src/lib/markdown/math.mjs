/**
 * $…$ and $$…$$ to MathML at build time with Temml: no stylesheet or script for
 * the reader to download, and the browser's own math layout with our math font
 * (see src/styles/math.css). Display maths is wrapped so it can scroll sideways
 * on a phone instead of widening the page.
 */
import { defineMdastPlugin } from 'satteri'
import temml from 'temml'

/** \newcommand-style shorthands shared by every page */
const macros = {
  '\\R': '\\mathbb{R}',
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\Q': '\\mathbb{Q}',
  '\\C': '\\mathbb{C}',
}

/**
 * Unicode has double-struck letters for only five Greek letters, so Temml sets
 * \mathbb{\Delta} as a plain Delta. Mark it instead, and math.css draws it in
 * DSSerif's Greek, as LaTeX's dsserif would.
 */
const GREEK = /\\mathbb\{\s*((?:\\(?:var)?(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega)\s*)+)\}/g
const prepare = (tex) => tex.replace(GREEK, (_, g) => `\\class{mathbb-greek}{${g.replace(/\s+/g, '')}}`)

const render = (tex, displayMode, ctx, node) => {
  try {
    return temml.renderToString(prepare(tex), {
      displayMode,
      throwOnError: false,
      macros: { ...macros },
      // only our own \class{mathbb-greek}; \href and friends stay off
      trust: (c) => c.command === '\\class' && c.class === 'mathbb-greek',
    })
  } catch (e) {
    ctx.report({ message: `math: failed on \`${tex}\`: ${e instanceof Error ? e.message : e}`, node, severity: 'warning' })
  }
}

export const math = defineMdastPlugin({
  name: 'lunalgia-math',
  inlineMath(node, ctx) {
    const value = render(node.value, false, ctx, node)
    if (value) return { type: 'html', value }
  },
  math(node, ctx) {
    const value = render(node.value, true, ctx, node)
    if (value) return { type: 'html', value: `<div class="math-display">${value}</div>` }
  },
})
