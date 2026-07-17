import React, { useState } from "react";
import { Car, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function LoginPage({ onGoSignup }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) setErr(error);
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

        <button className="crs-auth-link" onClick={onGoSignup}>Ainda não tem conta? Criar acesso</button>
      </div>
    </div>
  );
}
