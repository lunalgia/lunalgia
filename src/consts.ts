export const SITE = {
  title: 'lunalgia',
  author: 'Lilian',
  description: 'A garden of lilies.',
  url: 'https://lunalgia.pages.dev',
  email: 'lunalgia@proton.me',
  github: 'https://github.com/lunalgia',
  discord: 'lunalgia',
}

/** Every room of the house, in footer order. */
export const NAV = [
  { href: '/writing', label: 'writings' },
  { href: '/work', label: 'work' },
  { href: '/academics', label: 'academics' },
  { href: '/media', label: 'media' },
  { href: '/bookmarks', label: 'bookmarks' },
] as const
