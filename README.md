# injin-woo-phil.github.io

Injin Woo's personal academic site — a Jekyll site hosted on GitHub Pages.
Bilingual (English at the root, Korean under `/ko/`) with a custom
"ink on paper / rubbing" theme.

## How it's built & deployed

- Static site built by **GitHub Pages** (classic build) on every push to
  `master`. There is no separate deploy workflow — just push and Pages
  rebuilds.
- Local preview needs a modern Ruby (the repo's default Ruby 2.6 is too old
  for current Jekyll). Edits are normally verified on the live site after
  pushing.

## Layout of the repo

| Path | What it is |
|------|-----------|
| `index.md`, `about.md`, `research.md`, `presentation.md`, `blog.md`, `cv.md` | English pages |
| `ko/*.md` | Korean counterparts (same file names under `ko/`) |
| `_layouts/default.html` | The only layout: masthead, nav, language toggle, footer |
| `assets/css/style.scss` | All styling (palette tokens, light/dark, typography) |
| `assets/img/thumbnail.png` | Portrait used on the home page |
| `_config.yml` | Site title, description (front page quote), and the nav menu |
| `.github/workflows/cv-pdf.yml` | Builds the downloadable CV PDFs (see below) |

## Editing content

**Korean is the source of truth.** Edit the `ko/*.md` page, then bring the
English page in line. (The Claude Code command `/sync-en` helps with this;
otherwise mirror the change by hand.) Keep the two language versions
structurally parallel — same sections in the same order.

Do not translate: the classical-Chinese quote on the home page, URLs,
proper nouns, dates, or English titles the author already wrote in English.

## Navigation menu

Defined in `_config.yml` under `navigation`. Each item has an English
`title` and a Korean `title_ko`; the layout shows the right one based on the
page's language. To add a page to the menu, add an entry there **and** create
both the English and Korean Markdown files.

## Language toggle

The yin-yang (taegeuk) button in `_layouts/default.html` links each page to
its counterpart (`/about` ⇄ `/ko/about`, etc.). The mapping is computed from
the URL in Liquid — no per-page configuration needed. It is a plain `<a>`
link first; the spin is a JS enhancement that respects
`prefers-reduced-motion`.

## Theme / colours

`assets/css/style.scss` defines CSS custom properties for the palette
(`--paper`, `--ink`, `--rule`, `--seal`) with a `prefers-color-scheme: dark`
override. Hierarchy comes from typography, not colour; the seal (인주) colour
is reserved for the name-seal and the current menu item.

## CV PDF (auto-generated)

`cv.md` and `ko/cv.md` each link to a downloadable PDF at the top
(`/assets/cv.pdf`, `/assets/cv-ko.pdf`). Those PDFs are **generated
automatically**: whenever `cv.md` or `ko/cv.md` changes on `master`, the
workflow `.github/workflows/cv-pdf.yml` runs pandoc + XeLaTeX to rebuild them
(with an "Updated: YYYY-MM-DD" date) and commits them back to `assets/`.

- The commit is path-filtered and tagged `[skip ci]`, so it does not loop.
- To rebuild manually: GitHub → Actions → **Build CV PDF** → *Run workflow*.
- The first run creates the PDFs; until then the download links 404.

Approach adapted from <https://github.com/junian/markdown-resume>.
