import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { compressImageToBlob, uploadBlob } from "./storageUtils";
import SignedImage from "./SignedImage";
import { useAuth } from "./AuthContext";
import { Users, Plus, Search, Loader2, Camera, X, Trash2, Pencil, ChevronLeft, AlertTriangle } from "lucide-react";

const CLIENT_FIELDS = [
  { key: "nome", label: "Nome completo", type: "text" },
  { key: "cpf", label: "CPF", type: "text" },
  { key: "cpfDoc", label: "Foto do documento (CPF)", type: "photo" },
  { key: "rg", label: "RG", type: "text" },
  { key: "rgDoc", label: "Foto do documento (RG)", type: "photo" },
  { key: "telefone", label: "Telefone", type: "tel" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "endereco", label: "Endereço", type: "text" },
  { key: "enderecoDoc", label: "Foto do comprovante de endereço", type: "photo" },
  { key: "cnhDoc", label: "Foto da CNH", type: "photo" },
];

export function onlyDigits(v) {
  return (v || "").replace(/\D/g, "");
}

function emptyClient() {
  return { id: null, nome: "", cpf: "", cpfDoc: "", rg: "", rgDoc: "", telefone: "", email: "", endereco: "", enderecoDoc: "", cnhDoc: "" };
}

function Field({ f, value, onChange, missingKeys }) {
  const isErr = missingKeys.has(f.key);
  return (
    <div className="crs-field">
      <label>{f.label}{f.key !== "email" && f.key !== "rg" && <span className="req">*</span>}</label>
      <input type={f.type} className={isErr ? "err" : ""} value={value || ""} onChange={(e) => onChange(f.key, e.target.value)} />
    </div>
  );
}

function PhotoField({ label, value, onChange, locId, folder }) {
  const [busy, setBusy] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const blob = await compressImageToBlob(file);
      const path = await uploadBlob(locId, folder, blob);
      onChange(path);
    } catch {}
    setBusy(false);
    e.target.value = "";
  };
  return (
    <div className="crs-field">
      <label>{label}</label>
      {value ? (
        <div className="crs-thumb-wrap">
          <SignedImage path={value} className="crs-thumb" alt={label} style={{ maxWidth: 260 }} />
          <button className="crs-thumb-x" onClick={() => onChange("")}><X size={14} /></button>
        </div>
      ) : (
        <label className="crs-photo-btn">
          {busy ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
          {busy ? "Enviando..." : "Tirar foto / escolher arquivo"}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
        </label>
      )}
    </div>
  );
}

export default function ClientsPage() {
  const { perfil } = useAuth();
  const isAdmin = perfil?.role === "admin";
  const [view, setView] = useState("list"); // list | form
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [draft, setDraft] = useState(emptyClient());
  const [missing, setMissing] = useState([]);
  const [missingKeys, setMissingKeys] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("clientes").select("*").order("nome", { ascending: true });
    if (error) setNotice("Erro ao carregar clientes: " + error.message);
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtrados = rows.filter((c) => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return (c.nome || "").toLowerCase().includes(q) || onlyDigits(c.cpf).includes(onlyDigits(busca));
  });

  function novoCliente() {
    setDraft({ ...emptyClient(), id: crypto.randomUUID() });
    setMissing([]); setMissingKeys(new Set());
    setView("form");
  }
  function editarCliente(c) {
    setDraft({ ...c });
    setMissing([]); setMissingKeys(new Set());
    setView("form");
  }

  async function salvar() {
    const required = CLIENT_FIELDS.filter((f) => f.key !== "email" && f.key !== "rg" && f.key !== "rgDoc");
    const missingList = required.filter((f) => !draft[f.key] || String(draft[f.key]).trim() === "");
    if (missingList.length) {
      setMissing(missingList.map((m) => m.label));
      setMissingKeys(new Set(missingList.map((m) => m.key)));
      return;
    }
    setSaving(true);
    const cpfDigits = onlyDigits(draft.cpf);
    const payload = { ...draft, cpf: cpfDigits };
    const isNew = !rows.some((r) => r.id === draft.id);
    let error;
    if (isNew) {
      ({ error } = await supabase.from("clientes").upsert(payload, { onConflict: "cpf" }));
    } else {
      ({ error } = await supabase.from("clientes").update(payload).eq("id", draft.id));
    }
    setSaving(false);
    if (error) {
      if (error.code === "23505") setNotice("Já existe um cliente cadastrado com esse CPF.");
      else setNotice("Erro ao salvar: " + error.message);
      return;
    }
    setNotice("Cliente salvo com sucesso.");
    await load();
    setView("list");
  }

  async function excluir(id) {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
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
          <div className="crs-section-head"><Users size={16} /> Dados do cliente</div>
          <div className="crs-section-body">
            {CLIENT_FIELDS.map((f) => f.type === "photo" ? (
              <PhotoField key={f.key} label={f.label} value={draft[f.key]} onChange={(v) => setField(f.key, v)} locId={draft.id} folder={f.key} />
            ) : (
              <Field key={f.key} f={f} value={draft[f.key]} onChange={setField} missingKeys={missingKeys} />
            ))}
          </div>
        </div>
        <button className="crs-btn crs-btn-primary crs-btn-block" disabled={saving} onClick={salvar}>
          {saving ? <Loader2 size={16} className="spin" /> : <Users size={16} />} Salvar cliente
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
          <input type="text" placeholder="Buscar por nome ou CPF" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      {loading ? (
        <div className="crs-empty"><Loader2 className="spin" /> Carregando clientes...</div>
      ) : filtrados.length === 0 ? (
        <div className="crs-empty"><Users size={36} style={{ opacity: .4 }} /><p>Nenhum cliente encontrado.</p></div>
      ) : (
        filtrados.map((c) => (
          <div className="crs-ticket" key={c.id}>
            <div className="crs-ticket-top">
              <div className="crs-ticket-row">
                <div>
                  <div className="crs-ticket-name">{c.nome}</div>
                  <div className="crs-ticket-meta crs-mono">CPF {c.cpf} · {c.telefone || "sem telefone"}</div>
                </div>
              </div>
            </div>
            <div className="crs-ticket-actions">
              <button className="crs-btn crs-btn-outline" onClick={() => editarCliente(c)}><Pencil size={13} /> Editar</button>
              {isAdmin && <button className="crs-btn crs-btn-danger" onClick={() => excluir(c.id)}><Trash2 size={13} /></button>}
            </div>
          </div>
        ))
      )}
      <button className="crs-fab" onClick={novoCliente}><Plus size={26} /></button>
    </div>
  );
}
