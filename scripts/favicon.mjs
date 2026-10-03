/**
 * Favicons: the DINdong "L" in ultramarine on lavender, with the dithered lily
 * (src/assets/home/lily.png) laid faintly over the whole square.
 *
 *   npm run favicon
 *
 * Writes public/favicon.svg, favicon.ico (16 + 32), favicon-16x16.png,
 * favicon-32x32.png, apple-touch-icon.png (180) and android-chrome-192/512.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const out = (f) => path.join(root, 'public', f)

// the "L" from src/assets/fonts/DINdong.woff2, in font units (2048 per em, y up)
const L = { d: 'M109 2V0H1372V134H242L245 1262H111L108 2Z', x0: 108, x1: 1372, h: 1262 }
const LAVENDER = '#a297cb'
const ULTRAMARINE = '#020887'
const LILY = { file: path.join(root, 'src/assets/home/lily.png'), scale: 1.05, opacity: 0.28, dx: 20 / 512, dy: 10 / 512 }

const N = 512
const s = (N * 0.62) / L.h
const tx = (N - (L.x1 - L.x0) * s) / 2 - L.x0 * s
const ty = (N + L.h * s) / 2

/** the lily as one flat colour (its drawing lives in the alpha channel), sized to `w` */
async function lilyLayer(w) {
  const alpha = await sharp(LILY.file).resize(w).extractChannel('alpha').toColourspace('b-w').toBuffer()
  const { height } = await sharp(alpha).metadata()
  const png = await sharp({ create: { width: w, height, channels: 3, background: ULTRAMARINE } })
    .joinChannel(alpha)
    .png()
    .toBuffer()
  return { png, height }
}

// ---- the SVG: vector L, the lily embedded as a small PNG ----
const lw = Math.round(N * LILY.scale)
const small = await lilyLayer(128) // plenty for an icon shown at 16–64px
const lh = Math.round((small.height / 128) * lw)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}">
  <rect width="${N}" height="${N}" fill="${LAVENDER}"/>
  <image href="data:image/png;base64,${small.png.toString('base64')}" x="${(N - lw) / 2 + LILY.dx * N}" y="${(N - lh) / 2 + LILY.dy * N}" width="${lw}" height="${lh}" opacity="${LILY.opacity}"/>
  <path d="${L.d}" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)} ${(-s).toFixed(5)})" fill="${ULTRAMARINE}"/>
</svg>
`
fs.writeFileSync(out('favicon.svg'), svg)

// ---- the PNGs: rendered once at 512 from the same parts, then scaled down ----
const big = await lilyLayer(lw)
const B = 2 * N // the lily overhangs the square; place it on a bigger sheet and cut the square out
const lilySheet = await sharp({ create: { width: B, height: B, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([
    {
      input: await sharp(big.png).linear([1, 1, 1, LILY.opacity], [0, 0, 0, 0]).png().toBuffer(),
      left: Math.round((B - lw) / 2 + LILY.dx * N),
      top: Math.round((B - big.height) / 2 + LILY.dy * N),
    },
  ])
  .png()
  .toBuffer()
const lilySquare = await sharp(lilySheet).extract({ left: N / 2, top: N / 2, width: N, height: N }).png().toBuffer()
const letter = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}"><path d="${L.d}" transform="translate(${tx} ${ty}) scale(${s} ${-s})" fill="${ULTRAMARINE}"/></svg>`,
)
const icon = await sharp({ create: { width: N, height: N, channels: 4, background: LAVENDER } })
  .composite([{ input: lilySquare }, { input: letter }])
  .png()
  .toBuffer()

const sizes = { 'android-chrome-512x512.png': 512, 'android-chrome-192x192.png': 192, 'apple-touch-icon.png': 180, 'favicon-32x32.png': 32, 'favicon-16x16.png': 16 }
for (const [file, size] of Object.entries(sizes)) await sharp(icon).resize(size, size).png().toFile(out(file))

// ---- favicon.ico: an ICO container holding the 16 and 32 PNGs ----
const entries = await Promise.all([16, 32].map(async (z) => ({ z, png: await sharp(icon).resize(z, z).png().toBuffer() })))
const header = Buffer.alloc(6 + 16 * entries.length)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(entries.length, 4)
let offset = header.length
entries.forEach(({ z, png }, i) => {
  const at = 6 + 16 * i
  header.writeUInt8(z, at) // width
  header.writeUInt8(z, at + 1) // height
  header.writeUInt8(0, at + 2) // palette
  header.writeUInt8(0, at + 3) // reserved
  header.writeUInt16LE(1, at + 4) // colour planes
  header.writeUInt16LE(32, at + 6) // bits per pixel
  header.writeUInt32LE(png.length, at + 8)
  header.writeUInt32LE(offset, at + 12)
  offset += png.length
})
fs.writeFileSync(out('favicon.ico'), Buffer.concat([header, ...entries.map((e) => e.png)]))

console.log('favicons written to public/')
