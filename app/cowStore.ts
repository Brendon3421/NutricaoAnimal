import { useEffect, useState } from "react";
import { initialCows, type Cow } from "./data";

// Mesma estratégia de persistência do cadastro de ingredientes
// (app/ingredientStore.tsx): guarda no localStorage do navegador, recarrega
// no próximo acesso. Cobre tanto a edição da dieta da vaca (Rebanho/Cadastro)
// quanto a edição dos dados da vaca (peso, fase, saúde, etc.) — ambos passam
// pelo mesmo setCows() do CowContext em app/page.tsx, então um único
// storage já cobre os dois casos pedidos.
const STORAGE_KEY = "nutrileite.cows.v1";

function loadFromStorage(): Cow[] {
  if (typeof window === "undefined") return initialCows;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Cow[];
    }
  } catch {
    // localStorage indisponível ou dado corrompido — cai para o rebanho inicial
  }
  return initialCows;
}

function persist(list: Cow[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // sem espaço / navegador bloqueando localStorage — ignora silenciosamente
  }
}

/**
 * Hook com o mesmo formato de useState<Cow[]>, mas que carrega do
 * localStorage ao montar (só no cliente, evitando mismatch de hidratação) e
 * persiste toda alteração subsequente — cada chamada de setCows() (dieta,
 * peso, saúde, produção, notas, novo animal, remoção) já fica salva.
 */
export function usePersistedCows(): [Cow[], (list: Cow[]) => void] {
  const [cows, setCows] = useState<Cow[]>(initialCows);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCows(loadFromStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) persist(cows);
  }, [cows, loaded]);

  return [cows, setCows];
}
