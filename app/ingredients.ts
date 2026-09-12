// ============================================================
// INGREDIENTES — modelo completo (baseado na aba "Dieta" da planilha
// de formulação — MODELO LAYOUT.xls, aba "Dieta")
// ============================================================
//
// Cada campo abaixo é um dado de ENTRADA (cadastrado pelo usuário).
// Nenhum valor "calculado" da planilha (kg a partir de %, mg a partir
// de mg/kg, totais, etc.) é armazenado aqui — eles são sempre
// recalculados a partir destes dados base, em app/dietCalculations.ts,
// para nunca ficar desatualizado. A única exceção é o CNF (%), que na
// própria planilha já é derivado de outros campos do ingrediente
// (ver getCNF abaixo).
//
// Mapeamento planilha → campo (coluna da aba "Dieta"):
//   MS(D) ndt(F) pb(H) ee(J) fdn(P) fda(S) fb(R, não usada em cálculos)
//   mm(W) ca(L) p(N) s(AR) mgMin(AT) na(AV) amido(AX)
//   se(AB) zn(AD) cu(AF) iodo(AH) mn(AJ) co(AL)  — mg/kg, "as fed"
//   vitA(AN) vitE(AP) — UI/kg, "as fed"
//   costPerKg(Y)

export interface Ingredient {
  id: string;
  name: string;
  unit: string;       // unidade de uso, ex: "kg"
  category: string;   // Silagem, Pastagem, Feno, Concentrado, Mineral, Outros...

  // ── Composição nutricional (% na matéria seca, exceto MS = % na matéria natural) ──
  ms: number;     // MS (%) — matéria seca
  ndt: number;    // NDT (%) — nutrientes digestíveis totais
  pb: number;     // PB (%) — proteína bruta
  ee: number;     // EE (%) — extrato etéreo / gordura
  fdn: number;    // FDN (%) — fibra em detergente neutro
  fda: number;    // FDA (%) — fibra em detergente ácido
  fb: number;     // FB (%) — fibra bruta. Campo legado da planilha original:
                   // não entra em nenhum cálculo (sem total, sem par "kg").
                   // Mantido apenas como informativo/histórico.
  mm: number;     // MM (%) — matéria mineral (cinzas)
  amido: number;  // Amido (%)

  // ── Minerais — macro (% na matéria seca) ──
  ca: number;     // Ca (%) — cálcio
  p: number;      // P (%) — fósforo
  s: number;      // S (%) — enxofre
  mgMin: number;  // Mg (%) — magnésio ("Min" pra não colidir com os minerais-traço em mg/kg)
  na: number;     // Na (%) — sódio

  // ── Minerais-traço (mg por kg do ingrediente, "as fed") ──
  se: number;   // Selênio mg/kg
  zn: number;   // Zinco mg/kg
  cu: number;   // Cobre mg/kg
  iodo: number; // Iodo mg/kg
  mn: number;   // Manganês mg/kg
  co: number;   // Cobalto mg/kg

  // ── Vitaminas (UI por kg do ingrediente, "as fed") ──
  vitA: number; // Vitamina A UI/kg
  vitE: number; // Vitamina E UI/kg

  // ── Comercial ──
  costPerKg: number; // R$/kg
}

/**
 * CNF (%) não é digitado pelo usuário — na planilha original (coluna U da
 * aba Dieta) ele já é derivado dos outros nutrientes do próprio ingrediente:
 *   CNF% = 100 − (PB% + EE% + FDN% + MM%)
 */
export function getCNF(ing: Ingredient): number {
  const v = 100 - (ing.pb + ing.ee + ing.fdn + ing.mm);
  return v < 0 ? 0 : v;
}

export const ingredientCategories = ["Silagem", "Pastagem", "Feno", "Concentrado", "Mineral", "Outros"];

