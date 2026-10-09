/**
 * Every parenthetical in running text gets `data-parenthetical`, so CSS can set
 * it a step quieter than the sentence around it (after enscribe.dev).
 *
 * Works on the HTML tree, so a parenthetical may hold emphasis, links, maths or
 * a footnote mark. Only the outermost pair is wrapped; a "(" straight after a
 * letter or digit is a function call or similar, f(x), and is left alone along
 * with its ")". Unbalanced brackets, and pairs whose two halves sit in different
 * elements, are left as they are.
 */
import { defineHastPlugin } from 'satteri'

/** blocks of running text: each is rewritten as a whole */
const PROSE = new Set(['p', 'li', 'dd', 'dt', 'td', 'th', 'figcaption'])
/** never look inside these */
const SKIP = new Set(['code', 'pre', 'kbd', 'samp', 'script', 'style', 'math', 'svg', 'textarea'])
const WORDISH = /[\p{L}\p{N}]/u

const clean = (node) =>
  JSON.parse(JSON.stringify(node, (k, v) => (k.startsWith('_') || k === 'position' ? undefined : v)))

/** outermost balanced pairs among `children`: [startChild, startOffset, endChild, endOffset] */
function pairs(children) {
  const out = []
  const stack = [] // { i, o, ok }
  let prev = ''
  children.forEach((c, i) => {
    if (c.type !== 'text') {
      prev = c.type === 'element' ? 'x' : prev // an element ends in "something"
      return
    }
    for (let o = 0; o < c.value.length; o++) {
      const ch = c.value[o]
      if (ch === '(') stack.push({ i, o, ok: !WORDISH.test(prev) })
      else if (ch === ')' && stack.length) {
        const open = stack.pop()
        if (open.ok && !stack.some((s) => s.ok)) out.push([open.i, open.o, i, o])
      }
      prev = ch
    }
  })
  return out
}

/** split the text child at `i` before offset `o`; returns the index of the part from `o` on */
function splitAt(children, i, o) {
  const t = children[i]
  if (o <= 0) return i
  if (o >= t.value.length) return i + 1
  children.splice(i, 1, { type: 'text', value: t.value.slice(0, o) }, { type: 'text', value: t.value.slice(o) })
  return i + 1
}

/** rewrite a cleaned subtree in place; returns whether anything changed */
function transform(node) {
  if (node.type !== 'element' && node.type !== 'root') return false
  if (node.type === 'element' && (SKIP.has(node.tagName) || node.properties?.dataNoParen !== undefined)) return false
  let changed = false
  for (const c of node.children ?? []) changed = transform(c) || changed
  const kids = node.children ?? []
  const found = pairs(kids)
  for (const [si, so, ei, eo] of found.reverse()) {
    let e = splitAt(kids, ei, eo + 1)
    const before = kids.length
    const s = splitAt(kids, si, so)
    if (kids.length > before) e++
    const inner = kids.splice(s, e - s)
    kids.splice(s, 0, { type: 'element', tagName: 'span', properties: { dataParenthetical: '' }, children: inner })
    changed = true
  }
  return changed
}

export const parentheticals = defineHastPlugin({
  name: 'lunalgia-parentheticals',
  before(root, ctx) {
    const visit = (node) => {
      if (node.type !== 'element' && node.type !== 'root') return
      if (node.type === 'element' && SKIP.has(node.tagName)) return
      if (node.type === 'element' && PROSE.has(node.tagName)) {
        const copy = clean(node)
        if (transform(copy)) ctx.replaceNode(node, copy)
        return
      }
      for (const c of node.children ?? []) visit(c)
    }
    visit(root)
  },
})
