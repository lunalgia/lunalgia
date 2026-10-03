# lunalgia

My personal site. Astro 7 + MDX, React islands + Tailwind v4 (for shadcn/componentry components), GSAP
(ScrollTrigger, SplitText) and Lenis for motion, KaTeX for maths. Design tokens live in
`src/styles/global.css`; the home page is built from the Affinity boards in `design/website/`.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where things live

| what | where |
| --- | --- |
| palette, fonts, grid, frame/label/divider pieces | `src/styles/global.css` |
| long-form typesetting (posts, lecture pages) | `src/styles/prose.css` |
| home page boards (hero, writings, hello, intro) | `src/components/home/` |
| footer wording (label, paragraph, links) | `src/data/footer.md` |
| footer layout (jardin de lys) | `src/components/Footer.astro` |
| hero wordmark outlines + pen strokes | `scripts/gen-name.py` → `src/components/home/lunalgia.json` |
| framed title card used on every page | `src/components/PageIntro.astro` |
| writing (essays, notes, fragments) | `src/content/writing/` (copy `_template.md`) |
| work (design + projects) | `src/content/work/` (copy `_template.md`) |
| academics (courses) | `src/content/academics/` (+ files in `public/uni/`) |
| album reviews | `src/content/albums/*.md` (cover fetched from the link at build) |
| bookmarks, quotes, videos | `src/data/bookmarks.ts` |
| sidenotes (footnotes → margin notes) | `src/scripts/sidenotes.ts` |

### Writing a post

```md
---
title: 'What is an *Author*?'   # *word* → italic in the big title
description: 'Notes'
subtitle: ['left of the picture', 'right of the picture']   # optional
date: 2025-07-31
image: ./cover.jpg      # optional; defaults to the camellia
tags: ['introspection']
---
```

`## headings` become numbered chapters (I., II., …) with a contents list up top.

### Hero strokes (old notes, superseded)

Each stroke in `Hero.astro` is `{ href, label, d, at, anchor }`: `d` is the SVG path (always drawn
left-to-right so the label stays upright), `at` is where along the path the label sits (in %).
There are two drawings, one 16:9 for wide screens and one tall one for phones.

### Footnotes

Write ordinary Markdown footnotes (`text[^1]` … `[^1]: the note`). On screens ≥1180px wide they
are moved into the right margin next to their reference (long ones start partly collapsed); on
narrower screens tapping the number opens the note under the line. Without JavaScript they stay
ordinary footnotes at the end.

### Adding componentry / shadcn components

```sh
npx shadcn@latest add @componentry/image-trail
```

They land in `src/components/ui/` as React components; use them in an `.astro` page with a
`client:visible` directive so their JavaScript only loads on that page, when it scrolls into view.
