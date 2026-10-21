import { checkQuantifiedProof, parseQuantifiedProof, parseQuantifiedFormula, ALL_RULES } from './quantifier.mjs?v=quantifier-ae-20261021';
import { checkProof, parseProof, parseFormula, RULES } from './checker.mjs?v=quantifier-ae-20261021';
import { blankRow, trimTrailing, proofText, startAssumption, closeAssumption, closeCases, deleteRow, startParameter, closeQuantifier } from './editor.mjs?v=quantifier-ae-20261021';

const $ = id => document.getElementById(id);
const propositionalSamples = {
  conditional: { premises: 'A -> ~B\nB V C', conclusion: 'A -> C', proof: '1. A -> ~B ; 전제\n2. B V C ; 전제\n3. | A ; 가정\n4. | ~B ; -> 제거 1,3\n5. | C ; V 제거 2,4\n6. A -> C ; -> 도입 3-5' },
  nested: { premises: '', conclusion: 'A -> (B -> A)', proof: '1. | A ; 가정\n2. || B ; 가정\n3. || A ; 반복 1\n4. | B -> A ; -> 도입 2-3\n5. A -> (B -> A) ; -> 도입 1-4' },
  cases: { premises: 'A V B', conclusion: 'B V A', proof: '1. A V B ; 전제\n2. | A ; 가정\n3. | B V A ; V 도입 2\n4. | B ; 가정\n5. | B V A ; V 도입 4\n6. B V A ; 경우에 의한 논증 1,2-3,4-5' },
  contraposition: { premises: '~A -> B\nB -> ~C', conclusion: 'C -> A', proof: '1. ~A -> B ; 전제\n2. B -> ~C ; 전제\n3. ~A -> ~C ; 연쇄 논법 1,2\n4. C -> A ; 대우 규칙 3' }
};
const quantifiedSamples = {
  universal: {label:'보편 제거와 존재 도입',premises:'Ax (Px -> Qx)\nPa',conclusion:'E x Qx',proof:'Ax (Px -> Qx);전제\nPa;전제\nPa -> Qa;전칭제거 1\nQa;-> 제거 2,3\nE x Qx;존재도입 4'},
  generalize: {label:'임의 이름 상자 · 보편 도입',premises:'Ax (Px & Qx)',conclusion:'Ax Px',proof:'Ax (Px & Qx);전제\n|u;임의 이름\n|Pu & Qu;∀ 제거 1\n|Pu;& 제거 3\nAx Px;∀ 도입 2-4'},
  witness: {label:'교재 약식 · 존재 제거',premises:'E x (Px & Qx)',conclusion:'E x Px & E x Qx',proof:'E x (Px & Qx);전제\nPa & Qa;∃ 제거 1\nPa;& 제거 2\nQa;& 제거 2\nE x Px;∃ 도입 3\nE x Qx;∃ 도입 4\nE x Px & E x Qx;& 도입 6,5'},
  existsBox: {label:'보조증명 · 존재 제거',premises:'E x Px\nAx (Px -> Qx)',conclusion:'E x Qx',proof:'E x Px;전제\nAx (Px -> Qx);전제\n|Pa;가정\n|Pa -> Qa;∀ 제거 2\n|Qa;-> 제거 3,4\n|E x Qx;∃ 도입 5\nE x Qx;∃ 제거 3-6,1'},
  negation: {label:'양화사 부정 · 파생규칙',premises:'~Ax Px',conclusion:'E x ~Px',proof:'~Ax Px;전제\nE x ~Px;양화사 부정 1'},
  identity: {label:'동일성 · 부분 대입',premises:'a=b\nRaa',conclusion:'Rab',proof:'a=b;전제\nRaa;전제\nRab;동일성 제거 2,1'}
};
let mode = 'propositional', samples = propositionalSamples, rules = RULES;
const drafts = {};
let rows = [blankRow()];
let activeField = $('premises');
for (const id of ['premises', 'conclusion']) $(id).addEventListener('focus', () => { activeField = $(id); });
for (const id of ['premises', 'conclusion']) $(id).addEventListener('input', clearValidation);
$('basicOnly').addEventListener('change', clearValidation);

