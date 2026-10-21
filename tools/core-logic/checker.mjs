// 『코어 논리학』 7–8장 문장 논리. 검사는 문자열이 아니라 구문 나무에 한다.
const binary = new Set(['&', '∨', '→', '↔']);
// Bound names compare by binding position; propositional arrays retain their original form.
export function formulaKey(f, bound = []) {
  if (Array.isArray(f)) return f.map((x, i) => i === 0 && typeof x === 'string' ? x : formulaKey(x, bound));
  if (!f || typeof f !== 'object') return f;
  if (f.q) return [f.q, formulaKey(f.body, [...bound, f.v])];
  if (f.args) return [f.p, ...f.args.map(t => bound.includes(t) ? ['bound', bound.length - 1 - bound.lastIndexOf(t)] : ['free', t])];
  return f;
}
export const same = (a, b) => JSON.stringify(formulaKey(a)) === JSON.stringify(formulaKey(b));
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
  '↔E':'X↔Y에서 X→Y 또는 Y→X를 얻습니다. 파생규칙으로 X↔Y와 X에서 Y, 또는 Y에서 X를 얻습니다.',
  '~E':'~~X에서 X를 얻습니다.',
  '→I':'X 가정으로 시작해 Y로 끝나는 보조증명 a-b를 인용해 X→Y를 얻습니다.',
  '~I':'X 가정으로 시작해 모순쌍을 얻은 보조증명 a-b를 인용해 ~X를 얻습니다.',
  'RAA':'~X 가정에서 모순쌍을 얻은 보조증명 a-b를 인용해 X를 얻습니다.',
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
  if (/[∀∃=]|\b(?:forall|exists)\b/i.test(input)) throw inputError('양화사·동일성이 있는 식은 위의 양화 논리 탭에서 검사하세요.', 'unsupported');
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
  { id:'→E', group:'basic', name:'조건 기호 제거', inputs:['-> 제거','조건 제거','조건문 제거','->E','MP'], cite:'1,2' },
  { id:'→I', group:'basic', name:'조건 기호 도입', inputs:['-> 도입','조건 도입','조건문 도입','->I'], cite:'3-5' },
  { id:'∨E', group:'basic', name:'선언 기호 제거', inputs:['V 제거','선언 제거','VE'], cite:'1,2' },
  { id:'∨I', group:'basic', name:'선언 기호 도입', inputs:['V 도입','선언 도입','VI'], cite:'1' },
  { id:'&E', group:'basic', name:'연언 기호 제거', inputs:['& 제거','연언 제거','&E'], cite:'1' },
  { id:'&I', group:'basic', name:'연언 기호 도입', inputs:['& 도입','연언 도입','&I'], cite:'1,2' },
  { id:'↔E', group:'basic', name:'쌍조건 기호 제거', inputs:['<-> 제거','쌍조건 제거','쌍조건문 제거','<->E'], cite:'1 또는 1,2 (파생)' },
  { id:'↔I', group:'basic', name:'쌍조건 기호 도입', inputs:['<-> 도입','쌍조건 도입','쌍조건문 도입','<->I'], cite:'1,2' },
  { id:'~E', group:'basic', name:'부정 기호 제거', inputs:['~ 제거','부정 제거','~E'], cite:'1' },
  { id:'~I', group:'basic', name:'부정 기호 도입', inputs:['~ 도입','부정 도입','~I'], cite:'3-5' },
  { id:'RAA', group:'derived', name:'부정 도입·제거 약식', inputs:['~ 도입, ~ 제거','부정 도입, 부정 제거','~I, ~E'], cite:'3-5' },
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
const unaryRules = new Set(['반복','&E','↔E','~E','DNI','CP','COMM','ASSOC','DIST','DM','COND']);
export const normalizeRule = raw => {
  const named = ruleNames.get(ruleKey(raw));
  if (named) return named;
  const parts = raw.split(/[,·+]/).map(x => ruleNames.get(ruleKey(x)));
  return parts.length >= 2 && parts.length <= 4 && parts.every(x => unaryRules.has(x)) ? parts.join('+') : null;
};
const inputError = (message, status = 'input', line = null) => Object.assign(Error(message), { status, line });

