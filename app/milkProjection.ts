import type { DietTotals } from "./dietCalculations";
import { buildNutritionInsight, type NutritionInsight, type NutrIssue, type NutrKey } from "./nutritionInsight";

// ============================================================
// Projeção de Produção de Leite — não recalcula nutriente nenhum: usa
// direto os totais já calculados em app/dietCalculations.ts (MS, NDT, PB,
// EE, FDN, FDA, CNF em kg/dia) e a classificação contra a faixa da fase em
// app/nutritionInsight.ts (mesma usada no Status Nutricional/NutrStatus).
// O único dado externo é a "produção atual", que já vem do cadastro da
// vaca (Cow.production).
//
// POTENCIAL DE PRODUÇÃO (litros/dia) — fórmula centralizada abaixo em
// MILK_POTENTIAL_PARAMS + estimateMilkPotential(). É uma ESTIMATIVA
// NUTRICIONAL simplificada (sistema clássico de NDT/PB), não uma previsão
// exata: usa o excedente de energia (NDT) e de proteína (PB) entregues pela
// dieta acima da manutenção do animal, converte cada um em litros por um
// fator fixo, e considera o potencial real como o menor dos dois (o
// nutriente mais limitante). MS, EE, FDN, FDA e CNF não entram como
// multiplicador separado nessa conta — eles já influenciam quanto de NDT/PB
// a dieta consegue entregar (Potencial nutricional/Pontos de atenção
// abaixo), e adicionar mais coeficientes tornaria a fórmula menos simples
// e menos transparente do que o pedido. Os coeficientes ficam em
// MILK_POTENTIAL_PARAMS justamente para serem ajustados depois, sem tocar
// no resto do cálculo.
// ============================================================

/**
 * Coeficientes da estimativa de potencial de produção — ajuste aqui.
 * Valores de referência simplificados (sistema de NDT/PB), não um sistema
 * NRC completo.
 */
export const MILK_POTENTIAL_PARAMS = {
  /** NDT gasto em manutenção do animal, como % do peso vivo (kg NDT / kg PV). */
  ndtManutencaoPctPV: 1.3,
  /** kg de NDT, além da manutenção, necessários para produzir 1 litro de leite. */
  ndtPorLitro: 0.38,
  /** PB gasta em manutenção do animal, como % do peso vivo. */
  pbManutencaoPctPV: 0.09,
  /** kg de PB, além da manutenção, necessários para produzir 1 litro de leite. */
  pbPorLitro: 0.085,
};

export type LimitingFactor = "energia" | "proteina" | null;

export interface MilkPotentialEstimate {
  currentProductionAvg: number | null;
  /** Potencial estimado de produção (L/dia). null quando falta peso ou dieta. */
  estimatedPotential: number | null;
  /** estimatedPotential − currentProductionAvg. null se não houver produção atual registrada. */
  additionalPotential: number | null;
  /** Qual nutriente definiu o potencial (o mais limitante entre energia/NDT e proteína/PB). */
  limitingFactor: LimitingFactor;
  /** Frase curta explicando se a dieta mantém, aumenta ou limita a produção. */
  insightText: string;
}

/**
 * Estima o potencial de produção de leite (L/dia) a partir do NDT(kg) e
 * PB(kg) já entregues pela dieta (totals) e do peso do animal — o
 * "excedente" de cada nutriente acima da manutenção é convertido em litros;
 * o potencial final é o menor dos dois (nutriente mais limitante).
 */
export function estimateMilkPotential(
  totals: DietTotals,
  peso: number | undefined,
  currentProductionAvg: number | null,
): MilkPotentialEstimate {
  if (!peso || peso <= 0 || totals.qtyTotal === 0) {
    return {
      currentProductionAvg, estimatedPotential: null, additionalPotential: null, limitingFactor: null,
      insightText: "Cadastre o peso da vaca e os ingredientes da dieta para estimar o potencial de produção.",
    };
  }

  const p = MILK_POTENTIAL_PARAMS;

  const ndtManutencao = (peso * p.ndtManutencaoPctPV) / 100;
  const ndtProducao = Math.max(0, totals.ndtKg - ndtManutencao);
  const potencialEnergia = ndtProducao / p.ndtPorLitro;

  const pbManutencao = (peso * p.pbManutencaoPctPV) / 100;
  const pbProducao = Math.max(0, totals.pbKg - pbManutencao);
  const potencialProteina = pbProducao / p.pbPorLitro;

  const estimatedPotential = Math.min(potencialEnergia, potencialProteina);
  const limitingFactor: LimitingFactor = potencialEnergia <= potencialProteina ? "energia" : "proteina";
  const limitLabel = limitingFactor === "energia" ? "energia (NDT)" : "proteína (PB)";

  const additionalPotential = currentProductionAvg != null ? estimatedPotential - currentProductionAvg : null;

  let insightText: string;
  if (currentProductionAvg == null) {
    insightText = `Com a dieta atual, o potencial estimado é de ${estimatedPotential.toFixed(1)} L/dia — nutriente mais limitante: ${limitLabel}. Sem produção atual registrada para comparar.`;
  } else if (additionalPotential! > 1) {
    insightText = `A dieta atual tem potencial para AUMENTAR a produção em cerca de ${additionalPotential!.toFixed(1)} L/dia — o fator limitante é ${limitLabel}.`;
  } else if (additionalPotential! < -1) {
    insightText = `A produção atual está ACIMA do que a dieta sustenta nutricionalmente (déficit estimado de ${Math.abs(additionalPotential!).toFixed(1)} L/dia) — risco de a vaca usar reservas corporais para manter a produção.`;
  } else {
    insightText = `A dieta atual é suficiente para MANTER a produção atual, com pouca margem para aumento (fator limitante: ${limitLabel}).`;
  }

  return { currentProductionAvg, estimatedPotential, additionalPotential, limitingFactor, insightText };
}

