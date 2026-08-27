---
layout: default
---
{% assign lang = "ko" -%}
{% assign cv = site.data.cv -%}

# 소개

성균관대학교에서 철학과 한문학(고전 한문학)으로 학사 학위를 받고, 역시 성균관대학교에서 철학으로 석사 학위를 받았습니다. 인식론과 언어철학, 특히 이해의 인식론과 의미론적 추론주의에 가장 관심이 많습니다. 이 주제들을 AI에 적용하려고 노력중입니다. 철학사에서는 회의주의와 신유학에도 관심이 있습니다. 철학 이외에는 18세기 한국 문학과 송대 문학을 읽고 암송하는 것을 좋아합니다. 현대 재즈, 80년대 헤비메탈, 국악을 즐겨 듣습니다. 시간이 남으면 기타나 피리(국악기)를 연주합니다.

연락처: {{ site.data.cv.email }}

# 관심 분야

사회존재론, 사회언어철학, 과학적 이해, 피론주의, 실학.

# 학력
{% for e in cv.education -%}
- {{ e.degree[lang] }}, {{ e.school[lang] }}, {{ e.year }}.
{% endfor %}
# 학술 봉사
{% for s in cv.service -%}
- {{ s.since }} {{ s.org[lang] }}, {{ s.role[lang] }}.
{% endfor %}
<dl>
<dt>이름</dt>
<dd>우인진, 禹仁眞, Injin Woo.</dd>
<dt>출생지</dt>
<dd>대한민국 태백</dd>
</dl>
