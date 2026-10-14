// 『코어 논리학』 7–8장 문장 논리. 검사는 문자열이 아니라 구문 나무에 한다.
const binary = new Set(['&', '∨', '→', '↔']);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const neg = a => ['~', a];
const contradictory = (a, b) => same(a, neg(b)) || same(b, neg(a));
const bin = (op, a, b) => [op, a, b];
const is = (f, op) => Array.isArray(f) && f[0] === op;
const hint = {
  '전제':'논증의 전제 목록에 같은 수식이 있어야 합니다.',
  '가정':'새 보조증명의 첫 행이어야 합니다.',
  '반복':'현재 열린 보조증명에서 접근 가능한 같은 수식 한 행을 인용하세요.',
  '→E':'X→Y와 X 두 행에서 Y를 얻습니다.',
  '∨E':'X∨Y와 ~X에서 Y를 얻거나, X∨Y와 ~Y에서 X를 얻습니다. ~X∨Y와 X에서는 Y를 얻습니다.',
  '∨I':'X에서 X∨Y 또는 Y∨X를 얻습니다.',
  '&E':'X&Y에서 X 또는 Y를 얻습니다.',
  '&I':'X와 Y 두 행에서 X&Y를 얻습니다.',
  '↔I':'X→Y와 Y→X 두 행에서 X↔Y를 얻습니다.',
  '↔E':'X↔Y에서 X→Y 또는 Y→X를 얻습니다.',
  '~E':'~~X에서 X를 얻습니다.',
  '→I':'X 가정으로 시작해 Y로 끝나는 보조증명 a-b를 인용해 X→Y를 얻습니다.',
  '~I':'X 가정으로 시작해 모순쌍을 얻은 보조증명 a-b를 인용해 ~X를 얻습니다.',
  'DNI':'X에서 ~~X를 얻습니다.', 'MT':'X→Y와 ~Y에서 ~X를 얻습니다.',
  'HS':'X→Y와 Y→Z에서 X→Z를 얻습니다.', 'CP':'X→Y와 ~Y→~X를 양방향으로 바꿉니다. 이중 부정은 정리할 수 있습니다.',
  'W':'Y에서 X→Y를 얻습니다.',
  'CASES':'X∨Y, X→Z, Y→Z에서 Z를 얻거나 두 경우의 보조증명 범위를 인용합니다.',
  'COMM':'& 또는 ∨의 두 구성 문장 순서를 바꿉니다.', 'ASSOC':'& 또는 ∨의 괄호 묶는 위치를 바꿉니다.',
  'DIST':'&와 ∨ 사이의 분배 형식을 한 번 바꿉니다.',
  'DM':'~(X∨Y)와 ~X&~Y, 또는 ~(X&Y)와 ~X∨~Y 사이를 바꿉니다.',
  'COND':'X→Y와 ~X∨Y, 또는 ~(X→Y)와 X&~Y 사이를 바꿉니다.'
};

export function parseFormula(input) {
  const src = input.replace(/\s+/g, '').replace(/¬/g, '~').replace(/∧/g, '&').replace(/\|/g, '∨').replace(/<->|⇔/g, '↔').replace(/->|⇒/g, '→').replace(/[vV]/g, '∨');
  const tokens = src.match(/↔|→|∨|&|~|\(|\)|[A-Z][A-Z0-9_]*/g) || [];
  if (tokens.join('') !== src || !src) throw Error('문장 형식을 읽을 수 없습니다. 명제문자는 A, B처럼 대문자로 쓰세요.');
  let p = 0;
  function atom() {
    const t = tokens[p++];
    if (t === '~') return neg(atom());
    if (t === '(') { const f = expr(0); if (tokens[p++] !== ')') throw Error('닫는 괄호가 없습니다.'); return f; }
    if (t && /^[A-Z]/.test(t)) return t;
    throw Error('문장 형식을 읽을 수 없습니다.');
  }
  const precedence = { '↔': 1, '→': 2, '∨': 3, '&': 4 };
  function expr(min) {
    let left = atom();
    while (precedence[tokens[p]] >= min && binary.has(tokens[p])) {
      const op = tokens[p++], prec = precedence[op];
      left = bin(op, left, expr(prec + (op === '→' ? 0 : 1)));
    }
    return left;
  }
  const f = expr(1);
  if (p !== tokens.length) throw Error('괄호나 연결사의 위치를 확인하세요.');
  return f;
}

