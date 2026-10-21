// 『코어 논리학』 12–13장: 포획 없는 대입과 임시 이름의 의존 관계.
import { checkProof, parseProof, normalizeRule, RULES, same, formulaKey } from './checker.mjs?v=quantifier-ae-20261021';
const is = (f, op) => Array.isArray(f) && f[0] === op;
const quant = (f, q) => f && !Array.isArray(f) && f.q === q;
const termPattern = /^[a-z][0-9]*$/;
const error = (message, status = 'input') => Object.assign(Error(message), {status});

export function parseQuantifiedFormula(input, rule) {
  if (rule === 'PARAM') {
    const name = input.trim();
    if (!termPattern.test(name)) throw error('임의 이름은 u, v, a1처럼 소문자 한 글자와 선택적인 숫자로 쓰세요.');
    return {parameter: name};
  }
  const src = input.replace(/forall/gi, '∀').replace(/exists/gi, '∃').replace(/\s+/g, '').replace(/E(?=[a-z])/g, '∃').replace(/A(?=[a-z])/g, '∀')
    .replace(/¬/g, '~').replace(/∧/g, '&').replace(/<->|⇔/g, '↔').replace(/->|⇒/g, '→').replace(/[V|]/g, '∨')
    .replace(/\(([∀∃])([a-z][0-9]*)\)/g, '$1$2');
  const tokens = src.match(/[∀∃~&∨→↔(),=]|[A-Z][0-9]*|[a-z][0-9]*/g) || [];
  if (!src || tokens.join('') !== src) throw error('양화식은 AxPx, E x (Px & Qx), R(a,b)처럼 입력하세요. 함수기호는 지원하지 않습니다.');
  let pos = 0;
  const term = () => { const t = tokens[pos++]; if (!t || !termPattern.test(t)) throw error('이름·변항은 a, u, x, y처럼 소문자로 쓰세요.'); return t; };
  const precedence = {'↔':1, '→':2, '∨':3, '&':4};
  function atom() {
    const t = tokens[pos++];
    if (t === '~') return ['~', atom()];
    if (t === '∀' || t === '∃') { const v = term(); return {q:t, v, body:atom()}; }
    if (t === '(') { const f = expr(1); if (tokens[pos++] !== ')') throw error('닫는 괄호가 없습니다.'); return f; }
    if (t && termPattern.test(t)) {
      if (tokens[pos++] !== '=') throw error('이름만으로는 문장이 되지 않습니다. Pa 또는 a=b처럼 쓰세요.');
      return {p:'=', args:[t, term()]};
    }
    if (t && /^[A-Z][0-9]*$/.test(t)) {
      const args = [];
      if (tokens[pos] === '(') {
        pos++; args.push(term());
        while (tokens[pos] === ',') { pos++; args.push(term()); }
        if (tokens[pos++] !== ')') throw error('술어의 논항은 P(a), R(a,b)처럼 쉼표로 구분하세요.');
      } else while (tokens[pos] && termPattern.test(tokens[pos])) args.push(term());
      return {p:t, args};
    }
    throw error('양화사·연결사·괄호의 위치를 확인하세요.');
  }
  function expr(min) {
    let left = atom();
    while (precedence[tokens[pos]] >= min) {
      const op = tokens[pos++]; left = [op, left, expr(precedence[op] + (op === '→' ? 0 : 1))];
    }
    return left;
  }
  const f = expr(1);
  if (pos !== tokens.length) throw error('양화식의 괄호나 연결사 위치를 확인하세요.');
  return f;
}

export function freeNames(f, bound = []) {
  if (Array.isArray(f)) return new Set(f.slice(1).flatMap(x => [...freeNames(x, bound)]));
  if (f.q) return freeNames(f.body, [...bound, f.v]);
  return new Set((f.args || []).filter(x => !bound.includes(x)));
}
export function substitute(f, from, to) {
  if (Array.isArray(f)) return [f[0], ...f.slice(1).map(x => substitute(x, from, to))];
  if (f.q) {
    if (f.v === from) return f;
    if (f.v === to && freeNames(f.body).has(from)) {
      // Rename the binder before substituting; the resulting formula must still
      // match the student's target, so an actually captured target is rejected.
      const used = new Set(JSON.stringify(f).match(/[a-z][0-9]*/g) || []);
      used.add(from); used.add(to);
      let index = 0; while (used.has(`z${index}`)) index++;
      const fresh = `z${index}`;
      return {...f, v:fresh, body:substitute(substitute(f.body,f.v,fresh),from,to)};
    }
    return {...f, body:substitute(f.body, from, to)};
  }
  return f.args ? {...f, args:f.args.map(t => t === from ? to : t)} : f;
}
// The instance must be one consistent, capture-free substitution, modulo bound renaming.
export function instanceTerm(q, instance) {
  if (!q?.q) return undefined;
  if (!freeNames(q.body).has(q.v)) return same(q.body, instance) ? null : undefined;
  for (const t of freeNames(instance)) {
    try { if (same(substitute(q.body, q.v, t), instance)) return t; } catch { /* not free for this variable */ }
  }
  return undefined;
}

