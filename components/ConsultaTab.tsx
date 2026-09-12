"use client";
import { useState } from "react";
import { femeasHolandes, densidadeNutricional } from "@/app/data";

export default function ConsultaTab() {
  const [sub, setSub] = useState("densidade");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", gap:8, borderBottom:"0.5px solid var(--border)", paddingBottom:14 }}>
        {[{id:"densidade",label:"Densidade Nutricional"},{id:"femeas",label:"Fêmeas Crescimento"}].map(t => (
          <button key={t.id} onClick={() => setSub(t.id)}
            style={{ padding:"7px 16px", borderRadius:8, border:"0.5px solid", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
              borderColor: sub===t.id ? "#1D9E75":"var(--border)",
              background: sub===t.id ? "#E1F5EE":"transparent",
              color: sub===t.id ? "#0F6E56":"var(--text-muted)" }}>
            {t.label}
          </button>
        ))}
      </div>
      {sub === "densidade" && (
        <div className="card">
          <div className="card-header">📋 {densidadeNutricional.title}</div>
          <div style={{ overflowX:"auto" }}>
            <table className="data-table">
              <thead><tr>{densidadeNutricional.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {densidadeNutricional.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j} style={{ fontWeight:j===0?600:400, fontVariantNumeric:"tabular-nums" }}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {sub === "femeas" && (
        <div className="card">
          <div className="card-header">📋 {femeasHolandes.title}</div>
          <div style={{ overflowX:"auto" }}>
            <table className="data-table">
              <thead><tr>{femeasHolandes.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {femeasHolandes.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j} style={{ fontWeight:j===0?600:400, fontVariantNumeric:"tabular-nums" }}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
