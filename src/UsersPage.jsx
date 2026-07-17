import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Loader2, ShieldCheck, Ban, ShieldOff, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function UsersPage() {
  const { perfil: me, session } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novoRole, setNovoRole] = useState("operador");
  const [showPw, setShowPw] = useState(false);
  const [criando, setCriando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("perfis").select("*").order("created_at", { ascending: true });
    if (error) setNotice("Erro ao carregar usuários: " + error.message);
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    setBusyId(id);
    const { error } = await supabase.from("perfis").update({ status, failed_attempts: 0, locked_until: null }).eq("id", id);
    if (error) setNotice("Erro: " + error.message);
    await load();
    setBusyId(null);
  }
  async function setRole(id, role) {
    setBusyId(id);
    const { error } = await supabase.from("perfis").update({ role }).eq("id", id);
    if (error) setNotice("Erro: " + error.message);
    await load();
    setBusyId(null);
  }

  async function criarUsuario(e) {
    e.preventDefault();
    setErroForm("");
    if (!novoNome.trim() || !novoEmail.trim() || novaSenha.length < 6) {
      setErroForm("Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setCriando(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ nome: novoNome.trim(), email: novoEmail.trim(), password: novaSenha, role: novoRole }),
      });
      const json = await resp.json();
      if (!resp.ok) { setErroForm(json.error || "Erro ao criar usuário."); setCriando(false); return; }
      setNotice(`Usuário ${novoEmail} criado como ${novoRole === "admin" ? "Administrador" : "Operador"}, já ativo.`);
      setNovoNome(""); setNovoEmail(""); setNovaSenha(""); setNovoRole("operador");
      await load();
    } catch (err) {
      setErroForm("Não foi possível criar o usuário. Tente novamente.");
    }
    setCriando(false);
  }

  return (
    <div className="crs-main">
      {notice && <div className="crs-errbox" style={{ background: "var(--ok-bg)", borderColor: "var(--ok)", color: "var(--ok)" }} onClick={() => setNotice("")}>{notice}</div>}

      <div className="crs-section">
        <div className="crs-section-head"><UserPlus size={16} /> Criar novo usuário</div>
        <form className="crs-section-body" onSubmit={criarUsuario} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="crs-field">
            <label>Nome<span className="req">*</span></label>
            <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
          </div>
          <div className="crs-field">
            <label>E-mail<span className="req">*</span></label>
            <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
          </div>
          <div className="crs-field">
            <label>Senha<span className="req">*</span></label>
            <div className="crs-pw-wrap">
              <input type={showPw ? "text" : "password"} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} minLength={6} />
              <button type="button" className="crs-pw-toggle" onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="crs-field">
            <label>Papel<span className="req">*</span></label>
            <select className="crs-role-select" style={{ width: "100%", padding: "11px 13px" }} value={novoRole} onChange={(e) => setNovoRole(e.target.value)}>
              <option value="operador">Operador</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {erroForm && <div className="crs-errbox" style={{ gridColumn: "1 / -1", marginBottom: 0 }}>{erroForm}</div>}
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="crs-btn crs-btn-primary" disabled={criando} type="submit">
              {criando ? <Loader2 size={16} className="spin" /> : <UserPlus size={16} />} Criar usuário (já entra ativo)
            </button>
          </div>
        </form>
      </div>

      <div className="crs-section">
        <div className="crs-section-head"><ShieldCheck size={16} /> Usuários do sistema</div>
        <div className="crs-section-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="crs-empty"><Loader2 className="spin" /> Carregando...</div>
          ) : (
            <table className="crs-table">
              <thead>
                <tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nome || "-"}</td>
                    <td className="crs-mono" style={{ fontSize: 11.5 }}>{r.email}</td>
                    <td>
                      <select
                        className="crs-role-select"
                        value={r.role}
                        disabled={busyId === r.id || r.id === me?.id}
                        onChange={(e) => setRole(r.id, e.target.value)}
                      >
                        <option value="operador">Operador</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`crs-badge ${r.status === "ativo" ? "fechada" : "bloqueado"}`}>
                        {r.status === "ativo" ? "Ativo" : "Bloqueado"}
                      </span>
                      {r.locked_until && new Date(r.locked_until) > new Date() && (
                        <div style={{ fontSize: 10, color: "#8a8578", marginTop: 3 }}>tentativas travadas</div>
                      )}
                    </td>
                    <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.id === me?.id ? (
                        <span style={{ fontSize: 11, color: "#8a8578" }}>(você)</span>
                      ) : (
                        <>
                          {r.status === "ativo" ? (
                            <button className="crs-btn crs-btn-danger" disabled={busyId === r.id} onClick={() => setStatus(r.id, "bloqueado")}>
                              <Ban size={13} /> Bloquear
                            </button>
                          ) : (
                            <button className="crs-btn crs-btn-ok" disabled={busyId === r.id} onClick={() => setStatus(r.id, "ativo")}>
                              <ShieldOff size={13} /> Ativar
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#8a8578" }}>
        Novas contas criadas na tela de login entram automaticamente como <b>operador bloqueado</b> —
        ative aqui para liberar o acesso. Usuários criados pelo formulário acima já entram <b>ativos</b>.
      </p>
    </div>
  );
}

