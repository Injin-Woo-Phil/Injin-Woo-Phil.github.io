---
layout: default
---

# 블로그

외부 기고문과 전문적이지 않은 글입니다. 링크를 참고하세요.

<ul class="entry-list">
{%- assign links = site.data.blog_links | sort: "date" | reverse %}
{% for e in links %}
  <li class="entry">
    <a class="entry-title" href="{{ e.url }}" rel="external">{{ e.title }}</a>
    <span class="entry-meta">공진단 블랙 · {{ e.issue }} · {{ e.date | date: "%Y.%m" }}</span>
  </li>
{% endfor -%}
{%- assign entries = site.blog | sort: "date" | reverse %}
{% for e in entries %}
  <li class="entry">
    <a class="entry-title" href="{{ '/ko' | append: e.url | relative_url }}">{{ e.title }}</a>
    <span class="entry-meta">{{ e.venue }}{% if e.issue %} · {{ e.issue }}{% endif %} · {{ e.date | date: "%Y.%m" }}</span>
  </li>
{% endfor -%}
</ul>
