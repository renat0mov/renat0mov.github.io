# renat0.mov

Renato Ribeiro's site: one English page in the style of danieldalen.com. Hand-written HTML, one
stylesheet and two small vanilla scripts, no build step, no framework, no third-party requests.
Served by **GitHub Pages** at `https://renat0.mov`.

Personal project, not Audioglobo. Todoist label `personal`, in the **Personal** project. The
design decisions are in the Todoist task "Redesign do site renat0.mov" (Personal › Next).

*Rebuilt as one page on 8 Nov 2026 (branch `redesign-one-page`) from the mock-up Renato approved
with Jarvis, and live since 8 Nov 2026 (merge `d42e0ec`). The old multi-page Bootstrap portfolio, `/pt`, the project pages and their ~10 MB of
media were deleted on his decision of 6 Nov 2026; they are in git history before `b2f0dbb`.*

## Deploy

`~/Documents/Personal Website` is the working clone of `renat0mov/renat0mov.github.io`,
branch `main`. **A push to `main` is a deploy.** `.github/workflows/static.yml` uploads the
whole repository to GitHub Pages on every push, and the custom domain `renat0.mov` is set
in the repo's Pages settings rather than by a `CNAME` file in the tree.

There is no staging and no preview. Whatever lands on `main` is live a minute or two later,
so check locally first and keep work on a branch until Renato approves it.

**The workflow uploads the entire repository, so anything committed here is published on
renat0.mov.** `CLAUDE.md` and `serve.py` are deleted in the runner before packaging (the
`Strip files that are not part of the site` step). **Anything else added to this repo that is
not part of the site has to be added to that step**, or it goes live. `.claude/` is gitignored.

**Preview with `python3 serve.py`** (http://localhost:8000), not `python3 -m http.server`:
`serve.py` serves `404.html` with a real 404 for missing paths, as GitHub Pages does.
Add `?theme=light` or `?theme=dark` to force a theme while checking.

## Files

```
index.html          the page
404.html            same style, links home; every URL in it is root-absolute (/style.css)
style.css           all styles for both pages
theme.js            sunrise/sunset theme, loaded in <head> without defer (no flash)
main.js             copy button and project pop-ups, deferred
fonts/              subset woff2 + OFL licences
images/             WebP stills and marks, share.png (1200x630), LOGO MINI.png (source)
media/              jogo-limpo-teaser.mp4 (1440x1080 4:3, 31 s, sound, 18.9 MB) and
                    kapittal-os.mp4 (silent 1080p, 28 s, 5.7 MB); each loads only in its pop-up
favicon.ico · favicon.svg · apple-touch-icon.png · icon-192/512.png · site.webmanifest
robots.txt · sitemap.xml · llms.txt
serve.py            local preview only, never runs in production
```

## How the page works

**Security.** Each page has a Content-Security-Policy `<meta>` (GitHub Pages cannot send
headers): only the site's own files, nothing from another site and no frames (YouTube was dropped on 8 Nov 2026; both videos are
self-hosted).
Consequence: **no `style="…"` attributes and no inline `<script>` or `<style>`** anywhere, or the
browser silently drops them. Everything goes in `style.css` / `main.js`. JSON-LD is fine (it is
not executed). Referrer policy is `strict-origin-when-cross-origin`.

**Theme.** Light between the visitor's sunrise and sunset, dark otherwise. Place comes from the
browser's timezone mapped to its main city (table inlined in `theme.js`, from macOS `zone.tab`);
unknown zone falls back to 07:00–20:00; polar day/night handled; re-checked every minute. Colour
tokens are CSS variables on `:root` / `[data-theme="dark"]`, registered with `@property` so the
tokens themselves fade over 1.2 s at sunset (never put a colour transition on individual elements:
it overrides their own hover transitions). Without JS, the system setting decides.

**Opening animation.** Dalen's sequence as CSS keyframes. Each animated element has a `dN` class
whose `animation-delay` was computed once from the mock-up's `renderVals()` maths (headline lines
0.4 s + 0.12 s each, pills 1.19 s, words every 18 ms from 1.27 s, links 150 ms apart, then the
list and the ©). **Changing the paragraph text means recomputing those classes**; the generator
was a one-off script, not kept in the repo. Everything is off under `prefers-reduced-motion`.

