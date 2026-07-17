"use client";
import AIAlertas from "./AIAlertas";
import { useCows } from "@/app/page";
import { phaseColors, type Cow } from "@/app/data";
import { calcNutrition } from "./NutrStatus";

interface Alert {
  cowId: string; cowName: string; type: "health"|"nutrition"|"production";
  level: "r"|"a"; title: string; detail: string;
}

function buildAlerts(cows: Cow[]): Alert[] {
  const alerts: Alert[] = [];
  cows.forEach(c => {
    // Health
    c.health.forEach(h => {
      if (h.level !== "g") alerts.push({ cowId:c.id, cowName:c.name, type:"health", level:h.level, title:`${h.label}: ${h.status}`, detail:`Vaca ${c.name} — ${c.phase}` });
    });
    // Produção baixa (< 70% do esperado para fase)
    const expected: Record<string, number> = { "0–21 dias":22,"22–80 dias":28,"81–200 dias":22,"> 200 dias":16,"Pré-parto":0,"Seca":0 };
    const prodAvg = c.production.reduce((s,p)=>s+p.liters,0)/c.production.length;
    const exp = expected[c.phase] ?? 0;
    if (exp > 0 && prodAvg < exp * 0.75)
      alerts.push({ cowId:c.id, cowName:c.name, type:"production", level:"r", title:`Produção abaixo do esperado`, detail:`${c.name}: ${prodAvg.toFixed(1)} L/dia (esperado ≥ ${(exp*0.75).toFixed(0)} L)` });
    else if (exp > 0 && prodAvg < exp * 0.90)
      alerts.push({ cowId:c.id, cowName:c.name, type:"production", level:"a", title:`Produção levemente abaixo`, detail:`${c.name}: ${prodAvg.toFixed(1)} L/dia (meta ${exp} L)` });
    // Nutrição
    const nutr = calcNutrition(c.diet);
    if (nutr.ndt < 60) alerts.push({ cowId:c.id, cowName:c.name, type:"nutrition", level:"r", title:`NDT muito baixo (${nutr.ndt.toFixed(1)}%)`, detail:`${c.name} — ${c.phase}` });
    if (nutr.pb < 10) alerts.push({ cowId:c.id, cowName:c.name, type:"nutrition", level:"r", title:`PB muito baixo (${nutr.pb.toFixed(1)}%)`, detail:`${c.name} — ${c.phase}` });
  });
  return alerts.sort((a,b) => a.level === b.level ? 0 : a.level === "r" ? -1 : 1);
}

const typeIcon: Record<string, string> = { health:"❤️", nutrition:"🔬", production:"💧" };
const typeLabel: Record<string, string> = { health:"Saúde", nutrition:"Nutrição", production:"Produção" };

export default function AlertasTab({ onNavigate }: { onNavigate: (t:string)=>void }) {
  const { cows } = useCows();
  const alerts = buildAlerts(cows);
  const reds = alerts.filter(a => a.level === "r");
  const ambers = alerts.filter(a => a.level === "a");

  if (alerts.length === 0) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:12 }}>
        <div style={{ fontSize:48 }}>✅</div>
        <div style={{ fontSize:16, fontWeight:600 }}>Tudo certo no rebanho!</div>
        <div style={{ fontSize:13, color:"var(--text-muted)" }}>Nenhum alerta ativo no momento.</div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <AIAlertas />
      {/* Summary KPIs */}
      <div className="grid-4">
        {[
          { label:"Total de alertas", val:alerts.length, color:"var(--text)" },
          { label:"Críticos 🔴", val:reds.length, color:"#E24B4A" },
          { label:"Atenção ⚠️", val:ambers.length, color:"#BA7517" },
          { label:"Vacas afetadas", val:new Set(alerts.map(a=>a.cowId)).size, color:"var(--text)" },
        ].map(m => (
          <div key={m.label} className="card">
            <div className="card-body">
              <div className="metric-label">{m.label}</div>
              <div style={{ fontSize:28, fontWeight:600, marginTop:4, color:m.color }}>{m.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems:"start" }}>
        {/* Alert list */}
        <div className="card">
          <div className="card-header">🔔 Alertas ativos</div>
          {alerts.map((al, i) => {
            const pc = phaseColors[cows.find(c=>c.id===al.cowId)?.phase ?? ""] ?? {};
            return (
              <div key={i} className="alert-item" onClick={() => onNavigate("rebanho")}>
                <div className="alert-dot" style={{ background: al.level==="r"?"#E24B4A":"#BA7517", marginTop:5 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{al.title}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:1 }}>{al.detail}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  <span style={{ fontSize:10 }}>{typeIcon[al.type]}</span>
                  <span className={`badge badge-${al.level === "r" ? "red":"amber"}`}>{typeLabel[al.type]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Per-cow summary */}
        <div className="card">
          <div className="card-header">🐄 Situação por vaca</div>
          {cows.map(c => {
            const cowAlerts = alerts.filter(a => a.cowId === c.id);
            const hasRed = cowAlerts.some(a => a.level==="r");
            const hasAmber = cowAlerts.some(a => a.level==="a");
            const pc = phaseColors[c.phase] ?? { bg:"#F1EFE8", text:"#5F5E5A" };
            return (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:"0.5px solid var(--border)", cursor:"pointer" }} onClick={() => onNavigate("rebanho")}>
                <div style={{ width:32, height:32, borderRadius:8, background:pc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🐄</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{c.name}</div>
                  <div style={{ fontSize:10, color:"var(--text-muted)" }}>{c.phase}</div>
                </div>
                <div>
                  {cowAlerts.length === 0
                    ? <span className="badge badge-green">✓ OK</span>
                    : hasRed
                    ? <span className="badge badge-red">🔴 {cowAlerts.length} alerta{cowAlerts.length>1?"s":""}</span>
                    : <span className="badge badge-amber">⚠️ {cowAlerts.length} alerta{cowAlerts.length>1?"s":""}</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
