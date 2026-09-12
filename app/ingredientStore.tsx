"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Ingredient, SEED_INGREDIENTS } from "./ingredients";

// v2: dados de seed foram corrigidos (extraídos direto da planilha real —
// v1 tinha valores aproximados/errados migrados do app antigo, ex.: MS da
// "Silagem de milho 1" estava 35% quando a planilha traz 40%). Trocar a
// chave força o reseed com os valores certos; quem já tinha cadastro
// próprio em v1 não perde nada — o dado antigo continua salvo sob a chave
// v1, só não é mais lido automaticamente.
const STORAGE_KEY = "nutrileite.ingredients.v2";

function loadFromStorage(): Ingredient[] {
  if (typeof window === "undefined") return SEED_INGREDIENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Ingredient[];
    }
  } catch {
    // localStorage indisponível ou dado corrompido — cai para o seed
  }
  return SEED_INGREDIENTS;
}

function persist(list: Ingredient[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // sem espaço / navegador bloqueando localStorage — ignora silenciosamente
  }
}

type IngredientCtx = {
  ingredients: Ingredient[];
  addIngredient: (ing: Omit<Ingredient, "id">) => Ingredient;
  updateIngredient: (id: string, patch: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;
};

const IngredientContext = createContext<IngredientCtx>({
  ingredients: [],
  addIngredient: () => {
    throw new Error("useIngredients() usado fora de <IngredientProvider>");
  },
  updateIngredient: () => {},
  removeIngredient: () => {},
});

export function useIngredients() {
  return useContext(IngredientContext);
}

export function IngredientProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(SEED_INGREDIENTS);
  const [loaded, setLoaded] = useState(false);

  // Carrega do localStorage só no cliente (evita mismatch de hidratação).
  useEffect(() => {
    setIngredients(loadFromStorage());
    setLoaded(true);
  }, []);

  // Persiste toda alteração, exceto o carregamento inicial.
  useEffect(() => {
    if (loaded) persist(ingredients);
  }, [ingredients, loaded]);

  function addIngredient(ing: Omit<Ingredient, "id">): Ingredient {
    const newIng: Ingredient = { ...ing, id: `ing-${Date.now()}` };
    setIngredients(list => [...list, newIng]);
    return newIng;
  }

  function updateIngredient(id: string, patch: Partial<Ingredient>) {
    setIngredients(list => list.map(i => (i.id === id ? { ...i, ...patch, id } : i)));
  }

  function removeIngredient(id: string) {
    setIngredients(list => list.filter(i => i.id !== id));
  }

  return (
    <IngredientContext.Provider value={{ ingredients, addIngredient, updateIngredient, removeIngredient }}>
      {children}
    </IngredientContext.Provider>
  );
}
