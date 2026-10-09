/**
 * Content boxes from plain Markdown blockquotes, so they work in .md and .mdx:
 *
 *   > [!theorem] Cauchy–Schwarz        (the name is optional)
 *   > For all $u, v$ …
 *
 * Kinds: theorem, lemma, proposition, corollary, definition, example,
 * question, answer, proof, remark, pull. Numbered kinds share one counter
 * (Theorem 1, Definition 2, …), done in CSS. An [!answer] straight after a
 * [!question] folds into it behind "show answer".
 *
 * An ordinary quote whose last line starts with "— " or "-- " gets that line
 * styled as the attribution.
 *
 * Sätteri port of the old remark plugin: Sätteri hands plugins read-only nodes,
 * so each top-level blockquote is cloned, rewritten as before, and swapped in.
 */
import { defineMdastPlugin } from 'satteri'

const KINDS = ['theorem', 'lemma', 'proposition', 'corollary', 'definition', 'example', 'question', 'answer', 'proof', 'remark', 'pull']
const TAG = /^\[!(\w+)\][ \t]*/

const text = (value) => ({ type: 'text', value })
const el = (type, hName, className, children = []) => ({ type, data: { hName, ...(className.length ? { hProperties: { className } } : {}) }, children })
const clone = (node) => JSON.parse(JSON.stringify(node))

/** kind of each rewritten box, kept off the node so it never reaches the output */
const kindOf = new WeakMap()

function convert(node) {
  const first = node.children[0]
  const lead = first?.type === 'paragraph' ? first.children[0] : null
  if (!lead || lead.type !== 'text') return attribution(node)
  const m = lead.value.match(TAG)
  if (!m || !KINDS.includes(m[1].toLowerCase())) return attribution(node)
  const kind = m[1].toLowerCase()

  // the rest of the first line is the name (it may hold emphasis or maths); the rest is body
  lead.value = lead.value.slice(m[0].length)
  const nameNodes = []
  const firstRest = []
  let inName = true
  for (const c of first.children) {
    if (!inName) firstRest.push(c)
    else if (c.type === 'text' && c.value.includes('\n')) {
      const i = c.value.indexOf('\n')
      if (c.value.slice(0, i).trim()) nameNodes.push(text(c.value.slice(0, i)))
      if (c.value.slice(i + 1)) firstRest.push(text(c.value.slice(i + 1)))
      inName = false
    } else if (c.type === 'break') inName = false
    else if (!(c.type === 'text' && !c.value.trim())) nameNodes.push(c)
  }
  if (nameNodes[0]?.type === 'text') nameNodes[0].value = nameNodes[0].value.trimStart()

  const body = [...(firstRest.length ? [{ ...first, children: firstRest }] : []), ...node.children.slice(1)]
  const head =
    kind === 'pull' || kind === 'proof'
      ? []
      : [
          el('paragraph', 'p', ['env__h'], [
            el('strong', 'b', ['env__k'], [text(kind)]),
            ...(nameNodes.length ? [el('emphasis', 'i', ['env__name'], nameNodes)] : []),
          ]),
        ]
  if (kind === 'proof' && body[0]?.type === 'paragraph')
    body[0].children.unshift(el('emphasis', 'i', ['env__proof'], [text('Proof.')]), text(' '))
  node.data = { hName: kind === 'pull' ? 'aside' : 'div', hProperties: { className: ['env', `env--${kind}`] } }
  node.children = [...head, ...body]
  kindOf.set(node, kind)
}

/** "— Name" as the last line of a quote becomes its caption */
function attribution(node) {
  const last = node.children.at(-1)
  if (last?.type !== 'paragraph') return
  // "— Name" may start the last line of a longer paragraph, and the name may
  // carry emphasis: split the paragraph at the last line break before a dash
  const kids = last.children
  for (let i = kids.length - 1; i >= 0; i--) {
    const k = kids[i]
    if (k.type !== 'text') continue
    const at = k.value.search(/\n(—|--)\s[^\n]*$/)
    if (at < 0) continue
    const before = k.value.slice(0, at)
    const after = k.value.slice(at + 1)
    last.children = [...kids.slice(0, i), ...(before ? [text(before)] : [])]
    node.children.push({ type: 'paragraph', children: [text(after), ...kids.slice(i + 1)] })
    return attribution(node)
  }
  const lead = kids[0]
  if (lead?.type !== 'text' || !/^(—|--)\s/.test(lead.value)) return
  lead.value = lead.value.replace(/^(—|--)\s+/, '')
  // one box for the whole caption, so a name and an italic title stay one line of text
  last.children = [el('emphasis', 'span', [], kids)]
  last.data = { hName: 'p', hProperties: { className: ['quote__by'] } }
  node.data = { hProperties: { className: ['quote'] } }
}

/** rewrite a cloned subtree in place: nested quotes too */
function rewrite(node) {
  if (node.type === 'blockquote') convert(node)
  if (node.children) node.children.forEach(rewrite)
  return node
}

/** fold an answer into the question right before it */
function fold(q, a) {
  q.children.push({
    type: 'blockquote',
    data: { hName: 'details', hProperties: { className: ['env__ans'] } },
    children: [el('paragraph', 'summary', [], [text('show answer')]), ...a.children.slice(1)],
  })
  return q
}

export const boxes = defineMdastPlugin({
  name: 'lunalgia-boxes',
  before(root, ctx) {
    const visit = (parent) => {
      if (!parent.children) return
      const kids = [...parent.children]
      const done = kids.map((c) => (c.type === 'blockquote' ? rewrite(clone(c)) : null))
      for (let i = 0; i < kids.length; i++) {
        if (kids[i].type !== 'blockquote') {
          visit(kids[i])
          continue
        }
        const next = done[i + 1]
        if (kindOf.get(done[i]) === 'question' && next && kindOf.get(next) === 'answer') {
          ctx.replaceNode(kids[i], fold(done[i], next))
          ctx.removeNode(kids[i + 1])
          i++
        } else ctx.replaceNode(kids[i], done[i])
      }
    }
    visit(root)
  },
})
