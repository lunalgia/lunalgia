#!/usr/bin/env node
/**
 * Copy files that live elsewhere on this computer (your CV, the BL4S proposal…)
 * into the site, so the repo has real copies Cloudflare can build from.
 * The list is in scripts/files.json: { "path in the site": "where it comes from" }.
 *
 *   npm run files      copy whatever has changed
 *
 * It also runs before `npm run dev` and `npm run build`. A source that isn't
 * there (on Cloudflare, say) is skipped, and the copy already in the repo is used.
 * Commit the copies after updating them.
 */
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const list = JSON.parse(await fs.readFile(path.join(root, 'scripts/files.json'), 'utf8'))
const quiet = process.argv.includes('--quiet')

for (const [dest, from] of Object.entries(list)) {
  const src = from.replace(/^~(?=\/|$)/, os.homedir())
  const out = path.join(root, dest)
  const s = await fs.stat(src).catch(() => null)
  if (!s) {
    if (!quiet) console.log(`skip    ${dest} (no ${from} here; keeping the copy in the repo)`)
    continue
  }
  // replace a leftover symlink with a real file
  const d = await fs.lstat(out).catch(() => null)
  if (d?.isSymbolicLink()) await fs.rm(out)
  else if (d && d.size === s.size && d.mtimeMs >= s.mtimeMs) {
    if (!quiet) console.log(`same    ${dest}`)
    continue
  }
  await fs.mkdir(path.dirname(out), { recursive: true })
  await fs.copyFile(src, out)
  await fs.utimes(out, s.atime, s.mtime)
  console.log(`updated ${dest} ← ${from}`)
}
