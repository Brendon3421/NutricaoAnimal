"use client";
import { useState } from "react";
import { useCows } from "@/app/page";
import { useIngredients } from "@/app/ingredientStore";
import { calcDietLine, calcDietTotals } from "@/app/dietCalculations";
import ProjecaoLeitePanel from "./ProjecaoLeitePanel";

/**
 * Tela standalone de Projeção de Produção de Leite (com seletor de animal
 * próprio). A tela principal do sistema é a aba "Projeção de leite" dentro
 * de Rebanho (RebanhoTab.tsx), que usa a vaca já selecionada ali — este
 * componente não é mais importado por nenhuma tela, mas é mantido
 * funcional (e sem duplicar lógica: todo o cálculo/exibição vem de
 * ProjecaoLeitePanel, o mesmo componente usado em Rebanho).
 */
export default function ProjecaoProducaoTab() {
  const { cows } = useCows();
  const { ingredients } = useIngredients();
  const [selId, setSelId] = useState(cows[0]?.id);
  const sel = cows.find(c => c.id === selId) ?? cows[0];

  if (!sel) {
    return <div className="card"><div className="card-body">Nenhum animal cadastrado ainda.</div></div>;
  }

  const lines = sel.diet
    .filter(d => d.qtyMN > 0)
    .map(d => {
      const ing = ingredients.find(i => i.name === d.ingredientName);
      return ing ? calcDietLine(ing, d.qtyMN) : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);
  const totals = calcDietTotals(lines);

  const prodAvg = sel.production.length
    ? sel.production.reduce((s, p) => s + p.liters, 0) / sel.production.length
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card">
        <div className="card-header" style={{ justifyContent: "space-between" }}>
          <span>📈 Projeção de Produção de Leite</span>
          <select className="field" style={{ width: 200, fontSize: 12 }} value={sel.id} onChange={e => setSelId(e.target.value)}>
            {cows.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <ProjecaoLeitePanel totals={totals} phase={sel.phase} peso={sel.peso} productionAvg={prodAvg} cowName={sel.name} />
    </div>
  );
}
