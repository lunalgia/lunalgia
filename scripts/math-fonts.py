"""
Rebuild the maths alphabet fonts in src/assets/fonts/math from CTAN's Type 1 files.

Put these in a folder called .mf/ next to this script's working directory first:
  zxxrw8a.pfb      boondox   (Boondox Calligraphic; deslanted here like BOONDOX-calo)
  DutchCalReg.pfb  dutchcal
  ESSTIX15.pfb     esstix    (ESSTIX-Fifteen, the fraktur)
  DSSerif.pfb      dsserif   (Michael Sharpe's DSSerif, with Greek)
All four are OFL. Needs fonttools and brotli: pip install fonttools brotli.
Garamond-Math.otf (CTAN garamond-math, OFL) was subset separately with:
  pyftsubset Garamond-Math.otf --unicodes=<Latin, Greek, maths ranges> --layout-features='*' --flavor=woff2
"""
from fontTools.t1Lib import T1Font
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.fontBuilder import FontBuilder
import string, os
OUT = 'out'; os.makedirs(OUT, exist_ok=True)

def holes(base, holes, letters):
    return {c: holes.get(c, base + i) for i, c in enumerate(letters)}
UP, LO = string.ascii_uppercase, string.ascii_lowercase
SCRIPT = {**holes(0x1D49C, dict(B=0x212C, E=0x2130, F=0x2131, H=0x210B, I=0x2110, L=0x2112, M=0x2133, R=0x211B), UP),
          **holes(0x1D4B6, dict(e=0x212F, g=0x210A, o=0x2134), LO)}
FRAK = {**holes(0x1D504, dict(C=0x212D, H=0x210C, I=0x2111, R=0x211C, Z=0x2128), UP), **holes(0x1D51E, {}, LO)}
DS = {**holes(0x1D538, dict(C=0x2102, H=0x210D, N=0x2115, P=0x2119, Q=0x211A, R=0x211D, Z=0x2124), UP), **holes(0x1D552, {}, LO)}
DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
DS.update({d: 0x1D7D8 + i for i, d in enumerate(DIGITS)})
DS.update({'Gamma': 0x213E, 'Pi': 0x213F, 'Sigma': 0x2140, 'gamma': 0x213D, 'pi': 0x213C})
GREEK = {'Alpha':0x391,'Beta':0x392,'Gamma':0x393,'uni0394':0x394,'Epsilon':0x395,'Zeta':0x396,'Eta':0x397,'Theta':0x398,'Iota':0x399,'Kappa':0x39A,'Lambda':0x39B,'Mu':0x39C,'Nu':0x39D,'Xi':0x39E,'Omicron':0x39F,'Pi':0x3A0,'Rho':0x3A1,'Sigma':0x3A3,'Tau':0x3A4,'Upsilon':0x3A5,'Phi':0x3A6,'Chi':0x3A7,'Psi':0x3A8,'uni03A9':0x3A9,
         'alpha':0x3B1,'beta':0x3B2,'gamma':0x3B3,'delta':0x3B4,'epsilon':0x3B5,'zeta':0x3B6,'eta':0x3B7,'theta':0x3B8,'iota':0x3B9,'kappa':0x3BA,'lambda':0x3BB,'uni03BC':0x3BC,'nu':0x3BD,'xi':0x3BE,'omicron':0x3BF,'pi':0x3C0,'rho':0x3C1,'uni03C2':0x3C2,'sigma':0x3C3,'tau':0x3C4,'upsilon':0x3C5,'phi':0x3C6,'chi':0x3C7,'psi':0x3C8,'omega':0x3C9,
         'theta1':0x3D1,'phi1':0x3D5,'omega1':0x3D6,'epsilon1':0x3F5}

def build(src, family, cmap_by_glyph, slant=0.0, scale=1.0):
    t = T1Font(src); t.parse()
    cs = t['CharStrings']
    order, charstrings, metrics, cmap = ['.notdef'], {}, {}, {}
    # .notdef: empty
    p = T2CharStringPen(500, None); charstrings['.notdef'] = p.getCharString(); metrics['.notdef'] = (500, 0)
    ymin = ymax = 0
    for gname, cp in cmap_by_glyph.items():
        if gname not in cs: continue
        g = cs[gname]
        g.decompile() if hasattr(g, 'decompile') else None
        # width: run through a bounds pen first to make the extractor record it
        bp = BoundsPen(None); g.draw(bp)
        width = round(g.width * scale)
        pen = T2CharStringPen(width, None)
        g.draw(TransformPen(pen, (scale, 0, slant * scale, scale, 0, 0)))
        name = f'g{cp:05X}'
        if name in charstrings: continue
        order.append(name); charstrings[name] = pen.getCharString()
        b = BoundsPen(None); g.draw(TransformPen(b, (scale, 0, slant * scale, scale, 0, 0)))
        lsb = round(b.bounds[0]) if b.bounds else 0
        if b.bounds: ymin, ymax = min(ymin, b.bounds[1]), max(ymax, b.bounds[3])
        metrics[name] = (width, lsb); cmap[cp] = name
    fb = FontBuilder(1000, isTTF=False)
    fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap)
    ps = family.replace(' ', '')
    fb.setupCFF(ps, {'FullName': family}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    asc, desc = round(max(ymax, 700)), round(min(ymin, -200))
    fb.setupHorizontalHeader(ascent=asc, descent=desc)
    fb.setupNameTable({'familyName': family, 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=asc, sTypoDescender=desc, usWinAscent=asc, usWinDescent=-desc)
    fb.setupPost()
    fb.font.flavor = 'woff2'
    out = f'{OUT}/{ps}.woff2'; fb.save(out)
    print(out, len(cmap), 'glyphs', os.path.getsize(out), 'bytes')

by = lambda m: {k: v for k, v in m.items()}
# \mathcal: Boondox Calligraphic, deslanted as BOONDOX-calo (dvips SlantFont -.3), calscaled=.94
build('.mf/zxxrw8a.pfb', 'Lunalgia Math Cal', SCRIPT, slant=-0.3, scale=0.94)
# \mathscr: Dutch Calligraphic
build('.mf/DutchCalReg.pfb', 'Lunalgia Math Scr', SCRIPT)
# \mathfrak: ESSTIX-Fifteen, frakscaled=.97
build('.mf/ESSTIX15.pfb', 'Lunalgia Math Frak', FRAK, scale=0.97)
# \mathbb: Sharpe's DSSerif (has Greek)
build('.mf/DSSerif.pfb', 'Lunalgia Math BB', DS)
build('.mf/DSSerif.pfb', 'Lunalgia Math BB Greek', GREEK)