export interface NutrientUtilization {
  key: NutrKey;
  label: string;
  kg: number;
  pctMS: number;
  target?: [number, number];
  /** 0–100: quão perto o valor entregue está da faixa ideal da fase.
   *  Dentro da faixa = 100%. Fora, cai proporcionalmente à distância. */
  utilizationPct: number;
}

const KG_FIELD: Record<NutrKey, keyof DietTotals> = {
  ndt: "ndtKg", pb: "pbKg", fdn: "fdnKg", fda: "fdaKg", ee: "eeKg", ca: "caKg", p: "pKg",
};

export function buildNutrientUtilization(totals: DietTotals, issues: NutrIssue[]): NutrientUtilization[] {
  return issues.map(i => {
    let utilizationPct: number;
    if (!i.target) {
      utilizationPct = 0; // sem faixa cadastrada para a fase — não é possível avaliar aproveitamento
    } else {
      const [mn, mx] = i.target;
      if (i.value < mn) utilizationPct = mn > 0 ? (i.value / mn) * 100 : 0;
      else if (i.value > mx) utilizationPct = i.value > 0 ? (mx / i.value) * 100 : 0;
      else utilizationPct = 100;
    }
    return {
      key: i.key,
      label: i.label,
      kg: totals[KG_FIELD[i.key]] as number,
      pctMS: i.value,
      target: i.target,
      utilizationPct: Math.max(0, Math.min(100, utilizationPct)),
    };
  });
}

export interface AttentionPoint { level: "ok" | "warn" | "bad"; label: string; text: string; }

const TIPS: Record<NutrKey, { high: string; low: string; ok: string }> = {
  ndt: {
    high: "NDT acima do recomendado — dieta muito energética para a fase; pode gerar excesso de gordura corporal.",
    low:  "NDT abaixo do objetivo — pode limitar a disponibilidade de energia para produção.",
    ok:   "Energia (NDT) dentro da referência para a fase.",
  },
  pb: {
    high: "PB acima do recomendado — proteína em excesso tende a ser desperdiçada e sobrecarrega o metabolismo.",
    low:  "PB abaixo do objetivo — pode limitar a síntese de proteína do leite.",
    ok:   "Proteína (PB) adequada — a oferta está dentro da referência.",
  },
  fdn: {
    high: "FDN elevado — pode limitar o consumo de matéria seca.",
    low:  "FDN abaixo do recomendado — risco de acidose por baixa fibra efetiva.",
    ok:   "Fibra (FDN) dentro da faixa recomendada.",
  },
  fda: {
    high: "FDA elevado — fibra menos digestível, reduz a energia efetivamente aproveitada.",
    low:  "FDA abaixo do recomendado — atenção à fibra efetiva da dieta.",
    ok:   "FDA dentro da referência.",
  },
  ee: {
    high: "EE (gordura) acima do limite — risco de reduzir a fermentação ruminal.",
    low:  "EE abaixo do recomendado — energia de gordura subaproveitada.",
    ok:   "Extrato etéreo (EE) dentro da referência.",
  },
  ca: {
    high: "Cálcio acima do recomendado — atenção à relação Ca:P.",
    low:  "Cálcio abaixo do objetivo — pode comprometer a mineralização óssea.",
    ok:   "Cálcio dentro da referência.",
  },
  p: {
    high: "Fósforo acima do recomendado — atenção à relação Ca:P.",
    low:  "Fósforo abaixo do objetivo.",
    ok:   "Fósforo dentro da referência.",
  },
};

export function buildAttentionPoints(issues: NutrIssue[]): AttentionPoint[] {
  return issues.map(i => {
    const tip = TIPS[i.key];
    let text: string;
    if (i.status === "ok") text = tip.ok;
    else {
      const above = i.target ? i.value > i.target[1] : false;
      text = above ? tip.high : tip.low;
    }
    return { level: i.status, label: i.label, text };
  });
}

export interface MilkProjectionData {
  insight: NutritionInsight;
  utilization: NutrientUtilization[];
  attentionPoints: AttentionPoint[];
  /** Média do aproveitamento entre os nutrientes com faixa cadastrada para a fase. null se nenhum tiver faixa. */
  avgUtilizationPct: number | null;
  currentProductionAvg: number | null;
  /** Potencial de produção estimado a partir do NDT/PB da dieta — ver estimateMilkPotential. */
  potential: MilkPotentialEstimate;
}

export function buildMilkProjection(
  totals: DietTotals,
  phase: string | undefined,
  peso: number | undefined,
  currentProductionAvg: number | null,
): MilkProjectionData {
  const insight = buildNutritionInsight(totals, phase);
  const utilization = buildNutrientUtilization(totals, insight.issues);
  const attentionPoints = buildAttentionPoints(insight.issues);

  const evaluable = utilization.filter(u => u.target);
  const avgUtilizationPct = evaluable.length
    ? evaluable.reduce((s, u) => s + u.utilizationPct, 0) / evaluable.length
    : null;

  const potential = estimateMilkPotential(totals, peso, currentProductionAvg);

  return { insight, utilization, attentionPoints, avgUtilizationPct, currentProductionAvg, potential };
}
