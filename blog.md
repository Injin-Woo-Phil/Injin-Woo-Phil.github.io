---
layout: default
---

# Blog

External contributions and non-academic pieces. Please follow the links.

<ul class="entry-list">
{% assign entries = site.blog | sort: "date" | reverse -%}
{% for e in entries %}
  <li class="entry">
    <a class="entry-title" href="{{ e.url | relative_url }}">{% if e.title_en %}{{ e.title_en }}{% else %}{{ e.title }}{% endif %}</a>
    <span class="entry-meta">{{ e.venue }}{% if e.issue %} · {{ e.issue }}{% endif %} · {{ e.date | date: "%Y.%m" }} (in Korean)</span>
  </li>
{% endfor -%}
</ul>
