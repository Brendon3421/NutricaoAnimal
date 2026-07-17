"use client";
import { useState, useRef, useEffect } from "react";
import { useCows } from "@/app/page";
import { calcNutrition } from "./NutrStatus";

interface Message { role: "user" | "assistant"; content: string; }

function buildSystemPrompt(cowsSummary: string) {
  return `Você é NutriIA, um especialista em nutrição de bovinos leiteiros com profundo conhecimento em formulação de dietas, metabolismo ruminal e produção de leite.

Você está integrado ao sistema NutriLeite e tem acesso ao seguinte rebanho:
${cowsSummary}

Responda sempre em português brasileiro. Seja direto, prático e use linguagem técnica adequada para um produtor rural. Use emojis com moderação para deixar mais legível. Quando sugerir dietas, mencione quantidades em kg/dia. Quando identificar problemas, sugira ações concretas.`;
}

function buildCowsSummary(cows: ReturnType<typeof useCows>["cows"]) {
  return cows.map(c => {
    const n = calcNutrition(c.diet);
    const avg = +(c.production.reduce((s,p)=>s+p.liters,0)/c.production.length).toFixed(1);
    const alerts = c.health.filter(h=>h.level!=="g").map(h=>`${h.label}: ${h.status}`).join(", ");
    return `- ${c.name} | Fase: ${c.phase} | Peso: ${c.peso}kg | CC: ${c.score}/5 | Prod média: ${avg}L | NDT: ${n.ndt.toFixed(1)}% | PB: ${n.pb.toFixed(1)}% | FDN: ${n.fdn.toFixed(1)}% | Custo dieta: R$${n.costTotal.toFixed(2)}/dia${alerts ? ` | ⚠️ ${alerts}` : ""}`;
  }).join("\n");
}

export default function AIChat() {
  const { cows } = useCows();
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Message[]>([
    { role:"assistant", content:"👋 Olá! Sou a NutriIA. Posso analisar seu rebanho, sugerir dietas, explicar nutrição bovina ou responder qualquer dúvida sobre manejo. Como posso ajudar?" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const newMsgs: Message[] = [...msgs, { role:"user", content }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: buildSystemPrompt(buildCowsSummary(cows)),
          messages: newMsgs.map(m => ({ role:m.role, content:m.content })),
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? "Erro ao obter resposta.";
      setMsgs(m => [...m, { role:"assistant", content:reply }]);
    } catch {
      setMsgs(m => [...m, { role:"assistant", content:"❌ Erro de conexão. Tente novamente." }]);
    } finally { setLoading(false); }
  }

  const quickPrompts = [
    "Analise o rebanho completo",
    "Qual vaca precisa de atenção?",
    "Sugira melhorias nas dietas",
    "Como reduzir custo de alimentação?",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", bottom:24, right:24, zIndex:1000,
          width:52, height:52, borderRadius:"50%",
          background: open ? "#0F6E56" : "#1D9E75",
          color:"#fff", border:"none", cursor:"pointer",
          fontSize:22, display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(29,158,117,0.45)",
          transition:"all 0.2s",
        }}
        title="NutriIA — Assistente de nutrição"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position:"fixed", bottom:88, right:24, zIndex:999,
          width:380, height:540, background:"#fff",
          border:"0.5px solid rgba(0,0,0,0.12)",
          borderRadius:16,
          boxShadow:"0 8px 40px rgba(0,0,0,0.15)",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          animation:"fadeSlide 0.2s ease forwards",
        }}>
          {/* Header */}
          <div style={{
            background:"linear-gradient(135deg,#1D9E75,#0F6E56)",
            padding:"14px 16px", flexShrink:0,
            display:"flex", alignItems:"center", gap:10,
          }}>
            <div style={{ width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🤖</div>
            <div>
              <div style={{ color:"#fff",fontWeight:600,fontSize:13 }}>NutriIA</div>
              <div style={{ color:"rgba(255,255,255,0.7)",fontSize:10 }}>Especialista em nutrição bovina • {cows.length} vacas no rebanho</div>
            </div>
            <div style={{ marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:"#86efac" }} className="pulse" />
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start" }}>
                <div style={{
                  maxWidth:"82%", padding:"9px 12px", borderRadius: m.role==="user" ? "12px 12px 2px 12px":"12px 12px 12px 2px",
                  background: m.role==="user" ? "#1D9E75":"#F3F4F6",
                  color: m.role==="user" ? "#fff":"#1a1a1a",
                  fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", justifyContent:"flex-start" }}>
                <div style={{ background:"#F3F4F6", borderRadius:"12px 12px 12px 2px", padding:"10px 14px", display:"flex", gap:4, alignItems:"center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"#9CA3AF",animation:`pulse 1.2s ease ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {msgs.length <= 1 && (
            <div style={{ padding:"0 12px 8px", display:"flex", flexWrap:"wrap", gap:6 }}>
              {quickPrompts.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  background:"#E1F5EE", color:"#0F6E56", border:"0.5px solid #9FE1CB",
                  borderRadius:99, padding:"4px 10px", fontSize:10, fontWeight:500,
                  cursor:"pointer", fontFamily:"inherit",
                }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:"10px 12px", borderTop:"0.5px solid rgba(0,0,0,0.08)", display:"flex", gap:8, alignItems:"flex-end" }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Pergunte sobre nutrição, dietas, alertas..."
              style={{
                flex:1, resize:"none", background:"#F9FAFB",
                border:"0.5px solid rgba(0,0,0,0.12)", borderRadius:8,
                padding:"8px 10px", fontSize:12, fontFamily:"inherit",
                outline:"none", lineHeight:1.5, maxHeight:80,
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width:34, height:34, borderRadius:8, border:"none",
                background: input.trim() && !loading ? "#1D9E75":"#E5E7EB",
                color: input.trim() && !loading ? "#fff":"#9CA3AF",
                cursor: input.trim() && !loading ? "pointer":"default",
                fontSize:15, display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.15s", flexShrink:0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
