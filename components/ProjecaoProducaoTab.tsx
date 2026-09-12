"use client";
import { useState } from "react";
import { useCows } from "@/app/page";
import { useIngredients } from "@/app/ingredientStore";
import { calcDietLine, calcDietTotals } from "@/app/dietCalculations";
import { buildMilkProjection } from "@/app/milkProjection";

function fmt(v: number, decimals = 1): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const statusColor = { ok: "#1D9E75", warn: "#BA7517", bad: "#E24B4A" } as const;
const statusBg    = { ok: "#E1F5EE", warn: "#FAEEDA", bad: "#FCEBEB" } as const;
const statusTxt   = { ok: "#0F6E56", warn: "#854F0B", bad: "#A32D2D" } as const;
const statusIcon  = { ok: "✓", warn: "⚠", bad: "⚠" } as const;

/**
 * Projeção de Produção de Leite — usa exclusivamente os dados já calculados
 * na Dieta da Vaca / Status Nutricional (mesma cadeia única: cadastro do
 * animal → dieta → app/dietCalculations.ts → app/nutritionInsight.ts).
 * Não recalcula nutriente nenhum aqui; a única lógica nova é
 * app/milkProjection.ts, que só interpreta o que já foi calculado.
 */
export default function ProjecaoProducaoTab() {
  const { cows } = useCows();
  const { ingredients } = useIngredients();
  const [selId, setSelId] = useState(cows[0]?.id);
  const sel = cows.find(c => c.id === selId) ?? cows[0];

  if (!sel) {
    return <div className="card"><div className="card-body">Nenhum animal cadastrado ainda.</div></div>;
  }

  const lines = sel.diet
    .filter(d => d.qtyMN > 0)
    .map(d => {
      const ing = ingredients.find(i => i.name === d.ingredientName);
      return ing ? calcDietLine(ing, d.qtyMN) : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);
  const totals = calcDietTotals(lines);

  const prodAvg = sel.production.length
    ? sel.production.reduce((s, p) => s + p.liters, 0) / sel.production.length
    : null;

  const proj = buildMilkProjection(totals, sel.phase, prodAvg);
  const oc = statusColor[proj.insight.overall];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Seletor de animal — a projeção é sempre da dieta/status atual do animal selecionado. */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: "space-between" }}>
          <span>📈 Projeção de Produção de Leite</span>
          <select className="field" style={{ width: 200, fontSize: 12 }} value={sel.id} onChange={e => setSelId(e.target.value)}>
            {cows.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="card-body">
          <div className="grid-4">
            <div className="metric-card">
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Produção atual (média)</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>
                {proj.currentProductionAvg != null ? `${fmt(proj.currentProductionAvg)} L/dia` : "—"}
              </div>
            </div>
            <div className="metric-card">
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Fase / categoria</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>{sel.phase || "—"}</div>
            </div>
            <div className="metric-card">
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Peso da vaca</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>{sel.peso} kg</div>
            </div>
            <div className="metric-card">
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Aproveitamento nutricional médio</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3, color: oc }}>
                {proj.avgUtilizationPct != null ? `${fmt(proj.avgUtilizationPct)}%` : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Potencial nutricional — quanto da dieta está dentro da faixa ideal da fase (aproveitamento), com o kg entregue. */}
      <div className="card">
        <div className="card-header">🌾 Potencial nutricional</div>
        <div className="card-body">
          {proj.utilization.every(u => !u.target) ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Selecione a fase do animal para comparar a dieta com as faixas nutricionais recomendadas.
            </div>
          ) : (
            proj.utilization.filter(u => u.target).map(u => (
              <div key={u.key} className="nutr-row">
                <div className="nutr-label">{u.label}</div>
                <div style={{ fontSize: 11, width: 62, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                  {fmt(u.kg, u.key === "ca" || u.key === "p" ? 3 : 2)} kg
                </div>
                <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${u.utilizationPct}%`, background: u.utilizationPct >= 95 ? "#1D9E75" : u.utilizationPct >= 80 ? "#BA7517" : "#E24B4A" }} />
                </div>
                <div style={{ fontVariantNumeric: "tabular-nums", fontSize: 11, fontWeight: 500, width: 40, textAlign: "right" }}>
                  {fmt(u.utilizationPct, 0)}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Projeção em litros — só é exibida com número quando existir fórmula validada. Como não existe, mostramos o que falta em vez de inventar um valor. */}
      <div className="card">
        <div className="card-header">🥛 Projeção de produção (litros/dia)</div>
        <div className="card-body">
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Produção atual</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {proj.currentProductionAvg != null ? `${fmt(proj.currentProductionAvg)} L/dia` : "sem registro"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Produção estimada</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-muted)" }}>não disponível</div>
            </div>
          </div>
          <div style={{ background: "#FFFBEB", border: "0.5px solid #FDE68A", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 11.5, color: "#854F0B", fontWeight: 600, marginBottom: 4 }}>
              ⚠ Ainda não há uma fórmula validada para converter os nutrientes da dieta em litros de leite projetados.
            </div>
            <div style={{ fontSize: 11, color: "#854F0B", lineHeight: 1.6 }}>
              Para calcular isso com segurança (e sem inventar números), falta cadastrar/definir:
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {proj.missingForLiters.map(m => <li key={m} style={{ marginBottom: 2 }}>{m}</li>)}
              </ul>
              Assim que essa referência existir no sistema, esta seção passa a calcular a estimativa e os cenários (conservador / atual / otimizado) automaticamente — sem precisar mudar nada aqui.
            </div>
          </div>
        </div>
      </div>

      {/* Pontos de atenção — direto da mesma classificação do Status Nutricional (app/nutritionInsight.ts). */}
      <div className="card">
        <div className="card-header">🔍 Pontos de atenção</div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {proj.attentionPoints.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Sem dados suficientes na dieta para avaliar.</div>
          ) : (
            proj.attentionPoints.map(a => (
              <div key={a.label} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 8px", borderRadius: 8, background: statusBg[a.level] }}>
                <span style={{ color: statusTxt[a.level], fontWeight: 700, fontSize: 12 }}>{statusIcon[a.level]}</span>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: statusTxt[a.level] }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: statusTxt[a.level] }}>{a.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Insight da projeção — texto único, gerado a partir do mesmo resultado usado acima. */}
      <div className="card">
        <div className="card-header">💡 Insight da projeção</div>
        <div className="card-body">
          <div style={{ fontSize: 12.5, lineHeight: 1.7, color: statusTxt[proj.insight.overall] }}>
            {proj.insight.text}
            {proj.avgUtilizationPct != null && (
              <> A dieta atual está aproveitando, em média, <b>{fmt(proj.avgUtilizationPct, 0)}%</b> das faixas nutricionais recomendadas para a fase "{sel.phase}".</>
            )}
            {proj.currentProductionAvg != null && (
              <> A produção média registrada é de <b>{fmt(proj.currentProductionAvg)} L/dia</b>.</>
            )}
            {" "}Uma projeção em litros/dia depende de uma fórmula de conversão nutriente→leite ainda não implementada (veja a seção acima).
          </div>
        </div>
      </div>
    </div>
  );
}