function renderRules() {
for (const id of ['basicRules','derivedRules','ruleOptions']) $(id).replaceChildren();
for (const rule of rules) {
  const row = document.createElement('tr');
  const name = document.createElement('td'); name.textContent = rule.name;
  const inputs = document.createElement('td');
  rule.inputs.forEach((input, i) => { if (i) inputs.append(' / '); const code = document.createElement('code'); code.textContent = input; inputs.append(code); });
  const cite = document.createElement('td'); cite.textContent = rule.cite;
  row.append(name, inputs, cite); $(rule.group === 'basic' ? 'basicRules' : 'derivedRules').append(row);
  const option = document.createElement('option'); option.value = rule.inputs[0]; option.label = rule.name; $('ruleOptions').append(option);
}

}
function clearValidation() {
  $('result').hidden = true;
  document.querySelectorAll('.proof-table tr.row-error, .proof-table tr.row-warning').forEach(row => row.classList.remove('row-error', 'row-warning'));
  document.querySelectorAll('.derived-badge').forEach(badge => { badge.hidden = true; badge.title = ''; });
}
function showResult(r) {
  clearValidation();
  for (const derived of r.derivedLines || []) {
    const badge = $('proofRows').children[derived.line - 1]?.querySelector('.derived-badge');
    if (badge) { badge.hidden = false; badge.title = derived.detail; }
  }
  const warning = ['unsupported', 'unverified'].includes(r.status);
  if (r.line) $('proofRows').children[r.line - 1]?.classList.add(warning ? 'row-warning' : 'row-error');
  $('result').hidden = false;
  $('result').className = `result ${r.ok ? 'success' : warning ? 'warning' : 'error'}`;
  $('resultIcon').textContent = r.ok ? '✓' : '!';
  const title = r.status === 'unsupported' ? '지원 범위 확인 필요' : r.status === 'unverified' ? '규칙 적용 확인 필요' : r.status === 'invalid' ? '증명 오류' : '입력 형식 확인';
  $('resultTitle').textContent = r.ok ? '검산 통과' : `${r.line ? r.line + '행 · ' : ''}${title}`;
  $('resultMessage').textContent = r.message;
  $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderRows(focusIndex = null) {
  $('proofRows').replaceChildren();
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const number = document.createElement('td'); number.className = 'row-number';
    const label = document.createElement('strong'); label.textContent = String(i + 1); number.append(label);
    const controls = document.createElement('div'); controls.className = 'row-controls';
    for (const [text, title, delta] of [['‹', '보조증명 깊이 줄이기', -1], ['›', '보조증명 깊이 늘리기', 1]]) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.setAttribute('aria-label', `${i + 1}행 ${title}`); button.disabled = delta === -1 && !row.depth;
      button.addEventListener('click', () => { row.depth += delta; renderRows(i); }); controls.append(button);
    }
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `${i + 1}행 삭제`);
    remove.addEventListener('click', () => { rows = deleteRow(rows, i); if (!rows.length) rows = [blankRow()]; renderRows(Math.min(i, rows.length - 1)); }); controls.append(remove);
    number.append(controls); tr.append(number);
    ['formula', 'rule', 'citations'].forEach((key, fieldIndex) => {
      const td = document.createElement('td');
      const input = document.createElement('input'); input.type = 'text'; input.value = row[key]; input.spellcheck = false;
      input.setAttribute('aria-label', `${i + 1}행 ${['수식', '규칙', '인용번호'][fieldIndex]}`); input.placeholder = [mode === 'quantified' ? 'Ax Px / Pa' : 'A -> B', '규칙 선택·입력', '1,2 / 3-5'][fieldIndex];
      if (key === 'rule') input.setAttribute('list', 'ruleOptions');
      if (key === 'formula') {
        td.className = 'formula-cell'; const guides = document.createElement('span'); guides.className = 'indent-guides'; guides.style.width = `${row.depth * 10}px`;
        guides.setAttribute('aria-label', `보조증명 ${row.depth}단계`); td.append(guides); input.style.width = `calc(100% - ${row.depth * 10}px)`;
      }
      input.addEventListener('focus', () => { activeField = input; });
      input.addEventListener('input', () => { row[key] = input.value; clearValidation(); });
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return; event.preventDefault();
        if (fieldIndex < 2) tr.querySelectorAll('input')[fieldIndex + 1].focus();
        else if (i + 1 < rows.length) $('proofRows').children[i + 1].querySelector('input').focus();
        else { rows.push(blankRow(row.depth)); renderRows(rows.length - 1); }
      });
      td.append(input);
      if (key === 'rule') {
        const badge = document.createElement('span'); badge.className = 'derived-badge'; badge.textContent = '파생규칙'; badge.hidden = true;
        td.append(badge);
      }
      tr.append(td);
    });
    $('proofRows').append(tr);
  });
  $('result').hidden = true;
  if (focusIndex !== null) $('proofRows').children[focusIndex]?.querySelector('input').focus();
}
function applyEdit(edit) {
  try { rows = edit(rows); renderRows(rows.length - 1); }
  catch (error) { showResult({ ok: false, line: null, message: error.message }); }
}
$('addRow').addEventListener('click', () => { if (rows.at(-1).formula || rows.at(-1).rule || rows.at(-1).citations) rows.push(blankRow(rows.at(-1).depth)); renderRows(rows.length - 1); });
$('startAssumption').addEventListener('click', () => applyEdit(rows => startAssumption(rows)));
$('nextCase').addEventListener('click', () => applyEdit(rows => startAssumption(rows, true)));
$('closeConditional').addEventListener('click', () => applyEdit(rows => closeAssumption(rows, '-> 도입')));
$('closeNegation').addEventListener('click', () => applyEdit(rows => closeAssumption(rows, '~ 도입')));
$('closeCases').addEventListener('click', () => applyEdit(r => closeCases(r, mode === 'quantified' ? parseQuantifiedFormula : parseFormula)));
$('startParameter').addEventListener('click', () => applyEdit(startParameter));
$('closeUniversal').addEventListener('click', () => applyEdit(r => closeQuantifier(r,true)));
$('closeExistential').addEventListener('click', () => applyEdit(r => closeQuantifier(r,false)));
$('check').addEventListener('click', () => {
  const filled = trimTrailing(rows);
  for (let i = 0; i < filled.length; i++) if (!filled[i].formula.trim() || !filled[i].rule.trim()) { showResult({ ok: false, line: i + 1, message: `${i + 1}행의 수식과 규칙을 모두 입력하세요.` }); return; }
  showResult((mode === 'quantified' ? checkQuantifiedProof : checkProof)($('premises').value, $('conclusion').value, proofText(rows), $('basicOnly').checked));
});
$('sample').addEventListener('click', () => {
  const sample = samples[$('sampleChoice').value]; $('premises').value = sample.premises; $('conclusion').value = sample.conclusion;
  rows = (mode === 'quantified' ? parseQuantifiedProof : parseProof)(sample.proof).map(line => ({ formula: line.formulaText, rule: rules.find(rule => rule.id === line.rule).inputs[0], citations: line.refs.map(ref => Array.isArray(ref) ? ref.join('-') : ref).join(','), depth: line.depth }));
  $('basicOnly').checked = ['conditional', 'nested', 'universal', 'generalize', 'existsBox', 'identity'].includes($('sampleChoice').value); renderRows();
});
$('clear').addEventListener('click', () => { $('premises').value = ''; $('conclusion').value = ''; rows = [blankRow()]; renderRows(); $('premises').focus(); });
document.querySelectorAll('[data-symbol]').forEach(button => button.addEventListener('click', () => {
  const field = activeField.isConnected ? activeField : $('proofRows').querySelector('input');
  field.setRangeText(button.dataset.symbol, field.selectionStart, field.selectionEnd, 'end'); field.dispatchEvent(new Event('input')); field.focus();
}));

