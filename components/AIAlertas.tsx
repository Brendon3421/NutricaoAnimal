"use client";
import { useState } from "react";
import { useCows } from "@/app/page";
import { calcNutrition } from "./NutrStatus";

export default function AIAlertas() {
  const { cows } = useCows();
  const [result, setResult]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  async function analyze() {
    setLoading(true); setResult(""); setDone(false);

    const summary = cows.map(c => {
      const n = calcNutrition(c.diet);
      const avg = +(c.production.reduce((s,p)=>s+p.liters,0)/c.production.length).toFixed(1);
      const alerts = c.health.filter(h=>h.level!=="g").map(h=>`${h.label}: ${h.status} (${h.level==="a"?"atenção":"crítico"})`).join(", ") || "nenhum";
      return `${c.name} | ${c.phase} | Prod: ${avg}L | CC: ${c.score}/5 | NDT: ${n.ndt.toFixed(1)}% | PB: ${n.pb.toFixed(1)}% | FDN: ${n.fdn.toFixed(1)}% | Custo: R$${n.costTotal.toFixed(2)} | Alertas: ${alerts}`;
    }).join("\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:"Você é especialista em nutrição de bovinos leiteiros. Responda em português brasileiro com análise técnica e ações práticas. Use formatação clara com emojis.",
          messages:[{ role:"user", content:
            `Analise este rebanho leiteiro completo e gere um diagnóstico prioritizado:\n\n${summary}\n\n1. Identifique as 3 situações mais urgentes que precisam de ação imediata\n2. Liste melhorias de médio prazo (próximos 30 dias)\n3. Calcule o potencial de aumento de receita se os problemas forem resolvidos (preço leite R$ 1,50/L)\n4. Dê uma nota geral para o rebanho (0-10) justificando`
          }],
        })
      });
      const data = await res.json();
      setResult(data.content?.[0]?.text ?? "Erro.");
      setDone(true);
    } catch { setResult("❌ Erro de conexão."); setDone(true); }
    finally { setLoading(false); }
  }

  function renderText(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**"))
        return <div key={i} style={{ fontWeight:700, fontSize:13, marginTop:10, marginBottom:4, color:"#0F6E56" }}>{line.slice(2,-2)}</div>;
      if (/^\d+\./.test(line))
        return <div key={i} style={{ paddingLeft:12, marginBottom:4, fontSize:12, lineHeight:1.65 }}>{line}</div>;
      if (line.startsWith("- ") || line.startsWith("• "))
        return <div key={i} style={{ paddingLeft:16, marginBottom:3, fontSize:12, lineHeight:1.65, display:"flex", gap:6 }}><span style={{ color:"#1D9E75", flexShrink:0 }}>•</span><span>{line.slice(2)}</span></div>;
      if (line.trim() === "") return <div key={i} style={{ height:6 }} />;
      return <div key={i} style={{ fontSize:12, lineHeight:1.7 }}>{line}</div>;
    });
  }

  return (
    <div className="card">
      <div className="card-header" style={{ justifyContent:"space-between" }}>
        <span>🤖 Diagnóstico IA do rebanho</span>
        {done && (
          <button className="btn btn-ghost" style={{ padding:"3px 10px", fontSize:11 }} onClick={() => { setResult(""); setDone(false); }}>
            Refazer
          </button>
        )}
      </div>
      <div className="card-body">
        {!done && !loading && (
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>Análise inteligente do rebanho completo</div>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>
                A IA analisa todos os {cows.length} animais, cruza dados de nutrição, saúde e produção e gera um diagnóstico priorizado com ações concretas.
              </div>
            </div>
            <button className="btn btn-primary" onClick={analyze} style={{ whiteSpace:"nowrap", gap:6 }}>
              🤖 Analisar rebanho
            </button>
          </div>
        )}
        {loading && (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:13, color:"#0F6E56", fontWeight:500 }}>Analisando {cows.length} vacas...</div>
            <div style={{ marginTop:10, display:"flex", justifyContent:"center", gap:6 }}>
              {[0,1,2].map(i => <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:"#1D9E75",animation:`pulse 1.2s ease ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        {result && <div style={{ maxHeight:320, overflowY:"auto" }}>{renderText(result)}</div>}
      </div>
    </div>
  );
}
