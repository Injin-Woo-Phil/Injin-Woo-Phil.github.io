---
layout: default
---
{% assign lang = "en" -%}
{% assign cv = site.data.cv -%}
{% assign today = site.time | date: "%Y%m%d" | plus: 0 -%}
<!-- Content lives in _data/cv.yml (single source). Edit there, not here.
     Upcoming / Talks split on each venue's `ymd` vs the build date. -->

# Talks

## Upcoming
{% for t in cv.presentations -%}
{% assign n = 0 %}{% for v in t.venues %}{% if v.ymd >= today %}{% assign n = n | plus: 1 %}{% endif %}{% endfor -%}
{% if n > 0 -%}
#### {{ t.title[lang] }}{% if t.links %} <span class="entry-links">{% for l in t.links %}[{{ l.label[lang] }}]({{ l.url }}){% unless forloop.last %} · {% endunless %}{% endfor %}</span>{% endif %}
{% assign sorted = t.venues | sort: "ymd" -%}
{% for v in sorted %}{% if v.ymd >= today -%}
- **{% if v.url %}[{{ v.place[lang] }}]({{ v.url }}){% else %}{{ v.place[lang] }}{% endif %}**{% if v.country.en != "South Korea" %}, {{ v.country[lang] }}{% endif %}, {{ v.date[lang] }}
{% endif %}{% endfor %}
{% endif -%}
{% endfor %}
## Past Talks
{% for t in cv.presentations -%}
{% assign n = 0 %}{% for v in t.venues %}{% if v.ymd < today %}{% assign n = n | plus: 1 %}{% endif %}{% endfor -%}
{% if n > 0 -%}
#### *{{ t.title[lang] }}*{% if t.links %} <span class="entry-links">{% for l in t.links %}[{{ l.label[lang] }}]({{ l.url }}){% unless forloop.last %} · {% endunless %}{% endfor %}</span>{% endif %}
{% for v in t.venues %}{% if v.ymd < today -%}
- **{% if v.url %}[{{ v.place[lang] }}]({{ v.url }}){% else %}{{ v.place[lang] }}{% endif %}**{% if v.country.en != "South Korea" %}, {{ v.country[lang] }}{% endif %}, {{ v.date[lang] }}
{% endif %}{% endfor %}
{% endif -%}
{% endfor %}
## Comments
{% for c in cv.comments -%}
- {{ c.topic[lang] }}
	- **{{ c.place[lang] }}**, {{ c.date[lang] }}
{% endfor %}
