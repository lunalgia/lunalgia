// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { satteri } from '@astrojs/markdown-satteri'
import { boxes } from './src/lib/markdown/boxes.mjs'
import { math } from './src/lib/markdown/math.mjs'
import { parentheticals } from './src/lib/markdown/parentheticals.mjs'

export default defineConfig({
  site: 'https://lunalgia.pages.dev',
  integrations: [mdx(), sitemap()],
  prefetch: { prefetchAll: true },
  redirects: {
    '/blog': '/writing',
    '/blog/[...id]': '/writing/[...id]',
    '/lectures': '/academics',
    '/lectures/[...id]': '/academics/[...id]',
  },
  markdown: {
    // Sätteri (Rust) parses; our plugins run on its trees. Maths first, so the
    // boxes plugin copies already-rendered MathML into theorem boxes.
    processor: satteri({
      features: { math: true },
      mdastPlugins: [math, boxes],
      hastPlugins: [parentheticals],
    }),
    // code takes its colours from CSS variables (see article.css), so it matches the site
    shikiConfig: {
      theme: 'css-variables',
      transformers: [
        {
          // ```haskell title="primes.hs"  →  a file name in the code block's header
          pre(node) {
            const title = this.options.meta?.__raw?.match(/title="([^"]+)"/)?.[1]
            if (title) node.properties['data-title'] = title
          },
        },
      ],
    },
  },
  devToolbar: { enabled: false },
})
