// ============================================================
// TIPOS
// ============================================================
export interface Ingredient {
  name: string; ms: number; ndt: number; pb: number;
  ee: number; ca: number; p: number; fdn: number; fda: number; cnf: number;
  category: string; costPerKg: number;
}

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
// INGREDIENTES
// ============================================================
export const ingredients: Ingredient[] = [
  { name:"Silagem de milho 1", ms:35, ndt:73, pb:8.0, ee:3.2, ca:0.22, p:0.21, fdn:43, fda:23, cnf:41.7, category:"Silagem", costPerKg:0.25 },
  { name:"Silagem de milho 2", ms:30, ndt:70, pb:7.0, ee:2.88, ca:0.2, p:0.18, fdn:47.88, fda:28.12, cnf:37.97, category:"Silagem", costPerKg:0.22 },
  { name:"Silagem de milho 3", ms:28, ndt:65, pb:6.0, ee:2.5, ca:0.2, p:0.16, fdn:55, fda:34, cnf:32.0, category:"Silagem", costPerKg:0.18 },
  { name:"Silagem de sorgo", ms:29, ndt:63, pb:8.0, ee:2.8, ca:0.3, p:0.15, fdn:54, fda:34, cnf:27.2, category:"Silagem", costPerKg:0.17 },
  { name:"Silagem de soja", ms:40, ndt:60, pb:17.0, ee:5.7, ca:1.07, p:0.37, fdn:47, fda:37, cnf:18.3, category:"Silagem", costPerKg:0.35 },
  { name:"Silagem de aveia", ms:17, ndt:60, pb:17.5, ee:4.0, ca:0.32, p:0.2, fdn:47, fda:37, cnf:23.5, category:"Silagem", costPerKg:0.20 },
  { name:"Tifton verde 1", ms:23, ndt:60, pb:16.0, ee:2.5, ca:0.24, p:0.23, fdn:65, fda:38, cnf:8.5, category:"Pastagem", costPerKg:0.08 },
  { name:"Tifton verde 2", ms:25, ndt:57, pb:12.0, ee:2.0, ca:0.21, p:0.16, fdn:70, fda:41, cnf:7.0, category:"Pastagem", costPerKg:0.07 },
  { name:"Brizantha águas", ms:28, ndt:54.5, pb:9.0, ee:2.0, ca:0.22, p:0.16, fdn:70, fda:40, cnf:10.0, category:"Pastagem", costPerKg:0.06 },
  { name:"Napier 75 dias", ms:23, ndt:55, pb:7.0, ee:3.0, ca:0.4, p:0.17, fdn:69, fda:36, cnf:11.0, category:"Pastagem", costPerKg:0.05 },
  { name:"Aveia/Azevém", ms:15, ndt:72, pb:21.0, ee:3.0, ca:0.45, p:0.44, fdn:40, fda:22, cnf:27.0, category:"Pastagem", costPerKg:0.09 },
  { name:"Feno Cynodon 1", ms:87, ndt:55, pb:13.0, ee:2.7, ca:0.39, p:0.22, fdn:73, fda:37, cnf:4.8, category:"Feno", costPerKg:0.70 },
  { name:"Feno alfafa", ms:90, ndt:60, pb:18.0, ee:2.2, ca:1.4, p:0.25, fdn:44, fda:35, cnf:27.8, category:"Feno", costPerKg:1.10 },
  { name:"Feno de aveia", ms:88, ndt:58, pb:11.5, ee:2.0, ca:0.35, p:0.2, fdn:58, fda:35, cnf:20.5, category:"Feno", costPerKg:0.65 },
  { name:"Cana", ms:24, ndt:60, pb:4.2, ee:1.5, ca:0.23, p:0.06, fdn:55, fda:35, cnf:34.3, category:"Outros", costPerKg:0.08 },
  { name:"Palha de aveia", ms:90, ndt:50, pb:4.0, ee:2.3, ca:0.24, p:0.06, fdn:70, fda:46, cnf:15.7, category:"Outros", costPerKg:0.35 },
  { name:"Cama de frango", ms:79, ndt:61, pb:18.0, ee:2.5, ca:2.3, p:0.6, fdn:38, fda:15, cnf:22.5, category:"Outros", costPerKg:0.28 },
  { name:"Ração concentrada 1", ms:88, ndt:78, pb:22.0, ee:4.5, ca:0.8, p:0.55, fdn:18, fda:10, cnf:53.0, category:"Concentrado", costPerKg:1.85 },
  { name:"Ração concentrada 2", ms:88, ndt:74, pb:18.0, ee:3.8, ca:0.7, p:0.48, fdn:20, fda:12, cnf:50.0, category:"Concentrado", costPerKg:1.65 },
  { name:"Farelo de soja", ms:87, ndt:82, pb:46.0, ee:1.5, ca:0.35, p:0.65, fdn:14, fda:8, cnf:30.0, category:"Concentrado", costPerKg:2.10 },
  { name:"Milho grão moído", ms:88, ndt:88, pb:9.0, ee:3.8, ca:0.03, p:0.28, fdn:10, fda:3, cnf:75.0, category:"Concentrado", costPerKg:1.20 },
  { name:"Mineral lactação", ms:98, ndt:0, pb:0.0, ee:0.0, ca:18.0, p:8.0, fdn:0, fda:0, cnf:0.0, category:"Mineral", costPerKg:4.50 },
  { name:"Bicarbonato sódio", ms:98, ndt:0, pb:0.0, ee:0.0, ca:0.0, p:0.0, fdn:0, fda:0, cnf:0.0, category:"Mineral", costPerKg:2.80 },
  { name:"Óleo vegetal", ms:100, ndt:184, pb:0.0, ee:99.9, ca:0.0, p:0.0, fdn:0, fda:0, cnf:0.1, category:"Outros", costPerKg:5.50 },
]

