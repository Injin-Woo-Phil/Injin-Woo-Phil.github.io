# Injin Woo — academic homepage

This GitHub Pages site uses [Pascal Michaillat's Hugo academic website template](https://github.com/pmichaillat/hugo-website) and its bundled PaperMod theme. The template is MIT licensed; see `LICENSE.md`.

## Local preview

Install Hugo Extended, then run `ruby bin/build_hugo_pages.rb && hugo server` from this directory. The GitHub Actions workflow regenerates the pages, builds them, and deploys from `master`.

## Content

- About pages and the paper page: `content/`
- Generated English and Korean CV, research, talks, and writing pages: `content/`
- Site navigation and home page: `config.yml`
- Downloadable files and tools: `static/`
- CV data and PDF generator: `_data/cv.yml` and `bin/build_cv.rb`
- External writing links: `_data/blog_links.yml`

Edit the YAML files, then run `ruby bin/build_hugo_pages.rb` to refresh the generated Markdown pages. The CV workflow regenerates the PDF files when `_data/cv.yml` changes.
