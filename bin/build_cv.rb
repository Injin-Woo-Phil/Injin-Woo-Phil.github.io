#!/usr/bin/env ruby
# encoding: UTF-8
# Generate cv.tex (en) and cv-ko.tex (ko) from _data/cv.yml.
# Usage: ruby bin/build_cv.rb [output_dir]
# CJK font is taken from ENV['CV_CJK_LINE'] (default: Noto Serif CJK KR, for CI).
require 'yaml'

ROOT   = File.expand_path('..', __dir__)
DATA   = YAML.load_file(File.join(ROOT, '_data', 'cv.yml'))
PRE    = File.read(File.join(ROOT, 'bin', 'cv_preamble.tex'))
CJK    = ENV['CV_CJK_LINE'] || '\setCJKmainfont{Noto Serif CJK KR}'
OUTDIR = ARGV[0] || '.'

SECTIONS = {
  'en' => { areas: 'Areas', education: 'Education', thesis: 'Thesis',
            publications: 'Publications', presentations: 'Presentations',
            teaching: 'Teaching Experience', service: 'Professional Service',
            awards: 'Grants \\& Awards' },
  'ko' => { areas: '연구 분야', education: '학력', thesis: '학위논문',
            publications: '논문', presentations: '발표', teaching: '교육 경험',
            service: '학술 봉사', awards: '수상 및 장학' },
}

def esc(s); s.to_s.gsub(/([&%$#_])/) { '\\' + $1 }; end
def url_esc(u); u.to_s.gsub(/[&%#]/) { |m| '\\' + m }; end
def wl(t, u); u ? '\href{' + url_esc(u) + '}{\textcolor{link}{' + t + '}}' : t; end
def L(h, lang); h.is_a?(Hash) ? h[lang] : h; end
def e(h, lang); esc(L(h, lang)); end
def it(s); '\textit{' + s + '}'; end

def head(a, b = ''); '\cvhead{' + a + '}{' + b + '}' + "\n"; end
def line(a, b = ''); '\cvline{' + a + '}{' + b + '}' + "\n"; end
def sub(a, b = '');  '\cvsub{'  + a + '}{' + b + '}' + "\n"; end
def sec(t); '\cvsection{' + t + '}' + "\n"; end
GAP = '\cvgap' + "\n"

def build(lang)
  d = DATA
  s = SECTIONS[lang]
  out = +''

  # header
  out << '\begin{center}' << "\n"
  out << '  {\Huge\bfseries ' << e(d['name'], lang) << '}\\\\[1.5mm]' << "\n"
  out << '  {\normalsize \href{mailto:' << d['email'] << '}{' << d['email'] << '} \;\textbar\; '
  out << '\href{https://' << d['website'] << '}{' << d['website'] << '} \;\textbar\; '
  out << '\href{' << d['orcid'] << '}{ORCID}}\\\\[1mm]' << "\n"
  out << '  {\small ' << e(d['affiliation'], lang) << '}' << "\n"
  out << '\end{center}' << "\n\\vspace{1mm}\n"

  # areas (AoS / AoC)
  out << sec(s[:areas])
  aos = lang == 'ko' ? '전문 분야' : 'Areas of Specialisation'
  aoc = lang == 'ko' ? '관심 분야' : 'Areas of Competence'
  out << head(aos, '') << line(e(d['areas']['aos'], lang), '')
  out << head(aoc, '') << line(e(d['areas']['aoc'], lang), '')

  # education
  out << sec(s[:education])
  d['education'].each_with_index do |ed, i|
    out << GAP if i > 0
    out << head(e(ed['degree'], lang), esc(ed['year']))
    out << line(e(ed['school'], lang), e(ed['location'], lang))
  end

  # thesis
  th = d['thesis']
  out << sec(s[:thesis])
  th_head   = lang == 'ko' ? '석사학위논문' : 'M.A. Thesis'
  advisor   = lang == 'ko' ? '지도교수' : 'Advisor'
  committee = lang == 'ko' ? '심사위원' : 'Committee'
  adv = wl(e(th['advisor']['name'], lang), th['advisor']['url'])
  comm = th['committee'].map { |c| wl(e(c['name'], lang), c['url']) }.join(', ')
  out << head(th_head, esc(th['date']))
  out << line(e(th['title'], lang), '')
  out << sub("#{advisor}: #{adv} \\quad #{committee}: #{comm}", '')

  # publications
  out << sec(s[:publications])
  d['publications'].each do |p|
    out << head(wl(esc(p['title']), p['url']), esc(p['date']))
    out << line(esc(p['gloss_en']), '') if lang == 'en' && p['gloss_en']
    jr = esc(p['journal']['ko'])
    jr = "#{jr} (#{esc(p['journal']['en'])})" if lang == 'en'
    out << sub("#{it(jr)}, #{esc(p['issue'])}", '')
  end

  # presentations
  out << sec(s[:presentations])
  d['presentations'].each_with_index do |t, i|
    out << GAP if i > 0
    out << head(e(t['title'], lang), '')
    t['venues'].each do |v|
      place = wl(e(v['place'], lang), v['url'])
      place += ", #{e(v['country'], lang)}" if v['country']
      out << sub(place, e(v['date'], lang))
    end
  end

  # teaching
  tc = d['teaching']
  out << sec(s[:teaching])
  out << head(e(tc['ta_header'], lang), '')
  tc['courses'].each { |c| out << sub(e(c['name'], lang), e(c['term'], lang)) }
  out << GAP
  scv = tc['short_course']
  out << head(e(scv['header'], lang), e(scv['duration'], lang))
  out << line(e(scv['detail'], lang), '')

  # service
  out << sec(s[:service])
  d['service'].each_with_index do |sv, i|
    out << GAP if i > 0
    out << head(e(sv['org'], lang), esc(sv['since']))
    out << line(e(sv['role'], lang), '')
  end

  # awards
  out << sec(s[:awards])
  d['awards'].each_with_index do |aw, i|
    out << GAP if i > 0
    right = aw['by'] ? e(aw['by'], lang) : esc(aw['year'])
    out << head(e(aw['title'], lang), right)
    out << line(e(aw['org'], lang), '') if aw['org']
    if aw['note']
      out << sub("#{it(e(aw['note']['talk'], lang))}, #{e(aw['note']['venue'], lang)}", '')
    end
  end

  (PRE.sub('%%CJK%%', CJK)) + "\n\\begin{document}\n" + out + "\n\\end{document}\n"
end

{ 'en' => 'cv.tex', 'ko' => 'cv-ko.tex' }.each do |lang, fname|
  File.write(File.join(OUTDIR, fname), build(lang))
  puts "wrote #{fname}"
end
