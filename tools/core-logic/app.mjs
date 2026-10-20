import { checkProof, parseProof, RULES } from './checker.mjs';
import { blankRow, trimTrailing, proofText, startAssumption, closeAssumption, closeCases, deleteRow } from './editor.mjs';

const $ = id => document.getElementById(id);
const samples = {
  conditional: { premises: 'A -> ~B\nB V C', conclusion: 'A -> C', proof: '1. A -> ~B ; 전제\n2. B V C ; 전제\n3. | A ; 가정\n4. | ~B ; -> 제거 1,3\n5. | C ; V 제거 2,4\n6. A -> C ; -> 도입 3-5' },
  nested: { premises: '', conclusion: 'A -> (B -> A)', proof: '1. | A ; 가정\n2. || B ; 가정\n3. || A ; 반복 1\n4. | B -> A ; -> 도입 2-3\n5. A -> (B -> A) ; -> 도입 1-4' },
  cases: { premises: 'A V B', conclusion: 'B V A', proof: '1. A V B ; 전제\n2. | A ; 가정\n3. | B V A ; V 도입 2\n4. | B ; 가정\n5. | B V A ; V 도입 4\n6. B V A ; 경우에 의한 논증 1,2-3,4-5' },
  contraposition: { premises: '~A -> B\nB -> ~C', conclusion: 'C -> A', proof: '1. ~A -> B ; 전제\n2. B -> ~C ; 전제\n3. ~A -> ~C ; 연쇄 논법 1,2\n4. C -> A ; 대우 규칙 3' }
};
let rows = [blankRow()];
let activeField = $('premises');
for (const id of ['premises', 'conclusion']) $(id).addEventListener('focus', () => { activeField = $(id); });
for (const id of ['premises', 'conclusion']) $(id).addEventListener('input', clearValidation);
$('basicOnly').addEventListener('change', clearValidation);

for (const rule of RULES) {
  const row = document.createElement('tr');
  const name = document.createElement('td'); name.textContent = rule.name;
  const inputs = document.createElement('td');
  rule.inputs.forEach((input, i) => { if (i) inputs.append(' / '); const code = document.createElement('code'); code.textContent = input; inputs.append(code); });
  const cite = document.createElement('td'); cite.textContent = rule.cite;
  row.append(name, inputs, cite); $(rule.group === 'basic' ? 'basicRules' : 'derivedRules').append(row);
  const option = document.createElement('option'); option.value = rule.inputs[0]; option.label = rule.name; $('ruleOptions').append(option);
}

function clearValidation() {
  $('result').hidden = true;
  document.querySelectorAll('.proof-table tr.row-error').forEach(row => row.classList.remove('row-error'));
  document.querySelectorAll('.derived-badge').forEach(badge => { badge.hidden = true; badge.title = ''; });
}
function showResult(r) {
  clearValidation();
  for (const derived of r.derivedLines || []) {
    const badge = $('proofRows').children[derived.line - 1]?.querySelector('.derived-badge');
    if (badge) { badge.hidden = false; badge.title = derived.detail; }
  }
  if (r.line) $('proofRows').children[r.line - 1]?.classList.add('row-error');
  $('result').hidden = false;
  $('result').className = `result ${r.ok ? 'success' : 'error'}`;
  $('resultIcon').textContent = r.ok ? '✓' : '!';
  $('resultTitle').textContent = r.ok ? '검산 통과' : r.line ? `${r.line}행을 확인하세요` : '입력을 확인하세요';
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
      input.setAttribute('aria-label', `${i + 1}행 ${['수식', '규칙', '인용번호'][fieldIndex]}`); input.placeholder = ['A -> B', '규칙 선택·입력', '1,2 / 3-5'][fieldIndex];
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
$('closeCases').addEventListener('click', () => applyEdit(closeCases));
$('check').addEventListener('click', () => {
  const filled = trimTrailing(rows);
  for (let i = 0; i < filled.length; i++) if (!filled[i].formula.trim() || !filled[i].rule.trim()) { showResult({ ok: false, line: i + 1, message: `${i + 1}행의 수식과 규칙을 모두 입력하세요.` }); return; }
  showResult(checkProof($('premises').value, $('conclusion').value, proofText(rows), $('basicOnly').checked));
});
$('sample').addEventListener('click', () => {
  const sample = samples[$('sampleChoice').value]; $('premises').value = sample.premises; $('conclusion').value = sample.conclusion;
  rows = parseProof(sample.proof).map(line => ({ formula: line.formulaText, rule: RULES.find(rule => rule.id === line.rule).inputs[0], citations: line.refs.map(ref => Array.isArray(ref) ? ref.join('-') : ref).join(','), depth: line.depth }));
  $('basicOnly').checked = ['conditional', 'nested'].includes($('sampleChoice').value); renderRows();
});
$('clear').addEventListener('click', () => { $('premises').value = ''; $('conclusion').value = ''; rows = [blankRow()]; renderRows(); $('premises').focus(); });
document.querySelectorAll('[data-symbol]').forEach(button => button.addEventListener('click', () => {
  const field = activeField.isConnected ? activeField : $('proofRows').querySelector('input');
  field.setRangeText(button.dataset.symbol, field.selectionStart, field.selectionEnd, 'end'); field.dispatchEvent(new Event('input')); field.focus();
}));
renderRows();
