---
layout: default
---
{% assign lang = "en" -%}
{% assign cv = site.data.cv -%}
<!-- Content lives in _data/cv.yml (single source for this page and the PDF).
     The PDF is rebuilt by .github/workflows/cv-pdf.yml from that data. -->

# Curriculum Vitae

[Download PDF](/assets/cv.pdf)

## Areas
- **Areas of Specialisation** — {{ cv.areas.aos[lang] }}
- **Areas of Competence** — {{ cv.areas.aoc[lang] }}

## Education
{% for e in cv.education -%}
- {{ e.degree[lang] }}, {{ e.school[lang] }}, {{ e.location[lang] }}, {{ e.year }}.
{% endfor %}
## Thesis
- M.A. thesis ({{ cv.thesis.date }}): {{ cv.thesis.title[lang] }}. Advisor: [{{ cv.thesis.advisor.name[lang] }}]({{ cv.thesis.advisor.url }}). Committee: {% for c in cv.thesis.committee %}[{{ c.name[lang] }}]({{ c.url }}){% unless forloop.last %}, {% endunless %}{% endfor %}.

## Publications
{% for p in cv.publications -%}
- ({{ p.date }}) [{{ p.title }}]({{ p.url }}) ({{ p.gloss_en }}), *{{ p.journal.ko }} ({{ p.journal.en }})*, {{ p.issue }}.
{% endfor %}
## Presentations
{% for t in cv.presentations -%}
- *{{ t.title[lang] }}* — {% for v in t.venues %}{% if v.url %}[{{ v.place[lang] }}]({{ v.url }}){% else %}{{ v.place[lang] }}{% endif %}, {{ v.country[lang] }}, {{ v.date[lang] }}{% unless forloop.last %}; {% endunless %}{% endfor %}.
{% endfor %}
## Teaching Experience
- {{ cv.teaching.ta_header[lang] }}:
{% for c in cv.teaching.courses %}	- {{ c.name[lang] }}, {{ c.term[lang] }}.
{% endfor %}- {{ cv.teaching.short_course.header[lang] }} — {{ cv.teaching.short_course.detail[lang] }} ({{ cv.teaching.short_course.duration[lang] }}).

## Professional Service
{% for s in cv.service -%}
- {{ s.since }} {{ s.org[lang] }}, {{ s.role[lang] }}.
{% endfor %}
## Grants & Awards
{% for a in cv.awards -%}
{% if a.by %}- {{ a.title[lang] }}, {{ a.by[lang] }}.
	- *{{ a.note.talk[lang] }}*, {{ a.note.venue[lang] }}
{% else %}- {{ a.year }}: {{ a.title[lang] }}{% if a.org %}, {{ a.org[lang] }}{% endif %}.
{% endif %}{% endfor %}
