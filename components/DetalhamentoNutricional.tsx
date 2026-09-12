"use client";
import { useState } from "react";
import type { DietLineCalc, DietTotals } from "@/app/dietCalculations";

type DetailTab = "nutrientes" | "minerais" | "vitaminas";

/**
 * Card "Detalhamento nutricional completo" — tabela por ingrediente + total,
 * igual à aba Dieta da planilha (um item por linha, TOTAL no rodapé).
 * Único componente para essa tabela: recebe as linhas já calculadas
 * (app/dietCalculations.ts::calcDietLine/calcDietTotals) e só formata —
 * nada aqui recalcula nutriente nenhum. Usado no Cadastro e no Rebanho
 * (aba "Status nutricional" da Dieta da Vaca) para nunca haver duas tabelas
 * divergentes mostrando o mesmo resultado.
 */
export default function DetalhamentoNutricional({ lines, totals }: { lines: DietLineCalc[]; totals: DietTotals }) {
  const [detailTab, setDetailTab] = useState<DetailTab>("nutrientes");

  if (lines.length === 0) return null;

  return (
    <div className="card">
      <div className="card-header" style={{ justifyContent:"space-between" }}>
        <span>📊 Detalhamento nutricional completo</span>
        <div style={{ display:"flex", gap:4 }}>
          {([
            { id:"nutrientes", label:"Nutrientes" },
            { id:"minerais",   label:"Minerais" },
            { id:"vitaminas",  label:"Vitaminas" },
          ] as { id: DetailTab; label:string }[]).map(t => (
            <button key={t.id} className="btn"
              style={{ padding:"4px 10px", fontSize:10, borderRadius:99,
                background: detailTab===t.id ? "var(--green-light)" : "var(--surface)",
                color: detailTab===t.id ? "var(--green-dark)" : "var(--text-muted)",
                border: detailTab===t.id ? "1px solid rgba(29,158,117,0.2)" : "1px solid var(--border)" }}
              onClick={() => setDetailTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="card-body" style={{ padding:0, overflowX:"auto" }}>
        {detailTab === "nutrientes" && (
          <table className="data-table" style={{ minWidth:760 }}>
            <thead>
              <tr>
                <th>Ingrediente</th><th>MS kg</th><th>NDT kg</th><th>PB kg</th><th>EE kg</th>
                <th>FDN kg</th><th>FDA kg</th><th>CNF kg</th><th>MM kg</th><th>Amido kg</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.ingredient.id || l.ingredient.name}>
                  <td style={{ fontWeight:500, fontSize:11 }}>{l.ingredient.name}</td>
                  <td style={{ fontSize:11 }}>{l.msKg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.ndtKg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.pbKg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.eeKg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.fdnKg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.fdaKg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.cnfKg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.mmKg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.amidoKg.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight:700, background:"var(--surface)" }}>
                <td style={{ fontSize:11 }}>TOTAL</td>
                <td style={{ fontSize:11 }}>{totals.msKg.toFixed(2)}</td>
                <td style={{ fontSize:11 }}>{totals.ndtKg.toFixed(2)} ({totals.ndtPct.toFixed(1)}%)</td>
                <td style={{ fontSize:11 }}>{totals.pbKg.toFixed(2)} ({totals.pbPct.toFixed(1)}%)</td>
                <td style={{ fontSize:11 }}>{totals.eeKg.toFixed(2)} ({totals.eePct.toFixed(1)}%)</td>
                <td style={{ fontSize:11 }}>{totals.fdnKg.toFixed(2)} ({totals.fdnPct.toFixed(1)}%)</td>
                <td style={{ fontSize:11 }}>{totals.fdaKg.toFixed(2)} ({totals.fdaPct.toFixed(1)}%)</td>
                <td style={{ fontSize:11 }}>{totals.cnfKg.toFixed(2)} ({totals.cnfPct.toFixed(1)}%)</td>
                <td style={{ fontSize:11 }}>{totals.mmKg.toFixed(2)} ({totals.mmPct.toFixed(1)}%)</td>
                <td style={{ fontSize:11 }}>{totals.amidoKg.toFixed(2)} ({totals.amidoPct.toFixed(1)}%)</td>
              </tr>
            </tfoot>
          </table>
        )}

        {detailTab === "minerais" && (
          <table className="data-table" style={{ minWidth:760 }}>
            <thead>
              <tr>
                <th>Ingrediente</th><th>Ca kg</th><th>P kg</th><th>S kg</th><th>Mg kg</th><th>Na kg</th>
                <th>Se mg</th><th>Zn mg</th><th>Cu mg</th><th>I mg</th><th>Mn mg</th><th>Co mg</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.ingredient.id || l.ingredient.name}>
                  <td style={{ fontWeight:500, fontSize:11 }}>{l.ingredient.name}</td>
                  <td style={{ fontSize:11 }}>{l.caKg.toFixed(3)}</td>
                  <td style={{ fontSize:11 }}>{l.pKg.toFixed(3)}</td>
                  <td style={{ fontSize:11 }}>{l.sKg.toFixed(3)}</td>
                  <td style={{ fontSize:11 }}>{l.mgKg.toFixed(3)}</td>
                  <td style={{ fontSize:11 }}>{l.naKg.toFixed(3)}</td>
                  <td style={{ fontSize:11 }}>{l.seMg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.znMg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.cuMg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.iodoMg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.mnMg.toFixed(2)}</td>
                  <td style={{ fontSize:11 }}>{l.coMg.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight:700, background:"var(--surface)" }}>
                <td style={{ fontSize:11 }}>TOTAL</td>
                <td style={{ fontSize:11 }}>{totals.caKg.toFixed(3)} ({totals.caPct.toFixed(2)}%)</td>
                <td style={{ fontSize:11 }}>{totals.pKg.toFixed(3)} ({totals.pPct.toFixed(2)}%)</td>
                <td style={{ fontSize:11 }}>{totals.sKg.toFixed(3)} ({totals.sPct.toFixed(2)}%)</td>
                <td style={{ fontSize:11 }}>{totals.mgKg.toFixed(3)} ({totals.mgPct.toFixed(2)}%)</td>
                <td style={{ fontSize:11 }}>{totals.naKg.toFixed(3)} ({totals.naPct.toFixed(2)}%)</td>
                <td style={{ fontSize:11 }}>{totals.seMg.toFixed(2)} ({totals.seConc.toFixed(2)} mg/kg MS)</td>
                <td style={{ fontSize:11 }}>{totals.znMg.toFixed(2)} ({totals.znConc.toFixed(2)} mg/kg MS)</td>
                <td style={{ fontSize:11 }}>{totals.cuMg.toFixed(2)} ({totals.cuConc.toFixed(2)} mg/kg MS)</td>
                <td style={{ fontSize:11 }}>{totals.iodoMg.toFixed(2)} ({totals.iodoConc.toFixed(2)} mg/kg MS)</td>
                <td style={{ fontSize:11 }}>{totals.mnMg.toFixed(2)} ({totals.mnConc.toFixed(2)} mg/kg MS)</td>
                <td style={{ fontSize:11 }}>{totals.coMg.toFixed(2)} ({totals.coConc.toFixed(2)} mg/kg MS)</td>
              </tr>
            </tfoot>
          </table>
        )}

        {detailTab === "vitaminas" && (
          <table className="data-table" style={{ minWidth:360 }}>
            <thead>
              <tr><th>Ingrediente</th><th>Vit. A UI</th><th>Vit. E UI</th></tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.ingredient.id || l.ingredient.name}>
                  <td style={{ fontWeight:500, fontSize:11 }}>{l.ingredient.name}</td>
                  <td style={{ fontSize:11 }}>{l.vitAUi.toFixed(1)}</td>
                  <td style={{ fontSize:11 }}>{l.vitEUi.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight:700, background:"var(--surface)" }}>
                <td style={{ fontSize:11 }}>TOTAL</td>
                <td style={{ fontSize:11 }}>{totals.vitAUi.toFixed(1)} ({totals.vitAConc.toFixed(1)} UI/kg MS)</td>
                <td style={{ fontSize:11 }}>{totals.vitEUi.toFixed(1)} ({totals.vitEConc.toFixed(1)} UI/kg MS)</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
