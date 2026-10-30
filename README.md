# Injin Woo — academic homepage

This GitHub Pages site uses [Pascal Michaillat's Hugo academic website template](https://github.com/pmichaillat/hugo-website) and its bundled PaperMod theme. The template is MIT licensed; see `LICENSE.md`.

## Local preview

Install Hugo Extended, then run `hugo server` from this directory. The GitHub Actions workflow builds and deploys the site from `master`.

## Content

- English and Korean pages: `content/`
- Site navigation and home page: `config.yml`
- Downloadable files and tools: `static/`
- CV data source and PDF generator: `_data/cv.yml` and `bin/build_cv.rb`

The HTML CV, research, and talks pages were migrated from `_data/cv.yml` on 2026-10-30. Update the relevant Markdown pages when changing that data. The existing CV workflow still regenerates the PDF files on changes to `_data/cv.yml`.
