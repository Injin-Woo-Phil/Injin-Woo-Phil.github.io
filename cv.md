---
layout: default
---
{% assign lang = "en" -%}
{% assign cv = site.data.cv -%}
<!-- Content lives in _data/cv.yml (single source for this page and the PDF).
     The PDF is rebuilt by .github/workflows/cv-pdf.yml from that data. -->

# Curriculum Vitae

[Download PDF](/assets/cv.pdf)

## Education
{% for e in cv.education -%}
- {{ e.degree[lang] }}, {{ e.school[lang] }}, {{ e.location[lang] }}, {{ e.year }}.
{% endfor %}
## Thesis
- M.A. thesis ({{ cv.thesis.date }}): {{ cv.thesis.title[lang] }}. Advisor: {{ cv.thesis.advisor[lang] }}. Committee: {{ cv.thesis.committee[lang] }}.

## Publications
{% for p in cv.publications -%}
- ({{ p.date }}) {{ p.title }} ({{ p.gloss_en }}), *{{ p.journal.ko }} ({{ p.journal.en }})*, {{ p.issue }}.
{% endfor %}
## Presentations
{% for t in cv.presentations -%}
- *{{ t.title[lang] }}* — {% for v in t.venues %}{{ v.place[lang] }}, {{ v.date[lang] }}{% unless forloop.last %}; {% endunless %}{% endfor %}.
{% endfor %}
## Teaching
- {{ cv.teaching.ta_header[lang] }}:
{% for c in cv.teaching.courses %}	- {{ c.name[lang] }}, {{ c.term[lang] }}.
{% endfor %}- {{ cv.teaching.short_course.header[lang] }} — {{ cv.teaching.short_course.detail[lang] }} ({{ cv.teaching.short_course.duration[lang] }}).

## Professional Service
{% for s in cv.service -%}
- {{ s.since }} {{ s.org[lang] }}, {{ s.role[lang] }}.
{% endfor %}
## Grants & Awards
{% for a in cv.awards -%}
- {{ a.year }}: {{ a.title[lang] }}{% if a.org %}, {{ a.org[lang] }}{% endif %}.
{% endfor %}
