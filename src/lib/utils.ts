import { getCollection, type CollectionEntry } from 'astro:content'

/** Escape, then turn *word* into <em>word</em> for display titles. */
export function emphasize(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc.replace(/\*(.+?)\*/g, '<em>$1</em>')
}

export function plain(text: string): string {
  return text.replace(/\*/g, '')
}

export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  })
}

const ROMAN: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]
export function roman(n: number): string {
  let out = ''
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v }
  return out
}

export function wordCount(body: string | undefined): number {
  if (!body) return 0
  const text = body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\^\d+\]:?/g, '')
    .replace(/[#>*_`[\]()]/g, ' ')
  return text.split(/\s+/).filter(Boolean).length
}

export async function getPosts(): Promise<CollectionEntry<'writing'>[]> {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft)
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}
