// ============================================================
// TIPOS
// ============================================================
// O cadastro completo de ingredientes (nutricional, minerais, vitaminas,
// custo) mora em app/ingredients.ts + app/ingredientStore.ts — aqui ficam
// só os tipos que dependem dele por referência (nunca duplicando dados).

export interface DietLine { ingredientName: string; qtyMN: number; }

export interface HealthRecord {
  label: string; status: string; level: 'g' | 'a' | 'r';
}

export interface ProductionRecord { day: string; liters: number; }

export interface Cow {
  id: string; name: string; phase: string; peso: number;
  gmd: string; score: number; // condição corporal 1-5
  production: ProductionRecord[];
  diet: DietLine[];
  health: HealthRecord[];
  notes: string;
}

// ============================================================
// REBANHO
// ============================================================
export const initialCows: Cow[] = [
  {
    id: "1", name: "Mimosa", phase: "22–80 dias", peso: 545, gmd: "+0.8", score: 3.5,
    production: [{ day: "Seg", liters: 28 }, { day: "Ter", liters: 30 }, { day: "Qua", liters: 31 }, { day: "Qui", liters: 30 }, { day: "Sex", liters: 32 }, { day: "Sáb", liters: 29 }, { day: "Dom", liters: 31 }],
    diet: [{ ingredientName: "Silagem de milho 2", qtyMN: 34 }, { ingredientName: "Tifton, verde 1", qtyMN: 4 }, { ingredientName: "Milho, grão moído", qtyMN: 5 }, { ingredientName: "Palha de aveia", qtyMN: 1 }],
    health: [{ label: "Vacinação", status: "Em dia", level: "g" }, { label: "Vermifugação", status: "Em dia", level: "g" }, { label: "Mastite", status: "Negativo", level: "g" }, { label: "Casco", status: "Normal", level: "g" }, { label: "C. corporal", status: "3.5/5", level: "g" }],
    notes: "Vaca de alta produção, monitorar consumo de MS."
  },
  {
    id: "2", name: "Estrela", phase: "81–200 dias", peso: 580, gmd: "+0.5", score: 3.0,
    production: [{ day: "Seg", liters: 24 }, { day: "Ter", liters: 25 }, { day: "Qua", liters: 23 }, { day: "Qui", liters: 26 }, { day: "Sex", liters: 25 }, { day: "Sáb", liters: 24 }, { day: "Dom", liters: 25 }],
    diet: [{ ingredientName: "Silagem de milho 2", qtyMN: 30 }, { ingredientName: "Brizantha, águas", qtyMN: 10 }, { ingredientName: "Farelo de soja", qtyMN: 4 }],
    health: [{ label: "Vacinação", status: "Em dia", level: "g" }, { label: "Vermifugação", status: "Pendente", level: "a" }, { label: "Mastite", status: "Negativo", level: "g" }, { label: "Casco", status: "Leve claudicação", level: "a" }, { label: "C. corporal", status: "3.0/5", level: "a" }],
    notes: "Agendar vermifugação. Observar casco dianteiro esquerdo."
  },
  {
    id: "3", name: "Pintada", phase: "0–21 dias", peso: 500, gmd: "-0.2", score: 2.8,
    production: [{ day: "Seg", liters: 18 }, { day: "Ter", liters: 19 }, { day: "Qua", liters: 20 }, { day: "Qui", liters: 21 }, { day: "Sex", liters: 22 }, { day: "Sáb", liters: 23 }, { day: "Dom", liters: 22 }],
    diet: [{ ingredientName: "Silagem de milho 1", qtyMN: 28 }, { ingredientName: "Feno alfafa floresc.1", qtyMN: 3 }, { ingredientName: "Milho, grão moído", qtyMN: 6 }],
    health: [{ label: "Vacinação", status: "Em dia", level: "g" }, { label: "Vermifugação", status: "Em dia", level: "g" }, { label: "Cetose", status: "Monitorar", level: "a" }, { label: "Casco", status: "Normal", level: "g" }, { label: "C. corporal", status: "2.8/5", level: "a" }],
    notes: "Recém parida. Monitorar cetose nos próximos 21 dias."
  },
  {
    id: "4", name: "Docinha", phase: "> 200 dias", peso: 520, gmd: "+0.3", score: 3.8,
    production: [{ day: "Seg", liters: 17 }, { day: "Ter", liters: 16 }, { day: "Qua", liters: 18 }, { day: "Qui", liters: 17 }, { day: "Sex", liters: 16 }, { day: "Sáb", liters: 17 }, { day: "Dom", liters: 16 }],
    diet: [{ ingredientName: "Silagem de milho 2", qtyMN: 24 }, { ingredientName: "Tifton, verde 2", qtyMN: 8 }, { ingredientName: "Farelo de soja", qtyMN: 3 }],
    health: [{ label: "Vacinação", status: "Em dia", level: "g" }, { label: "Vermifugação", status: "Em dia", level: "g" }, { label: "Mastite", status: "Subclínica", level: "r" }, { label: "Casco", status: "Normal", level: "g" }, { label: "C. corporal", status: "3.8/5", level: "g" }],
    notes: "⚠️ Mastite subclínica detectada. Iniciar tratamento CCS."
  },
  {
    id: "5", name: "Formosa", phase: "Pré-parto", peso: 600, gmd: "+0.4", score: 3.5,
    production: [{ day: "Seg", liters: 0 }, { day: "Ter", liters: 0 }, { day: "Qua", liters: 0 }, { day: "Qui", liters: 0 }, { day: "Sex", liters: 0 }, { day: "Sáb", liters: 0 }, { day: "Dom", liters: 0 }],
    diet: [{ ingredientName: "Silagem de milho 2", qtyMN: 20 }, { ingredientName: "Feno Cynodon1", qtyMN: 4 }, { ingredientName: "Fosfato bicálcico", qtyMN: 0.15 }],
    health: [{ label: "Vacinação", status: "Em dia", level: "g" }, { label: "Vermifugação", status: "Em dia", level: "g" }, { label: "Hipocalcemia", status: "Preventivo", level: "a" }, { label: "Casco", status: "Normal", level: "g" }, { label: "C. corporal", status: "3.5/5", level: "g" }],
    notes: "Parto previsto para próxima semana. Suplementar Ca aniônico."
  },
  {
    id: "6", name: "Rainha", phase: "Seca", peso: 560, gmd: "+0.2", score: 3.2,
    production: [{ day: "Seg", liters: 0 }, { day: "Ter", liters: 0 }, { day: "Qua", liters: 0 }, { day: "Qui", liters: 0 }, { day: "Sex", liters: 0 }, { day: "Sáb", liters: 0 }, { day: "Dom", liters: 0 }],
    diet: [{ ingredientName: "Silagem de milho 3", qtyMN: 18 }, { ingredientName: "Feno Cynodon1", qtyMN: 5 }, { ingredientName: "Fosfato bicálcico", qtyMN: 0.1 }],
    health: [{ label: "Vacinação", status: "Em dia", level: "g" }, { label: "Vermifugação", status: "Em dia", level: "g" }, { label: "Mastite", status: "Negativo", level: "g" }, { label: "Casco", status: "Normal", level: "g" }, { label: "C. corporal", status: "3.2/5", level: "g" }],
    notes: "Período seco. Meta: CC 3.5 ao parto."
  },
  {
    id: "7", name: "Modelo", phase: "22–80 dias", peso: 550, gmd: "+0.9", score: 3.8,
    production: [{ day: "Seg", liters: 30 }, { day: "Ter", liters: 31 }, { day: "Qua", liters: 30 }, { day: "Qui", liters: 32 }, { day: "Sex", liters: 31 }, { day: "Sáb", liters: 30 }, { day: "Dom", liters: 31 }],
    // Dieta de referência: todos os nutrientes calculados (NDT, PB, FDN, FDA, EE, Ca, P)
    // caem dentro (ou muito perto) da faixa ideal da fase "22–80 dias" — pensada para
    // servir de exemplo de "boa dieta" na Projeção de Leite / Status Nutricional.
    diet: [
      { ingredientName: "Silagem de milho 1", qtyMN: 26.4 },
      { ingredientName: "Germen de milho",    qtyMN: 2.5 },
      { ingredientName: "Farelo de soja",      qtyMN: 4.1 },
      { ingredientName: "Caroço de algodão",   qtyMN: 2.5 },
      { ingredientName: "Fosfato bicálcico",   qtyMN: 0.1 },
      { ingredientName: "Calcário calcítico",  qtyMN: 0.3 },
    ],
    health: [{ label: "Vacinação", status: "Em dia", level: "g" }, { label: "Vermifugação", status: "Em dia", level: "g" }, { label: "Mastite", status: "Negativo", level: "g" }, { label: "Casco", status: "Normal", level: "g" }, { label: "C. corporal", status: "3.8/5", level: "g" }],
    notes: "Vaca modelo — dieta balanceada de referência para a fase, use como exemplo ao formular outras dietas."
  },
]

