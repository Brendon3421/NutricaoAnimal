"use client";
import { useState } from "react";
import type { Cow, DietLine } from "@/app/data";
import { ingredients, phaseTargets } from "@/app/data";
import { calcNutrition } from "./NutrStatus";

interface Props {
  cow: Cow;
  onClose: () => void;
  onApplyDiet: (diet: DietLine[]) => void;
}

type Step = "idle" | "loading" | "result" | "applied";

interface SuggestedLine { ingredientName: string; qtyMN: number; reason: string; }
interface AIResult {
  diagnosis: string;
  suggestedDiet: SuggestedLine[];
  reasoning: string;
  expectedGains: string;
  warnings: string[];
}

/* ─── Build system prompt ─── */
function buildPrompt(cow: Cow): string {
  const n = calcNutrition(cow.diet);
  const t = phaseTargets[cow.phase] ?? {};
  const avg = +(cow.production.reduce((s,p) => s+p.liters, 0) / cow.production.length).toFixed(1);
  const ingList = ingredients.map(i =>
    `${i.name} | MS:${i.ms}% | NDT:${i.ndt}% | PB:${i.pb}% | FDN:${i.fdn}% | FDA:${i.fda}% | EE:${i.ee}% | Ca:${i.ca}% | P:${i.p}% | R$${i.costPerKg}/kg | cat:${i.category}`
  ).join("\n");

  return `Você é um zootecnista especialista em nutrição de bovinos leiteiros. Analise esta vaca e formule a dieta ideal.

## DADOS DA VACA
- Nome: ${cow.name}
- Fase: ${cow.phase}
- Peso vivo: ${cow.peso} kg
- Condição corporal: ${cow.score}/5
- GMD atual: ${cow.gmd} kg/dia
- Produção média: ${avg} L/dia
- Problemas de saúde: ${cow.health.filter(h=>h.level!=="g").map(h=>`${h.label}: ${h.status}`).join(", ") || "nenhum"}

## DIETA ATUAL
${cow.diet.map(d => `- ${d.ingredientName}: ${d.qtyMN} kg MN/dia`).join("\n")}
Resultados: NDT ${n.ndt.toFixed(1)}% | PB ${n.pb.toFixed(1)}% | FDN ${n.fdn.toFixed(1)}% | FDA ${n.fda.toFixed(1)}% | EE ${n.ee.toFixed(1)}% | Ca ${n.ca.toFixed(2)}% | P ${n.p.toFixed(2)}% | MS ${n.ms.toFixed(1)}kg | Custo R$${n.costTotal.toFixed(2)}/dia

## METAS NUTRICIONAIS PARA A FASE ${cow.phase}
- NDT: ${t.ndt?.[0]}–${t.ndt?.[1]}% | PB: ${t.pb?.[0]}–${t.pb?.[1]}% | FDN: ${t.fdn?.[0]}–${t.fdn?.[1]}%
- FDA: ${t.fda?.[0]}–${t.fda?.[1]}% | EE: ${t.ee?.[0]}–${t.ee?.[1]}% | Ca: ${t.ca?.[0]}–${t.ca?.[1]}% | P: ${t.p?.[0]}–${t.p?.[1]}%

## INGREDIENTES DISPONÍVEIS
${ingList}

## INSTRUÇÕES
1. Formule uma dieta OTIMIZADA usando apenas ingredientes da lista acima
2. Priorize custo-benefício mantendo os nutrientes dentro das metas
3. Use no máximo 5-6 ingredientes
4. Considere a praticidade do produtor rural

Responda APENAS com JSON válido neste formato exato (sem markdown, sem texto fora do JSON):
{
  "diagnosis": "diagnóstico em 2-3 frases do estado nutricional atual",
  "suggestedDiet": [
    { "ingredientName": "nome exato do ingrediente", "qtyMN": 0.0, "reason": "motivo em 1 frase" }
  ],
  "reasoning": "raciocínio técnico da formulação em 3-4 frases",
  "expectedGains": "ganhos esperados em produção e saúde em 2-3 frases",
  "warnings": ["aviso 1 se houver", "aviso 2 se houver"]
}`;
}

