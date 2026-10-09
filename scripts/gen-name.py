"""
Generate the hero wordmark: exact glyph outlines of "Lunalgia" (Louise, fitted
into the name's box in board1.svg: NAME in Hero.astro) plus a set of centre-line "pen strokes"
used as an animated mask, so the word appears to be written by hand.

    python3 scripts/gen-name.py   ->  src/components/home/lunalgia.json

Needs: fonttools, uharfbuzz, numpy, scikit-image, pillow
"""
import json
import math
from pathlib import Path

import numpy as np
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw
from skimage.morphology import skeletonize
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "src/assets/fonts/Louise-Regular.otf"
OUT = ROOT / "src/components/home/lunalgia.json"

TEXT = "Lunalgia"
# The name's box in board1, as NAME in Hero.astro: the word's ink is scaled to
# this width and centred on this point. (The Instrument Serif version was placed
# at a fixed size from the board file instead, with its "g" pinned by hand.)
BOX_CX, BOX_CY, BOX_W = 967.0, 543.0, 478.0

font = TTFont(FONT)
upm = font["head"].unitsPerEm
glyphset = font.getGlyphSet()

blob = hb.Blob.from_file_path(str(FONT))
hbfont = hb.Font(hb.Face(blob))
buf = hb.Buffer()
buf.add_str(TEXT)
buf.guess_segment_properties()
hb.shape(hbfont, buf, {"kern": True, "liga": True, "calt": True})
order = font.getGlyphOrder()

from fontTools.pens.boundsPen import BoundsPen

# lay the word out at 1 unit = 1 font unit, then measure its ink
raw, x = [], 0
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    raw.append((TEXT[info.cluster], order[info.codepoint], x + pos.x_offset, pos.y_offset))
    x += pos.x_advance
bx0 = by0 = float("inf")
bx1 = by1 = float("-inf")
for _, name, gx, gy in raw:
    bp = BoundsPen(glyphset)
    glyphset[name].draw(bp)
    if bp.bounds:
        a, b, c, d = bp.bounds
        bx0, by0, bx1, by1 = min(bx0, a + gx), min(by0, b + gy), max(bx1, c + gx), max(by1, d + gy)
scale = BOX_W / (bx1 - bx0)
SIZE = upm * scale
X0 = BOX_CX - (bx0 + bx1) / 2 * scale
Y0 = BOX_CY + (by0 + by1) / 2 * scale  # y flips: font units go up, the board goes down
glyphs = [(ch, name, X0 + gx * scale, Y0 - gy * scale) for ch, name, gx, gy in raw]
x = X0 + x * scale


