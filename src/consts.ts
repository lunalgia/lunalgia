import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Jardin De Lys',
  description:
    'A web home.',
  href: 'https://jardin-de-lys.github.io',
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
    href: 'https://github.com/jardin-de-lys',
    label: 'GitHub',
  },
  {
    href: 'mailto:lilianbrienne@protonmail.com',
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