export function emptyIngredient(): Ingredient {
  return {
    id: "", name: "", unit: "kg", category: "Outros",
    ms: 0, ndt: 0, pb: 0, ee: 0, fdn: 0, fda: 0, fb: 0, mm: 0, amido: 0,
    ca: 0, p: 0, s: 0, mgMin: 0, na: 0,
    se: 0, zn: 0, cu: 0, iodo: 0, mn: 0, co: 0,
    vitA: 0, vitE: 0,
    costPerKg: 0,
  };
}

/** Metadados para renderizar o formulário de cadastro em seções, sem repetir a lista de campos. */
export type FieldMeta = { key: keyof Ingredient; label: string; suffix: string };

export const FIELD_GROUPS: { title: string; icon: string; fields: FieldMeta[] }[] = [
  {
    title: "Composição nutricional", icon: "🌾",
    fields: [
      { key: "ms",    label: "MS — Matéria seca",            suffix: "%" },
      { key: "ndt",   label: "NDT — Nutrientes digestíveis",  suffix: "%" },
      { key: "pb",    label: "PB — Proteína bruta",           suffix: "%" },
      { key: "ee",    label: "EE — Extrato etéreo",           suffix: "%" },
      { key: "fdn",   label: "FDN — Fibra em det. neutro",    suffix: "%" },
      { key: "fda",   label: "FDA — Fibra em det. ácido",     suffix: "%" },
      { key: "fb",    label: "FB — Fibra bruta (informativo)", suffix: "%" },
      { key: "mm",    label: "MM — Matéria mineral",          suffix: "%" },
      { key: "amido", label: "Amido",                          suffix: "%" },
    ],
  },
  {
    title: "Minerais", icon: "⚗️",
    fields: [
      { key: "ca",    label: "Ca — Cálcio",   suffix: "%" },
      { key: "p",     label: "P — Fósforo",   suffix: "%" },
      { key: "s",     label: "S — Enxofre",   suffix: "%" },
      { key: "mgMin", label: "Mg — Magnésio", suffix: "%" },
      { key: "na",    label: "Na — Sódio",    suffix: "%" },
      { key: "se",    label: "Se — Selênio",  suffix: "mg/kg" },
      { key: "zn",    label: "Zn — Zinco",    suffix: "mg/kg" },
      { key: "cu",    label: "Cu — Cobre",    suffix: "mg/kg" },
      { key: "iodo",  label: "I — Iodo",      suffix: "mg/kg" },
      { key: "mn",    label: "Mn — Manganês", suffix: "mg/kg" },
      { key: "co",    label: "Co — Cobalto",  suffix: "mg/kg" },
    ],
  },
  {
    title: "Vitaminas", icon: "💊",
    fields: [
      { key: "vitA", label: "Vitamina A", suffix: "UI/kg" },
      { key: "vitE", label: "Vitamina E", suffix: "UI/kg" },
    ],
  },
];

