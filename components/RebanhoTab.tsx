"use client";
import AIAnalysis from "./AIAnalysis";
import { useState } from "react";
import { useCows } from "@/app/page";
import { phaseColors, type DietLine } from "@/app/data";
import { useIngredients } from "@/app/ingredientStore";
import { calcDietLine, calcDietTotals } from "@/app/dietCalculations";
import NutrStatus, { calcNutrition } from "./NutrStatus";
import StatusNutricionalGrid from "./StatusNutricionalGrid";
import DetalhamentoNutricional from "./DetalhamentoNutricional";
import ProjecaoLeitePanel from "./ProjecaoLeitePanel";

export default function RebanhoTab() {
  const { cows, setCows } = useCows();
  const { ingredients } = useIngredients();
  const [selId, setSelId] = useState(cows[0]?.id);
  const sel = cows.find(c => c.id === selId) ?? cows[0];
  const [search, setSearch] = useState("");
  const filteredCows = search.trim()
    ? cows.filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    : cows;

  // Diet editing state
  const [aiOpen, setAiOpen] = useState(false);
  const [dietEdit, setDietEdit] = useState<DietLine[] | null>(null);
  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState<string>("");
  const activeDiet = dietEdit ?? sel.diet;
  const nutr = calcNutrition(activeDiet, ingredients);
  // Mesma fonte única de cálculo (app/dietCalculations.ts) usada no Cadastro —
  // aqui em kg, para a grade "Status nutricional" da Dieta da Vaca.
  const activeDietLinesCalc = activeDiet
    .filter(d => d.qtyMN > 0)
    .map(d => {
      const ing = ingredients.find(i => i.name === d.ingredientName);
      return ing ? calcDietLine(ing, d.qtyMN) : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);
  const activeDietTotals = calcDietTotals(activeDietLinesCalc);
  const pc = phaseColors[sel.phase] ?? { bg: "#F1EFE8", text: "#5F5E5A", dot: "#888780" };
  const prodToday = sel.production[sel.production.length - 1]?.liters ?? 0;
  const prodAvg = sel.production.length ? +(sel.production.reduce((s, p) => s + p.liters, 0) / sel.production.length).toFixed(1) : 0;
  const prodMes = prodAvg * 30;
  const rendaDia = prodToday > 0 ? (prodToday * 1.5 - nutr.costTotal).toFixed(2) : "—";

  function saveDiet() {
    if (!dietEdit) return;
    setCows(cows.map(c => c.id === sel.id ? { ...c, diet: dietEdit } : c));
    setDietEdit(null);
  }
  function cancelDiet() { setDietEdit(null); }

  // Edição da produção de leite de qualquer dia (índice em Cow.production) —
  // clicar em uma barra do gráfico semanal (ou no lápis do card "Hoje")
  // seleciona o dia e abre o campo de edição abaixo do gráfico. Salva direto
  // em Cow.production, que já é persistido via useCows()/localStorage e é a
  // mesma fonte usada em prodToday/prodAvg acima e em productionAvg na
  // Projeção de Leite — nenhum cálculo novo, só grava o valor informado.
  const [prodEditDay, setProdEditDay] = useState<number | null>(null);
  const [prodEditValue, setProdEditValue] = useState<string>("");
  function saveProdDay() {
    if (prodEditDay === null) return;
    const val = Number(prodEditValue.replace(",", "."));
    if (isNaN(val) || val < 0) return;
    const updated = sel.production.map((p, i) => i === prodEditDay ? { ...p, liters: val } : p);
    setCows(cows.map(c => c.id === sel.id ? { ...c, production: updated } : c));
    setProdEditDay(null);
  }
  function cancelProdEdit() { setProdEditDay(null); }
  function addLine() {
    if (!addName || !addQty || Number(addQty) <= 0) return;
    const base = dietEdit ?? sel.diet;
    if (base.find(d => d.ingredientName === addName)) return;
    setDietEdit([...base, { ingredientName: addName, qtyMN: Number(addQty) }]);
    setAddName(""); setAddQty("");
  }
  function removeLine(name: string) {
    setDietEdit((dietEdit ?? sel.diet).filter(d => d.ingredientName !== name));
  }
  function updateQty(name: string, qty: number) {
    setDietEdit((dietEdit ?? sel.diet).map(d => d.ingredientName === name ? { ...d, qtyMN: qty } : d));
  }

  const alertsForSel = sel.health.filter(h => h.level !== "g");
  const monitorTabs = [
    { id: "producao", label: "Produção de leite", icon: "💧", badge: `${prodToday > 0 ? prodToday : 0} L` },
    { id: "saude", label: "Saúde", icon: "❤️", badge: `${alertsForSel.length} alertas` },
    { id: "dieta", label: "Dieta", icon: "🌿", badge: `${activeDiet.length} itens` },
    { id: "nutricao", label: "Status nutricional", icon: "🔬", badge: `${nutr.ms.toFixed(1)} kg MS` },
    { id: "projecao", label: "Projeção de leite", icon: "📈", badge: prodAvg > 0 ? `${prodAvg.toFixed(1)} L/dia` : "—" },
  ] as const;
  type MonitorTab = (typeof monitorTabs)[number]["id"];
  const [activeTab, setActiveTab] = useState<MonitorTab>("producao");

  const renderMonitorContent = () => {
    if (activeTab === "saude") {
      return (
        <div className="card">
          <div className="card-header">❤️ Saúde</div>
          <div className="card-body">
            {sel.health.map(h => (
              <div key={h.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "0.5px solid var(--border)" }}>
                <div className={`hdot hdot-${h.level}`} />
                <div style={{ flex: 1, fontSize: 12, color: "var(--text-muted)" }}>{h.label}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: h.level === "g" ? "#1D9E75" : h.level === "a" ? "#BA7517" : "#E24B4A" }}>{h.status}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "dieta") {
      return (
        <div className="card">
          <div className="card-header" style={{ justifyContent: "space-between" }}>
            <span>🌿 Dieta atual</span>
            {dietEdit ? (
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 11 }} onClick={saveDiet}>Salvar</button>
                <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={cancelDiet}>Cancelar</button>
              </div>
            ) : (
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setDietEdit(sel.diet.map(d => ({ ...d })))}>✏️ Editar</button>
            )}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead><tr><th>Alimento</th><th>kg MN</th><th>kg MS</th><th>R$/dia</th>{dietEdit && <th></th>}</tr></thead>
              <tbody>
                {activeDiet.map(line => {
                  const ing = ingredients.find(i => i.name === line.ingredientName);
                  const ms = ing ? +(line.qtyMN * ing.ms / 100).toFixed(2) : 0;
                  const cost = ing ? +(line.qtyMN * ing.costPerKg).toFixed(2) : 0;
                  return (
                    <tr key={line.ingredientName}>
                      <td style={{ fontWeight: 500, fontSize: 12 }}>{line.ingredientName}</td>
                      <td>
                        {dietEdit ? (
                          <input type="number" min={0} step={0.5} value={line.qtyMN} onChange={e => updateQty(line.ingredientName, Number(e.target.value))} className="field" style={{ width: 70, padding: "3px 8px" }} />
                        ) : <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 12 }}>{line.qtyMN}</span>}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{ms}</td>
                      <td style={{ fontSize: 12, color: "#1D9E75", fontWeight: 500 }}>R$ {cost}</td>
                      {dietEdit && (
                        <td><button className="btn btn-danger" style={{ padding: "3px 8px", fontSize: 10 }} onClick={() => removeLine(line.ingredientName)}>✕</button></td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {dietEdit && (
              <div style={{ padding: "10px 12px", borderTop: "0.5px dashed var(--border)", display: "flex", gap: 8 }}>
                <select className="field" style={{ flex: 2 }} value={addName} onChange={e => setAddName(e.target.value)}>
                  <option value="">— Adicionar ingrediente —</option>
                  {ingredients.map(i => <option key={i.name} value={i.name}>{i.name} ({i.category})</option>)}
                </select>
                <input type="number" min={0} step={1} placeholder="kg MN" className="field" style={{ width: 90 }} value={addQty} onChange={e => setAddQty(e.target.value)} />
                <button className="btn btn-primary" style={{ whiteSpace: "nowrap" }} onClick={addLine}>+ Add</button>
              </div>
            )}
            <StatusNutricionalGrid totals={activeDietTotals} pesoVaca={sel.peso} phase={sel.phase} cow={sel} />
          </div>
        </div>
      );
    }

    if (activeTab === "nutricao") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Insight + resumo do animal + totais em kg — mesmo cálculo único da aba Dieta. */}
          <div className="card">
            <StatusNutricionalGrid totals={activeDietTotals} pesoVaca={sel.peso} phase={sel.phase} cow={sel} />
          </div>

          {/* % na MS contra a faixa da fase — mesma classificação do insight acima. */}
          <div className="card">
            <div className="card-header">🔬 Status nutricional (% na MS)</div>
            <div className="card-body">
              <NutrStatus diet={activeDiet} phase={sel.phase} />
            </div>
          </div>

          {/* Detalhamento por ingrediente — nutrientes / minerais / vitaminas. */}
          <DetalhamentoNutricional lines={activeDietLinesCalc} totals={activeDietTotals} />
        </div>
      );
    }

    if (activeTab === "projecao") {
      // Mesmos totais já calculados acima para esta vaca — sem seletor próprio,
      // usa direto a vaca selecionada no Rebanho.
      return (
        <ProjecaoLeitePanel
          totals={activeDietTotals}
          phase={sel.phase}
          peso={sel.peso}
          productionAvg={sel.production.length ? sel.production.reduce((s, p) => s + p.liters, 0) / sel.production.length : null}
          cowName={sel.name}
        />
      );
    }

    return (
      <div className="card">
        <div className="card-header">💧 Produção de leite</div>
        <div className="card-body">
          <div className="grid-4" style={{ marginBottom: 12 }}>
            <div className="metric-card">
              <div className="metric-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                <span>Hoje{sel.production.length ? ` (${sel.production[sel.production.length - 1].day})` : ""}</span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "0 4px", fontSize: 10, lineHeight: 1 }}
                  onClick={() => { setProdEditDay(sel.production.length - 1); setProdEditValue(String(prodToday)); }}
                  title="Informar produção de hoje"
                >
                  ✏️
                </button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{prodToday > 0 ? `${prodToday} L` : "—"}</div>
            </div>
            {[
              { label: "Média 7d", val: `${prodAvg} L` },
              { label: "Projeção mês", val: `${prodMes} L` },
              { label: "Renda/dia", val: `R$ ${rendaDia}`, color: "#1D9E75" },
            ].map(m => (
              <div key={m.label} className="metric-card">
                <div className="metric-label">{m.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, color: m.color ?? "var(--text)" }}>{m.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
            {sel.production.map((p, i) => {
              const maxL = Math.max(...sel.production.map(x => x.liters), 1);
              const h = p.liters > 0 ? Math.max(8, (p.liters / maxL) * 60) : 0;
              const isToday = i === sel.production.length - 1;
              const isEditing = prodEditDay === i;
              return (
                <div
                  key={i}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}
                  onClick={() => { setProdEditDay(i); setProdEditValue(String(p.liters)); }}
                  title={`Informar produção de ${p.day}`}
                >
                  <span style={{ fontSize: 9, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{p.liters > 0 ? p.liters : ""}</span>
                  <div style={{ width: "100%", height: h, background: isToday ? "#1D9E75" : "#9FE1CB", borderRadius: "3px 3px 0 0", outline: isEditing ? "2px solid #0F6E56" : "none", outlineOffset: 1 }} />
                  <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: isEditing ? 700 : 400 }}>{p.day.slice(0, 1)}</span>
                </div>
              );
            })}
          </div>

          {prodEditDay !== null && (
            <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Produção de {sel.production[prodEditDay].day}:</span>
              <input
                type="number"
                min={0}
                step={0.1}
                autoFocus
                className="field"
                style={{ width: 70, padding: "3px 6px", fontSize: 12 }}
                value={prodEditValue}
                onChange={e => setProdEditValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveProdDay(); if (e.key === "Escape") cancelProdEdit(); }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>L</span>
              <button className="btn btn-primary" style={{ padding: "3px 10px", fontSize: 11 }} onClick={saveProdDay}>Salvar</button>
              <button className="btn btn-ghost" style={{ padding: "3px 10px", fontSize: 11 }} onClick={cancelProdEdit}>Cancelar</button>
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div className="card" style={{ width: 190, flexShrink: 0 }}>
        <div className="card-header">🐄 Rebanho</div>
        <div style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--border)" }}>
          <input
            type="text"
            className="field"
            placeholder="Buscar vaca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", fontSize: 11, padding: "5px 8px" }}
          />
        </div>
        {filteredCows.length === 0 && (
          <div style={{ padding: "12px 10px", fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
            Nenhuma vaca encontrada.
          </div>
        )}
        {filteredCows.map(c => {
          const pc2 = phaseColors[c.phase] ?? { bg: "#F1EFE8", text: "#5F5E5A", dot: "#888780" };
          const hasAlert = c.health.some(h => h.level !== "g");
          return (
            <div key={c.id} className={`animal-item${c.id === selId ? " selected" : ""}`} onClick={() => { setSelId(c.id); setDietEdit(null); setProdEditDay(null); }}>
              <div className="animal-avatar">🐄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  {c.name}
                  {hasAlert && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E24B4A", flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 10, marginTop: 2 }}>
                  <span style={{ background: pc2.bg, color: pc2.text, padding: "1px 6px", borderRadius: 99, fontWeight: 500 }}>{c.phase}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card">
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: pc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🐄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{sel.name}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ background: pc.bg, color: pc.text, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500 }}>{sel.phase}</span>
              </div>
            </div>
            <div className="grid-4" style={{ flex: "none" }}>
              {[
                { label: "Peso", val: `${sel.peso} kg` },
                { label: "GMD", val: `${sel.gmd} kg/dia` },
                { label: "CC", val: `${sel.score}/5` },
                { label: "Custo/dia", val: `R$ ${nutr.costTotal.toFixed(2)}` },
              ].map(m => (
                <div key={m.label} className="metric-card" style={{ minWidth: 90 }}>
                  <div className="metric-label">{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color: "var(--text)" }}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>
          {sel.notes && (
            <div style={{ margin: "0 16px 14px", padding: "8px 12px", background: "#FFFBEB", borderRadius: 8, fontSize: 11, color: "#854F0B", border: "0.5px solid #FDE68A" }}>
              📌 {sel.notes}
            </div>
          )}
          {alertsForSel.length > 0 && (
            <div style={{ margin: "0 16px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {alertsForSel.map(h => (
                <span key={h.label} className={`badge badge-${h.level === "r" ? "red" : "amber"}`}>
                  {h.level === "r" ? "🔴" : "⚠️"} {h.label}: {h.status}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Acompanhamento
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {monitorTabs.map(tab => (
                <button
                  key={tab.id}
                  className="btn"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "8px 12px",
                    fontSize: 11,
                    borderRadius: 999,
                    background: activeTab === tab.id ? "var(--green-light)" : "var(--surface)",
                    color: activeTab === tab.id ? "var(--green-dark)" : "var(--text-muted)",
                    border: activeTab === tab.id ? "1px solid rgba(29,158,117,0.2)" : "1px solid var(--border)",
                    boxShadow: activeTab === tab.id ? "inset 0 0 0 1px rgba(29,158,117,0.08)" : "none",
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span style={{ padding: "2px 6px", borderRadius: 99, background: activeTab === tab.id ? "rgba(29,158,117,0.12)" : "rgba(17,24,39,0.04)", fontSize: 10, fontWeight: 700 }}>{tab.badge}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: 16 }}>{renderMonitorContent()}</div>
        </div>
      </div>

      {aiOpen && (
        <AIAnalysis
          cow={sel}
          onClose={() => setAiOpen(false)}
          onApplyDiet={(diet) => {
            setCows(cows.map(c => c.id === sel.id ? { ...c, diet } : c));
            setDietEdit(null);
            setAiOpen(false);
          }}
        />
      )}
    </div>
  );
}
