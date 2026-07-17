"use client";
import { ingredients, phaseTargets } from "@/app/data";
import type { DietLine } from "@/app/data";

export function calcNutrition(diet: DietLine[]) {
  let msKg = 0, ndtKg = 0, pbKg = 0, eeKg = 0, caKg = 0, pKg = 0, fdnKg = 0, fdaKg = 0, cnfKg = 0;
  let costTotal = 0;
  diet.forEach(line => {
    const ing = ingredients.find(i => i.name === line.ingredientName);
    if (!ing || line.qtyMN <= 0) return;
    const ms = line.qtyMN * ing.ms / 100;
    msKg  += ms;
    ndtKg += ms * ing.ndt / 100;
    pbKg  += ms * ing.pb  / 100;
    eeKg  += ms * ing.ee  / 100;
    caKg  += ms * ing.ca  / 100;
    pKg   += ms * ing.p   / 100;
    fdnKg += ms * ing.fdn / 100;
    fdaKg += ms * ing.fda / 100;
    cnfKg += ms * ing.cnf / 100;
    costTotal += line.qtyMN * ing.costPerKg;
  });
  const pct = (v: number) => msKg > 0 ? (v / msKg) * 100 : 0;
  return {
    ms: msKg, costTotal,
    ndt: pct(ndtKg), pb: pct(pbKg), ee: pct(eeKg),
    fdn: pct(fdnKg), fda: pct(fdaKg), cnf: pct(cnfKg),
    ca: pct(caKg), p: pct(pKg),
  };
}

type NutrKey = "ndt"|"pb"|"fdn"|"fda"|"ee"|"ca"|"p";

function getStatus(key: NutrKey, value: number, phase: string): "ok"|"warn"|"bad" {
  const t = phaseTargets[phase];
  if (!t || !t[key]) return "ok";
  const [mn, mx] = t[key];
  if (value < mn || value > mx) return "bad";
  const margin = (mx - mn) * 0.1;
  if (value < mn + margin || value > mx - margin) return "warn";
  return "ok";
}

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
  const nutr = calcNutrition(diet);

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
