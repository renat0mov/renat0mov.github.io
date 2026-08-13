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

For local checks, **`python3 -m http.server` will 404 every nav link.** The site links to
`./about` and `./audioglobo-x-primavera-sound-porto` without extensions; GitHub Pages
resolves those to the `.html` file and Python's server does not. Nothing is broken — hit
`/about.html` directly, or serve with `python3 -m http.server 8000 --extensions html`.

*Set up 13 Aug 2026. Before that Renato uploaded files through github.com's web form, which
is why the 55 commits up to `0602005` all read "Add files via upload". The local folder was
byte-identical to the repo when the history was attached, so nothing was lost.*

## Pages

```
index.html          the work grid, 5 projects
about.html          bio + "Trusted By" list
404.html
<slug>.html         one per project: title, client, YouTube embed, 7 still frames
style.css
images/             33 MB — 5 hero GIFs, ~3–5 MB each, plus JPG frames
```

Project pages are copies of each other with the content swapped. A change to the header,
footer or `<head>` has to be made in all eight files; there is no partial, no include and
no template. Grep before assuming one edit is enough.

## The task

Todoist: *IMPROVE THE AI Search, SEO and Google Search visibility OF MY PERSONAL WEBSITE*
(`6hCxGxcg46cwmJhf`, p3, added 6 Aug 2026).

What is actually wrong, worst first — verified against the live site on 13 Aug 2026:

1. ~~**The homepage ships ~22 MB of GIF.**~~ **Done 13 Aug 2026.** First load went from
   21.30 MB to 0.41 MB. See *Media pipeline* below for how, and for the commands to
   repeat it when a project is added.
2. **No `<h1>` on any page.** The site name is an untitled `<img>` (`images/RENAT0.png`,
   no `alt`), and the real `<h1>` in `index.html` is commented out. About and project
   pages fake headings with `<p class="h1">`, which styles like a heading and parses as
   a paragraph.

   When these become real `<h1>` elements, **delete the `h1` and `h1:hover` rules in
   `style.css`.** The blur-on-hover was written for the logo back when the logo was an
   `<h1>`; it is now a PNG, so the rule has nothing to style and would blur every real
   heading the moment one is added. Renato confirmed 13 Aug 2026 that it can go.
3. **No structured data anywhere.** No JSON-LD `Person`, no `VideoObject` on the project
   pages that embed YouTube, no `ImageObject`. This is the single biggest lever for the
   "AI Search" half of the task: answer engines quote what they can parse, and right now
   there is nothing machine-readable saying who he is, where he works or what he shoots.
4. **Every page carries the same `<meta name="description">`**, byte for byte, including
   the project pages. Google picks one and treats the rest as duplicates.
5. **No `robots.txt`, no `sitemap.xml`.** Both return 404. Eight pages, zero discovery aid.
   The stale copy Google still holds for `/about` (it serves the pre-July bio, "from the
   first shot to the final grade") is the symptom — nothing tells it to re-crawl.
6. **No `<link rel="canonical">`** on any page.
7. **`<html lang="en">` and not one word of Portuguese.** He is Portuguese, works ~98% in
   Portugal, and his clients search in Portuguese. `videógrafo`, `realizador`, `Aveiro`,
   `Porto` appear nowhere on the site. Needs a decision from Renato before anyone writes
   copy — see below.
8. **No location beyond "Portugal".** Aveiro and Porto are all over the work and named
   nowhere in the markup.
9. Thumbnail `alt` text is the URL slug (`alt="audioglobo-x-primavera-sound-porto"`), and
   the project stills are `alt="Frame 1"` … `alt="Frame 7"`.
10. Footer logo is `alt="good bye"` on every page.
11. `<meta name="keywords">` is dead weight — Google has ignored it for years. Harmless,
    but it is not doing the job the file implies it is doing.
12. No `twitter:card` tags. `og:` tags are present and correct.

## Media pipeline

Nothing here runs at build time. These are the commands used once, by hand, and the ones
to run again when a project is added.

**Hero loop.** `images/<slug>.mp4` plus `images/<slug>-poster.jpg`:

```
ffmpeg -i <slug>.gif -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,hqdn3d=4:3:6:4.5" \
  -movflags +faststart -an <slug>.mp4
```

`hqdn3d` is the part that matters. GIF encoders dither, x264 then spends most of its
bitrate encoding that speckle, and stripping it first took one file from 2.03 MB to
0.92 MB while making the dark areas look *better* than the GIF did. `yuv420p` for browser
support, even dimensions because libx264 rejects the odd heights these GIFs have (603,
607), `+faststart` so playback can begin before the download finishes.

**Stills.** 2048 px on the long edge, JPEG q80, progressive. Bootstrap's `.container`
tops out at 1320 CSS px, so 2048 still covers a retina panel; the 3840 px originals were
costing ~700 KB a frame for pixels nobody could see. Compared side by side at render size
the two are indistinguishable.

**Fonts.** `woff2_compress THICCCBOI-Bold.ttf` — 385 KB of TTF became 71 KB. The `.ttf`
files stay in the repo as the `@font-face` fallback and are never downloaded by a browser
that can read woff2.

**Why the grid videos have no `autoplay` attribute.** `loading="lazy"` on `<video>` is a
real standard and defers autoplay, but only Chrome 148+ ships it — Firefox and WebKit were
still in review as of Aug 2026. Left to `autoplay`, Safari would download all five loops
on load, which is the entire problem. So playback is started by an IntersectionObserver in
`index.html` instead, which behaves the same everywhere. Two consequences worth knowing:

- **A `visibilitychange` listener sits alongside the observer, and is not optional.** Chrome
  pauses the rendering pipeline that computes intersections in a background tab, so a site
  opened in one and switched to later would show five frozen posters without it.
- **`play()` rejects under iOS Low Power Mode** and there is nothing to fix when it does.
  The poster frame is the fallback, which is why every video has one.

## Open decisions — Renato's, not ours

- **Portuguese.** Adding `/pt` pages, or a bilingual about, is the largest single gain
  available for the searches his actual clients type. It is also the most writing. Not
  started until he says which.

## Rules

Match the existing style: Bootstrap utility classes, no new dependencies, no build step,
no framework. The site is fast to reason about because it is eight plain files — keep it
that way.

Never invent client names, credits or dates. If a fact is not already in the HTML or
confirmed by Renato, leave it out.

**Jogo Limpo and DoZero have no `Client:` line because they had no client — both are
university projects** (Universidade de Aveiro). Renato confirmed this 13 Aug 2026 and
wants it stated on the pages rather than left blank, so the absence reads as a fact about
the work instead of a missing field. Do that when the project pages are next edited.
