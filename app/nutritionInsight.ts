import type { DietTotals } from "./dietCalculations";
import { phaseTargets } from "./data";

// ============================================================
// Única fonte de "leitura" do resultado nutricional — recebe os totais já
// calculados em app/dietCalculations.ts (nunca recalcula nutriente nenhum)
// e classifica cada um contra a faixa da fase (app/data.ts::phaseTargets).
// Reaproveitado no Status Nutricional (Rebanho e Cadastro) e no
// components/NutrStatus.tsx, para as barras e o texto de insight nunca
// divergirem sobre o que está "OK", "Atenção" ou "Fora".
// ============================================================

export type NutrKey = "ndt" | "pb" | "fdn" | "fda" | "ee" | "ca" | "p";
export type NutrStatusLevel = "ok" | "warn" | "bad";

export const NUTR_LABELS: Record<NutrKey, string> = {
  ndt: "NDT", pb: "PB", fdn: "FDN", fda: "FDA", ee: "EE", ca: "Ca", p: "P",
};

export const statusLabel: Record<NutrStatusLevel, string> = { ok: "OK", warn: "Atenção", bad: "Fora" };

/** Classifica um valor (%) contra a faixa da fase. Sem fase/faixa cadastrada, considera OK. */
export function getNutrStatus(key: NutrKey, value: number, phase?: string): NutrStatusLevel {
  const t = phase ? phaseTargets[phase] : undefined;
  if (!t || !t[key]) return "ok";
  const [mn, mx] = t[key];
  if (value < mn || value > mx) return "bad";
  const margin = (mx - mn) * 0.1;
  if (value < mn + margin || value > mx - margin) return "warn";
  return "ok";
}

export interface NutrIssue {
  key: NutrKey;
  label: string;
  status: NutrStatusLevel;
  value: number;
  target?: [number, number];
}

export interface NutritionInsight {
  overall: NutrStatusLevel;
  issues: NutrIssue[];
  text: string;
}

/**
 * Gera o insight textual do Status Nutricional a partir dos totais da dieta
 * (DietTotals) e da fase do animal. Única função que decide o texto — usada
 * tanto no Rebanho quanto no Cadastro, para nunca haver dois diagnósticos
 * diferentes para o mesmo cálculo.
 */
export function buildNutritionInsight(totals: DietTotals, phase?: string): NutritionInsight {
  const values: Record<NutrKey, number> = {
    ndt: totals.ndtPct, pb: totals.pbPct, fdn: totals.fdnPct,
    fda: totals.fdaPct, ee: totals.eePct, ca: totals.caPct, p: totals.pPct,
  };

  const keys: NutrKey[] = ["ndt", "pb", "fdn", "fda", "ee", "ca", "p"];
  const issues: NutrIssue[] = keys.map(key => {
    const value = values[key];
    const status = getNutrStatus(key, value, phase);
    const target = phase ? phaseTargets[phase]?.[key] : undefined;
    return { key, label: NUTR_LABELS[key], status, value, target };
  });

  const bad = issues.filter(i => i.status === "bad");
  const warn = issues.filter(i => i.status === "warn");
  const overall: NutrStatusLevel = bad.length ? "bad" : warn.length ? "warn" : "ok";

  let text: string;
  if (totals.qtyTotal === 0) {
    text = "Nenhum ingrediente lançado na dieta ainda — inclua itens para ver o diagnóstico.";
  } else if (!phase) {
    text = "Selecione a fase do animal para comparar a dieta com as faixas nutricionais recomendadas.";
  } else if (bad.length > 0) {
    const detalhes = bad.map(i => {
      const dir = i.target && i.value > i.target[1] ? "acima" : "abaixo";
      return `${i.label} ${dir} da faixa ideal${i.target ? ` (${i.target[0]}–${i.target[1]}%)` : ""}`;
    }).join("; ");
    text = `⚠️ ${detalhes}.`;
  } else if (warn.length > 0) {
    text = `${warn.map(i => i.label).join(", ")} no limite da faixa recomendada — acompanhar.`;
  } else {
    text = "✅ Dieta dentro das faixas nutricionais recomendadas para a fase.";
  }

  return { overall, issues, text };
}
