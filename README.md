# injin-woo-phil.github.io

우인진(Injin Woo)의 개인 학술 사이트 — GitHub Pages에 호스팅되는 Jekyll 사이트.
이중언어(영어는 루트, 한국어는 `/ko/` 아래) 구성에 "한지 위의 먹 / 탁본" 커스텀 테마.

> 처음이라면 [관리가이드.md](관리가이드.md)부터 — 초보용 요약본.

## 빌드 & 배포 방식

- `master`에 푸시할 때마다 **GitHub Pages**(클래식 빌드)가 정적 사이트를
  생성. 별도 배포 워크플로 없음 — 푸시하면 Pages가 알아서 다시 빌드.
- 로컬 미리보기에는 최신 Ruby 필요 (시스템 기본 Ruby 2.6은 현행 Jekyll에
  비해 너무 오래됨). 보통은 푸시 후 실제 사이트에서 확인.

## 저장소 구조

| 경로 | 내용 |
|------|-----|
| `index.md`, `about.md`, `research.md`, `presentation.md`, `blog.md`, `cv.md` | 영어 페이지 |
| `ko/*.md` | 한국어 페이지 (같은 파일명, `ko/` 아래) |
| `_layouts/default.html` | 유일한 레이아웃: 상단 헤더, 메뉴, 언어 전환, 푸터 |
| `assets/css/style.scss` | 스타일 전부 (팔레트 토큰, 라이트/다크, 타이포그래피) |
| `assets/img/thumbnail.jpg` | 홈 화면 초상화 |
| `_config.yml` | 사이트 제목, 설명(첫 화면 인용구), 메뉴 |
| `.github/workflows/cv-pdf.yml` | 다운로드용 CV PDF 자동 생성 (아래 참고) |

## 내용 수정

**한국어가 원본.** `ko/*.md` 페이지를 먼저 수정한 뒤 영어 페이지를 맞춤.
(Claude Code 명령 `/sync-en`이 도와줌; 없으면 손으로 똑같이 반영.)
두 언어 버전은 구조를 평행하게 유지 — 같은 섹션, 같은 순서.

번역하지 말 것: 홈 화면의 한문 인용구, URL, 고유명사, 날짜,
저자가 애초에 영어로 쓴 제목.

## 메뉴

`_config.yml`의 `navigation`에 정의. 각 항목에 영어 `title`과 한국어
`title_ko`가 있고, 페이지 언어에 따라 레이아웃이 알맞은 쪽을 표시.
메뉴에 페이지를 추가하려면 여기에 항목을 넣고 **동시에** 영어·한국어
Markdown 파일을 둘 다 생성.

## 언어 전환

`_layouts/default.html`의 태극 버튼이 각 페이지를 상대 언어 페이지로 연결
(`/about` ⇄ `/ko/about` 등). 대응 관계는 Liquid가 URL에서 계산 —
페이지별 설정 불필요. 기본은 일반 `<a>` 링크이고, 회전 애니메이션은
`prefers-reduced-motion`을 존중하는 JS 장식.

## 테마 / 색

`assets/css/style.scss`가 팔레트 CSS 변수(`--paper`, `--ink`, `--rule`,
`--seal`)를 정의하고 `prefers-color-scheme: dark` 오버라이드 제공.
위계는 색이 아니라 타이포그래피로 표현; 인주(印朱) 색은 이름 도장과
현재 메뉴 항목에만 사용.

## CV PDF (자동 생성)

`cv.md`와 `ko/cv.md` 상단에 다운로드 PDF 링크(`/assets/cv.pdf`,
`/assets/cv-ko.pdf`)가 있음. 이 PDF들은 **자동 생성**: 데이터 원본인
`_data/cv.yml`(또는 `bin/build_cv.rb`, `bin/cv_preamble.tex`)이 `master`에서
바뀌면 워크플로 `.github/workflows/cv-pdf.yml`이 `bin/build_cv.rb`로
cv.tex / cv-ko.tex를 렌더링하고 XeLaTeX로 컴파일해 ("Updated: YYYY-MM-DD"
날짜 포함) `assets/`에 커밋해 돌려놓음.

- 커밋은 경로 필터 + `[skip ci]` 태그라 무한 루프 없음.
- 수동 재생성: GitHub → Actions → **Build CV PDF** → *Run workflow*.
- 최초 실행 전에는 다운로드 링크가 404.

방식은 <https://github.com/junian/markdown-resume>에서 응용.
