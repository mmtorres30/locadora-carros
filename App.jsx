import React, { useState, useEffect, useRef } from "react";
import {
  Car, Camera, PenTool, Check, X, Trash2, FileText, User,
  ClipboardList, RotateCcw, Plus, Printer, AlertTriangle,
  ChevronLeft, Loader2, Undo2, ShieldCheck,
} from "lucide-react";
import { supabase } from "./supabaseClient";

/* ============================================================
   TOKENS / STYLE
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

*{ box-sizing:border-box; }
html,body,#root{ height:100%; }

.crs-app{
  --ink:#1C2321;
  --paper:#FAF9F6;
  --paper-2:#F1EEE6;
  --asphalt:#26282A;
  --asphalt-2:#33363A;
  --signal:#F4B400;
  --signal-ink:#3A2C00;
  --line:#DAD5C8;
  --ok:#3F7D58;
  --ok-bg:#E7F1EA;
  --alert:#B3261E;
  --alert-bg:#FBE9E7;
  font-family:'Inter',sans-serif;
  color:var(--ink);
  background:var(--paper);
  min-height:100vh;
  width:100%;
}
.crs-display{ font-family:'Oswald',sans-serif; letter-spacing:.02em; text-transform:uppercase; }
.crs-mono{ font-family:'JetBrains Mono',monospace; }

.crs-topbar{
  background:var(--asphalt); color:var(--paper); padding:16px 18px;
  display:flex; align-items:center; gap:10px; position:sticky; top:0; z-index:20;
  border-bottom:4px solid var(--signal);
}
.crs-topbar h1{ font-size:15px; margin:0; }
.crs-topbar .sub{ font-size:11px; opacity:.65; margin-top:1px; }

.crs-steps{ display:flex; gap:6px; padding:10px 16px; background:var(--paper-2); border-bottom:1px solid var(--line); overflow-x:auto; }
.crs-step{ font-size:11px; padding:5px 10px; border-radius:999px; white-space:nowrap; background:#fff; border:1px solid var(--line); color:#8a8578; font-weight:600; }
.crs-step.active{ background:var(--signal); color:var(--signal-ink); border-color:var(--signal); }
.crs-step.done{ background:var(--ok); color:#fff; border-color:var(--ok); }

.crs-main{ padding:16px; max-width:640px; margin:0 auto; padding-bottom:100px; }

.crs-section{ background:#fff; border:1px solid var(--line); border-radius:10px; margin-bottom:16px; overflow:hidden; }
.crs-section-head{ background:var(--asphalt); color:#fff; padding:10px 14px; display:flex; align-items:center; gap:8px; font-size:13px; }
.crs-section-body{ padding:16px; display:grid; gap:14px; }

.crs-field label{ display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:#4b4b46; }
.crs-field label .req{ color:var(--alert); margin-left:2px; }
.crs-field input[type=text], .crs-field input[type=email], .crs-field input[type=tel],
.crs-field input[type=date], .crs-field input[type=time]{
  width:100%; border:1.5px solid var(--line); border-radius:8px;
  padding:10px 12px; font-size:14px; font-family:inherit; background:var(--paper);
}
.crs-field input.err{ border-color:var(--alert); background:var(--alert-bg); }

.crs-photo-btn{
  display:flex; align-items:center; justify-content:center; gap:8px;
  border:1.5px dashed var(--line); border-radius:8px; padding:14px; cursor:pointer;
  font-size:13px; font-weight:600; color:#4b4b46; background:var(--paper);
}
.crs-photo-btn.err{ border-color:var(--alert); background:var(--alert-bg); color:var(--alert); }
.crs-photo-btn:hover{ background:var(--paper-2); }
.crs-thumb-wrap{ position:relative; display:inline-block; }
.crs-thumb{ width:100%; max-width:260px; border-radius:8px; border:1.5px solid var(--line); display:block; }
.crs-thumb-x{
  position:absolute; top:-8px; right:-8px; background:var(--alert); color:#fff; border-radius:999px;
  width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer;
}

.crs-avarias-grid{ display:flex; gap:10px; flex-wrap:wrap; }
.crs-avarias-grid .crs-thumb{ width:100px; height:100px; object-fit:cover; max-width:none; }

.crs-sig-box{ border:1.5px dashed var(--line); border-radius:8px; background:var(--paper); overflow:hidden; }
.crs-sig-box canvas{ display:block; width:100%; touch-action:none; background:#fff; }
.crs-sig-tools{ display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--paper-2); font-size:11px; color:#8a8578; }

.crs-btn{
  border:none; border-radius:8px; padding:12px 18px; font-size:13px; font-weight:700;
  cursor:pointer; display:inline-flex; align-items:center; gap:8px; font-family:'Inter',sans-serif;
}
.crs-btn-primary{ background:var(--signal); color:var(--signal-ink); }
.crs-btn-dark{ background:var(--asphalt); color:#fff; }
.crs-btn-outline{ background:transparent; border:1.5px solid var(--line); color:var(--ink); }
.crs-btn-danger{ background:var(--alert-bg); color:var(--alert); }
.crs-btn:disabled{ opacity:.5; cursor:not-allowed; }
.crs-btn-block{ width:100%; justify-content:center; }

.crs-footerbar{
  position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid var(--line);
  padding:12px 16px; display:flex; gap:10px; z-index:30; max-width:640px; margin:0 auto;
}

.crs-errbox{ background:var(--alert-bg); border:1.5px solid var(--alert); color:var(--alert); border-radius:8px; padding:12px 14px; font-size:12.5px; margin-bottom:14px; cursor:pointer; }
.crs-errbox b{ display:block; margin-bottom:4px; }

.crs-empty{ text-align:center; padding:60px 20px; color:#8a8578; }

.crs-ticket{ background:#fff; border:1px solid var(--line); border-radius:10px; margin-bottom:14px; border-left:6px dashed var(--line); overflow:hidden; }
.crs-ticket-top{ padding:14px 16px 8px; }
.crs-ticket-row{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px;}
.crs-badge{ font-size:10px; font-weight:700; padding:3px 9px; border-radius:999px; text-transform:uppercase; letter-spacing:.05em; transform:rotate(-2deg); display:inline-block; }
.crs-badge.aberta{ background:var(--signal); color:var(--signal-ink); }
.crs-badge.fechada{ background:var(--ok-bg); color:var(--ok); }
.crs-ticket-name{ font-size:15px; font-weight:700; }
.crs-ticket-meta{ font-size:11.5px; color:#8a8578; margin-top:2px; }
.crs-ticket-actions{ display:flex; gap:8px; padding:10px 16px 14px; border-top:1px dashed var(--line); margin-top:6px; flex-wrap:wrap; }

.crs-fab{
  position:fixed; bottom:20px; right:20px; background:var(--signal); color:var(--signal-ink);
  border:none; width:56px; height:56px; border-radius:999px; display:flex; align-items:center;
  justify-content:center; box-shadow:0 6px 18px rgba(0,0,0,.25); cursor:pointer; z-index:30;
}

.crs-contract{ background:#fff; padding:6px; }
.crs-contract h2{ font-size:16px; border-bottom:2px solid var(--asphalt); padding-bottom:6px; margin-top:26px; }
.crs-contract .grid2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12.5px; margin-top:10px;}
.crs-contract .kv b{ display:block; font-size:10px; color:#8a8578; text-transform:uppercase; letter-spacing:.04em;}
.crs-contract .photos{ display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;}
.crs-contract .photos img{ width:120px; height:90px; object-fit:cover; border:1px solid var(--line); border-radius:6px;}
.crs-contract .sig-img{ height:70px; border:1px solid var(--line); border-radius:6px; background:#fff; }

.spin{ animation:crs-spin 1s linear infinite; }
@keyframes crs-spin{ from{ transform:rotate(0deg);} to{ transform:rotate(360deg);} }

@media print{
  .no-print{ display:none !important; }
  body{ background:#fff; }
}
`;

/* ============================================================
   HELPERS
   ============================================================ */
