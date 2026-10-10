import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { readUniTree, type TreeNode } from '@/lib/file-tree'
import { NOTES, SOURCES } from '@/data/past-material'

export const PAST_ROOT = 'Past Material'

export interface Offering {
  /** folder name, e.g. "2025 Fall - Prof. B. V. Rao (fourthground)" */
  folder: string
  year: number
  season: 'Fall' | 'Spring' | string
  /** "Prof. B. V. Rao", or null for an archive without one */
  instructor: string | null
  /** key into SOURCES, or a plain label like "Moodle archive" */
  source: string | null
  note?: string
  inProgress: boolean
  files: number
  tree: TreeNode[]
}

export interface PastCourse {
  name: string
  slug: string
  sem: number
  offerings: Offering[]
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const dirs = async (p: string) =>
  (await readdir(p, { withFileTypes: true }).catch(() => []))
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)

const countFiles = (nodes: TreeNode[]): number =>
  nodes.reduce((n, x) => n + (x.type === 'file' ? 1 : countFiles(x.children ?? [])), 0)

/** "2025 Fall - Prof. B. V. Rao (fourthground)" / "2024 Fall - Moodle archive" */
function parse(folder: string) {
  const m = folder.match(/^(\d{4})\s+(\w+)\s+-\s+(.+?)(?:\s+\(([^()]+)\))?$/)
  if (!m) return { year: 0, season: '', instructor: folder, source: null }
  const [, year, season, who, source] = m
  if (!source && /archive/i.test(who)) return { year: +year, season, instructor: null, source: who }
  return { year: +year, season, instructor: who, source: source ?? null }
}

/** A Fall runs Aug–Nov, a Spring Jan–Apr; anything still running at build time is "in progress". */
function running(year: number, season: string, now = new Date()) {
  const end = season === 'Fall' ? new Date(year, 11, 1) : season === 'Spring' ? new Date(year, 4, 1) : null
  return !!end && now < end && now.getFullYear() >= year
}

export async function readPast(): Promise<PastCourse[]> {
  const root = join(process.cwd(), 'public', 'uni', PAST_ROOT)
  const courses: PastCourse[] = []
  for (const semDir of await dirs(root)) {
    const sem = Number(semDir.match(/\d+/)?.[0] ?? 0)
    for (const name of await dirs(join(root, semDir))) {
      const offerings: Offering[] = []
      for (const folder of await dirs(join(root, semDir, name))) {
        const p = parse(folder)
        const tree = await readUniTree(`${PAST_ROOT}/${semDir}/${name}/${folder}`)
        offerings.push({
          folder,
          ...p,
          note: NOTES[`${name}/${p.year} ${p.season}`],
          inProgress: running(p.year, p.season),
          files: countFiles(tree),
          tree,
        })
      }
      // newest first; within a term, an instructor's folder before a raw archive
      offerings.sort((a, b) => b.year - a.year || Number(!a.instructor) - Number(!b.instructor) || a.folder.localeCompare(b.folder))
      courses.push({ name, slug: slugify(name), sem, offerings })
    }
  }
  return courses.sort((a, b) => a.sem - b.sem || a.name.localeCompare(b.name))
}

export const sourceOf = (key: string | null) => (key ? SOURCES[key] : undefined)

/** the little Markdown the notes use: *italic* and [text](url) */
export function inline(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}
