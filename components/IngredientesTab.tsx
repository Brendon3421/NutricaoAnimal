"use client";
import { useState } from "react";
import { useIngredients } from "@/app/ingredientStore";
import {
  emptyIngredient, getCNF, ingredientCategories, FIELD_GROUPS,
  type Ingredient,
} from "@/app/ingredients";

type Mode = "list" | "new" | "edit";

export default function IngredientesTab() {
  const { ingredients, addIngredient, updateIngredient, removeIngredient } = useIngredients();
  const [mode, setMode] = useState<Mode>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>("Todos");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<Ingredient>(emptyIngredient());

  function openNew() {
    setForm(emptyIngredient());
    setEditId(null);
    setMode("new");
  }
  function openEdit(ing: Ingredient) {
    setForm({ ...ing });
    setEditId(ing.id);
    setMode("edit");
  }
  function cancel() {
    setMode("list");
    setEditId(null);
  }

  function setField<K extends keyof Ingredient>(key: K, value: Ingredient[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function save() {
    if (!form.name.trim()) return alert("Digite o nome do ingrediente.");
    if (mode === "new") {
      addIngredient(form);
    } else if (editId) {
      updateIngredient(editId, form);
    }
    setMode("list");
    setEditId(null);
  }

  function doDelete(id: string) {
    removeIngredient(id);
    setConfirmDel(null);
  }

  const filtered = ingredients.filter(i => {
    if (filterCat !== "Todos" && i.category !== filterCat) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const numInput = (key: keyof Ingredient, label: string, suffix: string) => (
    <div key={key}>
      <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
        {label} <span style={{ color: "#9CA3AF" }}>({suffix})</span>
      </label>
      <input
        className="field"
        type="number"
        step="any"
        value={(form[key] as number) ?? 0}
        onChange={e => setField(key, Number(e.target.value) as Ingredient[typeof key])}
      />
    </div>
  );

  // ────────────────────────────────────────────
  // LIST VIEW
  // ────────────────────────────────────────────
  if (mode === "list") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Cadastro de ingredientes</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {ingredients.length} ingrediente{ingredients.length !== 1 ? "s" : ""} cadastrado{ingredients.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Novo ingrediente</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="field" style={{ maxWidth: 240 }}
            placeholder="Buscar por nome..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="field" style={{ maxWidth: 180 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="Todos">Todas categorias</option>
            {ingredientCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ingrediente</th><th>Categoria</th><th>MS %</th><th>PB %</th>
                <th>NDT %</th><th>CNF % <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(calc.)</span></th>
                <th>R$/kg</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ing => (
                <tr key={ing.id}>
                  <td style={{ fontWeight: 500, fontSize: 12 }}>{ing.name}</td>
                  <td><span className="badge badge-cyan" style={{ fontSize: 10 }}>{ing.category}</span></td>
                  <td style={{ fontSize: 12 }}>{ing.ms}</td>
                  <td style={{ fontSize: 12 }}>{ing.pb}</td>
                  <td style={{ fontSize: 12 }}>{ing.ndt}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{getCNF(ing).toFixed(1)}</td>
                  <td style={{ fontSize: 12 }}>R$ {ing.costPerKg.toFixed(2)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => openEdit(ing)}>✏️ Editar</button>
                      <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setConfirmDel(ing.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌾</div>
              <div style={{ fontSize: 13 }}>Nenhum ingrediente encontrado.</div>
            </div>
          )}
        </div>

        {confirmDel && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
            <div className="card" style={{ width: 380, padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Confirmar exclusão</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                Excluir <b>{ingredients.find(i => i.id === confirmDel)?.name}</b>? Dietas que já usam este ingrediente vão deixar de encontrá-lo.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => doDelete(confirmDel)}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────
  // FORM VIEW (novo / editar)
  // ────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={cancel}>← Voltar</button>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{mode === "new" ? "Novo ingrediente" : `Editando: ${form.name}`}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Campos com "(calc.)" são calculados automaticamente e não podem ser digitados.</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={cancel}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>💾 Salvar ingrediente</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">📋 Informações básicas</div>
        <div className="card-body">
          <div className="grid-3">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Nome do ingrediente *</label>
              <input className="field" placeholder="Ex: Silagem de milho" value={form.name} onChange={e => setField("name", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Categoria</label>
              <select className="field" value={form.category} onChange={e => setField("category", e.target.value)}>
                {ingredientCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Unidade</label>
              <input className="field" value={form.unit} onChange={e => setField("unit", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {FIELD_GROUPS.map(group => (
        <div className="card" key={group.title}>
          <div className="card-header">{group.icon} {group.title}</div>
          <div className="card-body">
            <div className="grid-3" style={{ rowGap: 12 }}>
              {group.fields.map(f => numInput(f.key, f.label, f.suffix))}
              {group.title === "Composição nutricional" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                    CNF — Carboidr. não fibrosos <span style={{ color: "#9CA3AF" }}>(%)</span>
                  </label>
                  <input
                    className="field" disabled
                    style={{ background: "#F3F4F6", color: "#6B7280", fontWeight: 600 }}
                    value={`${getCNF(form).toFixed(1)}  (calc.)`}
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="card">
        <div className="card-header">💰 Valores comerciais</div>
        <div className="card-body">
          <div className="grid-3">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Preço (R$/kg)</label>
              <input className="field" type="number" step="any" value={form.costPerKg} onChange={e => setField("costPerKg", Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
        <button className="btn btn-ghost" onClick={cancel}>Cancelar</button>
        <button className="btn btn-primary" style={{ padding: "10px 24px" }} onClick={save}>💾 Salvar ingrediente</button>
      </div>
    </div>
  );
}
