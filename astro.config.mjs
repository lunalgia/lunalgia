// @ts-check
import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { satteri } from '@astrojs/markdown-satteri'
import { boxes } from './src/lib/markdown/boxes.mjs'
import { math } from './src/lib/markdown/math.mjs'
import { parentheticals } from './src/lib/markdown/parentheticals.mjs'

export default defineConfig({
  site: 'https://lunalgia.pages.dev',
  // Expressive Code must come before MDX
  integrations: [expressiveCode(), mdx(), sitemap()],
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
  },
  devToolbar: { enabled: false },
})