export const QUANTIFIER_RULES = [
  {id:'PARAM',group:'basic',name:'임의 이름',inputs:['임의 이름','임의이름 선언'],cite:'인용 없음 · 새 보조증명'},
  {id:'∀E',group:'basic',name:'보편 양화사 제거',inputs:['∀ 제거','A 제거','보편 제거','전칭 제거','보편 양화사 제거','전칭 양화사 제거','∀E','UE'],cite:'1'},
  {id:'∀I',group:'basic',name:'보편 양화사 도입',inputs:['∀ 도입','A 도입','보편 도입','전칭 도입','보편 양화사 도입','전칭 양화사 도입','∀I','UI'],cite:'1 또는 임의 이름 범위 2-5'},
  {id:'∃I',group:'basic',name:'존재 양화사 도입',inputs:['∃ 도입','E 도입','존재 도입','특칭 도입','존재 양화사 도입','특칭 양화사 도입','∃I','EI'],cite:'1'},
  {id:'∃E',group:'basic',name:'존재 양화사 제거',inputs:['∃ 제거','E 제거','존재 제거','특칭 제거','존재 양화사 제거','특칭 양화사 제거','∃E','EE'],cite:'1 (새 이름) / 1,2 / 1,2-5'},
  {id:'QN',group:'derived',name:'양화사 부정 규칙',inputs:['양화사 부정','양화사 부정 규칙','양화 부정','보편 양화사 부정규칙','존재 양화사 부정규칙','전칭 부정','존재 부정','~∀','~∃','~∀ 규칙','~∃ 규칙','QN'],cite:'1 · 양방향'},
  {id:'=I',group:'basic',name:'동일성 도입',inputs:['= 도입','동일성 도입','=I'],cite:'인용 없음'},
  {id:'=E',group:'basic',name:'동일성 제거',inputs:['= 제거','동일성 제거','=E'],cite:'1,2 · 양방향'}
];
export const ALL_RULES = [...RULES, ...QUANTIFIER_RULES];
const key = s => s.replace(/\s+/g,'').replace(/¬/g,'~').toLowerCase();
const names = new Map(QUANTIFIER_RULES.flatMap(r => [r.name,...r.inputs].map(s => [key(s),r.id])));
export const normalizeQuantifiedRule = s => names.get(key(s)) || normalizeRule(s);
const parserOptions = {parseFormula:parseQuantifiedFormula, normalizeRule:normalizeQuantifiedRule};
export const parseQuantifiedProof = text => parseProof(text, parserOptions);

function quantifierNegation(f, inverted = false) {
  if (is(f,'~')) return quantifierNegation(f[1], !inverted);
  if (f.q) return {q:inverted ? (f.q === '∀' ? '∃' : '∀') : f.q, v:f.v, body:quantifierNegation(f.body, inverted)};
  const result = Array.isArray(f) ? [f[0],...f.slice(1).map(x => quantifierNegation(x))] : f;
  return inverted ? ['~',result] : result;
}
const hasNegatedQuantifier = f => (is(f,'~') && !!f[1].q) || (f.q ? hasNegatedQuantifier(f.body) : Array.isArray(f) && f.slice(1).some(hasNegatedQuantifier));
function equalityReplacement(source, target, from, to) {
  let changed = false;
  function match(a,b) {
    if (JSON.stringify(a) === JSON.stringify(b)) return true;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    if (a[0] === 'free' && a[1] === from && b[0] === 'free' && b[1] === to) { changed = true; return true; }
    return a.every((x,i) => match(x,b[i]));
  }
  return match(formulaKey(source),formulaKey(target)) && changed;
}
function validateInput({premises,goal,lines}) {
  const arities = new Map();
  function visit(f) {
    if (Array.isArray(f)) return f.slice(1).forEach(visit);
    if (f.q) return visit(f.body);
    if (!f.args) return;
    if (arities.has(f.p) && arities.get(f.p) !== f.args.length) throw error(`${f.p}의 논항 개수가 서로 다릅니다. 같은 술어는 같은 개수의 이름을 받아야 합니다.`);
    arities.set(f.p,f.args.length);
  }
  [...premises,goal,...lines.map(l=>l.f)].forEach(visit);
}

