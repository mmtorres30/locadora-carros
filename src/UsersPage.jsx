import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Loader2, ShieldCheck, Ban, ShieldOff, Crown, User } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function UsersPage() {
  const { perfil: me } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");

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

  return (
    <div className="crs-main">
      {notice && <div className="crs-errbox" onClick={() => setNotice("")}>{notice}</div>}
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
                      <span className={`crs-badge ${r.role === "admin" ? "fechada" : "aberta"}`}>
                        {r.role === "admin" ? "Admin" : "Operador"}
                      </span>
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
                          {r.role === "admin" ? (
                            <button className="crs-btn crs-btn-outline" disabled={busyId === r.id} onClick={() => setRole(r.id, "operador")}>
                              <User size={13} /> Tornar operador
                            </button>
                          ) : (
                            <button className="crs-btn crs-btn-outline" disabled={busyId === r.id} onClick={() => setRole(r.id, "admin")}>
                              <Crown size={13} /> Tornar admin
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
        ative aqui para liberar o acesso.
      </p>
    </div>
  );
}
