// ============================================================
// CÁLCULO DE DIETA — motor de cálculo puro, replicando as fórmulas
// da aba "Dieta" da planilha (MODELO LAYOUT.xls).
// ============================================================
//
// Regra geral encontrada na planilha, para cada nutriente:
//   - o valor em "%" (ou "mg/kg" / "UI/kg") é um dado do INGREDIENTE;
//   - o valor absoluto ("kg", "mg", "UI") é CALCULADO na DIETA, a partir
//     da quantidade usada e do valor base do ingrediente. Nunca duplicar
//     dados nutricionais — eles pertencem sempre ao ingrediente.
//
// Duas bases de cálculo diferentes coexistem na planilha original:
//   1) Nutrientes em % da matéria seca (MS, NDT, PB, EE, FDN, FDA, CNF,
//      MM, Ca, P, S, Mg, Na, Amido): o "kg" é MS(kg) × %/100, onde
//      MS(kg) = kg_usado × MS%/100.
//   2) Minerais-traço (Se, Zn, Cu, I, Mn, Co) e vitaminas (A, E), dados em
//      mg/kg ou UI/kg do ingrediente "como fornecido": o total é
//      kg_usado × valor/kg — ou seja, multiplicam pelo kg usado (matéria
//      natural), não pelo kg de MS. Está assim na planilha original e foi
//      mantido igual aqui.

import type { Ingredient } from "./ingredients";
import { getCNF } from "./ingredients";

export interface DietLineCalc {
  ingredient: Ingredient;
  qty: number; // kg de matéria natural usados por dia

  msKg: number;
  ndtKg: number; pbKg: number; eeKg: number; fdnKg: number; fdaKg: number; cnfKg: number; mmKg: number;
  caKg: number; pKg: number; sKg: number; mgKg: number; naKg: number; amidoKg: number;

  seMg: number; znMg: number; cuMg: number; iodoMg: number; mnMg: number; coMg: number;
  vitAUi: number; vitEUi: number;

  custo: number; // R$ do dia para esta linha
}

/** Calcula todos os valores absolutos de uma linha da dieta (1 ingrediente + quantidade). */
export function calcDietLine(ingredient: Ingredient, qty: number): DietLineCalc {
  const msKg = (qty * ingredient.ms) / 100;
  const cnf = getCNF(ingredient);

  return {
    ingredient, qty, msKg,
    ndtKg: (msKg * ingredient.ndt) / 100,
    pbKg:  (msKg * ingredient.pb)  / 100,
    eeKg:  (msKg * ingredient.ee)  / 100,
    fdnKg: (msKg * ingredient.fdn) / 100,
    fdaKg: (msKg * ingredient.fda) / 100,
    cnfKg: (msKg * cnf) / 100,
    mmKg:  (msKg * ingredient.mm)  / 100,
    caKg:  (msKg * ingredient.ca)  / 100,
    pKg:   (msKg * ingredient.p)   / 100,
    sKg:   (msKg * ingredient.s)     / 100,
    mgKg:  (msKg * ingredient.mgMin) / 100,
    naKg:  (msKg * ingredient.na)    / 100,
    amidoKg: (msKg * ingredient.amido) / 100,

    seMg:   qty * ingredient.se,
    znMg:   qty * ingredient.zn,
    cuMg:   qty * ingredient.cu,
    iodoMg: qty * ingredient.iodo,
    mnMg:   qty * ingredient.mn,
    coMg:   qty * ingredient.co,
    vitAUi: qty * ingredient.vitA,
    vitEUi: qty * ingredient.vitE,

    custo: qty * ingredient.costPerKg,
  };
}

export interface DietTotals {
  qtyTotal: number;
  msKg: number; msPct: number; // % MS sobre o kg de matéria natural total

  ndtKg: number; ndtPct: number;
  pbKg: number; pbPct: number;
  eeKg: number; eePct: number;
  fdnKg: number; fdnPct: number;
  fdaKg: number; fdaPct: number;
  cnfKg: number; cnfPct: number;
  mmKg: number; mmPct: number;
  caKg: number; caPct: number;
  pKg: number; pPct: number;
  sKg: number; sPct: number;
  mgKg: number; mgPct: number;
  naKg: number; naPct: number;
  amidoKg: number; amidoPct: number;

