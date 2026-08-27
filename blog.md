---
layout: default
---

# Other Writing

External contributions and non-academic pieces. Please follow the links.

<ul class="entry-list">
{%- assign links = site.data.blog_links | sort: "date" | reverse %}
{% for e in links %}
  <li class="entry">
    <a class="entry-title" href="{{ e.url }}" rel="external">{{ e.title_en | default: e.title }}</a>
    <span class="entry-meta">공진단 블랙 · {{ e.issue }} · {{ e.date | date: "%Y.%m" }} (in Korean)</span>
  </li>
{% endfor -%}
{%- assign entries = site.blog | sort: "date" | reverse %}
{% for e in entries %}
  <li class="entry">
    <a class="entry-title" href="{{ e.url | relative_url }}">{% if e.title_en %}{{ e.title_en }}{% else %}{{ e.title }}{% endif %}</a>
    <span class="entry-meta">{{ e.venue }}{% if e.issue %} · {{ e.issue }}{% endif %} · {{ e.date | date: "%Y.%m" }} (in Korean)</span>
  </li>
{% endfor -%}
</ul>