// ============================================================
// SEED — extraído diretamente da aba "Dieta" da planilha original
// (MODELO LAYOUT.xls), linhas 6–107, uma por ingrediente. Cada campo abaixo
// é o valor real da célula correspondente na planilha (MS=D, NDT=F, PB=H,
// EE=J, Ca=L, P=N, FDN=P, FDA=S, FB=R, MM=W, S=AR, Mg=AT, Na=AV, Amido=AX,
// minerais-traço=AB/AD/AF/AH/AJ/AL, vitaminas=AN/AP, preço=Y) — não são
// estimativas nem migração da lista simplificada antiga.
//
// Minerais-traço e vitaminas ficam em 0 para os ingredientes cujo modelo de
// planilha não tinha valor preenchido naquela célula (a maioria) — não é
// omissão da extração, é o próprio dado de origem.
// ============================================================
function seed(
  name: string, category: string,
  ms: number, ndt: number, pb: number, ee: number, ca: number, p: number,
  fdn: number, fda: number, fb: number, mm: number, s: number, mgMin: number,
  na: number, amido: number, se: number, zn: number, cu: number, iodo: number,
  mn: number, co: number, vitA: number, vitE: number, costPerKg: number,
): Ingredient {
  return {
    ...emptyIngredient(),
    id: `seed-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name, category, ms, ndt, pb, ee, ca, p, fdn, fda, fb, mm, s, mgMin,
    na, amido, se, zn, cu, iodo, mn, co, vitA, vitE, costPerKg,
  };
}

export const SEED_INGREDIENTS: Ingredient[] = [
  seed("Silagem de milho 1", "Silagem", 40, 78, 8, 3.2, 0.22, 0.21, 43, 23, 0, 4.1, 0.1, 0.18, 0.01, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0.25),
  seed("Silagem de milho 2", "Silagem", 30, 70, 7, 2.88, 0.2, 0.18, 47.88, 28.12, 0, 4.27, 0.11, 0.18, 0.01, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0.22),
  seed("Silagem de milho 3", "Silagem", 28, 65, 6, 2.5, 0.2, 0.16, 55, 34, 0, 4.5, 0.13, 0.18, 0.01, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0.18),
  seed("Silagem de sorgo", "Silagem", 29, 63, 8, 2.8, 0.3, 0.15, 54, 34, 0, 8, 0.09, 0, 0, 4.6, 0, 0, 0, 0, 0, 0, 0, 0, 0.17),
  seed("Sil. de aveia emborr.", "Silagem", 17, 60, 17.5, 4, 0.32, 0.2, 47, 37, 0, 8, 0.32, 0.2, 0.07, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Sil. de aveia Floresc.", "Silagem", 30, 57, 12.9, 3.4, 0.52, 0.31, 61, 39, 0, 10, 0.3, 0.2, 0.07, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Sil. de aveia gr. Past.", "Silagem", 33, 54, 10.3, 4, 0.32, 0.2, 64, 40, 0, 8, 0.25, 0.2, 0.07, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Sil. de aveia gr. Farin.", "Silagem", 37, 51, 7, 4, 0.32, 0.2, 67, 42, 0, 8, 0.22, 0.2, 0.07, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Trigo BIO enregy", "Outros", 28, 66, 8.9, 2.68, 0.2, 0.2, 53, 34.4, 0, 6.3, 0, 0, 0, 29, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Silagem Triticale", "Silagem", 32, 57, 13.5, 3.8, 0.57, 0.33, 60, 40, 0, 10, 0.25, 0.2, 0.07, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Silagem de soja", "Silagem", 40, 60, 17, 5.7, 1.07, 0.37, 47, 37, 0, 12, 0.24, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0.35),
  seed("Silagem Azevém1", "Silagem", 42, 60, 17, 2.8, 0.57, 0.36, 51, 33, 0, 10, 0.25, 0.21, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Silagem azevém2", "Silagem", 35, 56, 13, 2.4, 0.6, 0.36, 58, 35, 0, 9, 0.25, 0.14, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Silagem sudão", "Silagem", 29, 54, 11, 3.6, 0.64, 0.24, 63, 41, 0, 11, 0.05, 0, 0, 2.4, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Capim sudão novo", "Pastagem", 23, 57, 13, 3.9, 0.5, 0.31, 65, 36, 0, 9, 0.06, 0.1, 0.06, 2.6, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Capim papuã1", "Pastagem", 23, 57, 14, 1.6, 0.2, 0.15, 65, 37, 0, 7.5, 0.06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Capim papuã2", "Pastagem", 25, 57, 12, 2, 0.2, 0.15, 70, 37, 0, 9, 0.04, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Tifton, verde 1", "Pastagem", 23, 60, 16, 2.5, 0.24, 0.23, 65, 38, 0, 8, 0.06, 0, 0, 2.3, 0, 0, 0, 0, 0, 0, 0, 0, 0.08),
  seed("Tifton, verde 2", "Pastagem", 25, 57, 12, 2, 0.21, 0.16, 70, 41, 0, 9, 0.05, 0.15, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0.07),
  seed("Tifton, verde3", "Pastagem", 27, 53, 9, 1.5, 0.17, 0.17, 75, 44, 0, 10, 0.04, 0, 0, 1.7, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Brizantha, águas", "Pastagem", 28, 54.5, 9, 2, 0.22, 0.16, 70, 40, 0, 9, 0.06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.06),
  seed("Brizantha, seca", "Pastagem", 57, 48, 4, 2, 0.2, 0.12, 80, 45, 0, 9, 0.04, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Napier 75 dias", "Pastagem", 23, 55, 7, 3, 0.4, 0.17, 69, 36, 0, 10, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05),
  seed("Napier 135 dias", "Pastagem", 26, 45, 4.5, 3, 0.4, 0.15, 75, 42, 0, 11, 0.04, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Napier novo", "Pastagem", 20, 58, 13, 3, 0.35, 0.2, 53, 30, 0, 9, 0.06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Trevo Branco1", "Pastagem", 21, 66, 24, 3.7, 1.31, 0.37, 33, 24, 0, 10, 0.2, 0.4, 0.1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Trevo Branco2", "Pastagem", 23, 55, 17, 1.6, 1.22, 0.28, 51, 40, 0, 9, 0.18, 0.4, 0.1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Trigo, pasto novo", "Pastagem", 21, 69, 28, 4, 0.4, 0.4, 52, 30, 0, 14, 0.22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Aveia, azevém 1", "Pastagem", 15, 72, 21, 3, 0.45, 0.44, 40, 22, 0, 9, 0.35, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Aveia, azevém 2", "Pastagem", 20, 66, 18, 2.7, 0.56, 0.44, 48, 26, 0, 10, 0.3, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Aveia, azevém 3", "Pastagem", 23, 57, 14, 2.5, 0.56, 0.26, 55, 36, 0, 10, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Feno Cynodon1", "Feno", 87, 55, 13, 2.7, 0.39, 0.22, 73, 37, 0, 6.5, 0.26, 0.15, 0.36, 2.3, 0, 0, 0, 0, 0, 0, 0, 0, 0.7),
  seed("Feno Cynodon2", "Feno", 87, 53, 10, 2.7, 0.49, 0.27, 77, 36, 0, 8, 0.26, 0.15, 0.36, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Feno de azevém1", "Feno", 87, 60, 13, 2.5, 0.66, 0.29, 58, 37, 0, 7, 0.26, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Feno de azevém2", "Feno", 87, 56, 11, 2, 0.47, 0.26, 69, 42, 0, 9, 0.2, 0.18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Feno aveia 1", "Feno", 88, 58, 11.5, 2, 0.35, 0.2, 58, 35, 0, 8, 0.26, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.65),
  seed("Feno aveia 2", "Feno", 87, 55, 9, 2.1, 0.2, 0.22, 63, 38, 0, 9, 0.2, 0.18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Feno alfafa floresc.1", "Feno", 90, 60, 18, 2.2, 1.4, 0.25, 44, 35, 0, 8, 0.24, 0.24, 0.13, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 1.1),
  seed("Feno alfafa floresc.2", "Feno", 89, 58, 17, 2, 1.4, 0.23, 48, 38, 0, 10, 0.24, 0.24, 0.13, 2.6, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Feno alfafa floresc.3", "Feno", 88, 53, 16, 1.8, 1.3, 0.2, 56, 41, 0, 8, 0.24, 0.24, 0.13, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Feno alfafa madura", "Feno", 90, 50, 14, 1.7, 1.3, 0.19, 59, 45, 0, 8, 0.24, 0.24, 0.13, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Cana", "Outros", 24, 60, 4.2, 1.5, 0.23, 0.06, 55, 35, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.08),
  seed("Bagaço de cana", "Outros", 95.5, 36.5, 1.1, 2, 0.05, 0.14, 85, 60, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Mandioca, parte aérea", "Outros", 26, 60, 15, 2.7, 1.34, 0.21, 42.5, 36, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Palha de arroz", "Outros", 92.5, 41.5, 3.9, 2, 0.1, 0.07, 80, 46, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Palha de milho", "Outros", 76, 45, 2.5, 2, 0.31, 0.07, 80, 46, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Palha de aveia", "Outros", 90, 50, 4, 2.3, 0.24, 0.06, 70, 46, 0, 8, 0.22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.35),
  seed("Palha de trigo", "Outros", 88, 40.6, 4, 1.5, 0.2, 0.08, 85, 56, 0, 7, 0.19, 0.12, 0.14, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Palha de cevada", "Outros", 88, 49, 4, 1.9, 0.3, 0.05, 82, 57, 0, 7, 0.15, 0.23, 0.14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Cama de frango", "Outros", 79, 61, 18, 2.5, 2.3, 0.6, 38, 15, 0, 19, 0.18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.28),
  seed("Mandioca, Raíz", "Outros", 35, 67, 3, 0.3, 0.15, 0.09, 46, 22, 0, 4.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Cevada úmida", "Outros", 20, 78, 26, 6.5, 0.33, 0.55, 42, 22, 0, 5, 0.32, 0.1, 0.24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Cenouras", "Outros", 12, 83, 10, 1.4, 0.4, 0.34, 12, 9, 0, 9, 0.02, 0.02, 0.12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Batatas", "Outros", 14, 82, 7, 1.5, 0.2, 0.26, 12, 9, 0, 3, 0.09, 0.14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Óleo vegetal", "Outros", 100, 184, 0, 99.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5.5),
  seed("Óleo de soja", "Outros", 100, 207, 0, 99.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Melaço", "Outros", 72.75, 69.75, 3.1, 1.5, 3.65, 0.16, 0, 0, 0, 12.84, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Massa de soja", "Concentrado", 10, 75, 28, 7.6, 0.19, 0.41, 23, 10, 0, 3.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Radícula de malte", "Concentrado", 89, 73, 25, 1.5, 0.26, 0.66, 46, 18, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Cascas de aveia", "Concentrado", 93, 37, 4, 1.5, 0.2, 0.15, 78, 44, 0, 7, 0.15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Casca de soja", "Concentrado", 91, 67, 12, 2.5, 0.63, 0.17, 60, 45, 0, 5, 0.09, 0, 0, 5.3, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Casca de algodão", "Concentrado", 89, 34, 3.6, 2.5, 0.18, 0.12, 85, 65, 0, 3.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Casca de Arroz", "Concentrado", 92, 16, 3, 1, 0.09, 0.06, 80, 56, 0, 13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Germen de milho", "Concentrado", 90, 84, 10, 6.5, 0.01, 0.48, 8, 10, 0, 4, 0.6, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Milho c/ palha e sabugo", "Outros", 88, 67, 8, 3, 0.08, 0.21, 39, 20, 0, 1.9, 0, 0, 0, 53, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Polpa cítrica seca", "Concentrado", 86, 76, 6.7, 4.9, 1.5, 0.1, 24, 22, 0, 7, 0.06, 0.14, 0.09, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Triguilho", "Concentrado", 90, 78, 13, 2.2, 0.04, 0.26, 14, 4, 0, 3, 0.17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Resíduo de soja", "Concentrado", 90, 71, 23, 7, 0.2, 0.4, 37, 15, 0, 6, 0.24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Farelo de trigo", "Concentrado", 89, 70, 17, 4.8, 0.12, 1.32, 51, 15, 0, 7, 0.25, 0.6, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Trigo, grão", "Concentrado", 89, 84, 12, 2, 0.1, 0.35, 14, 4, 0, 2, 0.16, 0.13, 0, 77, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Triticale, grão", "Concentrado", 90, 86, 12, 4.6, 0.1, 0.34, 14, 8, 0, 2, 0.17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Aveia, grão", "Concentrado", 89, 78, 13, 4, 0.07, 0.36, 32, 17, 0, 4, 0.19, 0.15, 0, 57, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Cevada, grão", "Concentrado", 89, 78, 12, 2, 0.1, 0.35, 20, 7, 0, 3, 0.15, 0.1, 0.02, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Milho, grão úmido", "Concentrado", 70, 87, 8.4, 3.9, 0.05, 0.28, 21, 9.4, 0, 1.7, 0.1, 0.08, 0.01, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Milho, grão quebrado", "Concentrado", 88, 85, 9, 4.2, 0.04, 0.3, 9.5, 3.4, 0, 1.5, 0.12, 0.12, 0, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Milho, grão moído", "Concentrado", 88, 88, 9, 4.2, 0.04, 0.3, 9.5, 3.4, 0, 1.5, 0.12, 0.12, 0, 72, 0, 0, 0, 0, 0, 0, 0, 0, 1.2),
  seed("Protenose", "Concentrado", 88, 86, 60, 1.1, 0.16, 0.5, 9, 5, 0, 3.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Refinazil", "Concentrado", 87.4, 83, 24, 1.1, 0.36, 0.82, 45, 12, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Sorgo, grão seco", "Concentrado", 88, 78, 10, 3.3, 0.05, 0.3, 18, 4, 0, 3, 0.13, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Arroz integral", "Outros", 88, 73, 10.5, 2.5, 0.03, 0.3, 40, 26, 0, 1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Quirera de arroz", "Concentrado", 88, 78, 9.2, 0.8, 0.01, 0.18, 6, 9.5, 0, 1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Farelo de arroz integral", "Concentrado", 88, 70, 14, 16, 0.09, 1.55, 32, 18, 0, 8, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Farelo de arroz deseng.", "Concentrado", 90, 60, 15, 2.2, 0.08, 1.4, 17, 14, 0, 10, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Grão de soja", "Concentrado", 90, 92, 39, 20, 0.41, 0.55, 28, 10, 0, 5, 0.24, 0.3, 0, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Farelo de soja", "Concentrado", 89, 83, 50, 1.3, 0.29, 0.6, 15, 10, 0, 7, 0.4, 0, 0, 2.7, 0, 0, 0, 0, 0, 0, 0, 0, 2.1),
  seed("Farelo de canola", "Concentrado", 92, 69, 40, 1.4, 0.67, 1.04, 28, 18, 0, 7.5, 0.09, 0.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Farelo de girassol", "Concentrado", 91, 66, 31, 1.4, 0.4, 0.96, 40, 33, 0, 7, 0.33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Farelo de linhaça", "Concentrado", 90, 65, 32, 1.7, 0.4, 0.83, 36, 22, 0, 6, 0.47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Farelo de algodão 28", "Concentrado", 91, 66, 31, 8.8, 0.28, 0.95, 32, 18, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Caroço de algodão", "Outros", 90, 92, 23, 19.3, 0.14, 0.56, 50, 39, 0, 4.2, 0.26, 0.37, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("FORMULAÇÂO", "Outros", 89, 78.9, 26.2, 2.5, 0.8, 0.57, 19.2, 12.4, 0, 11.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Megalac", "Mineral", 95, 276, 0, 84, 10, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Uréia", "Mineral", 99, 0, 281, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Optigen", "Mineral", 98, 430, 256, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Calcário calcítico", "Mineral", 98, 0, 0, 0, 38, 0, 0, 0, 0, 98, 0.09, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Calcário Dolomítico", "Mineral", 99, 0, 0, 0, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Carbonato de cálcio", "Mineral", 100, 0, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Farinha de conchas", "Mineral", 99, 0, 0, 0, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Fosfato bicálcico", "Mineral", 99, 0, 0, 0, 23, 18, 0, 0, 0, 98, 1.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Bicarbonato de sódio", "Mineral", 99, 0, 0, 0, 0, 0, 0, 0, 0, 98, 0, 0, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2.8),
  seed("Óxido de Magnésio", "Mineral", 99, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 51, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  seed("Sal comum", "Mineral", 99, 0, 0, 0, 0, 0, 0, 0, 0, 98, 0, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
];