// ============================================================
// FASES — limites nutricionais
// ============================================================
export const phaseTargets: Record<string, { ndt: [number, number]; pb: [number, number]; fdn: [number, number]; fda: [number, number]; ee: [number, number]; ca: [number, number]; p: [number, number]; }> = {
  "0–21 dias": { ndt: [72, 80], pb: [17, 21], fdn: [28, 35], fda: [19, 25], ee: [4, 7], ca: [0.9, 1.3], p: [0.4, 0.55] },
  "22–80 dias": { ndt: [74, 80], pb: [16, 20], fdn: [26, 34], fda: [17, 25], ee: [5, 7], ca: [0.8, 1.2], p: [0.35, 0.5] },
  "81–200 dias": { ndt: [72, 78], pb: [14, 18], fdn: [28, 36], fda: [19, 27], ee: [4, 6], ca: [0.6, 1.0], p: [0.3, 0.45] },
  "> 200 dias": { ndt: [65, 72], pb: [12, 16], fdn: [30, 38], fda: [20, 28], ee: [2, 5], ca: [0.5, 0.8], p: [0.25, 0.40] },
  "Pré-parto": { ndt: [62, 68], pb: [13, 16], fdn: [32, 40], fda: [22, 30], ee: [2, 4], ca: [0.6, 0.9], p: [0.25, 0.35] },
  "Seca": { ndt: [55, 62], pb: [11, 14], fdn: [36, 44], fda: [26, 34], ee: [1, 3], ca: [0.5, 0.7], p: [0.2, 0.30] },
}

