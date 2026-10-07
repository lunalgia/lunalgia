import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/** The three kinds of writing, in order of how finished they are. */
export const WRITING_KINDS = {
  essay: { label: 'Essays', blurb: 'long, finished pieces' },
  note: { label: 'Notes', blurb: 'academic, expository articles' },
  journal: { label: 'Journal', blurb: 'days as they happened' },
} as const

const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/writing' }),
  schema: ({ image }) =>
    z.object({
      /** Wrap words in *asterisks* to set them in italic display type. */
      title: z.string(),
      description: z.string(),
      /** Optional two-part subtitle, shown left and right of the title card. */
      subtitle: z.tuple([z.string(), z.string()]).optional(),
      date: z.coerce.date(),
      kind: z.enum(['essay', 'note', 'journal']).default('essay'),
      image: image().optional(),
      imageCaption: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
})

const academics = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/academics' }),
  schema: z.object({
    title: z.string(),
    course: z.string().optional(),
    year: z.coerce.number().optional(),
    semester: z.coerce.number().min(1).max(2).optional(),
    date: z.coerce.date().optional(),
    order: z.number().optional(),
    pdf: z.string().optional(),
    folder: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
})

/**
 * Media: books, records and films share one shape. One Markdown file per item;
 * the review is the body (leave it empty for "no review yet").
 */
const mediaSchema = ({ image }: { image: () => any }) =>
  z.object({
    title: z.string(),
    /** shorter title for spines and the big label */
    short: z.string().optional(),
    /** author / artist / director */
    by: z.string(),
    year: z.number().optional(),
    /** out of 100 */
    rating: z.number().min(0).max(100).optional(),
    /** an all-time favourite */
    favourite: z.boolean().default(false),
    /** films: the heart */
    liked: z.boolean().default(false),
    /** when you finished it / started playing it / watched it */
    date: z.coerce.date().optional(),
    cover: image().optional(),
    /** spine colour; picked from the cover when omitted */
    spine: z.string().optional(),
    /** filled by `npm run meta` from Wikidata; edit freely */
    genres: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    /** facts shown beside the review, in order: { 'original title': '海辺のカフカ', runtime: '169 min' } */
    meta: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
    /** outside links by name: { Wikipedia: 'https://…', Letterboxd: 'https://…' } */
    links: z.record(z.string(), z.string()).default({}),
    /** the Wikidata item `npm run meta` matched; change it to fix a wrong match */
    wikidata: z.string().optional(),
    link: z.string().optional(),
    /** lower comes first on the shelf; ties sort newest first */
    order: z.number().default(0),
    warning: z.string().optional(),
    draft: z.boolean().default(false),
  })

const books = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/books' }),
  schema: mediaSchema,
})
const records = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/records' }),
  schema: mediaSchema,
})
const films = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/films' }),
  schema: mediaSchema,
})

/** Posters for the carousel on the work page: one Markdown file per poster, image beside it. */
const posters = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posters' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      image: image(),
      year: z.number().optional(),
      note: z.string().optional(),
      order: z.number().default(0),
      draft: z.boolean().default(false),
    }),
})

/** Design pieces and projects (BL4S and friends). One Markdown file each. */
const work = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kind: z.enum(['design', 'project']),
      summary: z.string(),
      date: z.coerce.date(),
      cover: image().optional(),
      gallery: z.array(image()).default([]),
      role: z.string().optional(),
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
      tags: z.array(z.string()).default([]),
      order: z.number().default(0),
      draft: z.boolean().default(false),
    }),
})

export const collections = { writing, academics, books, records, films, posters, work }