/* ─── Nutrient comparison row ─── */
function NutrRow({ label, before, after, min, max }: {
  label: string; before: number; after: number; min?: number; max?: number;
}) {
  const inRange = (v: number) => (min == null || v >= min) && (max == null || v <= max);
  const color = (v: number) => inRange(v) ? "#1D9E75" : "#E24B4A";
  const improved = inRange(after) && !inRange(before);
  const fmt = (v: number) => v.toFixed(1) + "%";

  return (
    <div style={{ display:"grid", gridTemplateColumns:"52px 1fr 28px 28px auto", gap:8, alignItems:"center", padding:"5px 0", borderBottom:"0.5px solid rgba(0,0,0,0.06)" }}>
      <span style={{ fontSize:11, color:"#6B7280", fontWeight:500 }}>{label}</span>
      <div style={{ position:"relative", height:6, background:"#F3F4F6", borderRadius:3, overflow:"visible" }}>
        {/* range band */}
        {min != null && max != null && (
          <div style={{ position:"absolute", left:`${Math.min(min,100)}%`, width:`${Math.min(max,100)-Math.min(min,100)}%`, top:0, height:"100%", background:"rgba(29,158,117,0.15)", borderRadius:3 }} />
        )}
        {/* before bar */}
        <div style={{ position:"absolute", left:0, top:0, width:`${Math.min(before,100)}%`, height:"100%", background:"rgba(156,163,175,0.6)", borderRadius:3, transition:"width 0.4s" }} />
        {/* after bar */}
        <div style={{ position:"absolute", left:0, top:0, width:`${Math.min(after,100)}%`, height:"100%", background:color(after), borderRadius:3, opacity:0.85, transition:"width 0.4s" }} />
      </div>
      <span style={{ fontSize:10, color:"#9CA3AF", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{fmt(before)}</span>
      <span style={{ fontSize:10, color:color(after), fontWeight:600, textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{fmt(after)}</span>
      {improved
        ? <span style={{ fontSize:9, background:"#E1F5EE", color:"#0F6E56", padding:"1px 5px", borderRadius:99, fontWeight:600, whiteSpace:"nowrap" }}>↑ Fix</span>
        : inRange(after)
        ? <span style={{ fontSize:9, background:"#E1F5EE", color:"#0F6E56", padding:"1px 5px", borderRadius:99, fontWeight:600 }}>OK</span>
        : <span style={{ fontSize:9, background:"#FCEBEB", color:"#A32D2D", padding:"1px 5px", borderRadius:99, fontWeight:600 }}>Fora</span>
      }
    </div>
  );
}

/* ─── Main component ─── */
export default function AIAnalysis({ cow, onClose, onApplyDiet }: Props) {
  const [step, setStep]       = useState<Step>("idle");
  const [result, setResult]   = useState<AIResult | null>(null);
  const [error, setError]     = useState("");

  const beforeNutr = calcNutrition(cow.diet);
  const afterNutr  = result ? calcNutrition(result.suggestedDiet.map(d => ({ ingredientName: d.ingredientName, qtyMN: d.qtyMN }))) : null;
  const t = phaseTargets[cow.phase] ?? {};

  async function generate() {
    setStep("loading"); setError(""); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: buildPrompt(cow) }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text ?? "";
      // strip any accidental markdown fences
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed: AIResult = JSON.parse(clean);
      // validate ingredientNames exist
      parsed.suggestedDiet = parsed.suggestedDiet.filter(d =>
        ingredients.some(i => i.name === d.ingredientName)
      );
      setResult(parsed);
      setStep("result");
    } catch (e) {
      setError("Erro ao processar resposta da IA. Tente novamente.");
      setStep("idle");
    }
  }

  function applyDiet() {
    if (!result) return;
    const lines: DietLine[] = result.suggestedDiet.map(d => ({
      ingredientName: d.ingredientName,
      qtyMN: d.qtyMN,
    }));
    onApplyDiet(lines);
    setStep("applied");
  }

  const costBefore = beforeNutr.costTotal;
  const costAfter  = afterNutr?.costTotal ?? 0;
  const costDiff   = costAfter - costBefore;
  const avg = +(cow.production.reduce((s,p)=>s+p.liters,0)/cow.production.length).toFixed(1);

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background:"#fff", borderRadius:18, width:"100%", maxWidth:680,
        maxHeight:"92vh", display:"flex", flexDirection:"column",
        boxShadow:"0 24px 64px rgba(0,0,0,0.18)", overflow:"hidden",
      }}>

        {/* ── Header ── */}
        <div style={{ background:"linear-gradient(135deg,#1D9E75 0%,#0a5c3f 100%)", padding:"16px 20px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🤖</div>
            <div style={{ flex:1 }}>
              <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>NutriIA — Formulação de dieta</div>
              <div style={{ color:"rgba(255,255,255,0.72)", fontSize:11, marginTop:1 }}>
                {cow.name} · {cow.phase} · {cow.peso} kg · Prod. média {avg} L/dia
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:8, width:30, height:30, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {/* Progress steps */}
          <div style={{ display:"flex", alignItems:"center", gap:0, marginTop:14 }}>
            {[
              { id:"idle",    label:"1. Analisar",  icon:"🔍" },
              { id:"loading", label:"2. Formulando", icon:"⚙️" },
              { id:"result",  label:"3. Comparar",  icon:"📊" },
              { id:"applied", label:"4. Aplicado",  icon:"✅" },
            ].map((s, i, arr) => {
              const steps = ["idle","loading","result","applied"];
              const active = steps.indexOf(step) >= steps.indexOf(s.id);
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", flex: i < arr.length-1 ? 1 : undefined }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background: active ? "rgba(255,255,255,0.9)":"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>
                      {active ? s.icon : <span style={{ color:"rgba(255,255,255,0.6)", fontSize:10 }}>{i+1}</span>}
                    </div>
                    <span style={{ fontSize:10, color: active ? "#fff":"rgba(255,255,255,0.5)", fontWeight: active ? 600:400 }}>{s.label}</span>
                  </div>
                  {i < arr.length-1 && (
                    <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.25)", margin:"0 8px" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* IDLE */}
          {step === "idle" && (
            <div>
              <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
                <div style={{ fontWeight:600, fontSize:13, color:"#14532D", marginBottom:6 }}>O que a IA vai fazer:</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[
                    "Analisar os desvios nutricionais atuais vs. metas da fase",
                    `Formular nova dieta com os ${ingredients.length} ingredientes disponíveis`,
                    "Calcular custo x benefício e projetar ganho de produção",
                    "Gerar comparativo visual antes x depois — você decide se aplica",
                  ].map((t, i) => (
                    <div key={i} style={{ display:"flex", gap:8, fontSize:12, color:"#166534" }}>
                      <span style={{ color:"#1D9E75", fontWeight:700, flexShrink:0 }}>{i+1}.</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current diet preview */}
              <div style={{ fontWeight:600, fontSize:12, marginBottom:8, color:"#374151" }}>Dieta atual que será analisada:</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:12 }}>
                {cow.diet.map(d => {
                  const ing = ingredients.find(i => i.name === d.ingredientName);
                  return (
                    <div key={d.ingredientName} style={{ display:"flex", justifyContent:"space-between", background:"#F9FAFB", borderRadius:7, padding:"7px 12px", fontSize:12 }}>
                      <span style={{ fontWeight:500 }}>{d.ingredientName}</span>
                      <span style={{ color:"#6B7280" }}>{d.qtyMN} kg MN · R$ {ing ? (d.qtyMN * ing.costPerKg).toFixed(2) : "—"}</span>
                    </div>
                  );
                })}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 12px", fontSize:11, color:"#6B7280" }}>
                  <span>Custo total atual</span>
                  <span style={{ fontWeight:600, color:"#E24B4A" }}>R$ {costBefore.toFixed(2)}/dia</span>
                </div>
              </div>
              {error && <div style={{ padding:"10px 12px", background:"#FEF2F2", borderRadius:8, fontSize:12, color:"#991B1B" }}>{error}</div>}
            </div>
          )}

          {/* LOADING */}
          {step === "loading" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:260, gap:16 }}>
              <div style={{ position:"relative", width:64, height:64 }}>
                <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid #E1F5EE", borderTopColor:"#1D9E75", animation:"spin 0.9s linear infinite" }} />
                <div style={{ position:"absolute", inset:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🤖</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontWeight:600, fontSize:14, color:"#0F6E56" }}>Formulando dieta ideal para {cow.name}...</div>
                <div style={{ fontSize:12, color:"#6B7280", marginTop:4 }}>Analisando {ingredients.length} ingredientes disponíveis</div>
              </div>
              <div style={{ display:"flex", gap:8, fontSize:11, color:"#9CA3AF" }}>
                {["Calculando NDT e PB...","Otimizando custo...","Verificando limites..."].map((t,i) => (
                  <span key={i} style={{ background:"#F9FAFB", padding:"4px 10px", borderRadius:99, border:"0.5px solid #E5E7EB" }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* RESULT */}
          {(step === "result" || step === "applied") && result && afterNutr && (
            <>
              {/* Diagnosis banner */}
              <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#166534", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>Diagnóstico</div>
                <div style={{ fontSize:12, color:"#14532D", lineHeight:1.65 }}>{result.diagnosis}</div>
              </div>

              {/* Nutrient comparison */}
              <div>
                <div style={{ fontWeight:600, fontSize:12, marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span>Comparativo nutricional</span>
                  <div style={{ display:"flex", gap:12, fontSize:10, color:"#6B7280" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:16, height:4, background:"rgba(156,163,175,0.6)", display:"inline-block", borderRadius:2 }} /> Antes</span>
                    <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:16, height:4, background:"#1D9E75", display:"inline-block", borderRadius:2 }} /> Depois</span>
                    <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:16, height:4, background:"rgba(29,158,117,0.15)", display:"inline-block", borderRadius:2 }} /> Meta</span>
                  </div>
                </div>
                <NutrRow label="NDT"  before={beforeNutr.ndt}  after={afterNutr.ndt}  min={t.ndt?.[0]}  max={t.ndt?.[1]}  />
                <NutrRow label="PB"   before={beforeNutr.pb}   after={afterNutr.pb}   min={t.pb?.[0]}   max={t.pb?.[1]}   />
                <NutrRow label="FDN"  before={beforeNutr.fdn}  after={afterNutr.fdn}  min={t.fdn?.[0]}  max={t.fdn?.[1]}  />
                <NutrRow label="FDA"  before={beforeNutr.fda}  after={afterNutr.fda}  min={t.fda?.[0]}  max={t.fda?.[1]}  />
                <NutrRow label="EE"   before={beforeNutr.ee}   after={afterNutr.ee}   min={t.ee?.[0]}   max={t.ee?.[1]}   />
                <NutrRow label="Ca"   before={beforeNutr.ca}   after={afterNutr.ca}   min={t.ca?.[0]}   max={t.ca?.[1]}   />
                <NutrRow label="P"    before={beforeNutr.p}    after={afterNutr.p}    min={t.p?.[0]}    max={t.p?.[1]}    />
              </div>

              {/* Cost comparison */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[
                  { label:"Custo atual",    val:`R$ ${costBefore.toFixed(2)}/dia`, color:"#E24B4A" },
                  { label:"Custo proposto", val:`R$ ${costAfter.toFixed(2)}/dia`,  color:"#1D9E75" },
                  { label:"Diferença",      val:`${costDiff > 0 ? "+" : ""}R$ ${costDiff.toFixed(2)}/dia`, color: costDiff <= 0 ? "#1D9E75":"#BA7517" },
                ].map(m => (
                  <div key={m.label} style={{ background:"#F9FAFB", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:"#6B7280", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.04em" }}>{m.label}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:m.color, marginTop:3 }}>{m.val}</div>
                  </div>
                ))}
              </div>

              {/* Suggested diet detail */}
              <div>
                <div style={{ fontWeight:600, fontSize:12, marginBottom:8 }}>Dieta proposta pela IA</div>
                {result.suggestedDiet.map(d => {
                  const ing = ingredients.find(i => i.name === d.ingredientName);
                  return (
                    <div key={d.ingredientName} style={{ borderBottom:"0.5px solid rgba(0,0,0,0.06)", padding:"8px 0" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:"#1D9E75", flexShrink:0 }} />
                          <span style={{ fontSize:12, fontWeight:500 }}>{d.ingredientName}</span>
                          <span className="badge badge-cyan" style={{ fontSize:9 }}>{ing?.category}</span>
                        </div>
                        <div style={{ fontSize:12, textAlign:"right" }}>
                          <span style={{ fontWeight:600 }}>{d.qtyMN} kg MN/dia</span>
                          <span style={{ color:"#6B7280", marginLeft:8 }}>R$ {ing ? (d.qtyMN * ing.costPerKg).toFixed(2) : "—"}</span>
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:"#6B7280", marginTop:3, marginLeft:14 }}>💡 {d.reason}</div>
                    </div>
                  );
                })}
                <div style={{ display:"flex", justifyContent:"flex-end", padding:"8px 0", fontSize:12 }}>
                  <span style={{ color:"#6B7280" }}>MS total: <b>{afterNutr.ms.toFixed(1)} kg</b></span>
                  <span style={{ color:"#6B7280", marginLeft:16 }}>Custo: <b style={{ color:"#1D9E75" }}>R$ {costAfter.toFixed(2)}/dia</b></span>
                </div>
              </div>

              {/* Reasoning + Gains */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ background:"#F9FAFB", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#374151", marginBottom:6 }}>🔬 Raciocínio técnico</div>
                  <div style={{ fontSize:11, color:"#4B5563", lineHeight:1.65 }}>{result.reasoning}</div>
                </div>
                <div style={{ background:"#F0FDF4", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#166534", marginBottom:6 }}>📈 Ganhos esperados</div>
                  <div style={{ fontSize:11, color:"#14532D", lineHeight:1.65 }}>{result.expectedGains}</div>
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:"10px 14px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#92400E", marginBottom:5 }}>⚠️ Atenções importantes</div>
                  {result.warnings.map((w,i) => (
                    <div key={i} style={{ fontSize:11, color:"#78350F", lineHeight:1.6 }}>• {w}</div>
                  ))}
                </div>
              )}

              {/* Applied success */}
              {step === "applied" && (
                <div style={{ background:"#F0FDF4", border:"2px solid #1D9E75", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>✅</div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#0F6E56" }}>Dieta aplicada com sucesso!</div>
                  <div style={{ fontSize:12, color:"#166534", marginTop:4 }}>A dieta de {cow.name} foi atualizada. Você pode ajustar as quantidades na aba Rebanho.</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding:"12px 20px", borderTop:"0.5px solid rgba(0,0,0,0.08)", display:"flex", gap:8, justifyContent:"flex-end", flexShrink:0, background:"#FAFAFA" }}>
          {step === "idle" && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={generate} style={{ gap:8, paddingLeft:20, paddingRight:20 }}>
                🤖 Gerar dieta com IA
              </button>
            </>
          )}
          {step === "result" && (
            <>
              <button className="btn btn-ghost" onClick={() => { setStep("idle"); setResult(null); }}>← Refazer</button>
              <button className="btn btn-ghost" onClick={onClose}>Fechar sem aplicar</button>
              <button className="btn btn-primary" onClick={applyDiet} style={{ gap:6, paddingLeft:20, paddingRight:20 }}>
                ✅ Aplicar esta dieta
              </button>
            </>
          )}
          {step === "applied" && (
            <button className="btn btn-primary" onClick={onClose}>Fechar</button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