export const phaseColors: Record<string, { bg: string; text: string; dot: string }> = {
  "0–21 dias": { bg: "#FAECE7", text: "#993C1D", dot: "#D85A30" },
  "22–80 dias": { bg: "#E1F5EE", text: "#0F6E56", dot: "#1D9E75" },
  "81–200 dias": { bg: "#E6F1FB", text: "#185FA5", dot: "#378ADD" },
  "> 200 dias": { bg: "#F1EFE8", text: "#5F5E5A", dot: "#888780" },
  "Pré-parto": { bg: "#EEEDFE", text: "#534AB7", dot: "#7F77DD" },
  "Seca": { bg: "#F1EFE8", text: "#5F5E5A", dot: "#B4B2A9" },
}

// ============================================================
// GESTÃO
// ============================================================
export const gestaoData = {
  precoLeite: 1.50,
  vacas: 40,
  producaoDia: 450,
  custoOperacional: 0.9716,
  custos: [
    { categoria: "Nutrição", valorAnual: 75400, pct: 48.83 },
    { categoria: "Sanidade", valorAnual: 31000, pct: 20.08 },
    { categoria: "Mão de Obra", valorAnual: 30000, pct: 19.43 },
    { categoria: "Benfeitorias", valorAnual: 18000, pct: 11.66 },
  ],
}

// ============================================================
// TABELAS DE REFERÊNCIA
// ============================================================
export const femeasHolandes = {
  title: "Fêmeas em Crescimento — Holandês (750 g/dia)",
  headers: ["Peso (kg)", "IMS kg/dia", "NDT %", "PB %", "Ca g/dia", "P g/dia"],
  rows: [
    [100, 2.92, 70.06, 16.0, 18.0, 9.5], [150, 3.87, 68.56, 16.0, 19.9, 12.0],
    [200, 4.83, 67.05, 14.78, 21.7, 14.5], [250, 5.82, 65.55, 12.04, 23.5, 17.0],
    [300, 6.86, 64.05, 12.0, 24.3, 18.2], [350, 7.98, 62.54, 12.0, 25.2, 19.3],
    [400, 9.19, 61.04, 12.0, 26.1, 20.4], [500, 11.98, 58.03, 12.0, 28.6, 20.8],
  ]
}
export const densidadeNutricional = {
  title: "Densidade Nutricional — Vacas em Lactação",
  headers: ["Fase", "IMS (kg)", "PB (%)", "NDT (%)", "FDA (%)", "FDN (%)", "Ca (%)", "P (%)"],
  rows: [
    ["Seca", 12.7, 13.0, 60.0, 30.0, 40.0, 0.6, 0.26],
    ["Pré-parto", 10.0, 15.0, 67.0, 24.0, 35.0, 0.70, 0.3],
    ["0–21 dias", 18.2, 19.0, 75.0, 21.0, 30.0, 1.1, 0.5],
    ["22–80 dias", 23.6, 18.0, 77.0, 19.0, 28.0, 1.0, 0.46],
    ["81–200 dias", 22.2, 16.0, 75.0, 21.0, 30.0, 0.8, 0.42],
    ["> 200 dias", 19.1, 14.0, 67.0, 24.0, 32.0, 0.6, 0.36],
  ]
}