export const ingredientCategories = ["Todos","Silagem","Pastagem","Feno","Concentrado","Mineral","Outros"]

// ============================================================
// FASES — limites nutricionais
// ============================================================
export const phaseTargets: Record<string, { ndt:[number,number]; pb:[number,number]; fdn:[number,number]; fda:[number,number]; ee:[number,number]; ca:[number,number]; p:[number,number]; }> = {
  "0–21 dias":    { ndt:[72,80], pb:[17,21], fdn:[28,35], fda:[19,25], ee:[4,7],  ca:[0.9,1.3], p:[0.4,0.55] },
  "22–80 dias":   { ndt:[74,80], pb:[16,20], fdn:[26,34], fda:[17,25], ee:[5,7],  ca:[0.8,1.2], p:[0.35,0.5] },
  "81–200 dias":  { ndt:[72,78], pb:[14,18], fdn:[28,36], fda:[19,27], ee:[4,6],  ca:[0.6,1.0], p:[0.3,0.45] },
  "> 200 dias":   { ndt:[65,72], pb:[12,16], fdn:[30,38], fda:[20,28], ee:[2,5],  ca:[0.5,0.8], p:[0.25,0.40] },
  "Pré-parto":    { ndt:[62,68], pb:[13,16], fdn:[32,40], fda:[22,30], ee:[2,4],  ca:[0.6,0.9], p:[0.25,0.35] },
  "Seca":         { ndt:[55,62], pb:[11,14], fdn:[36,44], fda:[26,34], ee:[1,3],  ca:[0.5,0.7], p:[0.2,0.30] },
}

export const phaseColors: Record<string, { bg: string; text: string; dot: string }> = {
  "0–21 dias":   { bg:"#FAECE7", text:"#993C1D", dot:"#D85A30" },
  "22–80 dias":  { bg:"#E1F5EE", text:"#0F6E56", dot:"#1D9E75" },
  "81–200 dias": { bg:"#E6F1FB", text:"#185FA5", dot:"#378ADD" },
  "> 200 dias":  { bg:"#F1EFE8", text:"#5F5E5A", dot:"#888780" },
  "Pré-parto":   { bg:"#EEEDFE", text:"#534AB7", dot:"#7F77DD" },
  "Seca":        { bg:"#F1EFE8", text:"#5F5E5A", dot:"#B4B2A9" },
}

