---
layout: default
---

# 블로그

다른 매체에 실린 글과 인터뷰의 색인 — 짧은 노트와 원문 링크.

<ul class="entry-list">
{% assign entries = site.blog | sort: "date" | reverse -%}
{% for e in entries %}
  <li class="entry">
    <a class="entry-title" href="{{ e.url | relative_url }}">{{ e.title }}</a>
    <span class="entry-meta">{{ e.venue }}{% if e.issue %} · {{ e.issue }}{% endif %} · {{ e.date | date: "%Y.%m" }}</span>
  </li>
{% endfor -%}
</ul>
