import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./AuthContext";
import { toTitleCase } from "./formatters";
import { Car, Plus, Search, Loader2, Trash2, Pencil, ChevronLeft, AlertTriangle } from "lucide-react";

const VEHICLE_FIELDS = [
  { key: "placa", label: "Placa", type: "text" },
  { key: "marca", label: "Marca", type: "text", format: "title" },
  { key: "modelo", label: "Modelo", type: "text", format: "title" },
  { key: "cor", label: "Cor", type: "text", format: "title" },
  { key: "ano", label: "Ano", type: "text" },
];

function emptyVehicle() {
  return { id: null, placa: "", marca: "", modelo: "", cor: "", ano: "" };
}
function normPlaca(v) {
  return (v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function Field({ f, value, onChange, missingKeys }) {
  const isErr = missingKeys.has(f.key);
  return (
    <div className="crs-field">
      <label>{f.label}<span className="req">*</span></label>
      <input
        type={f.type} className={isErr ? "err" : ""} value={value || ""}
        onChange={(e) => onChange(f.key, f.key === "placa" ? normPlaca(e.target.value) : (f.format === "title" ? toTitleCase(e.target.value) : e.target.value))}
      />
    </div>
  );
}

export default function VehiclesPage() {
  const { perfil: me } = useAuth();
  const isAdmin = me?.role === "admin";
  const [view, setView] = useState("list");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [draft, setDraft] = useState(emptyVehicle());
  const [missing, setMissing] = useState([]);
  const [missingKeys, setMissingKeys] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("veiculos").select("*").order("placa", { ascending: true });
    if (error) setNotice("Erro ao carregar veículos: " + error.message);
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtrados = rows.filter((v) => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return normPlaca(v.placa).includes(normPlaca(busca)) || (v.modelo || "").toLowerCase().includes(q);
  });

  function novoVeiculo() { setDraft({ ...emptyVehicle(), id: crypto.randomUUID() }); setMissing([]); setMissingKeys(new Set()); setView("form"); }
  function editarVeiculo(v) { setDraft({ ...v }); setMissing([]); setMissingKeys(new Set()); setView("form"); }

  async function salvar() {
    const missingList = VEHICLE_FIELDS.filter((f) => f.key !== "ano" && (!draft[f.key] || String(draft[f.key]).trim() === ""));
    if (missingList.length) {
      setMissing(missingList.map((m) => m.label));
      setMissingKeys(new Set(missingList.map((m) => m.key)));
      return;
    }
    setSaving(true);
    const payload = { ...draft, placa: normPlaca(draft.placa) };
    const isNew = !rows.some((r) => r.id === draft.id);
    let error;
    if (isNew) ({ error } = await supabase.from("veiculos").upsert(payload, { onConflict: "placa" }));
    else ({ error } = await supabase.from("veiculos").update(payload).eq("id", draft.id));
    setSaving(false);
    if (error) {
      if (error.code === "23505") setNotice("Já existe um veículo cadastrado com essa placa.");
      else setNotice("Erro ao salvar: " + error.message);
      return;
    }
    setNotice("Veículo salvo com sucesso.");
    await load();
    setView("list");
  }

  async function excluir(id) {
    const { error } = await supabase.from("veiculos").delete().eq("id", id);
    if (error) { setNotice("Erro ao excluir: " + error.message); return; }
    await load();
  }

  const setField = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  if (view === "form") {
    return (
      <div className="crs-main">
        {notice && <div className="crs-errbox" style={{ background: "var(--ok-bg)", borderColor: "var(--ok)", color: "var(--ok)" }} onClick={() => setNotice("")}>{notice}</div>}
        {missing.length > 0 && (
          <div className="crs-errbox">
            <b><AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />Preencha os campos obrigatórios:</b>
            {missing.join(" · ")}
          </div>
        )}
        <button className="crs-btn crs-btn-outline" style={{ marginBottom: 16 }} onClick={() => setView("list")}><ChevronLeft size={14} /> Voltar</button>
        <div className="crs-section">
          <div className="crs-section-head"><Car size={16} /> Dados do veículo</div>
          <div className="crs-section-body">
            {VEHICLE_FIELDS.map((f) => <Field key={f.key} f={f} value={draft[f.key]} onChange={setField} missingKeys={missingKeys} />)}
          </div>
        </div>
        <button className="crs-btn crs-btn-primary crs-btn-block" disabled={saving} onClick={salvar}>
          {saving ? <Loader2 size={16} className="spin" /> : <Car size={16} />} Salvar veículo
        </button>
      </div>
    );
  }

  return (
    <div className="crs-main">
      {notice && <div className="crs-errbox" style={{ background: "var(--ok-bg)", borderColor: "var(--ok)", color: "var(--ok)" }} onClick={() => setNotice("")}>{notice}</div>}
      <div className="crs-field" style={{ marginBottom: 18 }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input type="text" placeholder="Buscar por placa ou modelo" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      {loading ? (
        <div className="crs-empty"><Loader2 className="spin" /> Carregando veículos...</div>
      ) : filtrados.length === 0 ? (
        <div className="crs-empty"><Car size={36} style={{ opacity: .4 }} /><p>Nenhum veículo encontrado.</p></div>
      ) : (
        filtrados.map((v) => (
          <div className="crs-ticket" key={v.id}>
            <div className="crs-ticket-top">
              <div className="crs-ticket-row">
                <div>
                  <div className="crs-ticket-name crs-mono">{v.placa}</div>
                  <div className="crs-ticket-meta">{v.marca} {v.modelo} {v.cor ? `· ${v.cor}` : ""} {v.ano ? `· ${v.ano}` : ""}</div>
                </div>
              </div>
            </div>
            <div className="crs-ticket-actions">
              <button className="crs-btn crs-btn-outline" onClick={() => editarVeiculo(v)}><Pencil size={13} /> Editar</button>
              {isAdmin && <button className="crs-btn crs-btn-danger" onClick={() => excluir(v.id)}><Trash2 size={13} /></button>}
            </div>
          </div>
        ))
      )}
      <button className="crs-fab" onClick={novoVeiculo}><Plus size={26} /></button>
    </div>
  );
}
