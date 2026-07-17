"use client";
import AIAnalysis from "./AIAnalysis";
import { useState } from "react";
import { useCows } from "@/app/page";
import { phaseColors, ingredients, type DietLine } from "@/app/data";
import NutrStatus, { calcNutrition } from "./NutrStatus";

export default function RebanhoTab() {
  const { cows, setCows } = useCows();
  const [selId, setSelId] = useState(cows[0]?.id);
  const sel = cows.find(c => c.id === selId) ?? cows[0];

  // Diet editing state
  const [aiOpen, setAiOpen] = useState(false);
  const [dietEdit, setDietEdit] = useState<DietLine[] | null>(null);
  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState<string>("");
  const activeDiet = dietEdit ?? sel.diet;
  const nutr = calcNutrition(activeDiet);
  const pc = phaseColors[sel.phase] ?? { bg:"#F1EFE8", text:"#5F5E5A", dot:"#888780" };
  const prodToday = sel.production[sel.production.length - 1]?.liters ?? 0;
  const prodAvg = sel.production.length ? +(sel.production.reduce((s,p) => s+p.liters,0)/sel.production.length).toFixed(1) : 0;
  const prodMes = prodAvg * 30;
  const rendaDia = prodToday > 0 ? (prodToday * 1.5 - nutr.costTotal).toFixed(2) : "—";

  function saveDiet() {
    if (!dietEdit) return;
    setCows(cows.map(c => c.id === sel.id ? { ...c, diet: dietEdit } : c));
    setDietEdit(null);
  }
  function cancelDiet() { setDietEdit(null); }
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

  return (
    <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
      {/* Animal list */}
      <div className="card" style={{ width:190, flexShrink:0 }}>
        <div className="card-header">🐄 Rebanho</div>
        {cows.map(c => {
          const pc2 = phaseColors[c.phase] ?? { bg:"#F1EFE8", text:"#5F5E5A", dot:"#888780" };
          const hasAlert = c.health.some(h => h.level !== "g");
          return (
            <div key={c.id} className={`animal-item${c.id === selId ? " selected":""}`} onClick={() => { setSelId(c.id); setDietEdit(null); }}>
              <div className="animal-avatar">🐄</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                  {c.name}
                  {hasAlert && <span style={{ width:6, height:6, borderRadius:"50%", background:"#E24B4A", flexShrink:0 }} />}
                </div>
                <div style={{ fontSize:10, marginTop:2 }}>
                  <span style={{ background:pc2.bg, color:pc2.text, padding:"1px 6px", borderRadius:99, fontWeight:500 }}>{c.phase}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12 }}>

        {/* Hero row */}
        <div className="card">
          <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:52, height:52, borderRadius:12, background:pc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>🐄</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:18, fontWeight:600 }}>{sel.name}</div>
              <div style={{ marginTop:4 }}>
                <span style={{ background:pc.bg, color:pc.text, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:500 }}>{sel.phase}</span>
              </div>
            </div>
            <div className="grid-4" style={{ flex:"none" }}>
              {[
                { label:"Peso", val:`${sel.peso} kg` },
                { label:"GMD", val:`${sel.gmd} kg/dia` },
                { label:"CC", val:`${sel.score}/5` },
                { label:"Custo/dia", val:`R$ ${nutr.costTotal.toFixed(2)}` },
              ].map(m => (
                <div key={m.label} className="metric-card" style={{ minWidth:90 }}>
                  <div className="metric-label">{m.label}</div>
                  <div style={{ fontSize:14, fontWeight:600, marginTop:3, color:"var(--text)" }}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>
          {sel.notes && (
            <div style={{ margin:"0 16px 14px", padding:"8px 12px", background:"#FFFBEB", borderRadius:8, fontSize:11, color:"#854F0B", border:"0.5px solid #FDE68A" }}>
              📌 {sel.notes}
            </div>
          )}
          {alertsForSel.length > 0 && (
            <div style={{ margin:"0 16px 14px", display:"flex", gap:6, flexWrap:"wrap" }}>
              {alertsForSel.map(h => (
                <span key={h.label} className={`badge badge-${h.level === "r" ? "red":"amber"}`}>
                  {h.level === "r" ? "🔴" : "⚠️"} {h.label}: {h.status}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid-2">
          {/* Produção */}
          <div className="card">
            <div className="card-header">💧 Produção de leite</div>
            <div className="card-body">
              <div className="grid-4" style={{ marginBottom:12 }}>
                {[
                  { label:"Hoje", val:prodToday > 0 ? `${prodToday} L` : "—" },
                  { label:"Média 7d", val:`${prodAvg} L` },
                  { label:"Projeção mês", val:`${prodMes} L` },
                  { label:"Renda/dia", val:`R$ ${rendaDia}`, color:"#1D9E75" },
                ].map(m => (
                  <div key={m.label} className="metric-card">
                    <div className="metric-label">{m.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, marginTop:3, color:m.color ?? "var(--text)" }}>{m.val}</div>
                  </div>
                ))}
              </div>
              {/* mini chart */}
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:60 }}>
                {sel.production.map((p, i) => {
                  const maxL = Math.max(...sel.production.map(x => x.liters), 1);
                  const h = p.liters > 0 ? Math.max(8, (p.liters / maxL) * 60) : 0;
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                      <span style={{ fontSize:9, color:"var(--text-muted)", fontVariantNumeric:"tabular-nums" }}>{p.liters > 0 ? p.liters : ""}</span>
                      <div style={{ width:"100%", height:h, background: i === sel.production.length-1 ? "#1D9E75" : "#9FE1CB", borderRadius:"3px 3px 0 0" }} />
                      <span style={{ fontSize:9, color:"var(--text-muted)" }}>{p.day.slice(0,1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Saúde */}
          <div className="card">
            <div className="card-header">❤️ Saúde</div>
            <div className="card-body">
              {sel.health.map(h => (
                <div key={h.label} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"0.5px solid var(--border)" }}>
                  <div className={`hdot hdot-${h.level}`} />
                  <div style={{ flex:1, fontSize:12, color:"var(--text-muted)" }}>{h.label}</div>
                  <div style={{ fontSize:12, fontWeight:500, color: h.level==="g"?"#1D9E75":h.level==="a"?"#BA7517":"#E24B4A" }}>{h.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dieta + Nutrição */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header" style={{ justifyContent:"space-between" }}>
              <span>🌿 Dieta atual</span>
              {dietEdit ? (
                <div style={{ display:"flex", gap:6 }}>
                  <button className="btn btn-primary" style={{ padding:"4px 12px", fontSize:11 }} onClick={saveDiet}>Salvar</button>
                  <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:11 }} onClick={cancelDiet}>Cancelar</button>
                </div>
              ) : (
                <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:11 }} onClick={() => setDietEdit(sel.diet.map(d => ({...d})))}>✏️ Editar</button>
              )}
            </div>
            <div className="card-body" style={{ padding:0 }}>
              <table className="data-table">
                <thead><tr><th>Alimento</th><th>kg MN</th><th>kg MS</th><th>R$/dia</th>{dietEdit && <th></th>}</tr></thead>
                <tbody>
                  {activeDiet.map(line => {
                    const ing = ingredients.find(i => i.name === line.ingredientName);
                    const ms = ing ? +(line.qtyMN * ing.ms / 100).toFixed(2) : 0;
                    const cost = ing ? +(line.qtyMN * ing.costPerKg).toFixed(2) : 0;
                    return (
                      <tr key={line.ingredientName}>
                        <td style={{ fontWeight:500, fontSize:12 }}>{line.ingredientName}</td>
                        <td>
                          {dietEdit ? (
                            <input type="number" min={0} step={0.5} value={line.qtyMN} onChange={e => updateQty(line.ingredientName, Number(e.target.value))} className="field" style={{ width:70, padding:"3px 8px" }} />
                          ) : <span style={{ fontVariantNumeric:"tabular-nums", fontSize:12 }}>{line.qtyMN}</span>}
                        </td>
                        <td style={{ fontSize:12, color:"var(--text-muted)" }}>{ms}</td>
                        <td style={{ fontSize:12, color:"#1D9E75", fontWeight:500 }}>R$ {cost}</td>
                        {dietEdit && (
                          <td><button className="btn btn-danger" style={{ padding:"3px 8px", fontSize:10 }} onClick={() => removeLine(line.ingredientName)}>✕</button></td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {dietEdit && (
                <div style={{ padding:"10px 12px", borderTop:"0.5px dashed var(--border)", display:"flex", gap:8 }}>
                  <select className="field" style={{ flex:2 }} value={addName} onChange={e => setAddName(e.target.value)}>
                    <option value="">— Adicionar ingrediente —</option>
                    {ingredients.map(i => <option key={i.name} value={i.name}>{i.name} ({i.category})</option>)}
                  </select>
                  <input type="number" min={0} step={1} placeholder="kg MN" className="field" style={{ width:90 }} value={addQty} onChange={e => setAddQty(e.target.value)} />
                  <button className="btn btn-primary" style={{ whiteSpace:"nowrap" }} onClick={addLine}>+ Add</button>
                </div>
              )}
              <div style={{ padding:"8px 12px", borderTop:"0.5px solid var(--border)", display:"flex", justifyContent:"space-between", fontSize:12 }}>
                <span style={{ color:"var(--text-muted)" }}>MS total: <b>{nutr.ms.toFixed(1)} kg</b></span>
                <span style={{ color:"var(--text-muted)" }}>Custo total: <b style={{ color:"#1D9E75" }}>R$ {nutr.costTotal.toFixed(2)}</b></span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">🔬 Status nutricional (% na MS)</div>
            <div className="card-body">
              <NutrStatus diet={activeDiet} phase={sel.phase} />
            </div>
          </div>
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