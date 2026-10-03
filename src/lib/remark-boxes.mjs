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
 */
const KINDS = ['theorem', 'lemma', 'proposition', 'corollary', 'definition', 'example', 'question', 'answer', 'proof', 'remark', 'pull']
const TAG = /^\[!(\w+)\][ \t]*/

const text = (value) => ({ type: 'text', value })
const el = (type, hName, className, children = []) => ({ type, data: { hName, hProperties: { className } }, children })

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
    kind === 'pull'
      ? []
      : kind === 'proof'
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
  node.kind = kind
}

/** "— Name" as the last line of a quote becomes its caption */
function attribution(node) {
  const last = node.children.at(-1)
  const lead = last?.type === 'paragraph' ? last.children[0] : null
  if (!lead || lead.type !== 'text') return
  // the dash may also start the last line of a longer paragraph
  const lines = lead.value.split('\n')
  if (last.children.length === 1 && lines.length > 1 && /^(—|--)\s/.test(lines.at(-1))) {
    lead.value = lines.slice(0, -1).join('\n')
    node.children.push({ type: 'paragraph', children: [text(lines.at(-1))] })
    return attribution(node)
  }
  if (!/^(—|--)\s/.test(lead.value)) return
  lead.value = lead.value.replace(/^(—|--)\s+/, '')
  last.data = { hName: 'p', hProperties: { className: ['quote__by'] } }
  node.data = { hProperties: { className: ['quote'] } }
}

function walk(parent) {
  if (!parent.children) return
  for (const child of parent.children) {
    if (child.type === 'blockquote') convert(child)
    walk(child)
  }
  // fold an answer into the question right before it
  for (let i = parent.children.length - 1; i > 0; i--) {
    const a = parent.children[i]
    const q = parent.children[i - 1]
    if (a.kind === 'answer' && q.kind === 'question') {
      const body = a.children.slice(1) // drop the answer's own heading
      q.children.push({
        type: 'blockquote',
        data: { hName: 'details', hProperties: { className: ['env__ans'] } },
        children: [el('paragraph', 'summary', [], [text('show answer')]), ...body],
      })
      parent.children.splice(i, 1)
    }
  }
}

export default function remarkBoxes() {
  return (tree) => walk(tree)
}
