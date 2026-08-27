---
layout: default
---
{% assign lang = "ko" -%}
{% assign cv = site.data.cv -%}
<!-- 내용은 _data/cv.yml 한 곳에서 관리. 여기 말고 거기서 고칠 것. -->

# 연구

## 논문
{% for p in cv.publications -%}
- ({{ p.date }}) [{{ p.title }}]({{ p.page | default: p.url }}) {{ p.journal.ko }}, {{ p.issue }}, {{ p.pages }}.{% if p.preprint %} [[저자 원고 PDF]({{ p.preprint }})]{% endif %}
{% endfor %}
## 진행 중인 연구
{% for w in cv.wip -%}
- {{ w[lang] }}
{% endfor %}
## 학위논문
- 석사학위논문 ({{ cv.thesis.date }}): {{ cv.thesis.title[lang] }}
	- 지도교수: [{{ cv.thesis.advisor.name[lang] }}]({{ cv.thesis.advisor.url }})
	- 심사위원: {% for c in cv.thesis.committee %}[{{ c.name[lang] }}]({{ c.url }}){% unless forloop.last %}, {% endunless %}{% endfor %}