// ============================================================
// REBANHO
// ============================================================
export const initialCows: Cow[] = [
  {
    id:"1", name:"Mimosa", phase:"22–80 dias", peso:545, gmd:"+0.8", score:3.5,
    production:[{day:"Seg",liters:28},{day:"Ter",liters:30},{day:"Qua",liters:31},{day:"Qui",liters:30},{day:"Sex",liters:32},{day:"Sáb",liters:29},{day:"Dom",liters:31}],
    diet:[{ingredientName:"Silagem de milho 2",qtyMN:34},{ingredientName:"Tifton verde 1",qtyMN:4},{ingredientName:"Ração concentrada 1",qtyMN:5},{ingredientName:"Palha de aveia",qtyMN:1}],
    health:[{label:"Vacinação",status:"Em dia",level:"g"},{label:"Vermifugação",status:"Em dia",level:"g"},{label:"Mastite",status:"Negativo",level:"g"},{label:"Casco",status:"Normal",level:"g"},{label:"C. corporal",status:"3.5/5",level:"g"}],
    notes:"Vaca de alta produção, monitorar consumo de MS."
  },
  {
    id:"2", name:"Estrela", phase:"81–200 dias", peso:580, gmd:"+0.5", score:3.0,
    production:[{day:"Seg",liters:24},{day:"Ter",liters:25},{day:"Qua",liters:23},{day:"Qui",liters:26},{day:"Sex",liters:25},{day:"Sáb",liters:24},{day:"Dom",liters:25}],
    diet:[{ingredientName:"Silagem de milho 2",qtyMN:30},{ingredientName:"Brizantha águas",qtyMN:10},{ingredientName:"Ração concentrada 2",qtyMN:4}],
    health:[{label:"Vacinação",status:"Em dia",level:"g"},{label:"Vermifugação",status:"Pendente",level:"a"},{label:"Mastite",status:"Negativo",level:"g"},{label:"Casco",status:"Leve claudicação",level:"a"},{label:"C. corporal",status:"3.0/5",level:"a"}],
    notes:"Agendar vermifugação. Observar casco dianteiro esquerdo."
  },
  {
    id:"3", name:"Pintada", phase:"0–21 dias", peso:500, gmd:"-0.2", score:2.8,
    production:[{day:"Seg",liters:18},{day:"Ter",liters:19},{day:"Qua",liters:20},{day:"Qui",liters:21},{day:"Sex",liters:22},{day:"Sáb",liters:23},{day:"Dom",liters:22}],
    diet:[{ingredientName:"Silagem de milho 1",qtyMN:28},{ingredientName:"Feno alfafa",qtyMN:3},{ingredientName:"Ração concentrada 1",qtyMN:6}],
    health:[{label:"Vacinação",status:"Em dia",level:"g"},{label:"Vermifugação",status:"Em dia",level:"g"},{label:"Cetose",status:"Monitorar",level:"a"},{label:"Casco",status:"Normal",level:"g"},{label:"C. corporal",status:"2.8/5",level:"a"}],
    notes:"Recém parida. Monitorar cetose nos próximos 21 dias."
  },
  {
    id:"4", name:"Docinha", phase:"> 200 dias", peso:520, gmd:"+0.3", score:3.8,
    production:[{day:"Seg",liters:17},{day:"Ter",liters:16},{day:"Qua",liters:18},{day:"Qui",liters:17},{day:"Sex",liters:16},{day:"Sáb",liters:17},{day:"Dom",liters:16}],
    diet:[{ingredientName:"Silagem de milho 2",qtyMN:24},{ingredientName:"Tifton verde 2",qtyMN:8},{ingredientName:"Ração concentrada 2",qtyMN:3}],
    health:[{label:"Vacinação",status:"Em dia",level:"g"},{label:"Vermifugação",status:"Em dia",level:"g"},{label:"Mastite",status:"Subclínica",level:"r"},{label:"Casco",status:"Normal",level:"g"},{label:"C. corporal",status:"3.8/5",level:"g"}],
    notes:"⚠️ Mastite subclínica detectada. Iniciar tratamento CCS."
  },
  {
    id:"5", name:"Formosa", phase:"Pré-parto", peso:600, gmd:"+0.4", score:3.5,
    production:[{day:"Seg",liters:0},{day:"Ter",liters:0},{day:"Qua",liters:0},{day:"Qui",liters:0},{day:"Sex",liters:0},{day:"Sáb",liters:0},{day:"Dom",liters:0}],
    diet:[{ingredientName:"Silagem de milho 2",qtyMN:20},{ingredientName:"Feno Cynodon 1",qtyMN:4},{ingredientName:"Mineral lactação",qtyMN:0.15}],
    health:[{label:"Vacinação",status:"Em dia",level:"g"},{label:"Vermifugação",status:"Em dia",level:"g"},{label:"Hipocalcemia",status:"Preventivo",level:"a"},{label:"Casco",status:"Normal",level:"g"},{label:"C. corporal",status:"3.5/5",level:"g"}],
    notes:"Parto previsto para próxima semana. Suplementar Ca aniônico."
  },
  {
    id:"6", name:"Rainha", phase:"Seca", peso:560, gmd:"+0.2", score:3.2,
    production:[{day:"Seg",liters:0},{day:"Ter",liters:0},{day:"Qua",liters:0},{day:"Qui",liters:0},{day:"Sex",liters:0},{day:"Sáb",liters:0},{day:"Dom",liters:0}],
    diet:[{ingredientName:"Silagem de milho 3",qtyMN:18},{ingredientName:"Feno Cynodon 1",qtyMN:5},{ingredientName:"Mineral lactação",qtyMN:0.1}],
    health:[{label:"Vacinação",status:"Em dia",level:"g"},{label:"Vermifugação",status:"Em dia",level:"g"},{label:"Mastite",status:"Negativo",level:"g"},{label:"Casco",status:"Normal",level:"g"},{label:"C. corporal",status:"3.2/5",level:"g"}],
    notes:"Período seco. Meta: CC 3.5 ao parto."
  },
]

