/**
 * Small build-time fetchers. Every one of them fails soft: offline builds just
 * get no cover / no title and the page renders a typographic fallback.
 */
const cache = new Map<string, Promise<unknown>>()

async function get<T>(url: string, as: 'json' | 'text'): Promise<T | null> {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { signal: AbortSignal.timeout(8000), headers: { 'user-agent': 'lunalgia-build/2.0' } })
        .then((r) => (r.ok ? (as === 'json' ? r.json() : r.text()) : null))
        .catch(() => null),
    )
  }
  return (await cache.get(url)) as T | null
}

/** Album cover from an Apple Music or Bandcamp link. */
export async function albumCover(link: string): Promise<string | null> {
  const apple = link.match(/music\.apple\.com\/.*\/album\/[^/]+\/(\d+)/)
  if (apple) {
    const data = await get<{ results?: { artworkUrl100?: string }[] }>(
      `https://itunes.apple.com/lookup?id=${apple[1]}`,
      'json',
    )
    return data?.results?.[0]?.artworkUrl100?.replace('100x100bb', '1000x1000bb') ?? null
  }
  const html = await get<string>(link, 'text')
  return html?.match(/<meta property="og:image" content="([^"]+)"/i)?.[1] ?? null
}

export function youtubeId(url: string): string | null {
  return url.match(/(?:youtu\.be\/|v=)([\w-]{11})/)?.[1] ?? null
}

export interface Video {
  id: string
  url: string
  title: string | null
  author: string | null
}

export async function youtube(url: string): Promise<Video | null> {
  const id = youtubeId(url)
  if (!id) return null
  const canonical = `https://www.youtube.com/watch?v=${id}`
  const data = await get<{ title?: string; author_name?: string }>(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(canonical)}`,
    'json',
  )
  return { id, url: canonical, title: data?.title ?? null, author: data?.author_name ?? null }
}
