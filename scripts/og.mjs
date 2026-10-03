/**
 * The link-preview picture (og:image): the Monet from the footer, cropped to
 * the 1200×630 shape link previews use, through the middle of the painting.
 *
 *   npm run og
 */
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const src = path.join(root, 'src/assets/home/monet.jpg')
const W = 1200
const H = 630

const { width, height } = await sharp(src).metadata()
const h = Math.round((width * H) / W)
await sharp(src)
  .extract({ left: 0, top: Math.round((height - h) / 2), width, height: h })
  .resize(W, H)
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(root, 'public/og.jpg'))
console.log('public/og.jpg written')