export function parseProof(text, options = {}) {
  const parse = options.parseFormula || parseFormula;
  const normalize = options.normalizeRule || normalizeRule;
  const rows = text.split('\n').map(s => s.trim()).filter(Boolean);
  if (!rows.length) throw Error('증명을 입력하세요.');
  return rows.map((row, i) => {
    const m = row.match(/^(?:(\d+)[.)]\s*)?((?:\|\s*)*)\s*([^;]+);\s*([^;]+)$/);
    if (!m) throw Error(`${i + 1}행: ‘수식 ; 규칙 인용번호’ 형태로 입력하세요.`);
    if (m[1] && Number(m[1]) !== i + 1) throw Error(`${i + 1}행: 행 번호가 순서와 다릅니다.`);
    const tail = m[4].trim().match(/^(.*?)(\d[\d,\s-]*)?$/);
    let rule = tail && normalize(tail[1].replace(/,\s*$/, ''));
    let citationText = tail?.[2] || '';
    if (!rule) {
      const leading = m[4].trim().match(/^(\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*)\s*,?\s*(.+)$/);
      if (leading) { rule = normalize(leading[2]); citationText = leading[1]; }
    }
    if (!rule) throw inputError(`${i + 1}행: 등록된 규칙 이름 또는 지원하는 복합 규칙인지 확인하세요. 규칙을 각각 한 행씩 풀어 쓰면 검사할 수 있습니다.`, 'unsupported', i + 1);
    const refs = citationText.replace(/\s+/g, '').split(',').filter(Boolean).map(s => {
      const r = s.match(/^(\d+)(?:-(\d+))?$/);
      if (!r) throw Error(`${i + 1}행: 인용은 1,2 또는 3-5처럼 쓰세요.`);
      return r[2] ? [Number(r[1]), Number(r[2])] : Number(r[1]);
    });
    return { n: i + 1, depth: (m[2].match(/\|/g) || []).length, formulaText: m[3].trim(), f: parse(m[3], rule), rule, refs };
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
  return kind === 'COND' ? variants.map(simplifyNegations) : variants;
}

function schematic(source, target, kind) {
  const simplify = ['CP','DM','COND'].includes(kind) ? simplifyNegations : x => x;
  const a = simplify(source), b = simplify(target);
  if (kind === 'CP') return contains(a, x => x[0] === '→') && same(algebraicKey(a, kind), algebraicKey(b, kind));
  if (kind === 'COMM' || kind === 'ASSOC') return contains(a, x => x[0] === '&' || x[0] === '∨') && same(algebraicKey(a, kind), algebraicKey(b, kind));
  if (kind === 'DM') return (contains(a, x => x[0] === '~' && (is(x[1], '&') || is(x[1], '∨'))) || contains(b, x => x[0] === '~' && (is(x[1], '&') || is(x[1], '∨')))) && same(deMorganKey(a), deMorganKey(b));
  if (same(a, b)) return true;
  const childrenMatch = (x, y) => Array.isArray(x) && Array.isArray(y) && x[0] === y[0] && x.length === y.length && x.slice(1).every((part, i) => schematic(part, y[i + 1], kind));
  return childrenMatch(a, b) || localVariants(a, kind).some(v => same(v, b) || childrenMatch(v, b)) || localVariants(b, kind).some(v => same(a, v) || childrenMatch(a, v));
}

// 복합 규칙은 적힌 순서대로 중간식을 구성한다. 의미적 동치만으로 통과시키지 않는다.
function unaryMatches(a, b, rule) {
  if (rule === '반복') return same(a, b);
  if (rule === '&E') return is(a, '&') && (same(a[1], b) || same(a[2], b));
  if (rule === '↔E') return is(a, '↔') && (same(bin('→', a[1], a[2]), b) || same(bin('→', a[2], a[1]), b));
  if (rule === '~E') return is(a, '~') && is(a[1], '~') && same(a[1][1], b);
  if (rule === 'DNI') return same(neg(neg(a)), b);
  // 재귀 검사 안에서는 불변 부분을 허용하지만 전체 적용에는 해당 형식이 있어야 한다.
  if (rule === 'DIST' && !contains(a, x => localVariants(x, rule).length) && !contains(b, x => localVariants(x, rule).length)) return false;
  if (rule === 'COND' && !contains(a, x => is(x, '→') || is(x, '∨') || is(x, '&')) && !contains(b, x => is(x, '→') || is(x, '∨') || is(x, '&'))) return false;
  return schematic(a, b, rule);
}
function unaryVariants(a, rule) {
  if (rule === '반복') return [a];
  if (rule === '&E') return is(a, '&') ? a.slice(1) : [];
  if (rule === '↔E') return is(a, '↔') ? [bin('→', a[1], a[2]), bin('→', a[2], a[1])] : [];
  if (rule === '~E') return is(a, '~') && is(a[1], '~') ? [a[1][1]] : [];
  if (rule === 'DNI') return [neg(neg(a))];
  if (!Array.isArray(a)) return [];
  const out = [];
  if (rule === 'CP' && is(a, '→')) out.push(simplifyNegations(bin('→', neg(a[2]), neg(a[1]))));
  if (rule === 'COMM' && ['&','∨'].includes(a[0])) out.push(bin(a[0], a[2], a[1]));
  if (rule === 'ASSOC' && ['&','∨'].includes(a[0])) {
    if (is(a[1], a[0])) out.push(bin(a[0], a[1][1], bin(a[0], a[1][2], a[2])));
    if (is(a[2], a[0])) out.push(bin(a[0], bin(a[0], a[1], a[2][1]), a[2][2]));
  }
  if (rule === 'DM') {
    if (is(a, '~') && (is(a[1], '&') || is(a[1], '∨'))) out.push(bin(a[1][0] === '&' ? '∨' : '&', neg(a[1][1]), neg(a[1][2])));
    if ((is(a, '&') || is(a, '∨')) && is(a[1], '~') && is(a[2], '~')) out.push(neg(bin(a[0] === '&' ? '∨' : '&', a[1][1], a[2][1])));
  }
  if (rule === 'DIST' || rule === 'COND') out.push(...localVariants(a, rule));
  for (let i = 1; i < a.length; i++) for (const next of unaryVariants(a[i], rule)) {
    const changed = [...a]; changed[i] = next; out.push(changed);
    if (out.length > 256) throw inputError('복합 규칙의 중간식이 너무 많습니다. 규칙을 각각 한 행씩 풀어 쓰세요.', 'unsupported');
  }
  return out;
}
function compoundMatches(source, target, rules) {
  let candidates = [source];
  for (const rule of rules.slice(0, -1)) {
    candidates = [...new Map(candidates.flatMap(a => unaryVariants(a, rule)).map(a => [JSON.stringify(a), a])).values()];
    if (candidates.length > 256) throw inputError('복합 규칙의 중간식이 너무 많습니다. 규칙을 각각 한 행씩 풀어 쓰세요.', 'unsupported');
  }
  return candidates.some(a => unaryMatches(a, target, rules.at(-1)));
}
const flattenAnd = f => is(f, '&') ? [...flattenAnd(f[1]), ...flattenAnd(f[2])] : [f];

// 실패한 일반 추론에만 제한된 진리표를 사용한다. 통과 판정을 대신하지 않는다.
function counterexample(premises, conclusion) {
  const atoms = f => Array.isArray(f) ? f.slice(1).flatMap(atoms) : [f];
  const names = [...new Set([...premises.flatMap(atoms), ...atoms(conclusion)])];
  if (names.length > 10) return null;
  const evaluate = (f, env) => {
    if (!Array.isArray(f)) return env[f];
    const a = evaluate(f[1], env);
    if (f[0] === '~') return !a;
    const b = evaluate(f[2], env);
    return f[0] === '&' ? a && b : f[0] === '∨' ? a || b : f[0] === '→' ? !a || b : a === b;
  };
  for (let bits = 0; bits < 2 ** names.length; bits++) {
    const env = Object.fromEntries(names.map((name, i) => [name, !!(bits & (1 << i))]));
    if (premises.every(f => evaluate(f, env)) && !evaluate(conclusion, env)) return env;
  }
  return null;
}

export function checkProof(premiseText, conclusionText, proofText, basicOnly = false, options = {}) {
  const parse = options.parseFormula || parseFormula;
  const rules = options.rules || RULES;
  const opening = l => l.rule === '가정' || options.isOpening?.(l);
  let premises, goal, lines;
  try {
    premises = premiseText.split('\n').map(s => s.trim()).filter(Boolean).map(x => parse(x));
    goal = parse(conclusionText);
    lines = parseProof(proofText, options);
    options.validateInput?.({premises, goal, lines});
  } catch (e) { return { ok: false, status: e.status || 'input', line: e.line || null, message: e.message }; }
  const derivedLines = [];
  const fail = (l, msg, status = 'invalid') => ({ ok: false, status, line: l.n, derivedLines: [...derivedLines], message: `${l.n}행: ${msg}` });
  const open = [];
  const scopeAt = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], prev = lines[i - 1];
    if (l.depth > (prev?.depth || 0) + 1) return fail(l, '보조증명 깊이를 한 번에 한 단계씩 늘리세요.');
    if (l.depth > (prev?.depth || 0) && !opening(l)) return fail(l, '보조증명은 가정으로 시작해야 합니다.');
    if (opening(l) && (l.depth < 1 || l.depth > (prev?.depth || 0) + 1)) return fail(l, '가정은 새 보조증명을 열어야 합니다.');
    while (open.length > l.depth || (opening(l) && open.length >= l.depth)) open.pop();
    if (opening(l)) open.push(l.n);
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
    const closedRange = ([a, b]) => a >= 1 && a <= b && b < l.n &&
      (ref(a).rule === '가정' || (l.rule === '∀I' && options.isOpening?.(ref(a)))) && ref(a).depth === l.depth + 1 && ref(b).depth === l.depth + 1 &&
      scopeAt[a - 1].slice(0, -1).every((v, k) => scopeAt[i][k] === v) &&
      scopeAt[b - 1][l.depth] === a && scopeAt[b]?.[l.depth] !== a;
    if (ranges.some(range => !closedRange(range))) return fail(l, '인용 범위는 같은 바깥 가정 아래에서 완전히 끝난 보조증명이어야 합니다. 시작·끝 행과 가정선을 확인하세요.');
    const subproof = () => {
      if (!exact(0, 1)) return null;
      const [a, b] = ranges[0];
      return [ref(a).f, ref(b).f, a, b];
    };
    let valid = false;
    const ruleInfo = rules.find(rule => rule.id === l.rule);
    const compound = l.rule.includes('+');
    let derived = compound || ruleInfo?.group === 'derived';
    let derivedDetail = compound ? l.rule.split('+').map(id => rules.find(r => r.id === id)?.name || id).join(' · ') : derived ? ruleInfo.name : '';
    const context = {l, f, fs, nums, ranges, exact, ref, lines, premises, goal, scopeAt, open: [...open], accessible, basicOnly};
    const extra = options.extraRule?.(context);
    if (extra?.error) return fail(l, extra.error, extra.status || 'invalid');
    if (extra) { valid = extra.valid; derived = extra.derived ?? derived; derivedDetail = extra.detail || derivedDetail; }
    else if (l.rule === '전제') valid = l.depth === 0 && exact(0) && premises.some(p => same(p, f));
    else if (l.rule === '가정') valid = exact(0);
    else if (l.rule === '반복') valid = exact(1) && same(f, fs[0]);
    else if (l.rule === '→E') valid = exact(2) && pair((x, y) => is(x, '→') && same(x[1], y) && same(x[2], f));
    else if (l.rule === '∨E') {
      const basic = exact(2) && pair((x, y) => is(x, '∨') && ((same(neg(x[1]), y) && same(x[2], f)) || (same(neg(x[2]), y) && same(x[1], f))));
      valid = basic || (exact(2) && pair((x, y) => is(x, '∨') && ((contradictory(x[1], y) && same(x[2], f)) || (contradictory(x[2], y) && same(x[1], f)))));
      derived = valid && !basic;
      derivedDetail = '선언 제거 약식 · 이중 부정 도입 생략';
    }
    else if (l.rule === '∨I') valid = exact(1) && is(f, '∨') && (same(f[1], fs[0]) || same(f[2], fs[0]));
    else if (l.rule === '&E') valid = exact(1) && is(fs[0], '&') && (same(f, fs[0][1]) || same(f, fs[0][2]));
    else if (l.rule === '&I') {
      valid = exact(2) && is(f, '&') && pair((x, y) => same(f, bin('&', x, y)));
      if (!valid && exact(2) && is(f, '&') && pair((x, y) => same(flattenAnd(f), [...flattenAnd(x), ...flattenAnd(y)]))) {
        valid = true; derived = true; derivedDetail = '연언 도입·결합 약식 · 연속 연언의 괄호 묶음 조정';
      }
    }
    else if (l.rule === '↔I') valid = exact(2) && is(f, '↔') && fs.some(x => same(x, bin('→', f[1], f[2]))) && fs.some(x => same(x, bin('→', f[2], f[1])));
    else if (l.rule === '↔E') {
      valid = exact(1) && is(fs[0], '↔') && (same(f, bin('→', fs[0][1], fs[0][2])) || same(f, bin('→', fs[0][2], fs[0][1])));
      if (exact(2)) {
        valid = pair((x, y) => is(x, '↔') && ((same(x[1], y) && same(x[2], f)) || (same(x[2], y) && same(x[1], f))));
        derived = valid;
        derivedDetail = '쌍조건 제거 약식 · 조건 기호 제거를 함께 적용';
      }
    }
    else if (l.rule === '~E') valid = exact(1) && is(fs[0], '~') && is(fs[0][1], '~') && same(f, fs[0][1][1]);
    else if (l.rule === '→I') { const s = subproof(); valid = !!s && same(f, bin('→', s[0], s[1])); }
    else if (l.rule === '~I' || l.rule === 'RAA') {
      const s = subproof();
      if (s && (l.rule === '~I' ? same(f, neg(s[0])) : same(s[0], neg(f)))) {
        const inside = lines.slice(s[2] - 1, s[3]).filter(x => scopeAt[x.n - 1].every((a, k) => scopeAt[s[3] - 1][k] === a));
        valid = inside.some(x => inside.some(y => same(x.f, neg(y.f))));
      }
    }
    else if (!basicOnly) {
      if (compound && exact(1)) {
        try { valid = compoundMatches(fs[0], f, l.rule.split('+')); }
        catch (error) { return fail(l, error.message, error.status || 'unverified'); }
      }
      else if (l.rule === 'DNI') valid = exact(1) && same(f, neg(neg(fs[0])));
      else if (l.rule === 'MT') valid = exact(2) && pair((x, y) => is(x, '→') && ((same(y, neg(x[2])) && same(f, neg(x[1]))) || (is(x[2], '~') && same(y, x[2][1]) && same(f, neg(x[1])))));
      else if (l.rule === 'HS') valid = exact(2) && is(f, '→') && pair((x, y) => is(x, '→') && is(y, '→') && same(x[1], f[1]) && same(x[2], y[1]) && same(y[2], f[2]));
      else if (l.rule === 'CP') valid = exact(1) && schematic(fs[0], f, 'CP');
      else if (l.rule === 'W') valid = exact(1) && is(f, '→') && same(f[2], fs[0]);
      else if (l.rule === 'CASES') {
        valid = exact(3) && fs.some(x => is(x, '∨') && fs.some(y => same(y, bin('→', x[1], f))) && fs.some(y => same(y, bin('→', x[2], f))));
        if (!valid && exact(1, 2) && is(fs[0], '∨')) {
          const branch = ([a, b], assumption) => same(ref(a).f, assumption) && same(ref(b).f, f);
          const [r1, r2] = [...ranges].sort((a, b) => a[0] - b[0]);
          valid = r1[1] < r2[0] && ((branch(r1, fs[0][1]) && branch(r2, fs[0][2])) || (branch(r1, fs[0][2]) && branch(r2, fs[0][1])));
        }
      }
      else if (['COMM','ASSOC','DIST','DM','COND'].includes(l.rule)) valid = exact(1) && unaryMatches(fs[0], f, l.rule);
    }
    if (basicOnly && derived) return fail(l, '이 적용은 파생규칙입니다. 기본 규칙만 허용하는 경우에는 생략한 단계를 풀어 쓰세요.');
    if (!valid) {
      if (l.rule === '전제') return fail(l, hint['전제']);
      if (l.rule === '가정') return fail(l, '가정에는 인용번호를 쓰지 않습니다.');
      const witness = !options.disableCounterexample && !ranges.length && fs.length ? counterexample(fs, f) : null;
      if (witness) return { ...fail(l, '인용한 식들이 모두 참인데 이 행의 식은 거짓인 경우가 있습니다. ' + Object.entries(witness).map(([name, truth]) => `${name}=${truth ? '참' : '거짓'}`).join(', ')), counterexample: witness };
      const help = (options.hints?.[l.rule] || hint[l.rule] || '복합 규칙은 적힌 순서대로 적용합니다. 각 단계를 나누어 입력해 보세요.').replaceAll('→', ' -> ').replaceAll('∨', ' V ');
      return fail(l, `입력한 규칙과 인용으로 이 단계를 확인하지 못했습니다. 풀이 전체가 틀렸다는 뜻은 아닙니다. ${help}`, 'unverified');
    }
    const postError = options.afterRow?.(context, extra);
    if (postError) return fail(l, postError);
    if (derived) derivedLines.push({ line: l.n, rule: l.rule, detail: derivedDetail });
  }
  const last = lines.at(-1);
  if (last.depth !== 0) return fail(last, '마지막 보조증명이 닫히지 않았습니다.');
  if (!same(last.f, goal)) return fail(last, '마지막 행이 목표 결론과 다릅니다.');
  return { ok: true, status: 'valid', line: null, derivedLines, message: `${lines.length}개 행을 검사했습니다. 각 행의 규칙 적용과 가정 해제가 맞습니다.` };
}
