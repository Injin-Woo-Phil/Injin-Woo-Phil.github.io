import { parseFormula } from './checker.mjs';
export const blankRow = (depth = 0, rule = '') => ({ formula: '', rule, citations: '', depth });
const isBlank = row => !row.formula.trim() && !row.rule.trim() && !row.citations.trim();
export function trimTrailing(rows) {
  const result = [...rows];
  while (result.length && isBlank(result.at(-1))) result.pop();
  return result;
}
export function proofText(rows) {
  return trimTrailing(rows).map((row, i) => `${i + 1}. ${'|'.repeat(row.depth)} ${row.formula} ; ${row.rule} ${row.citations}`).join('\n');
}
export function startAssumption(rows, sibling = false) {
  const result = trimTrailing(rows), depth = result.at(-1)?.depth || 0;
  if (sibling && !depth) throw Error('열린 보조증명 안에서 다음 경우를 시작하세요.');
  return [...result, blankRow(sibling ? depth : depth + 1, '가정')];
}
function scopes(rows) {
  const open = [];
  return rows.map((row, i) => {
    const assumption = row.rule.replace(/\s+/g, '') === '가정';
    while (open.length > row.depth || (assumption && open.length >= row.depth)) open.pop();
    if (assumption) open.push(i);
    return [...open];
  });
}
export function closeAssumption(rows, rule) {
  const result = trimTrailing(rows), last = result.at(-1);
  if (!last?.depth) throw Error('닫을 보조증명이 없습니다.');
  const open = scopes(result).at(-1);
  const start = open[last.depth - 1];
  if (start === undefined || !result[start].formula.trim() || !last.formula.trim()) throw Error('가정과 보조증명의 마지막 수식을 입력하세요.');
  const formula = rule === '-> 도입' ? `(${result[start].formula}) -> (${last.formula})` : `~(${result[start].formula})`;
  return [...result, { formula, rule, citations: `${start + 1}-${result.length}`, depth: last.depth - 1 }];
}
export function closeCases(rows) {
  const result = trimTrailing(rows), last = result.at(-1), states = scopes(result);
  if (!last?.depth || !last.formula.trim()) throw Error('두 경우의 보조증명을 먼저 입력하세요.');
  const second = states.at(-1)[last.depth - 1], parent = states.at(-1).slice(0, -1);
  let first = -1;
  for (let i = second - 1; i >= 0; i--) {
    if (result[i].depth < last.depth) break;
    if (result[i].depth === last.depth && result[i].rule.replace(/\s+/g, '') === '가정') { first = i; break; }
  }
  if (first < 0) throw Error('같은 깊이의 두 경우가 필요합니다. 첫 경우를 쓴 뒤 ‘다음 경우’를 누르세요.');
  let premise = '?';
  try {
    const left = parseFormula(result[first].formula), right = parseFormula(result[second].formula);
    const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    for (let i = first - 1; i >= 0; i--) {
      if (!states[i].every((v, k) => parent[k] === v)) continue;
      const f = parseFormula(result[i].formula);
      if (Array.isArray(f) && f[0] === '∨' && ((eq(f[1], left) && eq(f[2], right)) || (eq(f[1], right) && eq(f[2], left)))) { premise = String(i + 1); break; }
    }
  } catch { /* 입력 중인 수식은 검산할 때 행별로 확인한다. */ }
  return [...result, { formula: last.formula, rule: '경우에 의한 논증', citations: `${premise},${first + 1}-${second},${second + 1}-${result.length}`, depth: last.depth - 1 }];
}
export function deleteRow(rows, index) {
  return rows.filter((_, i) => i !== index).map(row => ({ ...row, citations: row.citations.replace(/\d+/g, value => {
    const n = Number(value);
    return n === index + 1 ? '?' : String(n > index + 1 ? n - 1 : n);
  }) }));
}
