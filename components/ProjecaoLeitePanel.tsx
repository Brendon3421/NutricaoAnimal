"use client";
import type { DietTotals } from "@/app/dietCalculations";
import { buildMilkProjection } from "@/app/milkProjection";

function fmt(v: number, decimals = 1): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const statusColor = { ok: "#1D9E75", warn: "#BA7517", bad: "#E24B4A" } as const;
const statusBg    = { ok: "#E1F5EE", warn: "#FAEEDA", bad: "#FCEBEB" } as const;
const statusTxt   = { ok: "#0F6E56", warn: "#854F0B", bad: "#A32D2D" } as const;
const statusIcon  = { ok: "✓", warn: "⚠", bad: "⚠" } as const;

/**
 * Conteúdo da Projeção de Produção de Leite — sem seletor de animal próprio:
 * recebe os totais já calculados (app/dietCalculations.ts) e os dados do
 * animal de quem os chama (Rebanho usa a vaca já selecionada ali). Não
 * recalcula nutriente nenhum; a única lógica é app/milkProjection.ts, que
 * só interpreta o que já foi calculado (mesma cadeia: dieta → cálculos
 * nutricionais → status nutricional → aqui).
 */
export default function ProjecaoLeitePanel({
  totals, phase, peso, productionAvg, cowName,
}: {
  totals: DietTotals;
  phase?: string;
  peso?: number;
  productionAvg: number | null;
  cowName?: string;
}) {
  const proj = buildMilkProjection(totals, phase, peso, productionAvg);
  const oc = statusColor[proj.insight.overall];
  const pot = proj.potential;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card">
        <div className="card-header">
          <span>📈 Projeção de Produção de Leite{cowName ? ` — ${cowName}` : ""}</span>
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
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>{phase || "—"}</div>
            </div>
            <div className="metric-card">
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Peso da vaca</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>{peso != null ? `${peso} kg` : "—"}</div>
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

      {/* Projeção de produção — estimativa a partir do NDT/PB já entregues pela dieta (app/milkProjection.ts::estimateMilkPotential). */}
      <div className="card">
        <div className="card-header">🥛 Projeção de produção</div>
        <div className="card-body">
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Produção atual</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {pot.currentProductionAvg != null ? `${fmt(pot.currentProductionAvg)} L/dia` : "sem registro"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Produção estimada</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {pot.estimatedPotential != null ? `${fmt(pot.estimatedPotential)} L/dia` : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Potencial adicional</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: pot.additionalPotential != null ? (pot.additionalPotential >= 0 ? "#1D9E75" : "#E24B4A") : undefined }}>
                {pot.additionalPotential != null ? `${pot.additionalPotential >= 0 ? "+" : ""}${fmt(pot.additionalPotential)} L/dia` : "—"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6 }}>💡 {pot.insightText}</div>

          <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-muted)" }}>
            Estimativa nutricional baseada na dieta atual (não é uma previsão exata da produção real).
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
              <> A dieta atual está aproveitando, em média, <b>{fmt(proj.avgUtilizationPct, 0)}%</b> das faixas nutricionais recomendadas{phase ? ` para a fase "${phase}"` : ""}.</>
            )}
            {proj.currentProductionAvg != null && (
              <> A produção média registrada é de <b>{fmt(proj.currentProductionAvg)} L/dia</b>.</>
            )}
            {" "}Veja o potencial de produção estimado na seção "Projeção de produção" acima.
          </div>
        </div>
      </div>
    </div>
  );
}