const BUCKET = "documentos";

function compressImageToBlob(file, maxDim = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadBlob(locId, folder, blob, ext = "jpg") {
  const path = `${locId}/${folder}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

const MOTORISTA_FIELDS = [
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

const VEICULO_FIELDS = [
  { key: "placa", label: "Placa", type: "text" },
  { key: "marca", label: "Marca", type: "text" },
  { key: "modelo", label: "Modelo", type: "text" },
  { key: "cor", label: "Cor", type: "text" },
  { key: "ano", label: "Ano", type: "text" },
];

const CHECK_FIELDS = [
  { key: "data", label: "Data", type: "date" },
  { key: "horario", label: "Horário", type: "time" },
  { key: "km", label: "Quilometragem (Km)", type: "text" },
  { key: "fotoKm", label: "Foto do odômetro (Km)", type: "photo" },
  { key: "fotoPlaca", label: "Foto da placa", type: "photo" },
  { key: "fotoPainel", label: "Foto do painel", type: "photo" },
  { key: "fotoRosto", label: "Foto de rosto do motorista", type: "photo" },
];

function emptyDraft() {
  return {
    id: crypto.randomUUID(),
    status: "aberta",
    motorista: { nome: "", cpf: "", cpfDoc: "", rg: "", rgDoc: "", telefone: "", email: "", endereco: "", enderecoDoc: "", cnhDoc: "" },
    veiculo: { placa: "", marca: "", modelo: "", cor: "", ano: "" },
    retirada: { data: "", horario: "", km: "", fotoKm: "", fotoPlaca: "", fotoPainel: "", fotoRosto: "", assinatura: "", semAvarias: false, fotoAvarias: [] },
    devolucao: { data: "", horario: "", km: "", fotoKm: "", fotoPlaca: "", fotoPainel: "", fotoRosto: "", assinatura: "", semAvarias: false, fotoAvarias: [] },
  };
}

function validateGroup(obj, fields, extra = []) {
  const missing = [];
  fields.forEach((f) => { if (!obj[f.key] || String(obj[f.key]).trim() === "") missing.push(f); });
  extra.forEach((e) => { if (e.test) missing.push({ key: e.key, label: e.label }); });
  return missing;
}

/* ============================================================
   SMALL UI PIECES
   ============================================================ */
function Field({ f, value, onChange, missingKeys }) {
  const isErr = missingKeys.has(f.key);
  return (
    <div className="crs-field">
      <label>{f.label}<span className="req">*</span></label>
      <input
        type={f.type}
        className={isErr ? "err" : ""}
        value={value || ""}
        onChange={(e) => onChange(f.key, e.target.value)}
      />
    </div>
  );
}

function PhotoField({ label, required = true, value, onChange, missing, locId, folder }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr("");
    try {
      const blob = await compressImageToBlob(file);
      const url = await uploadBlob(locId, folder, blob);
      onChange(url);
    } catch (ex) {
      setErr("Falha ao enviar a foto. Tente novamente.");
    }
    setBusy(false);
    e.target.value = "";
  };
  return (
    <div className="crs-field">
      <label>{label}{required && <span className="req">*</span>}</label>
      {value ? (
        <div className="crs-thumb-wrap">
          <img src={value} className="crs-thumb" alt={label} />
          <button className="crs-thumb-x" onClick={() => onChange("")}><X size={14} /></button>
        </div>
      ) : (
        <label className={`crs-photo-btn ${missing ? "err" : ""}`}>
          {busy ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
          {busy ? "Enviando..." : "Tirar foto / escolher arquivo"}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
        </label>
      )}
      {err && <div style={{ color: "var(--alert)", fontSize: 11, marginTop: 4 }}>{err}</div>}
    </div>
  );
}

function AvariasField({ group, onChangeGroup, missing, locId }) {
  const [busy, setBusy] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const blob = await compressImageToBlob(file, 700, 0.55);
      const url = await uploadBlob(locId, "avaria", blob);
      onChangeGroup({ ...group, fotoAvarias: [...group.fotoAvarias, url] });
    } catch {}
    setBusy(false);
    e.target.value = "";
  };
  const removeAt = (i) => onChangeGroup({ ...group, fotoAvarias: group.fotoAvarias.filter((_, idx) => idx !== i) });

  return (
    <div className="crs-field">
      <label>Fotos de avarias existentes{!group.semAvarias && <span className="req">*</span>}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12.5 }}>
        <input
          type="checkbox"
          checked={group.semAvarias}
          onChange={(e) => onChangeGroup({ ...group, semAvarias: e.target.checked, fotoAvarias: e.target.checked ? [] : group.fotoAvarias })}
        />
        Carro sem avarias visíveis
      </div>
      {!group.semAvarias && (
        <div className="crs-avarias-grid">
          {group.fotoAvarias.map((src, i) => (
            <div className="crs-thumb-wrap" key={i}>
              <img src={src} className="crs-thumb" alt={`avaria-${i}`} />
              <button className="crs-thumb-x" onClick={() => removeAt(i)}><X size={12} /></button>
            </div>
          ))}
          <label className={`crs-photo-btn ${missing ? "err" : ""}`} style={{ width: 100, height: 100 }}>
            {busy ? <Loader2 size={16} className="spin" /> : <Plus size={18} />}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
          </label>
        </div>
      )}
    </div>
  );
}

function SignaturePad({ value, onChange, locId }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = 150 * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1C2321";
    if (value) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.clientWidth, 150);
      img.src = value;
    }
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };
  const start = (e) => { drawing.current = true; last.current = pos(e); };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  };
  const end = async () => {
    if (!drawing.current) return;
    drawing.current = false;
    setSaving(true);
    canvasRef.current.toBlob(async (blob) => {
      try {
        const url = await uploadBlob(locId, "assinatura", blob, "png");
        onChange(url);
      } catch {}
      setSaving(false);
    }, "image/png");
  };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="crs-field">
      <label>Assinatura do motorista<span className="req">*</span></label>
      <div className="crs-sig-box">
        <canvas ref={canvasRef} onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
        <div className="crs-sig-tools">
          <span>{saving ? "Salvando assinatura..." : "Assine com o dedo ou o mouse"}</span>
          <button className="crs-btn crs-btn-outline" style={{ padding: "4px 10px", fontSize: 11 }} onClick={clear}>
            <RotateCcw size={12} /> Limpar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [view, setView] = useState("home");
  const [index, setIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(emptyDraft());
  const [missing, setMissing] = useState([]);
  const [missingKeys, setMissingKeys] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [contractRecord, setContractRecord] = useState(null);

  useEffect(() => { loadIndex(); }, []);

  async function loadIndex() {
    setLoading(true);
    const { data, error } = await supabase
      .from("locacoes")
      .select("id,status,motorista,veiculo,retirada")
      .order("created_at", { ascending: false });
    if (error) { setNotice("Erro ao carregar histórico: " + error.message); setIndex([]); }
    else {
      setIndex(data.map((r) => ({
        id: r.id, status: r.status,
        nome: r.motorista?.nome, placa: r.veiculo?.placa, modelo: r.veiculo?.modelo,
        dataRetirada: r.retirada?.data,
      })));
    }
    setLoading(false);
  }

  async function loadRecord(id) {
    const { data, error } = await supabase.from("locacoes").select("*").eq("id", id).single();
    if (error || !data) return null;
    return {
      id: data.id, status: data.status,
      motorista: data.motorista, veiculo: data.veiculo,
      retirada: data.retirada, devolucao: data.devolucao,
    };
  }

  function iniciarNovaLocacao() {
    setDraft(emptyDraft());
    setMissing([]); setMissingKeys(new Set());
    setView("cadastro");
  }

  function avancarParaRetirada() {
    const missM = validateGroup(draft.motorista, MOTORISTA_FIELDS);
    const missV = validateGroup(draft.veiculo, VEICULO_FIELDS);
    const all = [...missM, ...missV];
    if (all.length) { setMissing(all.map((m) => m.label)); setMissingKeys(new Set(all.map((m) => m.key))); return; }
    setMissing([]); setMissingKeys(new Set());
    setView("retirada");
  }

  async function finalizarRetirada() {
    const missC = validateGroup(draft.retirada, CHECK_FIELDS);
    const extra = [
      { test: !draft.retirada.assinatura, key: "assinatura", label: "Assinatura do motorista" },
      { test: !draft.retirada.semAvarias && draft.retirada.fotoAvarias.length === 0, key: "fotoAvarias", label: "Foto de avarias (ou marcar 'sem avarias')" },
    ];
    const all = [...missC, ...validateGroup(draft.retirada, [], extra)];
    if (all.length) { setMissing(all.map((m) => m.label)); setMissingKeys(new Set(all.map((m) => m.key))); return; }

    setSaving(true);
    const { error } = await supabase.from("locacoes").upsert({
      id: draft.id, status: "aberta",
      motorista: draft.motorista, veiculo: draft.veiculo,
      retirada: draft.retirada, devolucao: draft.devolucao,
    });
    setSaving(false);
    if (error) { setNotice("Erro ao salvar: " + error.message); return; }
    setNotice("Locação registrada com sucesso.");
    await loadIndex();
    setView("home");
  }

  async function abrirDevolucao(id) {
    const rec = await loadRecord(id);
    if (!rec) { setNotice("Não foi possível carregar essa locação."); return; }
    setDraft(rec);
    setMissing([]); setMissingKeys(new Set());
    setView("devolucao");
  }

  async function finalizarDevolucao() {
    const missC = validateGroup(draft.devolucao, CHECK_FIELDS);
    const extra = [
      { test: !draft.devolucao.assinatura, key: "assinatura", label: "Assinatura do motorista" },
      { test: !draft.devolucao.semAvarias && draft.devolucao.fotoAvarias.length === 0, key: "fotoAvarias", label: "Foto de avarias (ou marcar 'sem avarias')" },
    ];
    const all = [...missC, ...validateGroup(draft.devolucao, [], extra)];
    if (all.length) { setMissing(all.map((m) => m.label)); setMissingKeys(new Set(all.map((m) => m.key))); return; }

    setSaving(true);
    const { error } = await supabase.from("locacoes").update({
      status: "fechada", devolucao: draft.devolucao,
    }).eq("id", draft.id);
    setSaving(false);
    if (error) { setNotice("Erro ao salvar: " + error.message); return; }
    setNotice("Devolução registrada. Locação encerrada.");
    await loadIndex();
    setView("home");
  }

  async function verContrato(id) {
    const rec = await loadRecord(id);
    if (!rec) { setNotice("Não foi possível carregar essa locação."); return; }
    setContractRecord(rec);
    setView("contrato");
  }

  async function excluir(id) {
    const { error } = await supabase.from("locacoes").delete().eq("id", id);
    if (error) { setNotice("Erro ao excluir: " + error.message); return; }
    await loadIndex();
  }

  const setMotorista = (k, v) => setDraft((d) => ({ ...d, motorista: { ...d.motorista, [k]: v } }));
  const setVeiculo = (k, v) => setDraft((d) => ({ ...d, veiculo: { ...d.veiculo, [k]: v } }));
  const setRetirada = (k, v) => setDraft((d) => ({ ...d, retirada: { ...d.retirada, [k]: v } }));
  const setDevolucao = (k, v) => setDraft((d) => ({ ...d, devolucao: { ...d.devolucao, [k]: v } }));

  return (
    <div className="crs-app">
      <style>{CSS}</style>

      {view !== "contrato" && (
        <div className="crs-topbar no-print">
          {view !== "home" && (
            <button onClick={() => setView("home")} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <Car size={20} />
          <div>
            <h1 className="crs-display">Locação de Carros</h1>
            <div className="sub">
              {view === "home" && "Histórico de locações"}
              {view === "cadastro" && "Cadastro do motorista e veículo"}
              {view === "retirada" && "Checklist de retirada"}
              {view === "devolucao" && "Checklist de devolução"}
            </div>
          </div>
        </div>
      )}

      {(view === "cadastro" || view === "retirada" || view === "devolucao") && (
        <div className="crs-steps no-print">
          <span className={`crs-step ${view === "cadastro" ? "active" : "done"}`}>1 · Motorista &amp; Veículo</span>
          <span className={`crs-step ${view === "retirada" ? "active" : view === "devolucao" ? "done" : ""}`}>2 · Retirada</span>
          <span className={`crs-step ${view === "devolucao" ? "active" : ""}`}>3 · Devolução</span>
        </div>
      )}

      <div className="crs-main">
        {notice && <div className="crs-errbox" style={{ background: "var(--ok-bg)", borderColor: "var(--ok)", color: "var(--ok)" }} onClick={() => setNotice("")}>{notice}</div>}

        {missing.length > 0 && (
          <div className="crs-errbox">
            <b><AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />Preencha os campos obrigatórios:</b>
            {missing.join(" · ")}
          </div>
        )}

        {view === "home" && (
          <>
            {loading ? (
              <div className="crs-empty"><Loader2 className="spin" /> Carregando histórico...</div>
            ) : index.length === 0 ? (
              <div className="crs-empty">
                <ClipboardList size={36} style={{ opacity: .4 }} />
                <p>Nenhuma locação registrada ainda.<br />Toque em "+" para começar.</p>
              </div>
            ) : (
              index.map((it) => (
                <div className="crs-ticket" key={it.id}>
                  <div className="crs-ticket-top">
                    <div className="crs-ticket-row">
                      <div>
                        <div className="crs-ticket-name">{it.nome || "(sem nome)"}</div>
                        <div className="crs-ticket-meta crs-mono">{it.placa || "----"} · {it.modelo || "-"} · retirada {it.dataRetirada || "-"}</div>
                      </div>
                      <span className={`crs-badge ${it.status}`}>{it.status === "aberta" ? "Em andamento" : "Concluída"}</span>
                    </div>
                  </div>
                  <div className="crs-ticket-actions">
                    {it.status === "aberta" && (
                      <button className="crs-btn crs-btn-primary" onClick={() => abrirDevolucao(it.id)}>
                        <Undo2 size={14} /> Registrar devolução
                      </button>
                    )}
                    <button className="crs-btn crs-btn-outline" onClick={() => verContrato(it.id)}>
                      <FileText size={14} /> Ver contrato
                    </button>
                    <button className="crs-btn crs-btn-danger" onClick={() => excluir(it.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
            <button className="crs-fab" onClick={iniciarNovaLocacao}><Plus size={26} /></button>
          </>
        )}

        {view === "cadastro" && (
          <>
            <div className="crs-section">
              <div className="crs-section-head"><User size={16} /> Dados do motorista</div>
              <div className="crs-section-body">
                {MOTORISTA_FIELDS.map((f) =>
                  f.type === "photo" ? (
                    <PhotoField key={f.key} label={f.label} value={draft.motorista[f.key]} onChange={(v) => setMotorista(f.key, v)} missing={missingKeys.has(f.key)} locId={draft.id} folder={f.key} />
                  ) : (
                    <Field key={f.key} f={f} value={draft.motorista[f.key]} onChange={setMotorista} missingKeys={missingKeys} />
                  )
                )}
              </div>
            </div>
            <div className="crs-section">
              <div className="crs-section-head"><Car size={16} /> Dados do carro</div>
              <div className="crs-section-body">
                {VEICULO_FIELDS.map((f) => (
                  <Field key={f.key} f={f} value={draft.veiculo[f.key]} onChange={setVeiculo} missingKeys={missingKeys} />
                ))}
              </div>
            </div>
            <div className="crs-footerbar no-print">
              <button className="crs-btn crs-btn-primary crs-btn-block" onClick={avancarParaRetirada}>
                Continuar para retirada <Check size={16} />
              </button>
            </div>
          </>
        )}

        {(view === "retirada" || view === "devolucao") && (() => {
          const groupKey = view === "retirada" ? "retirada" : "devolucao";
          const group = draft[groupKey];
          const setGroup = view === "retirada" ? setRetirada : setDevolucao;
          const onChangeGroup = (g) => setDraft((d) => ({ ...d, [groupKey]: g }));
          return (
            <>
              <div className="crs-section">
                <div className="crs-section-head"><ClipboardList size={16} /> {view === "retirada" ? "Checklist de retirada do carro" : "Checklist de devolução do carro"}</div>
                <div className="crs-section-body">
                  {CHECK_FIELDS.filter((f) => f.type !== "photo").map((f) => (
                    <Field key={f.key} f={f} value={group[f.key]} onChange={setGroup} missingKeys={missingKeys} />
                  ))}
                  {CHECK_FIELDS.filter((f) => f.type === "photo").map((f) => (
                    <PhotoField key={f.key} label={f.label} value={group[f.key]} onChange={(v) => setGroup(f.key, v)} missing={missingKeys.has(f.key)} locId={draft.id} folder={`${groupKey}-${f.key}`} />
                  ))}
                  <AvariasField group={group} onChangeGroup={onChangeGroup} missing={missingKeys.has("fotoAvarias")} locId={draft.id} />
                </div>
              </div>
              <div className="crs-section">
                <div className="crs-section-head"><PenTool size={16} /> Assinatura</div>
                <div className="crs-section-body">
                  <SignaturePad value={group.assinatura} onChange={(v) => setGroup("assinatura", v)} locId={draft.id} />
                </div>
              </div>
              <div className="crs-footerbar no-print">
                <button className="crs-btn crs-btn-primary crs-btn-block" disabled={saving} onClick={view === "retirada" ? finalizarRetirada : finalizarDevolucao}>
                  {saving ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
                  {view === "retirada" ? "Concluir retirada" : "Concluir devolução"}
                </button>
              </div>
            </>
          );
        })()}

        {view === "contrato" && contractRecord && <ContractView record={contractRecord} onBack={() => setView("home")} />}
      </div>
    </div>
  );
}

function ContractView({ record, onBack }) {
  const m = record.motorista, v = record.veiculo, r = record.retirada, d = record.devolucao;
  const hasDevolucao = record.status === "fechada";
  return (
    <div className="crs-contract">
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button className="crs-btn crs-btn-outline" onClick={onBack}><ChevronLeft size={14} /> Voltar</button>
        <button className="crs-btn crs-btn-dark" onClick={() => window.print()}><Printer size={14} /> Imprimir / Salvar PDF</button>
      </div>
      <div className="crs-display" style={{ fontSize: 20 }}>Contrato de Locação de Veículo</div>
      <div style={{ fontSize: 11.5, color: "#8a8578" }}>Registro {record.id} · Status: {record.status === "aberta" ? "em andamento" : "concluída"}</div>

      <h2>Dados do motorista</h2>
      <div className="grid2">
        <div className="kv"><b>Nome</b>{m.nome}</div>
        <div className="kv"><b>CPF</b>{m.cpf}</div>
        <div className="kv"><b>RG</b>{m.rg}</div>
        <div className="kv"><b>Telefone</b>{m.telefone}</div>
        <div className="kv"><b>E-mail</b>{m.email}</div>
        <div className="kv"><b>Endereço</b>{m.endereco}</div>
      </div>
      <div className="photos">
        {m.cpfDoc && <img src={m.cpfDoc} alt="CPF" />}
        {m.rgDoc && <img src={m.rgDoc} alt="RG" />}
        {m.enderecoDoc && <img src={m.enderecoDoc} alt="Comprovante endereço" />}
        {m.cnhDoc && <img src={m.cnhDoc} alt="CNH" />}
      </div>

      <h2>Dados do veículo</h2>
      <div className="grid2">
        <div className="kv"><b>Placa</b>{v.placa}</div>
        <div className="kv"><b>Marca</b>{v.marca}</div>
        <div className="kv"><b>Modelo</b>{v.modelo}</div>
        <div className="kv"><b>Cor</b>{v.cor}</div>
        <div className="kv"><b>Ano</b>{v.ano}</div>
      </div>

      <CheckoutBlock title="Retirada do veículo" g={r} />
      {hasDevolucao && <CheckoutBlock title="Devolução do veículo" g={d} />}
      {!hasDevolucao && <p style={{ fontSize: 12, color: "#8a8578", marginTop: 20 }}>Devolução ainda não registrada.</p>}
    </div>
  );
}

function CheckoutBlock({ title, g }) {
  return (
    <>
      <h2>{title}</h2>
      <div className="grid2">
        <div className="kv"><b>Data</b>{g.data}</div>
        <div className="kv"><b>Horário</b>{g.horario}</div>
        <div className="kv"><b>Km</b>{g.km}</div>
        <div className="kv"><b>Avarias</b>{g.semAvarias ? "Nenhuma registrada" : `${g.fotoAvarias.length} foto(s)`}</div>
      </div>
      <div className="photos">
        {g.fotoKm && <img src={g.fotoKm} alt="Km" />}
        {g.fotoPlaca && <img src={g.fotoPlaca} alt="Placa" />}
        {g.fotoPainel && <img src={g.fotoPainel} alt="Painel" />}
        {g.fotoRosto && <img src={g.fotoRosto} alt="Rosto motorista" />}
        {g.fotoAvarias.map((s, i) => <img key={i} src={s} alt={`avaria-${i}`} />)}
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="kv"><b>Assinatura do motorista</b></div>
        {g.assinatura && <img src={g.assinatura} className="sig-img" alt="assinatura" />}
      </div>
    </>
  );
}
