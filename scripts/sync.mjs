#!/usr/bin/env node
/**
 * Everything to run before pushing, in one go. It only fetches what is missing,
 * so a run with nothing new to do is quick and changes nothing.
 *
 *   npm run sync              all of it
 *   npm run sync -- --no-build    skip the build check at the end
 *
 * Steps, in order:
 *   0. uni        mirror ~/Uni into public/uni via ~/Scripts/sync-uni.sh (skipped if absent)
 *   1. files      copy the files that live elsewhere (CV, course PDFs…) into the site
 *   2. covers     fetch covers for media entries that have none
 *   3. meta       fetch genres, facts and links for entries not looked up yet
 *   4. snapshots  hover-card pictures for links and PDFs that have none
 *   5. build      build the site, to catch broken Markdown or code before Cloudflare does
 * Then it lists what changed, ready to commit.
 *
 * A step that fails (no internet, a source that is down) is reported at the end
 * and the rest still run. It can run alongside `npm run dev`.
 * Not included, since they only need running when their source picture changes:
 * `npm run favicon`, `npm run og`.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const args = process.argv.slice(2)

const steps = [
  ['files', ['scripts/files.mjs']],
  ['covers', ['scripts/covers.mjs']],
  ['meta', ['scripts/meta.mjs']],
  ['snapshots', ['scripts/snapshots.mjs']],
]

const failed = []
const run = (name, cmd, cmdArgs) => {
  console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 60 - name.length))}`)
  const t = Date.now()
  const r = spawnSync(cmd, cmdArgs, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' })
  const ok = r.status === 0
  console.log(`   ${ok ? 'done' : 'FAILED'} in ${((Date.now() - t) / 1000).toFixed(1)}s`)
  if (!ok) failed.push(name)
}

const uniScript = path.join(os.homedir(), 'Scripts', 'sync-uni.sh')
if (fs.existsSync(uniScript)) {
  // Point the script at this checkout so it keeps working if the repo is moved or renamed.
  process.env.DEST ??= path.join(ROOT, 'public', 'uni')
  run('uni', 'bash', [uniScript])
}
else console.log(`\n── uni: skipped (no ${uniScript})`)

for (const [name, cmdArgs] of steps) run(name, process.execPath, cmdArgs)
if (!args.includes('--no-build')) run('build', 'npx', ['astro', 'build'])

console.log(`\n── changes ${'─'.repeat(52)}`)
const status = spawnSync('git', ['status', '--short'], { cwd: ROOT, encoding: 'utf8' }).stdout.trimEnd()
console.log(status ? status.replace(/^/gm, '   ') : '   nothing changed')

if (failed.length) {
  console.log(`\n${failed.length} step(s) failed: ${failed.join(', ')} (scroll up for why)`)
  process.exit(1)
}
console.log('\nall good' + (status ? '; commit the changes above and push' : ''))
