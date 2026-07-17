"use client";
import { useState, createContext, useContext } from "react";
import { initialCows, type Cow } from "./data";
import RebanhoTab  from "@/components/RebanhoTab";
import AlertasTab  from "@/components/AlertasTab";
import RelatorioTab from "@/components/RelatorioTab";
import ConsultaTab from "@/components/ConsultaTab";
import CadastroTab from "@/components/CadastroTab";
import AIChat from "@/components/AIChat";

type CowCtx = { cows: Cow[]; setCows: (c: Cow[]) => void };
export const CowContext = createContext<CowCtx>({ cows: [], setCows: () => {} });
export function useCows() { return useContext(CowContext); }

const TABS = [
  { id:"rebanho",   icon:"🐄", label:"Rebanho"   },
  { id:"cadastro",  icon:"➕", label:"Cadastro"  },
  { id:"alertas",   icon:"🔔", label:"Alertas"   },
  { id:"relatorio", icon:"📊", label:"Relatório" },
  { id:"consulta",  icon:"📋", label:"Consulta"  },
];

export default function Home() {
  const [tab, setTab]   = useState("rebanho");
  const [cows, setCows] = useState<Cow[]>(initialCows);

  const alertCount = cows.reduce((n, c) =>
    n + c.health.filter(h => h.level !== "g").length, 0);

  return (
    <CowContext.Provider value={{ cows, setCows }}>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-logo">🌿</div>
          {TABS.map(t => (
            <button key={t.id} className={`sidebar-btn${tab === t.id ? " active":""}`}
              title={t.label} onClick={() => setTab(t.id)}
              style={{ position:"relative" }}>
              {t.icon}
              {t.id === "alertas" && alertCount > 0 && (
                <span style={{ position:"absolute",top:4,right:4,width:14,height:14,borderRadius:"50%",background:"#E24B4A",color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </aside>

        <div className="main-area" style={{ flexDirection:"column", flex:1 }}>
          <header className="topbar">
            <span style={{ fontWeight:600, fontSize:13 }}>NutriLeite</span>
            <div className="sep" />
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>
              {TABS.find(t => t.id === tab)?.label}
            </span>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
              <span className="badge badge-green">José Rocha</span>
              <span style={{ fontSize:11, color:"var(--text-muted)" }}>{cows.length} vaca{cows.length!==1?"s":""}</span>
            </div>
          </header>

          <main className="content-area animate-in" key={tab}>
            {tab === "rebanho"   && <RebanhoTab />}
            {tab === "cadastro"  && <CadastroTab />}
            {tab === "alertas"   && <AlertasTab onNavigate={setTab} />}
            {tab === "relatorio" && <RelatorioTab />}
            {tab === "consulta"  && <ConsultaTab />}
          </main>
        </div>
      </div>
      <AIChat />
    </CowContext.Provider>
  );
}
