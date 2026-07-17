import React, { useState } from "react";
import { Car, Loader2, ShieldCheck, Eye, EyeOff, KeyRound } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function LoginPage({ onGoSignup }) {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [enviandoRecuperar, setEnviandoRecuperar] = useState(false);
  const [msgRecuperar, setMsgRecuperar] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) setErr(error);
  }

  async function handleRecuperar(e) {
    e.preventDefault();
    setEnviandoRecuperar(true); setMsgRecuperar("");
    await resetPassword(emailRecuperar.trim());
    setEnviandoRecuperar(false);
    setMsgRecuperar("Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha. Confira sua caixa de entrada (e o spam).");
  }

  if (modoRecuperar) {
    return (
      <div className="crs-auth-wrap">
        <div className="crs-auth-card">
          <div className="crs-auth-brand"><KeyRound size={18} /> Locação de Carros</div>
          <h1 className="crs-display crs-auth-title">Recuperar senha</h1>
          <p className="crs-auth-sub">Digite seu e-mail. Se ele estiver cadastrado, enviamos um link para você criar uma senha nova.</p>

          <form onSubmit={handleRecuperar} className="crs-auth-form">
            <div className="crs-field">
              <label>E-mail</label>
              <input type="email" required value={emailRecuperar} onChange={(e) => setEmailRecuperar(e.target.value)} autoComplete="username" />
            </div>
            {msgRecuperar && <div className="crs-errbox" style={{ background: "var(--ok-bg)", borderColor: "var(--ok)", color: "var(--ok)" }}>{msgRecuperar}</div>}
            <button className="crs-btn crs-btn-primary crs-btn-block" disabled={enviandoRecuperar} type="submit">
              {enviandoRecuperar ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />} Enviar link de recuperação
            </button>
          </form>

          <button className="crs-auth-link" onClick={() => { setModoRecuperar(false); setMsgRecuperar(""); }}>Voltar para o login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="crs-auth-wrap">
      <div className="crs-auth-card">
        <div className="crs-auth-brand">
          <Car size={26} />
          <span>Locação de Carros</span>
        </div>
        <h1 className="crs-display crs-auth-title">Acesso reservado</h1>
        <p className="crs-auth-sub">Entre com suas credenciais para continuar.</p>

        <form onSubmit={handleSubmit} className="crs-auth-form">
          <div className="crs-field">
            <label>E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div className="crs-field">
            <label>Senha</label>
            <div className="crs-pw-wrap">
              <input
                type={showPassword ? "text" : "password"}
                required value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="crs-pw-toggle" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {err && <div className="crs-errbox">{err}</div>}
          <button className="crs-btn crs-btn-primary crs-btn-block" disabled={busy} type="submit">
            {busy ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />} Entrar
          </button>
        </form>

        <button className="crs-auth-link" onClick={() => setModoRecuperar(true)}>Esqueci minha senha</button>
        <button className="crs-auth-link" onClick={onGoSignup}>Ainda não tem conta? Criar acesso</button>
      </div>
    </div>
  );
}
