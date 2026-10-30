require 'yaml'
require 'json'
require 'date'

root = File.expand_path('..', __dir__)
cv = YAML.load_file(File.join(root, '_data/cv.yml'))
writing = YAML.load_file(File.join(root, '_data/blog_links.yml'))

def local(value, lang)
  value.is_a?(Hash) ? value.fetch(lang) : value
end

def link(label, url)
  url ? "[#{label}](#{url})" : label
end

def page(root, slug, lang, title, body)
  suffix = lang == 'ko' ? '.ko' : ''
  url = "/#{lang == 'ko' ? 'ko/' : ''}#{slug}/"
  File.write(File.join(root, "content/#{slug}#{suffix}.md"), "---\ntitle: #{title.to_json}\nurl: #{url}\n---\n\n#{body.strip}\n")
end

%w[en ko].each do |lang|
  t = ->(value) { local(value, lang) }
  ko = lang == 'ko'

  research = "## #{ko ? '논문' : 'Publications'}\n\n"
  cv['publications'].each do |p|
    research << "- (#{p['date']}) #{link(p['title'], p['page'] || p['url'])} *#{p['journal']['ko']}* #{p['issue']}, #{p['pages']}."
    research << " [#{ko ? '저자 원고 PDF' : 'Author manuscript PDF'}](#{p['preprint']})" if p['preprint']
    research << "\n"
    research << "  - #{p['gloss_en']}\n" unless ko
  end
  research << "\n## #{ko ? '진행 중인 연구' : 'Work in Progress'}\n\n"
  cv['wip'].each { |w| research << "- #{t.call(w)}\n" }
  thesis = cv['thesis']
  research << "\n## #{ko ? '학위논문' : 'Thesis'}\n\n"
  research << "- #{ko ? '석사학위논문' : 'M.A. thesis'} (#{thesis['date']}): #{t.call(thesis['title'])}\n"
  research << "  - #{ko ? '지도교수' : 'Advisor'}: #{link(t.call(thesis['advisor']['name']), thesis['advisor']['url'])}\n"
  research << "  - #{ko ? '심사위원' : 'Committee'}: #{thesis['committee'].map { |c| link(t.call(c['name']), c['url']) }.join(', ')}\n"
  page(root, 'research', lang, ko ? '연구' : 'Research', research)

  talks = ''
  [true, false].each do |future|
    talks << "## #{future ? (ko ? '다가오는 일정' : 'Upcoming') : (ko ? '지난 발표' : 'Past Talks')}\n\n"
    cv['presentations'].each do |p|
      venues = p['venues'].select { |v| (v['ymd'].to_i >= Date.today.strftime('%Y%m%d').to_i) == future }
      next if venues.empty?
      talks << "### #{t.call(p['title'])}\n\n"
      venues.each do |v|
        country = v['country'] && v['country']['en'] != 'South Korea' ? ", #{t.call(v['country'])}" : ''
        talks << "- #{link(t.call(v['place']), v['url'])}#{country}, #{t.call(v['date'])}\n"
      end
      (p['links'] || []).each { |l| talks << "  - #{link(t.call(l['label']), l['url'])}\n" }
      talks << "\n"
    end
  end
  talks << "## #{ko ? '코멘트' : 'Comments'}\n\n"
  cv['comments'].each { |c| talks << "- #{t.call(c['topic'])} — #{t.call(c['place'])}, #{t.call(c['date'])}\n" }
  talks << "\n#{ko ? '수업 발표 · 『무정』의 영채 목소리 (2026)' : "Course presentation · Youngchae's Voice in *Mujeong* (2026)"} · [#{ko ? '슬라이드 PDF' : 'Slides PDF'}](/assets/slides-youngchae-voice-2026.pdf)\n"
  page(root, 'presentation', lang, ko ? '발표' : 'Talks', talks)

  resume = "[#{ko ? 'PDF 다운로드' : 'Download PDF'}](/assets/cv#{ko ? '-ko' : ''}.pdf)\n\n*#{t.call(cv['updated'])}*\n\n"
  resume << "## #{ko ? '연구 분야' : 'Areas'}\n\n"
  resume << "- **#{ko ? '전문 분야' : 'Areas of Specialisation'}** — #{t.call(cv['areas']['aos'])}\n"
  resume << "- **#{ko ? '관심 분야' : 'Areas of Competence'}** — #{t.call(cv['areas']['aoc'])}\n\n"
  resume << "## #{ko ? '학력' : 'Education'}\n\n"
  cv['education'].each do |e|
    location = ko ? '' : ", #{t.call(e['location'])}"
    resume << "- #{t.call(e['degree'])}, #{t.call(e['school'])}#{location}, #{e['year']}\n"
  end
  resume << "\n## #{ko ? '학위논문' : 'Thesis'}\n\n"
  resume << "- #{ko ? '석사학위논문' : 'M.A. thesis'} (#{thesis['date']}): #{t.call(thesis['title'])}. #{ko ? '지도교수' : 'Advisor'}: #{link(t.call(thesis['advisor']['name']), thesis['advisor']['url'])}. #{ko ? '심사위원' : 'Committee'}: #{thesis['committee'].map { |c| link(t.call(c['name']), c['url']) }.join(', ')}.\n"
  resume << "\n## #{ko ? '논문' : 'Publications'}\n\n"
  cv['publications'].each do |p|
    gloss = ko ? '' : " (#{p['gloss_en']})"
    journal = ko ? p['journal']['ko'] : "#{p['journal']['ko']} (#{p['journal']['en']})"
    resume << "- (#{p['date']}) #{link(p['title'], p['url'])}#{gloss}, *#{journal}* #{p['issue']}.\n"
  end
  resume << "\n## #{ko ? '발표' : 'Presentations'}\n\n"
  cv['presentations'].each do |p|
    venues = p['venues'].map { |v| "#{link(t.call(v['place']), v['url'])}, #{t.call(v['country'])}, #{t.call(v['date'])}" }
    resume << "- *#{t.call(p['title'])}* — #{venues.join('; ')}.\n"
  end
  resume << "\n## #{ko ? '교육 경험' : 'Teaching Experience'}\n\n"
  resume << "- #{t.call(cv['teaching']['ta_header'])}:\n"
  cv['teaching']['courses'].each { |c| resume << "  - #{t.call(c['name'])}, #{t.call(c['term'])}\n" }
  short = cv['teaching']['short_course']
  resume << "- #{t.call(short['header'])} — #{t.call(short['detail'])} (#{t.call(short['duration'])})\n"
  resume << "\n## #{ko ? '학술 봉사' : 'Professional Service'}\n\n"
  cv['service'].each { |s| resume << "- #{s['since']} #{t.call(s['org'])}, #{t.call(s['role'])}.\n" }
  resume << "\n## #{ko ? '수상 및 장학' : 'Grants & Awards'}\n\n"
  cv['awards'].each do |a|
    year = a['year'] ? "#{t.call(a['year'])}: " : ''
    org = a['org'] ? ", #{t.call(a['org'])}" : ''
    by = a['by'] ? ", #{t.call(a['by'])}" : ''
    resume << "- #{year}#{t.call(a['title'])}#{org}#{by}.\n"
    resume << "  - *#{t.call(a['note']['talk'])}*, #{t.call(a['note']['venue'])}\n" if a['note']
  end
  resume << "\n## #{ko ? '기고' : 'Public Writing'}\n\n"
  cv['public_writing'].each do |w|
    gloss = ko ? '' : " (#{w['gloss_en']})"
    outlet = ko ? w['outlet']['ko'] : "#{w['outlet']['ko']} (#{w['outlet']['en']})"
    resume << "- (#{w['date']}) #{link(w['title'], w['url'])}#{gloss}, *#{outlet}* #{w['issue']}.\n"
  end
  page(root, 'cv', lang, ko ? '이력서' : 'Curriculum Vitae', resume)

  blog = "#{ko ? '외부 기고문과 비학술 글입니다. 원문은 링크에서 읽을 수 있습니다.' : 'External contributions and non-academic pieces. Follow the links to read them.'}\n\n"
  writing.sort_by { |w| w['date'].to_s }.reverse_each do |w|
    title = ko ? w['title'] : w['title_en']
    blog << "- #{link(title, w['url'])} — 공진단 블랙, #{w['issue']}, #{w['date'].to_s[0, 7]}\n"
  end
  roundtable = ko ? '블랙토크: 과연 가능할까? 블랙토커가 말하는 국악 팬덤' : 'Black Talk: Is It Possible? Blacktalkers on Gugak Fandom'
  blog << "- #{link(roundtable, "/#{ko ? 'ko/' : ''}blog/2026-04-black26/")} — 공진단 블랙, vol.26, 2026-04\n"
  page(root, 'blog', lang, ko ? '기타 글' : 'Other Writing', blog)
end