// 입력 안내와 규칙 이름 인식이 같은 목록을 사용한다.
export const RULES = [
  { id:'전제', group:'basic', name:'전제', inputs:['전제'], cite:'인용 없음' },
  { id:'가정', group:'basic', name:'가정', inputs:['가정'], cite:'인용 없음 · |로 시작' },
  { id:'반복', group:'basic', name:'반복', inputs:['반복','reit'], cite:'1' },
  { id:'→E', group:'basic', name:'조건 기호 제거', inputs:['-> 제거','->E','MP'], cite:'1,2' },
  { id:'→I', group:'basic', name:'조건 기호 도입', inputs:['-> 도입','->I'], cite:'3-5' },
  { id:'∨E', group:'basic', name:'선언 기호 제거', inputs:['V 제거','VE'], cite:'1,2' },
  { id:'∨I', group:'basic', name:'선언 기호 도입', inputs:['V 도입','VI'], cite:'1' },
  { id:'&E', group:'basic', name:'연언 기호 제거', inputs:['& 제거','&E'], cite:'1' },
  { id:'&I', group:'basic', name:'연언 기호 도입', inputs:['& 도입','&I'], cite:'1,2' },
  { id:'↔E', group:'basic', name:'쌍조건 기호 제거', inputs:['<-> 제거','<->E'], cite:'1' },
  { id:'↔I', group:'basic', name:'쌍조건 기호 도입', inputs:['<-> 도입','<->I'], cite:'1,2' },
  { id:'~E', group:'basic', name:'부정 기호 제거', inputs:['~ 제거','~E'], cite:'1' },
  { id:'~I', group:'basic', name:'부정 기호 도입', inputs:['~ 도입','~I'], cite:'3-5' },
  { id:'DNI', group:'derived', name:'이중 부정 도입', inputs:['이중 부정 도입'], cite:'1' },
  { id:'MT', group:'derived', name:'후건 부정', inputs:['후건 부정'], cite:'1,2' },
  { id:'HS', group:'derived', name:'연쇄 논법', inputs:['연쇄 논법'], cite:'1,2' },
  { id:'CP', group:'derived', name:'대우 규칙', inputs:['대우 규칙','대우'], cite:'1' },
  { id:'W', group:'derived', name:'약화', inputs:['약화'], cite:'1' },
  { id:'CASES', group:'derived', name:'경우에 의한 논증', inputs:['경우에 의한 논증'], cite:'1,2,3 또는 1,2-3,4-5' },
  { id:'COMM', group:'derived', name:'교환 규칙', inputs:['교환 규칙','교환'], cite:'1' },
  { id:'ASSOC', group:'derived', name:'결합 규칙', inputs:['결합 규칙','결합'], cite:'1' },
  { id:'DIST', group:'derived', name:'분배 규칙', inputs:['분배 규칙','분배'], cite:'1' },
  { id:'DM', group:'derived', name:'드 모르간의 규칙', inputs:['드 모르간의 규칙','드 모르간 규칙','드 모르간'], cite:'1' },
  { id:'COND', group:'derived', name:'조건문 규칙', inputs:['조건문 규칙','조건문'], cite:'1' }
];
const ruleKey = raw => raw.replace(/\s+/g, '').replace(/¬/g, '~').replace(/∧/g, '&').replace(/<->/g, '↔').replace(/->/g, '→').replace(/^[vV]/, '∨').toLowerCase();
const ruleNames = new Map(RULES.flatMap(rule => [rule.name, ...rule.inputs].map(input => [ruleKey(input), rule.id])));
const normalizeRule = raw => ruleNames.get(ruleKey(raw)) || null;

