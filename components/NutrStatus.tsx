"use client";
import type { DietLine } from "@/app/data";
import type { Ingredient } from "@/app/ingredients";
import { calcDietLine, calcDietTotals } from "@/app/dietCalculations";
import { useIngredients } from "@/app/ingredientStore";
import { getNutrStatus, type NutrKey } from "@/app/nutritionInsight";

/** Resumo simplificado (% na MS) usado nas telas de Rebanho/IA — cálculo
 * completo (todos os nutrientes/minerais/vitaminas) fica em app/dietCalculations.ts. */
export function calcNutrition(diet: DietLine[], ingredientsList: Ingredient[]) {
  const lines = diet
    .filter(d => d.qtyMN > 0)
    .map(d => {
      const ing = ingredientsList.find(i => i.name === d.ingredientName);
      return ing ? calcDietLine(ing, d.qtyMN) : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const t = calcDietTotals(lines);
  return {
    ms: t.msKg, costTotal: t.custoTotal,
    ndt: t.ndtPct, pb: t.pbPct, ee: t.eePct,
    fdn: t.fdnPct, fda: t.fdaPct, cnf: t.cnfPct,
    ca: t.caPct, p: t.pPct,
  };
}

// Classificação ok/atenção/fora vem de app/nutritionInsight.ts (mesma lógica
// usada no texto de insight do Status Nutricional) — aqui só decide a cor da barra.
const getStatus = getNutrStatus;

const statusColor = { ok:"#1D9E75", warn:"#BA7517", bad:"#E24B4A" };
const statusLabel = { ok:"OK", warn:"Atenção", bad:"Fora" };
const statusBg    = { ok:"#E1F5EE", warn:"#FAEEDA", bad:"#FCEBEB" };
const statusTxt   = { ok:"#0F6E56", warn:"#854F0B", bad:"#A32D2D" };

const NUTR_ROWS: { key: NutrKey; label: string; max: number }[] = [
  { key:"ndt", label:"NDT",  max:100 },
  { key:"pb",  label:"PB",   max:30  },
  { key:"fdn", label:"FDN",  max:80  },
  { key:"fda", label:"FDA",  max:50  },
  { key:"ee",  label:"EE",   max:12  },
  { key:"ca",  label:"Ca",   max:2   },
  { key:"p",   label:"P",    max:0.7 },

];

export default function NutrStatus({ diet, phase }: { diet: DietLine[]; phase: string }) {
  const { ingredients } = useIngredients();
  const nutr = calcNutrition(diet, ingredients);

  return (
    <div>
      {NUTR_ROWS.map(({ key, label, max }) => {
        const val = nutr[key] as number;
        const st = getStatus(key, val, phase);
        const pct = Math.min(100, (val / max) * 100);
        return (
          <div key={key} className="nutr-row">
            <div className="nutr-label">{label}</div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width:`${pct}%`, background:statusColor[st] }} />
            </div>
            <div style={{ fontVariantNumeric:"tabular-nums", fontSize:11, fontWeight:500, width:40, textAlign:"right" }}>
              {val.toFixed(1)}%
            </div>
            <div style={{ background:statusBg[st], color:statusTxt[st], fontSize:9, padding:"2px 6px", borderRadius:99, fontWeight:600, marginLeft:4, minWidth:32, textAlign:"center" }}>
              {statusLabel[st]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