// ============================================================
// GESTÃO
// ============================================================
export const gestaoData = {
  precoLeite: 1.50,
  vacas: 40,
  producaoDia: 450,
  custoOperacional: 0.9716,
  custos: [
    { categoria:"Nutrição",     valorAnual:75400, pct:48.83 },
    { categoria:"Sanidade",     valorAnual:31000, pct:20.08 },
    { categoria:"Mão de Obra",  valorAnual:30000, pct:19.43 },
    { categoria:"Benfeitorias", valorAnual:18000, pct:11.66 },
  ],
}

// ============================================================
// TABELAS DE REFERÊNCIA
// ============================================================
export const femeasHolandes = {
  title:"Fêmeas em Crescimento — Holandês (750 g/dia)",
  headers:["Peso (kg)","IMS kg/dia","NDT %","PB %","Ca g/dia","P g/dia"],
  rows:[
    [100,2.92,70.06,16.0,18.0,9.5],[150,3.87,68.56,16.0,19.9,12.0],
    [200,4.83,67.05,14.78,21.7,14.5],[250,5.82,65.55,12.04,23.5,17.0],
    [300,6.86,64.05,12.0,24.3,18.2],[350,7.98,62.54,12.0,25.2,19.3],
    [400,9.19,61.04,12.0,26.1,20.4],[500,11.98,58.03,12.0,28.6,20.8],
  ]
}
export const densidadeNutricional = {
  title:"Densidade Nutricional — Vacas em Lactação",
  headers:["Fase","IMS (kg)","PB (%)","NDT (%)","FDA (%)","FDN (%)","Ca (%)","P (%)"],
  rows:[
    ["Seca",12.7,13.0,60.0,30.0,40.0,0.6,0.26],
    ["Pré-parto",10.0,15.0,67.0,24.0,35.0,0.70,0.3],
    ["0–21 dias",18.2,19.0,75.0,21.0,30.0,1.1,0.5],
    ["22–80 dias",23.6,18.0,77.0,19.0,28.0,1.0,0.46],
    ["81–200 dias",22.2,16.0,75.0,21.0,30.0,0.8,0.42],
    ["> 200 dias",19.1,14.0,67.0,24.0,32.0,0.6,0.36],
  ]
}
