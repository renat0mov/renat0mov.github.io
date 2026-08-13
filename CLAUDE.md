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
so check locally first — `python3 -m http.server 8000` from the repo root — and keep work
on a branch until it is ready.

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

1. **The homepage ships ~22 MB of GIF.** Five autoplaying hero GIFs, 3.1–5.4 MB each,
   all loaded on first paint, none lazy, no `width`/`height`, no poster, no `loading` attr.
   Confirmed live: `corrida-solidaria-aveiro-e-nosso.gif` is 5,395,278 bytes over the wire.
   On a phone on 4G this is the whole ranking problem — everything below is worth less
   than fixing it. They want to be short muted autoplay `<video>` in MP4/WebM, or at
   minimum `loading="lazy"` with real dimensions.
2. **No `<h1>` on any page.** The site name is an untitled `<img>` (`images/RENAT0.png`,
   no `alt`), and `index.html:47` has the real `<h1>` commented out. About and project
   pages fake headings with `<p class="h1">`, which styles like a heading and parses as
   a paragraph.
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

## Open decisions — Renato's, not ours

- **Portuguese.** Adding `/pt` pages, or a bilingual about, is the largest single gain
  available for the searches his actual clients type. It is also the most writing. Not
  started until he says which.

## Rules

Match the existing style: Bootstrap utility classes, no new dependencies, no build step,
no framework. The site is fast to reason about because it is eight plain files — keep it
that way.

Never invent client names, credits or dates. Everything on this site is a real job for a
real client; if a fact is not already in the HTML or confirmed by Renato, leave it out.
