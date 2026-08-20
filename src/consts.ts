import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Lunalgia',
  description:
    'Dystopian musings.',
  href: 'https://lunalgia.pages.dev',
  author: 'Lilian',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/lectures',
    label: 'lectures',
  },
  {
    href: '/authors',
    label: 'authors',
  },
  {
    href: '/about',
    label: 'about',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/lunalgia',
    label: 'GitHub',
  },
  {
    href: 'mailto:lunalgia@pm.me',
    label: 'Email',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
