import React, { useState } from "react";
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function ResetPasswordPage() {
  const { updatePassword, signOut } = useAuth();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (senha.length < 6) { setErr("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (senha !== confirmar) { setErr("As senhas não coincidem."); return; }
    setBusy(true);
    const { error } = await updatePassword(senha);
    setBusy(false);
    if (error) { setErr(error); return; }
    setOk(true);
  }

  if (ok) {
    return (
      <div className="crs-auth-wrap">
        <div className="crs-auth-card">
          <div className="crs-auth-brand"><KeyRound size={18} /> Locação de Carros</div>
          <h1 className="crs-display crs-auth-title">Senha atualizada</h1>
          <p className="crs-auth-sub">Sua senha foi alterada com sucesso. Você já pode continuar usando o sistema.</p>
          <button className="crs-btn crs-btn-primary crs-btn-block" onClick={() => window.location.reload()}>Continuar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="crs-auth-wrap">
      <div className="crs-auth-card">
        <div className="crs-auth-brand"><KeyRound size={18} /> Locação de Carros</div>
        <h1 className="crs-display crs-auth-title">Criar nova senha</h1>
        <p className="crs-auth-sub">Escolha uma nova senha para sua conta.</p>

        <form onSubmit={handleSubmit} className="crs-auth-form">
          <div className="crs-field">
            <label>Nova senha</label>
            <div className="crs-pw-wrap">
              <input type={show ? "text" : "password"} required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" />
              <button type="button" className="crs-pw-toggle" onClick={() => setShow((s) => !s)} tabIndex={-1}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="crs-field">
            <label>Confirmar nova senha</label>
            <input type={show ? "text" : "password"} required minLength={6} value={confirmar} onChange={(e) => setConfirmar(e.target.value)} autoComplete="new-password" />
          </div>
          {err && <div className="crs-errbox">{err}</div>}
          <button className="crs-btn crs-btn-primary crs-btn-block" disabled={busy} type="submit">
            {busy ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />} Salvar nova senha
          </button>
        </form>

        <button className="crs-auth-link" onClick={signOut}>Cancelar e sair</button>
      </div>
    </div>
  );
}
