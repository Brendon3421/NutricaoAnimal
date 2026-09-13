"use client";
import type { DietTotals } from "@/app/dietCalculations";
import { buildNutritionInsight } from "@/app/nutritionInsight";
import type { HealthRecord, ProductionRecord } from "@/app/data";

// Formata em pt-BR (vírgula decimal), igual ao exemplo do pedido: "MS: 7,50 kg".
function fmt(v: number, decimals = 2): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const insightColors: Record<"ok"|"warn"|"bad", { bg: string; text: string; border: string }> = {
  ok:   { bg: "#E1F5EE", text: "#0F6E56", border: "#9FE1CB" },
  warn: { bg: "#FAEEDA", text: "#854F0B", border: "#EAC98A" },
  bad:  { bg: "#FCEBEB", text: "#A32D2D", border: "#F0B4B4" },
};

/** Dados do animal aceitos para o resumo — subconjunto de Cow, todos opcionais
 *  porque no Cadastro o formulário pode estar parcialmente preenchido. */
export interface AnimalSummaryInput {
  name?: string;
  phase?: string;
  peso?: number;
  gmd?: string;
  score?: number;
  production?: ProductionRecord[];
  health?: HealthRecord[];
}

/**
 * Grade "Status Nutricional" — única fonte visual dos totais calculados da
 * dieta (app/dietCalculations.ts::calcDietTotals). Não recalcula nutriente
 * nenhum aqui: só formata e exibe o que já foi somado a partir do cadastro
 * de ingredientes. Reaproveitada na Dieta da Vaca (Rebanho e Cadastro) para
 * nunca haver dois lugares calculando o mesmo número de formas diferentes.
 *
 * Abaixo da grade, mostra também o insight nutricional (app/nutritionInsight.ts,
 * mesma classificação usada nas barras de NutrStatus) e um resumo rápido do
 * animal — passe `phase` e `cow` para habilitar essas duas seções.
 */
export default function StatusNutricionalGrid({ totals, pesoVaca, phase, cow }: { totals: DietTotals; pesoVaca?: number; phase?: string; cow?: AnimalSummaryInput }) {
  const tile = (label: string, value: string, sub?: string) => (
    <div key={label} style={{ padding:"10px 4px", textAlign:"center" }}>
      <div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.03em" }}>{label}</div>
      <div style={{ fontSize:15, fontWeight:700, marginTop:3, fontVariantNumeric:"tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize:9, color:"var(--text-muted)", marginTop:1 }}>{sub}</div>}
    </div>
  );

  const msPctPV = pesoVaca && pesoVaca > 0 ? (totals.msKg / pesoVaca) * 100 : null;
  const insight = buildNutritionInsight(totals, phase);
  const ic = insightColors[insight.overall];

  const prodAvg = cow?.production?.length
    ? cow.production.reduce((s, p) => s + p.liters, 0) / cow.production.length
    : null;
  const healthAlerts = cow?.health?.filter(h => h.level !== "g") ?? [];

  return (
    <div style={{ borderTop:"1px solid var(--border)" }}>
      <div style={{ padding:"8px 12px", background:"var(--surface)", borderBottom:"0.5px solid var(--border)", fontSize:11, fontWeight:700, letterSpacing:"0.04em", textTransform:"uppercase", color:"var(--text-muted)" }}>
        📊 Status nutricional — total da dieta
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", borderBottom:"0.5px solid var(--border)" }}>
        {tile("MS", `${fmt(totals.msKg)} kg`, msPctPV != null ? `${fmt(msPctPV,1)}% do PV` : `${fmt(totals.msPct,1)}%`)}
        {tile("NDT", `${fmt(totals.ndtKg)} kg`, `${fmt(totals.ndtPct,1)}%`)}
        {tile("PB", `${fmt(totals.pbKg)} kg`, `${fmt(totals.pbPct,1)}%`)}
        {tile("EE", `${fmt(totals.eeKg)} kg`, `${fmt(totals.eePct,1)}%`)}
        {tile("Ca", `${fmt(totals.caKg,3)} kg`, `${fmt(totals.caPct,2)}%`)}
        {tile("P", `${fmt(totals.pKg,3)} kg`, `${fmt(totals.pPct,2)}%`)}
        {tile("AM", `${fmt(totals.amidoKg,3)} kg`, `${fmt(totals.amidoPct,2)}%`)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)" }}>
        {tile("FDN", `${fmt(totals.fdnKg)} kg`, `${fmt(totals.fdnPct,1)}%`)}
        {tile("FDA", `${fmt(totals.fdaKg)} kg`, `${fmt(totals.fdaPct,1)}%`)}
        {tile("CNF", `${fmt(totals.cnfKg)} kg`, `${fmt(totals.cnfPct,1)}%`)}
        {tile("MM", `${fmt(totals.mmKg)} kg`, `${fmt(totals.mmPct,1)}%`)}
        {tile("Custo", `R$ ${fmt(totals.custoTotal)}`, `${fmt(totals.custoPorKg)}/kg`)}
        {tile("MS total", `${fmt(totals.qtyTotal)} kg MN`, undefined)}
        {tile("AM total", `${fmt(totals.amidoKg,3)} kg`, `${fmt(totals.amidoPct,2)}%`)}
      </div>

      {/* Insight — leitura automática dos totais acima contra a faixa da fase (app/nutritionInsight.ts). */}
      <div style={{ padding:"10px 12px", background:ic.bg, borderTop:`0.5px solid ${ic.border}`, display:"flex", alignItems:"flex-start", gap:8 }}>
        <span style={{ fontSize:14, lineHeight:1 }}>{insight.overall === "ok" ? "✅" : insight.overall === "warn" ? "🟡" : "⚠️"}</span>
        <div style={{ fontSize:11.5, color:ic.text, lineHeight:1.5, fontWeight:500 }}>{insight.text}</div>
      </div>

      {/* Resumo do animal — mesmos dados do cadastro, exibidos aqui pra contexto rápido junto do resultado nutricional. */}
      {cow && (
        <div style={{ padding:"8px 12px", borderTop:"0.5px solid var(--border)", display:"flex", flexWrap:"wrap", gap:14, alignItems:"center" }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.04em", textTransform:"uppercase", color:"var(--text-muted)" }}>🐄 Resumo do animal</span>
          {cow.phase && <span style={{ fontSize:11 }}>Fase: <b>{cow.phase}</b></span>}
          {cow.peso != null && <span style={{ fontSize:11 }}>Peso: <b>{fmt(cow.peso,0)} kg</b></span>}
          {cow.gmd && <span style={{ fontSize:11 }}>GMD: <b>{cow.gmd} kg/dia</b></span>}
          {cow.score != null && <span style={{ fontSize:11 }}>CC: <b>{fmt(cow.score,1)}/5</b></span>}
          {prodAvg != null && <span style={{ fontSize:11 }}>Produção média: <b>{fmt(prodAvg,1)} L/dia</b></span>}
          {healthAlerts.length > 0 ? (
            <span style={{ fontSize:11, color:"#A32D2D", fontWeight:600 }}>⚠️ {healthAlerts.length} alerta{healthAlerts.length > 1 ? "s" : ""} de saúde</span>
          ) : cow.health && (
            <span style={{ fontSize:11, color:"#0F6E56" }}>✓ Sem alertas de saúde</span>
          )}
        </div>
      )}
    </div>
  );
}
