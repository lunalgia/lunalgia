// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkBoxes from './src/lib/remark-boxes.mjs'

export default defineConfig({
  site: 'https://lunalgia.pages.dev',
  integrations: [mdx(), react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  prefetch: { prefetchAll: true },
  redirects: {
    '/blog': '/writing',
    '/blog/[...id]': '/writing/[...id]',
    '/lectures': '/academics',
    '/lectures/[...id]': '/academics/[...id]',
  },
  markdown: {
    remarkPlugins: [remarkMath, remarkBoxes],
    rehypePlugins: [rehypeKatex],
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
