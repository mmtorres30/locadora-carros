import React, { useState, useEffect, useRef } from "react";
import {
  Car, Camera, PenTool, Check, X, Trash2, FileText, User,
  ClipboardList, RotateCcw, Plus, Printer, AlertTriangle,
  ChevronLeft, Loader2, Undo2, ShieldCheck, Search, UserCheck, Image,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { compressImageToBlob, uploadBlob } from "./storageUtils";
import SignedImage from "./SignedImage";
import { useAuth } from "./AuthContext";
import { onlyDigits, applyFormat, formatCPF, formatPhone, isValidCPF, rgIncompleto } from "./formatters";

const MOTORISTA_FIELDS = [
  { key: "nome", label: "Nome completo", type: "text", format: "title" },
  { key: "cpf", label: "CPF", type: "text", format: "cpf" },
  { key: "rg", label: "RG", type: "text", format: "rg" },
  { key: "telefone", label: "Telefone", type: "tel", format: "phone" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "endereco", label: "Endereço", type: "text", format: "title" },
  { key: "enderecoDoc", label: "Foto do comprovante de endereço", type: "photo" },
  { key: "cnhDoc", label: "Foto da CNH", type: "photo" },
];
const VEICULO_FIELDS = [
  { key: "placa", label: "Placa", type: "text", format: "upper" },
  { key: "marca", label: "Marca", type: "text", format: "title" },
  { key: "modelo", label: "Modelo", type: "text", format: "title" },
  { key: "cor", label: "Cor", type: "text", format: "title" },
  { key: "ano", label: "Ano", type: "text" },
];
const CHECK_FIELDS = [
  { key: "data", label: "Data", type: "date" },
  { key: "horario", label: "Horário", type: "time" },
  { key: "km", label: "Quilometragem (Km)", type: "text" },
  { key: "fotoPlaca", label: "Foto da placa", type: "photo" },
  { key: "fotoPainel", label: "Tire a foto do painel onde mostre a Km e o nível de combustível", type: "photo" },
  { key: "fotoRosto", label: "Foto de rosto do motorista", type: "photo", dualOption: true },
];

function emptyDraft() {
  return {
    id: crypto.randomUUID(),
    status: "aberta",
    clienteId: null,
    veiculoId: null,
    motorista: { nome: "", cpf: "", rg: "", telefone: "", email: "", endereco: "", enderecoDoc: "", cnhDoc: "" },
    veiculo: { placa: "", marca: "", modelo: "", cor: "", ano: "" },
    retirada: { data: "", horario: "", km: "", fotoPlaca: "", fotoPainel: "", fotoRosto: "", assinatura: "", semAvarias: false, fotoAvarias: [] },
    devolucao: { data: "", horario: "", km: "", fotoPlaca: "", fotoPainel: "", fotoRosto: "", assinatura: "", semAvarias: false, fotoAvarias: [] },
  };
}
function validateGroup(obj, fields, extra = []) {
  const missing = [];
  fields.forEach((f) => { if (!obj[f.key] || String(obj[f.key]).trim() === "") missing.push(f); });
  extra.forEach((e) => { if (e.test) missing.push({ key: e.key, label: e.label }); });
  return missing;
}

function Field({ f, value, onChange, missingKeys }) {
  const isErr = missingKeys.has(f.key);
  const cpfInvalido = f.format === "cpf" && onlyDigits(value).length === 11 && !isValidCPF(value);
  const rgIncompletoMsg = f.format === "rg" && rgIncompleto(value);
  return (
    <div className="crs-field">
      <label>{f.label}<span className="req">*</span></label>
      <input
        type={f.type} className={isErr || cpfInvalido ? "err" : ""} value={value || ""}
        onChange={(e) => onChange(f.key, applyFormat(f.format, e.target.value))}
      />
      {cpfInvalido && <div style={{ color: "var(--alert)", fontSize: 11, marginTop: 4 }}>CPF inválido — confira os números.</div>}
      {rgIncompletoMsg && <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>RG parece incompleto.</div>}
    </div>
  );
}

function CameraCapture({ onCapture, onClose, facingMode = "user" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      })
      .catch(() => setError("Não foi possível acessar a câmera. Verifique se você permitiu o acesso nas configurações do navegador."));
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);

  function fechar() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onClose();
  }

  function capturar() {
    const video = videoRef.current;
    if (!video) return;
    const maxDim = 900;
    let w = video.videoWidth, h = video.videoHeight;
    if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
    else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(video, 0, 0, w, h);
    canvas.toBlob((blob) => { if (blob) onCapture(blob); fechar(); }, "image/jpeg", 0.8);
  }

  return (
    <div className="crs-camera-overlay">
      <div className="crs-camera-box">
        {error ? (
          <div className="crs-errbox">{error}</div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="crs-camera-video" />
        )}
        <div className="crs-camera-actions">
          <button className="crs-btn crs-btn-outline" onClick={fechar}><X size={14} /> Cancelar</button>
          {!error && <button className="crs-btn crs-btn-primary" disabled={!ready} onClick={capturar}><Camera size={16} /> Capturar</button>}
        </div>
      </div>
    </div>
  );
}