**Headline** never wraps a line: font size is `min(70px, (100vw − 96px) / 9.2)` (40px cap on
phones) so narrow phones keep the three approved lines.

**Project logos** (Audioglobo, Kapittal-os) are drawn with CSS `mask` in `currentColor`, so one
black-on-transparent file serves both themes.

**Pop-ups** are one native `<dialog>` filled from a `<template>` per project. Esc, focus trap and
inert background come from the browser; `main.js` adds the closing animation, backdrop click and
focus return. A pop-up opened with the mouse focuses the dialog itself, so no focus ring is drawn
round the card (Renato saw one in Safari); from the keyboard the first control gets focus and its
ring. Nothing inside a template loads until its pop-up opens. Jogo Limpo (4:3 card, sound) waits
for its play button, then shows the browser's controls; Kapittal-os plays muted on a loop and
clicking it does nothing (Renato's call). Without JS the project names are plain links (the two
MP4s, audioglobo.pt). audioglobo.pt refuses framing, so its pop-up is
a picture of the site in a browser-style card, never an iframe.

**Search Console** verification tag is in `index.html` `<head>`. Removing it un-verifies the
property.

## Media pipeline

Stills: `cwebp -q 78` at 1280 px wide (pop-up cards top out at 960 CSS px). The Jogo Limpo poster
is the approved 16:9 still centre-cropped to 960x720.

Jogo Limpo video, from Renato's 2880x2160 master (134 MB, in his OneDrive; GitHub refuses >100 MB):
`ffmpeg -i JOGO_LIMPO_TEASER.mp4 -map 0:v:0 -map 0:a:0 -map_metadata -1 -vf scale=1440:1080:flags=lanczos
-c:v libx264 -preset slow -crf 22 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart`.

Icons: white mini logo on a black square, rounded (radius 56/256) everywhere except
`apple-touch-icon.png`, which is a full square because iOS rounds it itself. Marks: lossless WebP
from Renato's PNGs in `~/Downloads/logos for the personal website/`.

Fonts: Inter from `@fontsource-variable/inter` pinned to wght 400–600 with
`fontTools.varLib.instancer`, Geist Mono 400/500 from `@fontsource/geist-mono`, Instrument Serif
Italic from the OFL release; all cut with `fontTools.subset`. **Instrument Serif contains only the
letters of `kid multimedia passion live productions`, Geist Mono only A–Z, digits, `-` and `·`.**
New italic words or list items need a re-subset, or they fall back to Georgia / system mono.

Share image and icons were rendered from HTML with WeasyPrint (see the global CLAUDE.md for the
`DYLD_FALLBACK_LIBRARY_PATH` it needs), then `pdftoppm -r 96`.

## Rules

Plain files, no dependencies, no build step. Keep it that way.

Never invent client names, credits, dates or places. If a fact is not already in the HTML
or confirmed by Renato, leave it out. **Renato is based in Aveiro** (confirmed 13 Aug 2026).
The page says "At university I studied…": **which university is not established**, so do not
name one.

English only, one address (decided 8 Nov 2026). The Portuguese copy is kept in the Todoist task.

## Launch, settled 9 Nov 2026

- Live on `main` since 8 Nov 2026. Renato tested Safari, iPhone and the WhatsApp preview.
- Search Console: new `sitemap.xml` submitted; temporary removals requested for `/about`, the five
  old project pages and the `/pt/` prefix.
- DNS at name.com: `_dmarc` TXT `v=DMARC1; p=reject`, SPF `v=spf1 -all` (renat0.mov never sends
  email), and the GitHub Pages domain verification TXT `_github-pages-challenge-renat0mov`, which
  must stay or the verification lapses. **Do not remove the `google-site-verification` TXT either.**
- Not done, on purpose: CAA and a null MX (name.com's editor offers neither, so the old
  `mx3`–`mx8.name.com` MX rows stay; forwarding is off, so mail bounces) and DNSSEC (not offered
  on this account's page). AAAA records for GitHub's IPv6 addresses (`2606:50c0:8000::153` to
  `8003::153`) are optional; Renato chose not to add them for now.
- Domain renewal is tracked in Todoist.