  // minerais-traço e vitaminas: concentração final = total / MS total (mg ou UI por kg de MS)
  seMg: number; seConc: number;
  znMg: number; znConc: number;
  cuMg: number; cuConc: number;
  iodoMg: number; iodoConc: number;
  mnMg: number; mnConc: number;
  coMg: number; coConc: number;
  vitAUi: number; vitAConc: number;
  vitEUi: number; vitEConc: number;

  custoTotal: number;
  custoPorKg: number; // R$ por kg de matéria natural da dieta
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/**
 * Totais da dieta — soma de todas as linhas + recálculo dos "%"/concentrações
 * sobre o total, igual à linha "TOTAIS" da planilha.
 *
 * NOTA IMPORTANTE sobre Vit. A e Vit. E: na planilha original, o total de UI
 * da dieta é dividido por uma constante FIXA (650) em vez do total de MS —
 * diferente de todos os outros minerais, que dividem pelo MS total da dieta.
 * Isso parece um resquício de uma versão antiga da planilha (feita para um
 * peso vivo específico) e não uma regra de negócio válida em geral. Aqui a
 * concentração de vitaminas foi calculada com a MESMA lógica dos outros
 * minerais (total ÷ MS total), por ser a forma correta e consistente. Se
 * você quiser reproduzir exatamente o comportamento antigo (÷650 fixo),
 * avise que eu troco.
 */
export function calcDietTotals(lines: DietLineCalc[]): DietTotals {
  const qtyTotal = sum(lines.map(l => l.qty));
  const msKg = sum(lines.map(l => l.msKg));
  const pct = (v: number) => (msKg > 0 ? (v / msKg) * 100 : 0);
  const conc = (v: number) => (msKg > 0 ? v / msKg : 0);

  const ndtKg = sum(lines.map(l => l.ndtKg));
  const pbKg = sum(lines.map(l => l.pbKg));
  const eeKg = sum(lines.map(l => l.eeKg));
  const fdnKg = sum(lines.map(l => l.fdnKg));
  const fdaKg = sum(lines.map(l => l.fdaKg));
  const cnfKg = sum(lines.map(l => l.cnfKg));
  const mmKg = sum(lines.map(l => l.mmKg));
  const caKg = sum(lines.map(l => l.caKg));
  const pKg = sum(lines.map(l => l.pKg));
  const sKg = sum(lines.map(l => l.sKg));
  const mgKg = sum(lines.map(l => l.mgKg));
  const naKg = sum(lines.map(l => l.naKg));
  const amidoKg = sum(lines.map(l => l.amidoKg));

  const seMg = sum(lines.map(l => l.seMg));
  const znMg = sum(lines.map(l => l.znMg));
  const cuMg = sum(lines.map(l => l.cuMg));
  const iodoMg = sum(lines.map(l => l.iodoMg));
  const mnMg = sum(lines.map(l => l.mnMg));
  const coMg = sum(lines.map(l => l.coMg));
  const vitAUi = sum(lines.map(l => l.vitAUi));
  const vitEUi = sum(lines.map(l => l.vitEUi));

  const custoTotal = sum(lines.map(l => l.custo));

  return {
    qtyTotal, msKg, msPct: qtyTotal > 0 ? (msKg / qtyTotal) * 100 : 0,
    ndtKg, ndtPct: pct(ndtKg),
    pbKg, pbPct: pct(pbKg),
    eeKg, eePct: pct(eeKg),
    fdnKg, fdnPct: pct(fdnKg),
    fdaKg, fdaPct: pct(fdaKg),
    cnfKg, cnfPct: pct(cnfKg),
    mmKg, mmPct: pct(mmKg),
    caKg, caPct: pct(caKg),
    pKg, pPct: pct(pKg),
    sKg, sPct: pct(sKg),
    mgKg, mgPct: pct(mgKg),
    naKg, naPct: pct(naKg),
    amidoKg, amidoPct: pct(amidoKg),

    seMg, seConc: conc(seMg),
    znMg, znConc: conc(znMg),
    cuMg, cuConc: conc(cuMg),
    iodoMg, iodoConc: conc(iodoMg),
    mnMg, mnConc: conc(mnMg),
    coMg, coConc: conc(coMg),
    vitAUi, vitAConc: conc(vitAUi),
    vitEUi, vitEConc: conc(vitEUi),

    custoTotal,
    custoPorKg: qtyTotal > 0 ? custoTotal / qtyTotal : 0,
  };
}