function PhotoField({ label, required = true, value, onChange, missing, locId, folder, capture = "environment", dualOption = false }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr("");
    try {
      const blob = await compressImageToBlob(file);
      const path = await uploadBlob(locId, folder, blob);
      onChange(path);
    } catch { setErr("Falha ao enviar a foto. Tente novamente."); }
    setBusy(false);
    e.target.value = "";
  };
  const handleCaptured = async (blob) => {
    setBusy(true); setErr("");
    try {
      const path = await uploadBlob(locId, folder, blob, "jpg");
      onChange(path);
    } catch { setErr("Falha ao enviar a foto. Tente novamente."); }
    setBusy(false);
  };
  return (
    <div className="crs-field">
      <label>{label}{required && <span className="req">*</span>}</label>
      {value ? (
        <div className="crs-thumb-wrap">
          <SignedImage path={value} className="crs-thumb" alt={label} style={{ maxWidth: 260 }} />
          <button className="crs-thumb-x" onClick={() => onChange("")}><X size={14} /></button>
        </div>
      ) : dualOption ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className={`crs-photo-btn ${missing ? "err" : ""}`} style={{ flex: 1 }} onClick={() => setShowCamera(true)} disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
            {busy ? "Enviando..." : "Tirar foto agora"}
          </button>
          <label className={`crs-photo-btn ${missing ? "err" : ""}`} style={{ flex: 1 }}>
            <Image size={16} />
            Escolher da galeria
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          </label>
        </div>
      ) : (
        <label className={`crs-photo-btn ${missing ? "err" : ""}`}>
          {busy ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
          {busy ? "Enviando..." : "Tirar foto / escolher arquivo"}
          <input type="file" accept="image/*" capture={capture} onChange={handleFile} style={{ display: "none" }} />
        </label>
      )}
      {showCamera && <CameraCapture facingMode="user" onCapture={handleCaptured} onClose={() => setShowCamera(false)} />}
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
      const path = await uploadBlob(locId, "avaria", blob);
      onChangeGroup({ ...group, fotoAvarias: [...group.fotoAvarias, path] });
    } catch {}
    setBusy(false);
    e.target.value = "";
  };
  const removeAt = (i) => onChangeGroup({ ...group, fotoAvarias: group.fotoAvarias.filter((_, idx) => idx !== i) });

  return (
    <div className="crs-field">
      <label>Fotos de avarias existentes{!group.semAvarias && <span className="req">*</span>}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12.5 }}>
        <input type="checkbox" checked={group.semAvarias} onChange={(e) => onChangeGroup({ ...group, semAvarias: e.target.checked, fotoAvarias: e.target.checked ? [] : group.fotoAvarias })} />
        Carro sem avarias visíveis
      </div>
      {!group.semAvarias && (
        <div className="crs-avarias-grid">
          {group.fotoAvarias.map((path, i) => (
            <div className="crs-thumb-wrap" key={i}>
              <SignedImage path={path} className="crs-thumb" alt={`avaria-${i}`} />
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
    ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.strokeStyle = "#1C2321";
    if (value) {
      supabase.storage.from("documentos").createSignedUrl(value, 3600).then(({ data }) => {
        if (!data?.signedUrl) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.clientWidth, 150);
        img.src = data.signedUrl;
      });
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
      try { const path = await uploadBlob(locId, "assinatura", blob, "png"); onChange(path); } catch {}
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
          <button className="crs-btn crs-btn-outline" style={{ padding: "4px 10px", fontSize: 11 }} onClick={clear}><RotateCcw size={12} /> Limpar</button>
        </div>
      </div>
    </div>
  );
}

function BuscaCliente({ onSelect }) {
  const [termo, setTermo] = useState("");
  const [todos, setTodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("clientes").select("*").order("nome", { ascending: true }).limit(500);
      setTodos(data || []);
      setCarregando(false);
    })();
  }, []);

  const q = termo.trim().toLowerCase();
  const digits = onlyDigits(termo);
  const resultados = q
    ? todos.filter((c) => (c.nome || "").toLowerCase().includes(q) || (digits.length >= 2 && onlyDigits(c.cpf).includes(digits)))
    : todos;

  return (
    <div className="crs-field" style={{ position: "relative" }}>
      <label>Buscar cliente já cadastrado (ou veja todos abaixo)</label>
      <div style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        <input
          type="text" placeholder="Digite o nome ou CPF, ou clique para ver todos..." style={{ paddingLeft: 36 }}
          value={termo}
          onChange={(e) => { setTermo(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 150)}
        />
        {carregando && <Loader2 size={14} className="spin" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />}
      </div>
      {aberto && resultados.length > 0 && (
        <div className="crs-search-results" style={{ maxHeight: 260, overflowY: "auto" }}>
          {resultados.map((c) => (
            <button
              key={c.id} type="button" className="crs-search-item"
              onMouseDown={() => { onSelect(c); setTermo(""); setAberto(false); }}
            >
              <UserCheck size={14} />
              <div>
                <div style={{ fontWeight: 600 }}>{c.nome}</div>
                <div className="crs-mono" style={{ fontSize: 11, color: "var(--muted)" }}>CPF {formatCPF(c.cpf)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BuscaVeiculo({ onSelect }) {
  const [termo, setTermo] = useState("");
  const [todos, setTodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("veiculos").select("*").order("placa", { ascending: true }).limit(500);
      setTodos(data || []);
      setCarregando(false);
    })();
  }, []);

  const q = termo.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const resultados = q ? todos.filter((v) => (v.placa || "").toUpperCase().replace(/[^A-Z0-9]/g, "").includes(q)) : todos;

  return (
    <div className="crs-field" style={{ position: "relative" }}>
      <label>Buscar veículo já cadastrado pela placa (ou veja todos abaixo)</label>
      <div style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        <input
          type="text" placeholder="Digite a placa, ou clique para ver todos..." style={{ paddingLeft: 36 }}
          value={termo}
          onChange={(e) => { setTermo(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 150)}
        />
        {carregando && <Loader2 size={14} className="spin" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />}
      </div>
      {aberto && resultados.length > 0 && (
        <div className="crs-search-results" style={{ maxHeight: 260, overflowY: "auto" }}>
          {resultados.map((v) => (
            <button
              key={v.id} type="button" className="crs-search-item"
              onMouseDown={() => { onSelect(v); setTermo(""); setAberto(false); }}
            >
              <Car size={14} />
              <div>
                <div className="crs-mono" style={{ fontWeight: 600 }}>{v.placa}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{v.marca} {v.modelo} {v.cor ? `· ${v.cor}` : ""}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocacoesApp() {
  const { session, perfil } = useAuth();
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
    const { data, error } = await supabase.from("locacoes").select("id,status,motorista,veiculo,retirada").order("created_at", { ascending: false });
    if (error) { setNotice("Erro ao carregar histórico: " + error.message); setIndex([]); }
    else setIndex(data.map((r) => ({ id: r.id, status: r.status, nome: r.motorista?.nome, placa: r.veiculo?.placa, modelo: r.veiculo?.modelo, dataRetirada: r.retirada?.data })));
    setLoading(false);
  }
  async function loadRecord(id) {
    const { data, error } = await supabase.from("locacoes").select("*").eq("id", id).single();
    if (error || !data) return null;
    return { id: data.id, status: data.status, clienteId: data.cliente_id, motorista: data.motorista, veiculo: data.veiculo, retirada: data.retirada, devolucao: data.devolucao };
  }

  function iniciarNovaLocacao() {
    setDraft(emptyDraft()); setMissing([]); setMissingKeys(new Set()); setView("cadastro");
  }
  function avancarParaRetirada() {
    const all = [...validateGroup(draft.motorista, MOTORISTA_FIELDS), ...validateGroup(draft.veiculo, VEICULO_FIELDS)];
    if (all.length) { setMissing(all.map((m) => m.label)); setMissingKeys(new Set(all.map((m) => m.key))); return; }
    setMissing([]); setMissingKeys(new Set()); setView("retirada");
  }
  async function finalizarRetirada() {
    const extra = [
      { test: !draft.retirada.assinatura, key: "assinatura", label: "Assinatura do motorista" },
      { test: !draft.retirada.semAvarias && draft.retirada.fotoAvarias.length === 0, key: "fotoAvarias", label: "Foto de avarias (ou marcar 'sem avarias')" },
    ];
    const all = [...validateGroup(draft.retirada, CHECK_FIELDS), ...validateGroup(draft.retirada, [], extra)];
    if (all.length) { setMissing(all.map((m) => m.label)); setMissingKeys(new Set(all.map((m) => m.key))); return; }
    if (!isValidCPF(draft.motorista.cpf)) {
      setMissing(["CPF inválido — confira os números"]);
      setMissingKeys(new Set(["cpf"]));
      setView("cadastro");
      return;
    }
    setSaving(true);

    // grava/atualiza o cliente (fica disponível pra busca nas próximas locações)
    const cpfDigits = onlyDigits(draft.motorista.cpf);
    const clientePayload = { ...draft.motorista, cpf: cpfDigits };
    if (draft.clienteId) clientePayload.id = draft.clienteId;
    const { data: clienteRow, error: clienteErr } = await supabase
      .from("clientes")
      .upsert(clientePayload, { onConflict: "cpf" })
      .select()
      .single();
    if (clienteErr) { setSaving(false); setNotice("Erro ao salvar cliente: " + clienteErr.message); return; }

    // grava/atualiza o veículo (fica disponível pra busca por placa nas próximas locações)
    const veiculoPayload = { ...draft.veiculo };
    if (draft.veiculoId) veiculoPayload.id = draft.veiculoId;
    const { data: veiculoRow, error: veiculoErr } = await supabase
      .from("veiculos")
      .upsert(veiculoPayload, { onConflict: "placa" })
      .select()
      .single();
    if (veiculoErr) { setSaving(false); setNotice("Erro ao salvar veículo: " + veiculoErr.message); return; }

    const { error } = await supabase.from("locacoes").upsert({
      id: draft.id, status: "aberta", motorista: draft.motorista, veiculo: draft.veiculo,
      retirada: draft.retirada, devolucao: draft.devolucao, criado_por: session?.user?.id,
      cliente_id: clienteRow.id, veiculo_id: veiculoRow.id,
    });
    setSaving(false);
    if (error) { setNotice("Erro ao salvar: " + error.message); return; }
    setNotice("Locação registrada com sucesso.");
    await loadIndex(); setView("home");
  }
  async function abrirDevolucao(id) {
    const rec = await loadRecord(id);
    if (!rec) { setNotice("Não foi possível carregar essa locação."); return; }
    setDraft(rec); setMissing([]); setMissingKeys(new Set()); setView("devolucao");
  }
  async function finalizarDevolucao() {
    const extra = [
      { test: !draft.devolucao.assinatura, key: "assinatura", label: "Assinatura do motorista" },
      { test: !draft.devolucao.semAvarias && draft.devolucao.fotoAvarias.length === 0, key: "fotoAvarias", label: "Foto de avarias (ou marcar 'sem avarias')" },
    ];
    const all = [...validateGroup(draft.devolucao, CHECK_FIELDS), ...validateGroup(draft.devolucao, [], extra)];
    if (all.length) { setMissing(all.map((m) => m.label)); setMissingKeys(new Set(all.map((m) => m.key))); return; }
    setSaving(true);
    const { error } = await supabase.from("locacoes").update({ status: "fechada", devolucao: draft.devolucao }).eq("id", draft.id);
    setSaving(false);
    if (error) { setNotice("Erro ao salvar: " + error.message); return; }
    setNotice("Devolução registrada. Locação encerrada.");
    await loadIndex(); setView("home");
  }
  async function verContrato(id) {
    const rec = await loadRecord(id);
    if (!rec) { setNotice("Não foi possível carregar essa locação."); return; }
    setContractRecord(rec); setView("contrato");
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

  const podeExcluir = perfil?.role === "admin";

  return (
    <>
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
              <div className="crs-empty"><ClipboardList size={36} style={{ opacity: .4 }} /><p>Nenhuma locação registrada ainda.<br />Toque em "+" para começar.</p></div>
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
                      <button className="crs-btn crs-btn-primary" onClick={() => abrirDevolucao(it.id)}><Undo2 size={14} /> Registrar devolução</button>
                    )}
                    <button className="crs-btn crs-btn-outline" onClick={() => verContrato(it.id)}><FileText size={14} /> Ver contrato</button>
                    {podeExcluir && <button className="crs-btn crs-btn-danger" onClick={() => excluir(it.id)}><Trash2 size={14} /></button>}
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
                <BuscaCliente onSelect={(c) => {
                  setDraft((d) => ({
                    ...d,
                    clienteId: c.id,
                    motorista: {
                      nome: c.nome || "", cpf: formatCPF(c.cpf) || "",
                      rg: c.rg || "", telefone: formatPhone(c.telefone) || "",
                      email: c.email || "", endereco: c.endereco || "", enderecoDoc: c.enderecoDoc || "",
                      cnhDoc: c.cnhDoc || "",
                    },
                  }));
                }} />
                {draft.clienteId && (
                  <div className="crs-client-tag">
                    <UserCheck size={13} /> Cliente já cadastrado selecionado — os campos abaixo foram preenchidos automaticamente.
                  </div>
                )}
                {MOTORISTA_FIELDS.map((f) => f.type === "photo" ? (
                  <PhotoField key={f.key} label={f.label} value={draft.motorista[f.key]} onChange={(v) => setMotorista(f.key, v)} missing={missingKeys.has(f.key)} locId={draft.id} folder={f.key} />
                ) : (
                  <Field key={f.key} f={f} value={draft.motorista[f.key]} onChange={setMotorista} missingKeys={missingKeys} />
                ))}
              </div>
            </div>
            <div className="crs-section">
              <div className="crs-section-head"><Car size={16} /> Dados do carro</div>
              <div className="crs-section-body">
                <BuscaVeiculo onSelect={(v) => {
                  setDraft((d) => ({
                    ...d,
                    veiculoId: v.id,
                    veiculo: { placa: v.placa || "", marca: v.marca || "", modelo: v.modelo || "", cor: v.cor || "", ano: v.ano || "" },
                  }));
                }} />
                {draft.veiculoId && (
                  <div className="crs-client-tag">
                    <Car size={13} /> Veículo já cadastrado selecionado — os campos abaixo foram preenchidos automaticamente.
                  </div>
                )}
                {VEICULO_FIELDS.map((f) => <Field key={f.key} f={f} value={draft.veiculo[f.key]} onChange={setVeiculo} missingKeys={missingKeys} />)}
              </div>
            </div>
            <div className="crs-footerbar no-print">
              <button className="crs-btn crs-btn-primary crs-btn-block" onClick={avancarParaRetirada}>Continuar para retirada <Check size={16} /></button>
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
                  {CHECK_FIELDS.filter((f) => f.type !== "photo").map((f) => <Field key={f.key} f={f} value={group[f.key]} onChange={setGroup} missingKeys={missingKeys} />)}
                  {CHECK_FIELDS.filter((f) => f.type === "photo").map((f) => (
                    <PhotoField key={f.key} label={f.label} value={group[f.key]} onChange={(v) => setGroup(f.key, v)} missing={missingKeys.has(f.key)} locId={draft.id} folder={`${groupKey}-${f.key}`} capture={f.capture || "environment"} dualOption={!!f.dualOption} />
                  ))}
                  <AvariasField group={group} onChangeGroup={onChangeGroup} missing={missingKeys.has("fotoAvarias")} locId={draft.id} />
                </div>
              </div>
              <div className="crs-section">
                <div className="crs-section-head"><PenTool size={16} /> Assinatura</div>
                <div className="crs-section-body"><SignaturePad value={group.assinatura} onChange={(v) => setGroup("assinatura", v)} locId={draft.id} /></div>
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
    </>
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
        <div className="kv"><b>Nome</b>{m.nome}</div><div className="kv"><b>CPF</b>{m.cpf}</div>
        <div className="kv"><b>RG</b>{m.rg}</div><div className="kv"><b>Telefone</b>{m.telefone}</div>
        <div className="kv"><b>E-mail</b>{m.email}</div><div className="kv"><b>Endereço</b>{m.endereco}</div>
      </div>
      <div className="photos">
        {m.enderecoDoc && <SignedImage path={m.enderecoDoc} alt="Comprovante endereço" />}
        {m.cnhDoc && <SignedImage path={m.cnhDoc} alt="CNH" />}
      </div>

      <h2>Dados do veículo</h2>
      <div className="grid2">
        <div className="kv"><b>Placa</b>{v.placa}</div><div className="kv"><b>Marca</b>{v.marca}</div>
        <div className="kv"><b>Modelo</b>{v.modelo}</div><div className="kv"><b>Cor</b>{v.cor}</div><div className="kv"><b>Ano</b>{v.ano}</div>
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
        <div className="kv"><b>Data</b>{g.data}</div><div className="kv"><b>Horário</b>{g.horario}</div>
        <div className="kv"><b>Km</b>{g.km}</div>
        <div className="kv"><b>Avarias</b>{g.semAvarias ? "Nenhuma registrada" : `${g.fotoAvarias.length} foto(s)`}</div>
      </div>
      <div className="photos">
        {g.fotoPlaca && <SignedImage path={g.fotoPlaca} alt="Placa" />}
        {g.fotoPainel && <SignedImage path={g.fotoPainel} alt="Painel" />}
        {g.fotoRosto && <SignedImage path={g.fotoRosto} alt="Rosto motorista" />}
        {g.fotoAvarias.map((s, i) => <SignedImage key={i} path={s} alt={`avaria-${i}`} />)}
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="kv"><b>Assinatura do motorista</b></div>
        {g.assinatura && <SignedImage path={g.assinatura} className="sig-img" alt="assinatura" />}
      </div>
    </>
  );
}