export function parseProof(text) {
  const rows = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (!rows.length) throw Error('증명을 입력하세요.');
  return rows.map((row, i) => {
    const m = row.match(/^(?:(\d+)[.)]\s*)?((?:\|\s*)*)\s*([^;]+);\s*([^;]+)$/);
    if (!m) throw Error(`${i + 1}행: ‘수식 ; 규칙 인용번호’ 형태로 입력하세요.`);
    if (m[1] && Number(m[1]) !== i + 1) throw Error(`${i + 1}행: 행 번호가 순서와 다릅니다.`);
    const tail = m[4].trim().match(/^(.*?)(\d[\d,\s-]*)?$/);
    let rule = tail && normalizeRule(tail[1].replace(/,\s*$/, ''));
    let citationText = tail?.[2] || '';
    if (!rule) {
      const leading = m[4].trim().match(/^(\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*)\s*,?\s*(.+)$/);
      if (leading) { rule = normalizeRule(leading[2]); citationText = leading[1]; }
    }
    if (!rule) throw Error(`${i + 1}행: 규칙 이름을 확인하세요.`);
    const refs = citationText.replace(/\s+/g, '').split(',').filter(Boolean).map(s => {
      const r = s.match(/^(\d+)(?:-(\d+))?$/);
      if (!r) throw Error(`${i + 1}행: 인용은 1,2 또는 3-5처럼 쓰세요.`);
      return r[2] ? [Number(r[1]), Number(r[2])] : Number(r[1]);
    });
    return { n: i + 1, depth: (m[2].match(/\|/g) || []).length, formulaText: m[3].trim(), f: parseFormula(m[3]), rule, refs };
  });
}

function simplifyNegations(f) {
  if (!Array.isArray(f)) return f;
  const children = f.slice(1).map(simplifyNegations);
  return f[0] === '~' && is(children[0], '~') ? children[0][1] : [f[0], ...children];
}
const opposite = f => is(f, '~') ? f[1] : neg(f);

function algebraicKey(f, kind) {
  if (!Array.isArray(f)) return f;
  const children = f.slice(1).map(x => algebraicKey(x, kind));
  if (f[0] === '&' || f[0] === '∨') {
    if (kind === 'COMM') children.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (kind === 'ASSOC') return [f[0], ...children.flatMap(x => is(x, f[0]) ? x.slice(1) : [x])];
  }
  if (kind === 'CP' && f[0] === '→') {
    const direct = bin('→', children[0], children[1]);
    const reversed = bin('→', opposite(children[1]), opposite(children[0]));
    return JSON.stringify(direct) < JSON.stringify(reversed) ? direct : reversed;
  }
  return [f[0], ...children];
}

function deMorganKey(f, inverted = false) {
  if (!Array.isArray(f)) return inverted ? neg(f) : f;
  if (f[0] === '~') return deMorganKey(f[1], !inverted);
  if (f[0] === '&' || f[0] === '∨') return bin(inverted ? (f[0] === '&' ? '∨' : '&') : f[0], deMorganKey(f[1], inverted), deMorganKey(f[2], inverted));
  const result = [f[0], ...f.slice(1).map(x => deMorganKey(x))];
  return inverted ? neg(result) : result;
}
const contains = (f, test) => Array.isArray(f) && (test(f) || f.slice(1).some(x => contains(x, test)));

function localVariants(a, kind) {
  const variants = [];
  if (kind === 'DIST') for (const outer of ['&', '∨']) {
    const inner = outer === '&' ? '∨' : '&';
    if (is(a, outer)) {
      if (is(a[2], inner)) variants.push(bin(inner, bin(outer, a[1], a[2][1]), bin(outer, a[1], a[2][2])));
      if (is(a[1], inner)) variants.push(bin(inner, bin(outer, a[1][1], a[2]), bin(outer, a[1][2], a[2])));
    }
    if (is(a, inner) && is(a[1], outer) && is(a[2], outer)) for (const i of [1, 2]) for (const j of [1, 2]) {
      if (same(a[1][i], a[2][j])) {
        const rest = bin(inner, a[1][3 - i], a[2][3 - j]);
        variants.push(bin(outer, a[1][i], rest), bin(outer, rest, a[1][i]));
      }
    }
  }
  if (kind === 'COND' && is(a, '→')) variants.push(bin('∨', opposite(a[1]), a[2]));
  if (kind === 'COND' && is(a, '∨')) variants.push(bin('→', opposite(a[1]), a[2]));
  if (kind === 'COND' && is(a, '~') && is(a[1], '→')) variants.push(bin('&', a[1][1], opposite(a[1][2])));
  if (kind === 'COND' && is(a, '&')) variants.push(neg(bin('→', a[1], opposite(a[2]))));
  return variants.map(simplifyNegations);
}

