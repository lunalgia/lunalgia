import { readdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

export interface TreeNode {
  name: string
  type: 'dir' | 'file'
  href?: string
  children?: TreeNode[]
}

export function uniHref(...parts: string[]): string {
  const rel = parts
    .flatMap((part) => part.split('/'))
    .filter(Boolean)
    .join('/')
  return (
    '/uni/' +
    encodeURI(rel.replace(/%/g, '%25'))
      .replace(/\?/g, '%3F')
      .replace(/#/g, '%23')
  )
}

export async function readUniTree(folder: string): Promise<TreeNode[]> {
  const root = join(process.cwd(), 'public', 'uni')
  const base = join(root, folder)

  async function walk(dir: string): Promise<TreeNode[]> {
    const entries = await readdir(dir, { withFileTypes: true })
    const nodes: TreeNode[] = []

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const full = join(dir, entry.name)

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          type: 'dir',
          children: await walk(full),
        })
      } else if (entry.isFile()) {
        if (/[#?]/.test(entry.name)) {
          console.warn(
            `[file-tree] "${entry.name}" contains '#' or '?' and will not be reachable by URL. Please rename it.`,
          )
        }
        nodes.push({
          name: entry.name,
          type: 'file',
          href: uniHref(folder, relative(base, full).split(sep).join('/')),
        })
      }
    }

    return nodes.sort((a, b) =>
      a.type !== b.type
        ? a.type === 'dir'
          ? -1
          : 1
        : a.name.localeCompare(b.name, undefined, { numeric: true }),
    )
  }

  try {
    return await walk(base)
  } catch {
    return []
  }
}
