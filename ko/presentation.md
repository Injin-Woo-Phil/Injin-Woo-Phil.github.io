---
layout: default
---
{% assign lang = "ko" -%}
{% assign cv = site.data.cv -%}
{% assign today = site.time | date: "%Y%m%d" | plus: 0 -%}
<!-- 내용은 _data/cv.yml 한 곳에서 관리. 여기 말고 거기서 고칠 것.
     Upcoming / Talks split on each venue's `ymd` vs the build date. -->

# 발표

## 다가오는 일정
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
## 지난 발표
{% for t in cv.presentations -%}
{% assign n = 0 %}{% for v in t.venues %}{% if v.ymd < today %}{% assign n = n | plus: 1 %}{% endif %}{% endfor -%}
{% if n > 0 -%}
#### *{{ t.title[lang] }}*{% if t.links %} <span class="entry-links">{% for l in t.links %}[{{ l.label[lang] }}]({{ l.url }}){% unless forloop.last %} · {% endunless %}{% endfor %}</span>{% endif %}
{% for v in t.venues %}{% if v.ymd < today -%}
- **{% if v.url %}[{{ v.place[lang] }}]({{ v.url }}){% else %}{{ v.place[lang] }}{% endif %}**{% if v.country.en != "South Korea" %}, {{ v.country[lang] }}{% endif %}, {{ v.date[lang] }}
{% endif %}{% endfor %}
{% endif -%}
{% endfor %}
## 코멘트
{% for c in cv.comments -%}
- {{ c.topic[lang] }}
	- **{{ c.place[lang] }}**, {{ c.date[lang] }}
{% endfor %}