function schematic(source, target, kind) {
  const a = simplifyNegations(source), b = simplifyNegations(target);
  if (kind === 'CP') return contains(a, x => x[0] === '→') && same(algebraicKey(a, kind), algebraicKey(b, kind));
  if (kind === 'COMM' || kind === 'ASSOC') return same(algebraicKey(a, kind), algebraicKey(b, kind));
  if (kind === 'DM') return (contains(a, x => x[0] === '~' && (is(x[1], '&') || is(x[1], '∨'))) || contains(b, x => x[0] === '~' && (is(x[1], '&') || is(x[1], '∨')))) && same(deMorganKey(a), deMorganKey(b));
  if (same(a, b)) return true;
  const childrenMatch = (x, y) => Array.isArray(x) && Array.isArray(y) && x[0] === y[0] && x.length === y.length && x.slice(1).every((part, i) => schematic(part, y[i + 1], kind));
  return childrenMatch(a, b) || localVariants(a, kind).some(v => same(v, b) || childrenMatch(v, b)) || localVariants(b, kind).some(v => same(a, v) || childrenMatch(a, v));
}

export function checkProof(premiseText, conclusionText, proofText, basicOnly = false) {
  let premises, goal, lines;
  try {
    premises = premiseText.split('\n').map(s => s.trim()).filter(Boolean).map(parseFormula);
    goal = parseFormula(conclusionText);
    lines = parseProof(proofText);
  } catch (e) { return { ok: false, line: null, message: e.message }; }
  const fail = (l, msg) => ({ ok: false, line: l.n, message: `${l.n}행: ${msg}` });
  const open = [];
  const scopeAt = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], prev = lines[i - 1];
    if (l.depth > (prev?.depth || 0) + 1) return fail(l, '보조증명 깊이를 한 번에 한 단계씩 늘리세요.');
    if (l.depth > (prev?.depth || 0) && l.rule !== '가정') return fail(l, '보조증명은 가정으로 시작해야 합니다.');
    if (l.rule === '가정' && (l.depth < 1 || l.depth > (prev?.depth || 0) + 1)) return fail(l, '가정은 새 보조증명을 열어야 합니다.');
    while (open.length > l.depth || (l.rule === '가정' && open.length >= l.depth)) open.pop();
    if (l.rule === '가정') open.push(l.n);
    if (l.depth !== open.length) return fail(l, '가정선(|)의 깊이가 맞지 않습니다.');
    scopeAt[i] = [...open];
    const ref = n => lines[n - 1];
    const accessible = n => n > 0 && n < l.n && ref(n).depth <= l.depth && scopeAt[n - 1].every((a, k) => scopeAt[i][k] === a);
    const nums = l.refs.filter(x => typeof x === 'number');
    const ranges = l.refs.filter(Array.isArray);
    const exact = (n, r = 0) => nums.length === n && ranges.length === r;
    if (l.refs.some(x => typeof x === 'number' && !accessible(x))) return fail(l, '닫힌 보조증명이나 미래 행을 인용했습니다.');
    const fs = nums.map(n => ref(n).f), f = l.f;
    const pair = pred => fs.length === 2 && (pred(fs[0], fs[1]) || pred(fs[1], fs[0]));
    const subproof = () => {
      if (!exact(0, 1)) return null;
      const [a, b] = ranges[0];
      if (a < 1 || b >= l.n || a > b || l.depth + 1 !== ref(a).depth || ref(a).rule !== '가정' || ref(b).depth !== l.depth + 1 || (prev && b !== prev.n)) return null;
      if (scopeAt[a - 1].slice(0, -1).some((v, k) => v !== scopeAt[i][k])) return null;
      if (scopeAt[b - 1][l.depth] !== a) return null;
      return [ref(a).f, ref(b).f, a, b];
    };
    let valid = false;
    if (l.rule === '전제') valid = l.depth === 0 && exact(0) && premises.some(p => same(p, f));
    else if (l.rule === '가정') valid = exact(0);
    else if (l.rule === '반복') valid = exact(1) && same(f, fs[0]);
    else if (l.rule === '→E') valid = exact(2) && pair((x, y) => is(x, '→') && same(x[1], y) && same(x[2], f));
    else if (l.rule === '∨E') valid = exact(2) && pair((x, y) => is(x, '∨') && ((contradictory(x[1], y) && same(x[2], f)) || (contradictory(x[2], y) && same(x[1], f))));
    else if (l.rule === '∨I') valid = exact(1) && is(f, '∨') && (same(f[1], fs[0]) || same(f[2], fs[0]));
    else if (l.rule === '&E') valid = exact(1) && is(fs[0], '&') && (same(f, fs[0][1]) || same(f, fs[0][2]));
    else if (l.rule === '&I') valid = exact(2) && is(f, '&') && ((same(f[1], fs[0]) && same(f[2], fs[1])) || (same(f[1], fs[1]) && same(f[2], fs[0])));
    else if (l.rule === '↔I') valid = exact(2) && is(f, '↔') && fs.some(x => same(x, bin('→', f[1], f[2]))) && fs.some(x => same(x, bin('→', f[2], f[1])));
    else if (l.rule === '↔E') valid = exact(1) && is(fs[0], '↔') && (same(f, bin('→', fs[0][1], fs[0][2])) || same(f, bin('→', fs[0][2], fs[0][1])));
    else if (l.rule === '~E') valid = exact(1) && is(fs[0], '~') && is(fs[0][1], '~') && same(f, fs[0][1][1]);
    else if (l.rule === '→I') { const s = subproof(); valid = !!s && same(f, bin('→', s[0], s[1])); }
    else if (l.rule === '~I') {
      const s = subproof();
      if (s && same(f, neg(s[0]))) {
        const inside = lines.slice(s[2] - 1, s[3]).filter(x => scopeAt[x.n - 1].every((a, k) => scopeAt[s[3] - 1][k] === a));
        valid = inside.some(x => inside.some(y => same(x.f, neg(y.f))));
      }
    }
    else if (!basicOnly) {
      if (l.rule === 'DNI') valid = exact(1) && same(f, neg(neg(fs[0])));
      else if (l.rule === 'MT') valid = exact(2) && pair((x, y) => is(x, '→') && ((same(y, neg(x[2])) && same(f, neg(x[1]))) || (is(x[2], '~') && same(y, x[2][1]) && same(f, neg(x[1])))));
      else if (l.rule === 'HS') valid = exact(2) && is(f, '→') && pair((x, y) => is(x, '→') && is(y, '→') && same(x[1], f[1]) && same(x[2], y[1]) && same(y[2], f[2]));
      else if (l.rule === 'CP') valid = exact(1) && schematic(fs[0], f, 'CP');
      else if (l.rule === 'W') valid = exact(1) && is(f, '→') && same(f[2], fs[0]);
      else if (l.rule === 'CASES') {
        valid = exact(3) && fs.some(x => is(x, '∨') && fs.some(y => same(y, bin('→', x[1], f))) && fs.some(y => same(y, bin('→', x[2], f))));
        if (!valid && exact(1, 2) && is(fs[0], '∨')) {
          const branch = ([a, b], assumption) => a > 0 && b < l.n && a <= b && ref(a).rule === '가정' && ref(a).depth === l.depth + 1 && ref(b).depth === l.depth + 1 && same(ref(a).f, assumption) && same(ref(b).f, f) && scopeAt[b - 1][l.depth] === a && scopeAt[a - 1].slice(0, -1).every((v, k) => v === scopeAt[i][k]);
          const [r1, r2] = [...ranges].sort((a, b) => a[0] - b[0]);
          valid = r1[1] < r2[0] && r2[1] === prev.n && ((branch(r1, fs[0][1]) && branch(r2, fs[0][2])) || (branch(r1, fs[0][2]) && branch(r2, fs[0][1])));
        }
      }
      else if (['COMM','ASSOC','DIST','DM','COND'].includes(l.rule)) valid = exact(1) && schematic(fs[0], f, l.rule);
    }
    if (!valid) return fail(l, basicOnly && !['전제','가정','반복','→E','∨E','∨I','&E','&I','↔I','↔E','~E','→I','~I'].includes(l.rule) ? '이 문제는 기본 규칙만 허용합니다.' : `규칙의 형식, 인용번호, 가정 해제를 확인하세요. ${hint[l.rule].replaceAll('→', ' -> ').replaceAll('∨', ' V ')}`);
  }
  const last = lines.at(-1);
  if (last.depth !== 0) return fail(last, '마지막 보조증명이 닫히지 않았습니다.');
  if (!same(last.f, goal)) return fail(last, '마지막 행이 목표 결론과 다릅니다.');
  return { ok: true, line: null, message: `${lines.length}개 행을 검사했습니다. 각 행의 규칙 적용과 가정 해제가 맞습니다.` };
}
