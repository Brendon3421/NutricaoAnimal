"use client";
import { useCows } from "@/app/page";
import { gestaoData, phaseColors } from "@/app/data";
import { calcNutrition } from "./NutrStatus";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ["#1D9E75","#378ADD","#BA7517","#7F77DD","#E24B4A","#B4B2A9"];

export default function RelatorioTab() {
  const { cows } = useCows();

  const totalProd = cows.reduce((s,c) => s + c.production[c.production.length-1].liters, 0);
  const totalCost = cows.reduce((s,c) => s + calcNutrition(c.diet).costTotal, 0);
  const avgProd = totalProd / cows.length;
  const receita = totalProd * gestaoData.precoLeite;
  const lucro = receita - totalCost;

  // Production chart — last 7 days across herd
  const days = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  const prodChart = days.map((day, i) => ({
    day,
    total: cows.reduce((s,c) => s + (c.production[i]?.liters ?? 0), 0),
  }));

  // Per-cow bar
  const perCowProd = cows.map(c => ({
    name: c.name,
    litros: c.production[c.production.length-1]?.liters ?? 0,
    meta: Number(c.production.reduce((s,p)=>s+p.liters,0)/c.production.length*1.1 | 0),
    phase: c.phase,
  }));

  // Cost breakdown pie
  const costPie = gestaoData.custos.map((c,i) => ({ name:c.categoria, value:c.pct, color:COLORS[i] }));

  // Nutrition compliance
  const nutrCompliance = cows.map(c => {
    const n = calcNutrition(c.diet);
    return { name:c.name, ndt:+n.ndt.toFixed(1), pb:+n.pb.toFixed(1), fdn:+n.fdn.toFixed(1) };
  });

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* KPIs */}
      <div className="grid-4">
        {[
          { label:"Produção total hoje", val:`${totalProd} L`, sub:`${cows.length} vacas`, color:"var(--text)" },
          { label:"Média por vaca", val:`${avgProd.toFixed(1)} L`, sub:"Média do rebanho", color:"#378ADD" },
          { label:"Receita do dia", val:fmt(receita), sub:`@ R$ ${gestaoData.precoLeite}/L`, color:"#1D9E75" },
          { label:"Lucro bruto/dia", val:fmt(lucro), sub:`Custo dieta: ${fmt(totalCost)}`, color: lucro > 0 ? "#1D9E75":"#E24B4A" },
        ].map(m => (
          <div key={m.label} className="card">
            <div className="card-body">
              <div className="metric-label">{m.label}</div>
              <div style={{ fontSize:20, fontWeight:600, marginTop:4, color:m.color, lineHeight:1.1 }}>{m.val}</div>
              <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:4 }}>{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Produção 7 dias */}
        <div className="card">
          <div className="card-header">📈 Produção total do rebanho — 7 dias</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={prodChart} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false} unit=" L" />
                <Tooltip formatter={(v: unknown) => [`${v} L`, "Total"]} contentStyle={{ fontSize:12, borderRadius:8, border:"0.5px solid var(--border)" }} />
                <Bar dataKey="total" fill="#1D9E75" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Produção por vaca */}
        <div className="card">
          <div className="card-header">🐄 Produção por vaca (hoje vs meta)</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={perCowProd} barSize={14} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} unit=" L" />
                <Tooltip formatter={(v: unknown, name: unknown) => [`${v} L`, name === "litros" ? "Hoje":"Meta"]} contentStyle={{ fontSize:12, borderRadius:8, border:"0.5px solid var(--border)" }} />
                <Legend wrapperStyle={{ fontSize:10 }} />
                <Bar dataKey="litros" name="Hoje" fill="#1D9E75" radius={[3,3,0,0]} />
                <Bar dataKey="meta" name="Meta" fill="#9FE1CB" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* NDT/PB por vaca */}
        <div className="card">
          <div className="card-header">🔬 NDT e PB por vaca (%MS)</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={nutrCompliance} barSize={14} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"0.5px solid var(--border)" }} />
                <Legend wrapperStyle={{ fontSize:10 }} />
                <Bar dataKey="ndt" name="NDT%" fill="#378ADD" radius={[3,3,0,0]} />
                <Bar dataKey="pb"  name="PB%"  fill="#1D9E75" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Custos pizza */}
        <div className="card">
          <div className="card-header">💰 Composição dos custos operacionais</div>
          <div className="card-body" style={{ display:"flex", gap:16, alignItems:"center" }}>
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={costPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {costPie.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, ""]} contentStyle={{ fontSize:11, borderRadius:8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
              {costPie.map((e,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:e.color, flexShrink:0 }} />
                  <span style={{ flex:1, color:"var(--text-muted)" }}>{e.name}</span>
                  <span style={{ fontWeight:600 }}>{e.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela resumo por vaca */}
      <div className="card">
        <div className="card-header">📋 Resumo completo por animal</div>
        <div style={{ overflowX:"auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Animal</th><th>Fase</th><th>Peso</th><th>Prod. hoje</th>
                <th>Média 7d</th><th>MS (kg)</th><th>NDT%</th><th>PB%</th>
                <th>Custo/dia</th><th>Renda/dia</th><th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {cows.map(c => {
                const n = calcNutrition(c.diet);
                const prod = c.production[c.production.length-1]?.liters ?? 0;
                const avg = +(c.production.reduce((s,p)=>s+p.liters,0)/c.production.length).toFixed(1);
                const renda = prod > 0 ? +(prod * 1.5 - n.costTotal).toFixed(2) : null;
                const hasAlert = c.health.some(h=>h.level!=="g");
                const pc = phaseColors[c.phase] ?? { bg:"#F1EFE8", text:"#5F5E5A" };
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight:600 }}>🐄 {c.name}</td>
                    <td><span style={{ background:pc.bg, color:pc.text, padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:500 }}>{c.phase}</span></td>
                    <td style={{ fontVariantNumeric:"tabular-nums" }}>{c.peso} kg</td>
                    <td style={{ fontVariantNumeric:"tabular-nums", fontWeight:500 }}>{prod > 0 ? `${prod} L` : "—"}</td>
                    <td style={{ fontVariantNumeric:"tabular-nums" }}>{avg > 0 ? `${avg} L` : "—"}</td>
                    <td style={{ fontVariantNumeric:"tabular-nums" }}>{n.ms.toFixed(1)}</td>
                    <td style={{ fontVariantNumeric:"tabular-nums", color: n.ndt < 60 ? "#E24B4A" : n.ndt > 80 ? "#BA7517" : "#1D9E75" }}>{n.ndt.toFixed(1)}%</td>
                    <td style={{ fontVariantNumeric:"tabular-nums", color: n.pb < 10 ? "#E24B4A" : "#1D9E75" }}>{n.pb.toFixed(1)}%</td>
                    <td style={{ fontVariantNumeric:"tabular-nums", color:"#E24B4A" }}>R$ {n.costTotal.toFixed(2)}</td>
                    <td style={{ fontVariantNumeric:"tabular-nums", fontWeight:600, color: renda === null ? "var(--text-muted)" : renda > 0 ? "#1D9E75":"#E24B4A" }}>
                      {renda !== null ? `R$ ${renda}` : "—"}
                    </td>
                    <td>
                      {hasAlert
                        ? <span className="badge badge-amber">⚠️ Alerta</span>
                        : <span className="badge badge-green">✓ OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