def outline(name, gx, gy):
    pen = SVGPathPen(glyphset, lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    tpen = TransformPen(pen, (scale, 0, 0, -scale, gx, gy))
    glyphset[name].draw(tpen)
    return pen.getCommands()


letters = [{"ch": ch, "d": outline(n, gx, gy)} for ch, n, gx, gy in glyphs]

# ---- rasterise the word to find centre lines ----
R = 4  # supersampling
pad = 40
minx = X0 - pad
miny = Y0 - SIZE * 1.0
W = int((x - minx + pad) * R)
H = int(SIZE * 1.45 * R)

from fontTools.pens.recordingPen import DecomposingRecordingPen


def polygons(name, gx, gy):
    """Flatten a glyph to polygons in raster space."""
    rec = DecomposingRecordingPen(glyphset)
    glyphset[name].draw(rec)
    polys, cur = [], []

    def tr(p):
        return ((gx + p[0] * scale - minx) * R, (gy - p[1] * scale - miny) * R)

    last = None
    for op, args in rec.value:
        if op == "moveTo":
            cur = [tr(args[0])]
            last = args[0]
        elif op == "lineTo":
            cur.append(tr(args[0]))
            last = args[0]
        elif op in ("curveTo", "qCurveTo"):
            pts = [last] + list(args)
            if op == "curveTo" and len(pts) == 4:
                for t in np.linspace(0, 1, 16)[1:]:
                    p = (
                        (1 - t) ** 3 * np.array(pts[0])
                        + 3 * (1 - t) ** 2 * t * np.array(pts[1])
                        + 3 * (1 - t) * t**2 * np.array(pts[2])
                        + t**3 * np.array(pts[3])
                    )
                    cur.append(tr(p))
            else:
                for p in args:
                    cur.append(tr(p))
            last = args[-1]
        elif op in ("closePath", "endPath"):
            if cur:
                polys.append(cur)
            cur = []
    return polys


strokes = []
for li, (ch, name, gx, gy) in enumerate(glyphs):
    img = Image.new("L", (W, H), 0)
    dr = ImageDraw.Draw(img)
    # even-odd fill via XOR of each contour
    acc = np.zeros((H, W), dtype=bool)
    for poly in polygons(name, gx, gy):
        m = Image.new("L", (W, H), 0)
        ImageDraw.Draw(m).polygon(poly, fill=255)
        acc ^= np.array(m) > 0
    mask = acc
    dist = ndimage.distance_transform_edt(mask)
    skel = skeletonize(mask)
    labels, n = ndimage.label(skel, structure=np.ones((3, 3)))
    comps = []
    for c in range(1, n + 1):
        ys, xs = np.nonzero(labels == c)
        if len(xs) < 6:
            continue
        pts = set(zip(ys.tolist(), xs.tolist()))

        def nbrs(p):
            y0, x0 = p
            return [
                (y0 + dy, x0 + dx)
                for dy in (-1, 0, 1)
                for dx in (-1, 0, 1)
                if (dy or dx) and (y0 + dy, x0 + dx) in pts
            ]

        ends = [p for p in pts if len(nbrs(p)) == 1] or list(pts)
        # a pen starts at the top-left-most loose end
        start = min(ends, key=lambda p: (p[1] + p[0] * 0.6))
        # DFS that prefers to keep going in the same direction; backtracks are
        # kept so the mask path stays continuous
        seq, seen = [start], {start}
        stack = [start]
        prev_dir = (1, 0)
        while stack:
            p = stack[-1]
            nb = [q for q in nbrs(p) if q not in seen]
            if not nb:
                stack.pop()
                if stack:
                    seq.append(stack[-1])
                continue
            nb.sort(key=lambda q: -((q[0] - p[0]) * prev_dir[0] + (q[1] - p[1]) * prev_dir[1]))
            q = nb[0]
            prev_dir = (q[0] - p[0], q[1] - p[1])
            seen.add(q)
            seq.append(q)
            stack.append(q)
        # thin the walk, convert back to board coordinates
        thin = seq[::3] + [seq[-1]]
        width = float(dist[ys, xs].max()) * 2.0 / R * 1.35 + 2.0
        d = "M" + " L".join(f"{px / R + minx:.1f} {py / R + miny:.1f}" for py, px in thin)
        comps.append((min(xs), {"d": d, "w": round(width, 2)}))
    # blobs whose skeleton is too small to trace (the dot of the i): a short dab
    blobs, nb = ndimage.label(mask)
    for b in range(1, nb + 1):
        if (skel & (blobs == b)).sum() >= 6:
            continue
        ys, xs = np.nonzero(blobs == b)
        cy, cx = ys.mean() / R + miny, xs.mean() / R + minx
        r = float(dist[blobs == b].max()) / R
        comps.append((min(xs) + 10**6, {"d": f"M{cx - r * 0.3:.1f} {cy + r * 0.3:.1f} L{cx + r * 0.3:.1f} {cy - r * 0.3:.1f}", "w": round(r * 2.6 + 2, 2)}))
    comps.sort(key=lambda c: c[0])
    for _, c in comps:
        c["letter"] = li
        strokes.append(c)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({"letters": letters, "strokes": strokes}, indent=1))
print(f"{len(letters)} letters, {len(strokes)} pen strokes -> {OUT.relative_to(ROOT)}")