function setMode(next) {
  drafts[mode] = {rows, premises:$('premises').value, conclusion:$('conclusion').value, basic:$('basicOnly').checked, sample:$('sampleChoice').value};
  mode = next; const q = mode === 'quantified'; samples = q ? quantifiedSamples : propositionalSamples; rules = q ? ALL_RULES : RULES;
  const draft = drafts[mode]; rows = draft?.rows || [blankRow()]; $('premises').value = draft?.premises || ''; $('conclusion').value = draft?.conclusion || ''; $('basicOnly').checked = draft?.basic || false;
  for (const [id,name] of [['propositionalTab','propositional'],['quantifiedTab','quantified']]) {$(id).classList.toggle('active',mode===name); if (mode===name) $(id).setAttribute('aria-current','page'); else $(id).removeAttribute('aria-current');}
  for (const id of ['quantifiedHelp','quantifiedGuide','startParameter','closeUniversal','closeExistential']) $(id).hidden = !q;
  document.querySelectorAll('.quant-symbol').forEach(button => {button.hidden = !q;});
  $('premises').placeholder = q ? '전제를 한 줄에 하나씩 입력하세요.\n예: Ax (Px -> Qx)\n    Pa\n전제가 없으면 비워 두세요.' : '전제를 한 줄에 하나씩 입력하세요.\n예: A -> ~B\n    B V C\n전제가 없으면 비워 두세요.';
  $('conclusion').placeholder = q ? '예: E x Qx' : '예: A -> C';
  $('sampleChoice').replaceChildren();
  const labels = {conditional:'조건문 도입',nested:'중첩 보조증명',cases:'경우에 의한 논증',contraposition:'대우 규칙'};
  for (const [key,sample] of Object.entries(samples)) {const option = document.createElement('option'); option.value=key; option.textContent=sample.label || labels[key]; $('sampleChoice').append(option);}
  if (draft?.sample) $('sampleChoice').value = draft.sample;
  activeField = $('premises'); renderRules(); renderRows();
}
$('propositionalTab').addEventListener('click',()=>{if(mode!=='propositional') setMode('propositional');});
$('quantifiedTab').addEventListener('click',()=>{if(mode!=='quantified') setMode('quantified');});
renderRules(); renderRows();
