"use client";
import { useState } from "react";
import { useCows } from "@/app/page";
import { phaseColors, ingredients, type Cow, type DietLine, type HealthRecord } from "@/app/data";

const PHASES = ["0–21 dias","22–80 dias","81–200 dias","> 200 dias","Pré-parto","Seca"];
const DAYS   = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

// Default health records for new cow
function defaultHealth(): HealthRecord[] {
  return [
    { label:"Vacinação",     status:"Em dia", level:"g" },
    { label:"Vermifugação",  status:"Em dia", level:"g" },
    { label:"Mastite",       status:"Negativo", level:"g" },
    { label:"Casco",         status:"Normal", level:"g" },
    { label:"C. corporal",   status:"3.0/5",  level:"g" },
  ];
}

function defaultProduction() {
  return DAYS.map(day => ({ day, liters: 0 }));
}

type Mode = "list" | "new" | "edit";

export default function CadastroTab() {
  const { cows, setCows } = useCows();
  const [mode, setMode]   = useState<Mode>("list");
  const [editId, setEditId] = useState<string|null>(null);
  const [confirmDel, setConfirmDel] = useState<string|null>(null);

  // ── Form state ──
  const blank = (): Partial<Cow> => ({
    name:"", phase:"22–80 dias", peso:500, gmd:"+0.5", score:3.0,
    production: defaultProduction(), diet:[], health:defaultHealth(), notes:""
  });
  const [form, setForm] = useState<Partial<Cow>>(blank());

  function openNew() { setForm(blank()); setEditId(null); setMode("new"); }
  function openEdit(cow: Cow) { setForm({ ...cow, production:[...cow.production.map(p=>({...p}))], diet:[...cow.diet.map(d=>({...d}))], health:[...cow.health.map(h=>({...h}))] }); setEditId(cow.id); setMode("edit"); }
  function cancel()  { setMode("list"); setEditId(null); }

  function save() {
    if (!form.name?.trim()) return alert("Digite o nome da vaca.");
    if (mode === "new") {
      const newCow: Cow = {
        id: Date.now().toString(),
        name: form.name!, phase: form.phase!, peso: form.peso!,
        gmd: form.gmd!, score: form.score!, production: form.production!,
        diet: form.diet!, health: form.health!, notes: form.notes ?? "",
      };
      setCows([...cows, newCow]);
    } else {
      setCows(cows.map(c => c.id === editId ? { ...c, ...form, id:c.id } as Cow : c));
    }
    setMode("list");
  }

  function deleteCow(id: string) { setCows(cows.filter(c => c.id !== id)); setConfirmDel(null); }

  // ── Diet helpers ──
  const [addIngName, setAddIngName] = useState("");
  const [addIngQty,  setAddIngQty]  = useState("");
  function addDietLine() {
    if (!addIngName || !addIngQty || Number(addIngQty) <= 0) return;
    if ((form.diet??[]).find(d => d.ingredientName === addIngName)) return;
    setForm(f => ({ ...f, diet:[...(f.diet??[]), { ingredientName:addIngName, qtyMN:Number(addIngQty) }] }));
    setAddIngName(""); setAddIngQty("");
  }
  function removeDietLine(name: string) {
    setForm(f => ({ ...f, diet:(f.diet??[]).filter(d => d.ingredientName !== name) }));
  }
  function updateDietQty(name: string, qty: number) {
    setForm(f => ({ ...f, diet:(f.diet??[]).map(d => d.ingredientName===name ? {...d,qtyMN:qty} : d) }));
  }

  // ── Health helpers ──
  const levelOpts: { v: HealthRecord["level"]; label:string }[] = [
    {v:"g",label:"✅ Normal"},{v:"a",label:"⚠️ Atenção"},{v:"r",label:"🔴 Crítico"}
  ];
  function updateHealth(i: number, field: keyof HealthRecord, val: string) {
    setForm(f => {
      const h = [...(f.health??[])];
      h[i] = { ...h[i], [field]: val } as HealthRecord;
      return { ...f, health:h };
    });
  }
  function addHealthRow() {
    setForm(f => ({ ...f, health:[...(f.health??[]), { label:"Novo item", status:"Normal", level:"g" }] }));
  }
  function removeHealthRow(i: number) {
    setForm(f => ({ ...f, health:(f.health??[]).filter((_,idx)=>idx!==i) }));
  }

  // ── Production helpers ──
  function updateProd(i: number, liters: number) {
    setForm(f => {
      const p = [...(f.production??[])];
      p[i] = { ...p[i], liters };
      return { ...f, production:p };
    });
  }

  const pc = phaseColors[form.phase ?? "22–80 dias"] ?? { bg:"#E1F5EE", text:"#0F6E56" };

  // ────────────────────────────────────────────
  // LIST VIEW
  // ────────────────────────────────────────────
  if (mode === "list") return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontWeight:600, fontSize:16 }}>Cadastro de animais</div>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{cows.length} vaca{cows.length!==1?"s":""} cadastrada{cows.length!==1?"s":""}</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Cadastrar nova vaca</button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Animal</th><th>Fase</th><th>Peso</th><th>CC</th>
              <th>Prod. média</th><th>Itens na dieta</th><th>Alertas</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cows.map(c => {
              const pc2 = phaseColors[c.phase] ?? { bg:"#F1EFE8", text:"#5F5E5A" };
              const avg = +(c.production.reduce((s,p)=>s+p.liters,0)/c.production.length).toFixed(1);
              const alerts = c.health.filter(h=>h.level!=="g").length;
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:30,height:30,borderRadius:7,background:pc2.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>🐄</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:12 }}>{c.name}</div>
                        <div style={{ fontSize:10, color:"var(--text-muted)" }}>GMD: {c.gmd} kg/dia</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ background:pc2.bg,color:pc2.text,padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:500 }}>{c.phase}</span></td>
                  <td style={{ fontVariantNumeric:"tabular-nums", fontSize:12 }}>{c.peso} kg</td>
                  <td style={{ fontSize:12 }}>{c.score}/5</td>
                  <td style={{ fontVariantNumeric:"tabular-nums", fontSize:12, fontWeight:500 }}>{avg > 0 ? `${avg} L` : "—"}</td>
                  <td style={{ fontSize:12 }}>{c.diet.length} ingrediente{c.diet.length!==1?"s":""}</td>
                  <td>
                    {alerts === 0
                      ? <span className="badge badge-green">✓ OK</span>
                      : <span className="badge badge-amber">⚠️ {alerts}</span>}
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn btn-ghost" style={{ padding:"4px 12px", fontSize:11 }} onClick={() => openEdit(c)}>✏️ Editar</button>
                      <button className="btn btn-danger" style={{ padding:"4px 10px", fontSize:11 }} onClick={() => setConfirmDel(c.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {cows.length === 0 && (
          <div style={{ padding:40, textAlign:"center", color:"var(--text-muted)" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🐄</div>
            <div style={{ fontSize:13 }}>Nenhuma vaca cadastrada ainda.</div>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDel && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <div className="card" style={{ width:360, padding:24 }}>
            <div style={{ fontWeight:600, fontSize:15, marginBottom:8 }}>Confirmar exclusão</div>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:20 }}>
              Tem certeza que quer excluir <b>{cows.find(c=>c.id===confirmDel)?.name}</b>? Esta ação não pode ser desfeita.
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => deleteCow(confirmDel)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ────────────────────────────────────────────
  // FORM VIEW (new / edit)
  // ────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button className="btn btn-ghost" style={{ padding:"6px 12px" }} onClick={cancel}>← Voltar</button>
        <div>
          <div style={{ fontWeight:600, fontSize:15 }}>{mode==="new" ? "Nova vaca" : `Editando: ${form.name}`}</div>
          <div style={{ fontSize:11, color:"var(--text-muted)" }}>Preencha os dados para gerar os cálculos automaticamente</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button className="btn btn-ghost" onClick={cancel}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>💾 Salvar animal</button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems:"start" }}>
        {/* LEFT: Identificação + Saúde */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          {/* Identificação */}
          <div className="card">
            <div className="card-header">🐄 Identificação</div>
            <div className="card-body" style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize:11, fontWeight:500, color:"var(--text-muted)", display:"block", marginBottom:4 }}>Nome da vaca *</label>
                  <input className="field" placeholder="Ex: Mimosa" value={form.name??""} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, color:"var(--text-muted)", display:"block", marginBottom:4 }}>Fase de produção *</label>
                  <select className="field" value={form.phase??""} onChange={e => setForm(f=>({...f,phase:e.target.value}))}>
                    {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {form.phase && (
                <div style={{ padding:"8px 12px", background:pc.bg, borderRadius:8, fontSize:11, color:pc.text, fontWeight:500 }}>
                  📌 Fase selecionada: <b>{form.phase}</b> — os limites nutricionais serão aplicados automaticamente nos cálculos.
                </div>
              )}

              <div className="grid-3">
                <div>
                  <label style={{ fontSize:11, fontWeight:500, color:"var(--text-muted)", display:"block", marginBottom:4 }}>Peso vivo (kg)</label>
                  <input className="field" type="number" min={100} max={900} value={form.peso??""} onChange={e => setForm(f=>({...f,peso:Number(e.target.value)}))} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, color:"var(--text-muted)", display:"block", marginBottom:4 }}>GMD (kg/dia)</label>
                  <input className="field" placeholder="+0.5" value={form.gmd??""} onChange={e => setForm(f=>({...f,gmd:e.target.value}))} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:500, color:"var(--text-muted)", display:"block", marginBottom:4 }}>Condição corporal (1–5)</label>
                  <input className="field" type="number" min={1} max={5} step={0.5} value={form.score??""} onChange={e => setForm(f=>({...f,score:Number(e.target.value)}))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize:11, fontWeight:500, color:"var(--text-muted)", display:"block", marginBottom:4 }}>Observações</label>
                <textarea className="field" rows={2} placeholder="Notas sobre o animal..." value={form.notes??""} onChange={e => setForm(f=>({...f,notes:e.target.value}))} style={{ resize:"vertical" }} />
              </div>
            </div>
          </div>

          {/* Produção */}
          <div className="card">
            <div className="card-header">💧 Produção de leite — últimos 7 dias (litros)</div>
            <div className="card-body">
              <div style={{ display:"flex", gap:8 }}>
                {(form.production ?? defaultProduction()).map((p, i) => (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:10, color:"var(--text-muted)", fontWeight:500 }}>{p.day}</span>
                    <input
                      type="number" min={0} max={80} step={1}
                      value={p.liters}
                      onChange={e => updateProd(i, Number(e.target.value))}
                      className="field"
                      style={{ padding:"6px 4px", textAlign:"center", fontSize:13, fontWeight:600 }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, fontSize:11, color:"var(--text-muted)" }}>
                💡 Coloque 0 para vacas secas ou em pré-parto. A média e projeção mensal são calculadas automaticamente.
              </div>
            </div>
          </div>

          {/* Saúde */}
          <div className="card">
            <div className="card-header" style={{ justifyContent:"space-between" }}>
              <span>❤️ Indicadores de saúde</span>
              <button className="btn btn-ghost" style={{ padding:"3px 10px", fontSize:11 }} onClick={addHealthRow}>+ Adicionar</button>
            </div>
            <div className="card-body" style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {(form.health ?? []).map((h, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto auto", gap:8, alignItems:"center" }}>
                  <input className="field" style={{ fontSize:12 }} value={h.label} placeholder="Item (ex: Mastite)" onChange={e => updateHealth(i,"label",e.target.value)} />
                  <input className="field" style={{ fontSize:12 }} value={h.status} placeholder="Status (ex: Negativo)" onChange={e => updateHealth(i,"status",e.target.value)} />
                  <select className="field" style={{ fontSize:11, width:110 }} value={h.level} onChange={e => updateHealth(i,"level",e.target.value as HealthRecord["level"])}>
                    {levelOpts.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                  </select>
                  <button className="btn btn-danger" style={{ padding:"6px 8px", fontSize:12 }} onClick={() => removeHealthRow(i)}>✕</button>
                </div>
              ))}
              {(form.health??[]).length === 0 && (
                <div style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", padding:"8px 0" }}>Nenhum indicador. Clique em "+ Adicionar".</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Dieta */}
        <div className="card" style={{ position:"sticky", top:72 }}>
          <div className="card-header">🌿 Dieta do animal</div>
          <div className="card-body" style={{ padding:0 }}>
            <div style={{ padding:"10px 12px", background:"#FFFBEB", borderBottom:"0.5px solid var(--border)", fontSize:11, color:"#854F0B" }}>
              💡 Adicione os ingredientes com as quantidades em <b>kg de matéria natural</b> por dia. O sistema calcula MS, NDT, PB e todos os outros nutrientes automaticamente.
            </div>

            {/* Table */}
            {(form.diet??[]).length > 0 && (
              <table className="data-table">
                <thead><tr><th>Ingrediente</th><th>kg MN/dia</th><th>Custo R$/dia</th><th></th></tr></thead>
                <tbody>
                  {(form.diet??[]).map(line => {
                    const ing = ingredients.find(i=>i.name===line.ingredientName);
                    const cost = ing ? (line.qtyMN * ing.costPerKg).toFixed(2) : "—";
                    return (
                      <tr key={line.ingredientName}>
                        <td style={{ fontWeight:500, fontSize:12 }}>{line.ingredientName}</td>
                        <td>
                          <input type="number" min={0} step={0.5} value={line.qtyMN}
                            onChange={e => updateDietQty(line.ingredientName, Number(e.target.value))}
                            className="field" style={{ width:80, padding:"3px 8px" }} />
                        </td>
                        <td style={{ fontSize:12, color:"#1D9E75", fontWeight:500 }}>R$ {cost}</td>
                        <td><button className="btn btn-danger" style={{ padding:"3px 8px", fontSize:10 }} onClick={() => removeDietLine(line.ingredientName)}>✕</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Add line */}
            <div style={{ padding:"10px 12px", borderTop:(form.diet??[]).length>0?"0.5px dashed var(--border)":"none", display:"flex", flexDirection:"column", gap:8 }}>
              <label style={{ fontSize:11, fontWeight:500, color:"var(--text-muted)" }}>Adicionar ingrediente à dieta:</label>
              <select className="field" value={addIngName} onChange={e => setAddIngName(e.target.value)}>
                <option value="">— Selecionar ingrediente —</option>
                {["Silagem","Pastagem","Feno","Concentrado","Mineral","Outros"].map(cat => (
                  <optgroup key={cat} label={`── ${cat} ──`}>
                    {ingredients.filter(i=>i.category===cat).map(i => (
                      <option key={i.name} value={i.name}>{i.name} (R$ {i.costPerKg}/kg)</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div style={{ display:"flex", gap:8 }}>
                <input type="number" min={0} step={1} placeholder="Quantidade (kg MN/dia)"
                  className="field" value={addIngQty} onChange={e => setAddIngQty(e.target.value)} />
                <button className="btn btn-primary" style={{ whiteSpace:"nowrap" }} onClick={addDietLine}>+ Adicionar</button>
              </div>
            </div>

            {/* Summary */}
            {(form.diet??[]).length > 0 && (() => {
              const totalCost = (form.diet??[]).reduce((s,d) => {
                const ing = ingredients.find(i=>i.name===d.ingredientName);
                return s + (ing ? d.qtyMN * ing.costPerKg : 0);
              }, 0);
              const totalMS = (form.diet??[]).reduce((s,d) => {
                const ing = ingredients.find(i=>i.name===d.ingredientName);
                return s + (ing ? d.qtyMN * ing.ms / 100 : 0);
              }, 0);
              return (
                <div style={{ padding:"10px 12px", borderTop:"0.5px solid var(--border)", background:"var(--surface)", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, fontSize:12 }}>
                  <div><div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:500 }}>MS TOTAL</div><div style={{ fontWeight:600 }}>{totalMS.toFixed(1)} kg</div></div>
                  <div><div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:500 }}>CUSTO/DIA</div><div style={{ fontWeight:600, color:"#E24B4A" }}>R$ {totalCost.toFixed(2)}</div></div>
                  <div><div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:500 }}>ITENS</div><div style={{ fontWeight:600 }}>{(form.diet??[]).length}</div></div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Save footer */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:4 }}>
        <button className="btn btn-ghost" onClick={cancel}>Cancelar</button>
        <button className="btn btn-primary" style={{ padding:"10px 24px" }} onClick={save}>💾 Salvar animal</button>
      </div>
    </div>
  );
}
