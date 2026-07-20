---
layout: default
---
{% assign lang = "ko" -%}
{% assign cv = site.data.cv -%}
<!-- 내용은 _data/cv.yml 한 곳에서 관리(이 페이지와 PDF 공용).
     PDF는 .github/workflows/cv-pdf.yml가 그 데이터로 다시 생성. -->

# 이력서

[PDF 다운로드](/assets/cv-ko.pdf)

## 연구 분야
- **전문 분야** — {{ cv.areas.aos[lang] }}
- **관심 분야** — {{ cv.areas.aoc[lang] }}

## 학력
{% for e in cv.education -%}
- {{ e.degree[lang] }}, {{ e.school[lang] }}, {{ e.year }}.
{% endfor %}
## 학위논문
- 석사학위논문 ({{ cv.thesis.date }}): {{ cv.thesis.title[lang] }}. 지도교수: [{{ cv.thesis.advisor.name[lang] }}]({{ cv.thesis.advisor.url }}). 심사위원: {% for c in cv.thesis.committee %}[{{ c.name[lang] }}]({{ c.url }}){% unless forloop.last %}, {% endunless %}{% endfor %}.

## 논문
{% for p in cv.publications -%}
- ({{ p.date }}) [{{ p.title }}]({{ p.url }}), *{{ p.journal.ko }}*, {{ p.issue }}.
{% endfor %}
## 발표
{% for t in cv.presentations -%}
- *{{ t.title[lang] }}* — {% for v in t.venues %}{% if v.url %}[{{ v.place[lang] }}]({{ v.url }}){% else %}{{ v.place[lang] }}{% endif %}, {{ v.country[lang] }}, {{ v.date[lang] }}{% unless forloop.last %}; {% endunless %}{% endfor %}.
{% endfor %}
## 교육 경험
- {{ cv.teaching.ta_header[lang] }}:
{% for c in cv.teaching.courses %}	- {{ c.name[lang] }}, {{ c.term[lang] }}.
{% endfor %}- {{ cv.teaching.short_course.header[lang] }} — {{ cv.teaching.short_course.detail[lang] }} ({{ cv.teaching.short_course.duration[lang] }}).

## 학술 봉사
{% for s in cv.service -%}
- {{ s.since }} {{ s.org[lang] }}, {{ s.role[lang] }}.
{% endfor %}
## 수상 및 장학
{% for a in cv.awards -%}
{% if a.by %}- {{ a.title[lang] }}, {{ a.by[lang] }}.
	- *{{ a.note.talk[lang] }}*, {{ a.note.venue[lang] }}
{% else %}- {{ a.year }}: {{ a.title[lang] }}{% if a.org %}, {{ a.org[lang] }}{% endif %}.
{% endif %}{% endfor %}
