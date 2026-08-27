---
layout: default
---
{% assign lang = "en" -%}
{% assign cv = site.data.cv -%}
<!-- Content lives in _data/cv.yml (single source). Edit there, not here. -->

# Research

## Publications
{% for p in cv.publications -%}
- ({{ p.date }}) [{{ p.title }}]({{ p.page | default: p.url }}) {{ p.journal.ko }}, {{ p.issue }}, {{ p.pages }}.{% if p.preprint %} [[Author manuscript PDF]({{ p.preprint }})]{% endif %}
	- {{ p.gloss_en }}
{% endfor %}
## Work in Progress
{% for w in cv.wip -%}
- {{ w[lang] }}
{% endfor %}
## Thesis
- M.A. thesis ({{ cv.thesis.date }}): {{ cv.thesis.title[lang] }}
	- Advisor: [{{ cv.thesis.advisor.name[lang] }}]({{ cv.thesis.advisor.url }})
	- Committee: {% for c in cv.thesis.committee %}[{{ c.name[lang] }}]({{ c.url }}){% unless forloop.last %}, {% endunless %}{% endfor %}
