---
# Copy this file, drop the leading underscore, fill it in.
title: 'A title, *italic words* in asterisks'
description: 'One line for lists and previews.'
date: 2026-01-01
kind: note               # essay | note | journal
tags: []
# image: ./cover.jpg     # optional; shown under the title and on /writing when it is the latest
draft: true
---

Text in Markdown. Footnotes[^1] become sidenotes on wide screens. Each `##` heading is a part and goes in the contents.

## Boxes

A box is a quote that starts with its kind; the rest of that line is an optional name. They number themselves.

> [!definition] inner product
> An *inner product* on $V$ is …

> [!theorem] Cauchy–Schwarz
> For all $u, v$, $|\langle u,v\rangle| \le \lVert u\rVert\,\lVert v\rVert$.

> [!proof]
> Ends with ∎ by itself.

> [!example]
> Kinds: theorem, lemma, proposition, corollary, definition, example, remark, question, proof, pull.

> [!question]
> An [!answer] right after a question folds into it behind "show answer".

> [!answer]
> Like this.

## Quotes and code

> An ordinary quote stays a small excerpt. Give it a last line starting with "— " and it becomes a styled quote.
> — Someone

> [!pull]
> A pull quote, large and centred.

```haskell title="file.hs" {2} ins={3}
-- title="…" names the file; {2} marks line 2, ins={3} / del={…} mark a diff
main = putStrLn "hello"
greet = putStrLn "again"
```

```python showLineNumbers collapse={1-3}
# showLineNumbers numbers the lines; collapse={1-3} hides lines 1–3 behind a toggle
import math
import itertools
print(math.pi)
```

```sh
# shell blocks get a terminal frame; blocks over ~8 lines start folded
npm run build
```

[^1]: Like this.
