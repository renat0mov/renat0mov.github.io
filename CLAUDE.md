# renat0.mov

Renato Ribeiro's video portfolio. Hand-written static HTML + Bootstrap 5.3.7 from CDN, one
file per page, no build step, no framework. Served by **GitHub Pages** at `https://renat0.mov`.

Personal project, not Audioglobo. Todoist label `renat0mov`, in the **Personal** project.

## Deploy

`~/Documents/Personal Website` is the working clone of `renat0mov/renat0mov.github.io`,
branch `main`. **A push to `main` is a deploy.** `.github/workflows/static.yml` uploads the
whole repository to GitHub Pages on every push, and the custom domain `renat0.mov` is set
in the repo's Pages settings rather than by a `CNAME` file in the tree.

There is no staging and no preview. Whatever lands on `main` is live a minute or two later,
so check locally first and keep work on a branch until it is ready.

**Preview with `python3 serve.py`, not `python3 -m http.server`.** The bare module 404s
every nav link: the site links to `./about` with no extension, GitHub Pages resolves that
to `about.html` and Python's server does not. `serve.py` adds that rule and the 404.html
fallback, so local behaviour matches production. (There is no `--extensions` flag on
`http.server` in any Python version — do not go looking for one.)

*Set up 13 Aug 2026. Before that Renato uploaded files through github.com's web form, which
is why the 55 commits up to `0602005` all read "Add files via upload". The local folder was
byte-identical to the repo when the history was attached, so nothing was lost.*

## Pages

```
index.html          the work grid, 5 projects          EN
about.html          bio + "Trusted By" list            EN
pt/index.html       the same grid                      PT
pt/sobre.html       the same bio                       PT
404.html
<slug>.html         one per project: title, credits, YouTube embed, still frames
style.css
serve.py            local preview only, never runs in production
robots.txt · sitemap.xml · llms.txt
images/             ~10 MB — 5 MP4 loops + posters, plus JPG stills
```

Ten HTML files, all copies of each other with the content swapped. **A change to the
header, footer or `<head>` has to be made in all ten**; there is no partial, no include
and no template. Grep before assuming one edit is enough.

The five project pages are **English only**. `/pt` covers the two pages that carry prose.
A Portuguese visitor clicking a project from `/pt/` lands on an English page, which is a
known gap rather than a bug — the project pages are a title, a credit list and a video.

## Bilingual setup

| | English | Portuguese |
|---|---|---|
| Work | `/` | `/pt/` |
| About | `/about` | `/pt/sobre` |

Every one of those four carries `hreflang` for `en`, `pt` and `x-default`, pointing at
each other, and `sitemap.xml` repeats the same pairings. **If a URL moves, all three
places have to move together** or Google sees a broken cluster and drops the alternates.
`x-default` points at English.

A visible `PT` / `EN` switch sits in the nav on all four, desktop and mobile menu both,
because `hreflang` tells Google and nothing else.

Portuguese copy is Renato's own voice, not translated marketing. Current-standard
orthography (`direto`, `projeto`). Project names stay exactly as they are in both
languages — they are the works' own titles and match YouTube. Only the descriptor after
the `//` changes.

## Structured data

JSON-LD in `<head>`, one `@graph` per page. The `Person` node is `https://renat0.mov/#renato`
on every page that emits it, so the graph joins up rather than describing four unrelated
Renatos. Project pages carry `VideoObject`.

**`uploadDate` and `duration` on those were read from each YouTube watch page, not
estimated.** If a video is replaced, re-read them; a wrong `uploadDate` is worse than none
because it is the field Google uses to decide the video is stale.

## Media pipeline

Nothing runs at build time. These are the commands used once, by hand, and the ones to run
again when a project is added.

**Hero loop** — `images/<slug>.mp4` plus `images/<slug>-poster.jpg`:

```
ffmpeg -i <slug>.gif -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,hqdn3d=4:3:6:4.5" \
  -movflags +faststart -an <slug>.mp4
```

`hqdn3d` is the part that matters. GIF encoders dither, x264 then spends most of its
bitrate encoding that speckle, and stripping it first took one file from 2.03 MB to
0.92 MB while making the dark areas look *better* than the GIF did. `yuv420p` for browser
support, even dimensions because libx264 rejects the odd heights these GIFs had (603,
607), `+faststart` so playback can begin before the download finishes.

**Stills.** 2048 px on the long edge, JPEG q80, progressive. Bootstrap's `.container` tops
out at 1320 CSS px, so 2048 still covers a retina panel; the 3840 px originals were costing
~700 KB a frame for pixels nobody could see. Compared side by side at render size the two
are indistinguishable.

**Fonts.** `woff2_compress THICCCBOI-Bold.ttf` — 385 KB of TTF became 71 KB. The `.ttf`
files stay as the `@font-face` fallback and are never fetched by a browser that reads woff2.

**Why the grid videos have no `autoplay` attribute.** `loading="lazy"` on `<video>` is a
real standard and does defer autoplay, but only Chrome 148+ ships it — Firefox and WebKit
were still in review as of Aug 2026. Left to `autoplay`, Safari would download all five
loops on load, which is the entire problem. Playback is started by an IntersectionObserver
in `index.html` instead, which behaves the same everywhere. Two consequences:

- **The `visibilitychange` listener beside the observer is not optional.** Chrome pauses
  the rendering pipeline that computes intersections in a background tab, so a site opened
  in one and switched to later would show five frozen posters without it.
- **`play()` rejects under iOS Low Power Mode** and there is nothing to fix when it does.
  The poster frame is the fallback, which is why every video has one.

## Still to do

- **Project pages have no Portuguese.** See *Pages* above.
- **No location signal below "Portugal".** Aveiro and Porto are all over the work and named
  nowhere as places Renato works. Adding them would be the strongest remaining local-search
  gain — but **whether he is based in Aveiro is not established**, only that the work
  happened there. Ask before writing it.
- **Submit `sitemap.xml` in Search Console** once this is deployed. Renato's own job; the
  property already exists and its verification tag is in `index.html`.
- The stale copy Google holds for `/about` (the pre-July bio) should refresh once the
  sitemap is submitted.

## Rules

Match the existing style: Bootstrap utility classes, no new dependencies, no build step, no
framework. The site is fast to reason about because it is plain files — keep it that way.

Never invent client names, credits, dates or places. If a fact is not already in the HTML
or confirmed by Renato, leave it out.

**Jogo Limpo and DoZero carry "University project, no client" where the other pages have a
`Client:` line.** They had no client because both are university projects; Renato confirmed
that 13 Aug 2026 and asked for it to be stated rather than left blank. **Which university
is not established** — do not name one.