export function checkQuantifiedProof(premiseText, conclusionText, proofText, basicOnly = false) {
  // Each witness is an implicit existential subproof. Dependencies are propagated
  // through citations and discharged only when the name is absent from the result,
  // its open assumptions, and every remaining witness constraint.
  const dependencies = new Map(), witnesses = new Map();
  const collect = c => {
    const result = new Set();
    for (const n of [...c.nums,...c.ranges.flatMap(([a,b])=>Array.from({length:b-a+1},(_,i)=>a+i))])
      for (const id of dependencies.get(n) || []) result.add(id);
    // A later assumption mentioning a witness must carry that witness even without a citation.
    for (const [id,w] of witnesses) if (freeNames(c.f).has(w.name)) result.add(id);
    return result;
  };
  const hints = {
    '∀E':'∀x A(x)에서 하나의 이름으로 일관되게 대입한 A(a)를 얻습니다.',
    '∃I':'A(a)에서 ∃x A(x)를 얻습니다. 안쪽 양화사에 이름이 포획되어서는 안 됩니다.',
    '∀I':'임의 이름 상자의 범위 또는 마지막 행을 인용하세요. 일반화할 이름은 전제·열린 가정·의존하는 임시 이름의 조건에 없어야 합니다.',
    '∃E':'새 이름을 쓰는 한 행 약식, 존재문과 보편 조건문 두 행, 또는 존재문과 보조증명 범위를 인용하세요.',
    'QN':'~∀x A와 ∃x ~A, ~∃x A와 ∀x ~A를 양방향으로 바꿉니다.',
    '=I':'a=a처럼 같은 이름의 동일성은 인용 없이 도입합니다.',
    '=E':'a=b와 다른 한 행을 인용해 자유롭게 나타난 a를 b로, 또는 b를 a로 바꿉니다.'
  };
  const extraRule = c => {
    const {l,f,fs,exact,nums,ranges,ref,premises,goal,lines,open} = c;
    const deps = collect(c);
    const assumptions = open.map(ref).filter(x => x.rule === '가정').map(x => x.f);
    const inContext = t => [...premises,...assumptions].some(x=>freeNames(x).has(t));
    const invalid = message => ({error:message});
    if (l.rule === 'PARAM') {
      const name = f.parameter;
      if (!exact(0)) return invalid('임의 이름 선언에는 인용번호를 쓰지 않습니다.');
      if ([...premises,goal,...lines.slice(0,l.n-1).map(x=>x.f)].some(x=>freeNames(x).has(name) || x.parameter === name)) return invalid(`임의 이름 ${name}은 전제·결론이나 앞선 행에 자유롭게 나타나지 않은 새 이름이어야 합니다.`);
      return {valid:true};
    }
    // A name declaration is structural, never a formula that can justify an inference.
    if (fs.some(x=>x.parameter)) return invalid('임의 이름 선언은 문장이 아닙니다. ∀ 도입에서 상자 전체 범위로 인용하세요.');
    if (l.rule === '∀E') return {valid:exact(1) && quant(fs[0],'∀') && instanceTerm(fs[0],f) !== undefined};
    if (l.rule === '∃I') return {valid:exact(1) && quant(f,'∃') && instanceTerm(f,fs[0]) !== undefined};
    if (l.rule === '∀I') {
      if (!quant(f,'∀')) return {valid:false};
      let source, declared;
      if (exact(1)) source = fs[0];
      else if (exact(0,1) && ref(ranges[0][0]).rule === 'PARAM') {
        declared = ref(ranges[0][0]).f.parameter; source = ref(ranges[0][1]).f;
      } else return {valid:false};
      const t = instanceTerm(f,source);
      if (t === undefined || (declared && t !== null && declared !== t)) return {valid:false};
      if (t !== null) {
        if (freeNames(f).has(t)) return invalid(`일반화한 이름 ${t}이 결론에 자유롭게 남아 있습니다. 모든 자유로운 출현을 일반화하세요.`);
        if (inContext(t)) return invalid(`${t}은 전제 또는 아직 닫지 않은 가정에 나타나므로 임의의 이름으로 일반화할 수 없습니다.`);
        if ([...witnesses.values()].some(w=>w.name === t)) return invalid(`${t}은 ∃ 제거로 선택한 임시 이름입니다. 이 이름에서 보편 일반화를 할 수 없습니다.`);
        for (const id of deps) if (freeNames(witnesses.get(id).constraint).has(t)) return invalid(`임시 이름 ${witnesses.get(id).name}의 선택이 ${t}에 의존합니다. 이 상태에서 ${t}을 보편 일반화할 수 없습니다.`);
      }
      return {valid:true};
    }
    if (l.rule === '∃E') {
      if (exact(1) && quant(fs[0],'∃')) {
        const t = instanceTerm(fs[0],f);
        if (t === undefined) return {valid:false};
        if (t === null) return {valid:true};
        if ([...premises,goal,...lines.slice(0,l.n-1).map(x=>x.f)].some(x=>freeNames(x).has(t) || x.parameter === t)) return invalid(`∃ 제거의 임시 이름 ${t}은 전제·목표 결론·앞선 행에 없던 새 이름이어야 합니다.`);
        witnesses.set(l.n,{name:t,constraint:f}); deps.add(l.n);
        return {valid:true,deps};
      }
      if (exact(2)) {
        const valid = fs.some((e,i) => {
          const u=fs[1-i];
          if (!quant(e,'∃') || !quant(u,'∀') || !is(u.body,'→')) return false;
          return same({q:'∀',v:e.v,body:e.body},{q:'∀',v:u.v,body:u.body[1]}) && !freeNames(u.body[2]).has(u.v) && same(u.body[2],f);
        });
        return {valid};
      }
      if (exact(1,1) && quant(fs[0],'∃')) {
        const [a,b]=ranges[0], first=ref(a), last=ref(b);
        if (first.rule !== '가정' || !same(last.f,f)) return {valid:false};
        const t=instanceTerm(fs[0],first.f);
        if (t === undefined) return {valid:false};
        if (t !== null && (inContext(t) || freeNames(f).has(t) || freeNames(fs[0]).has(t))) return invalid('∃ 제거의 보조증명 이름이 바깥 전제·가정·존재문·결론에 남아 있습니다.');
        if (t !== null && [...deps].some(id=>freeNames(witnesses.get(id).constraint).has(t))) return invalid('보조증명 밖으로 내보내는 결론의 임시 이름이 가정의 이름에 의존합니다.');
        if (t !== null && [...witnesses.values()].some(w=>w.name===t)) return invalid('보조증명의 임의 이름으로 앞서 선택한 임시 이름을 재사용할 수 없습니다.');
        return {valid:true};
      }
      return {valid:false};
    }
    if (l.rule === 'QN') return {valid:exact(1) && (hasNegatedQuantifier(fs[0]) || hasNegatedQuantifier(f)) && same(quantifierNegation(fs[0]),quantifierNegation(f))};
    if (l.rule === '=I') return {valid:exact(0) && f.p==='=' && f.args[0]===f.args[1]};
    if (l.rule === '=E') return {valid:exact(2) && fs.some((eq,i)=>eq.p==='=' && (equalityReplacement(fs[1-i],f,eq.args[0],eq.args[1]) || equalityReplacement(fs[1-i],f,eq.args[1],eq.args[0])))};
    return null;
  };
  const afterRow = (c,extra) => {
    const deps=extra?.deps || collect(c), needed=new Set([...freeNames(c.f),...c.open.flatMap(n=>[...freeNames(c.ref(n).f)])]);
    // Keep transitive dependencies if one selected witness still refers to another.
    let changed=true;
    while (changed) {
      changed=false;
      for (const id of deps) {
        const w=witnesses.get(id);
        if (needed.has(w.name)) for (const t of freeNames(w.constraint)) if (!needed.has(t)) {needed.add(t);changed=true;}
      }
    }
    dependencies.set(c.l.n,new Set([...deps].filter(id=>needed.has(witnesses.get(id).name))));
    return null;
  };
  try {
    return checkProof(premiseText,conclusionText,proofText,basicOnly,{...parserOptions,rules:ALL_RULES,isOpening:l=>l.rule==='PARAM',validateInput,extraRule,afterRow,hints,disableCounterexample:true});
  } catch(e) { return {ok:false,status:e.status || 'input',line:null,message:e.message}; }
}
