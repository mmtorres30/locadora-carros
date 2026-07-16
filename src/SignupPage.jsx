import React, { useState } from "react";
import { Car, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function SignupPage({ onGoLogin }) {
  const { signUp } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error, firstAdmin } = await signUp(email.trim(), password, nome.trim());
    setBusy(false);
    if (error) { setErr(error); return; }
    setDone(firstAdmin);
  }

  if (done !== null) {
    return (
      <div className="crs-auth-wrap">
        <div className="crs-auth-card">
          <div className="crs-auth-brand"><Car size={26} /><span>Locação de Carros</span></div>
          <h1 className="crs-display crs-auth-title">Conta criada</h1>
          {done ? (
            <p className="crs-auth-sub">
              Você é o primeiro usuário — sua conta de <b>administrador</b> já está ativa.
              Confirme seu e-mail (se pedido) e entre normalmente.
            </p>
          ) : (
            <p className="crs-auth-sub">
              Sua conta foi criada como <b>operador</b> e está aguardando aprovação de um
              administrador antes que você possa entrar.
            </p>
          )}
          <button className="crs-btn crs-btn-primary crs-btn-block" onClick={onGoLogin}>Ir para o login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="crs-auth-wrap">
      <div className="crs-auth-card">
        <div className="crs-auth-brand"><Car size={26} /><span>Locação de Carros</span></div>
        <h1 className="crs-display crs-auth-title">Criar acesso</h1>
        <p className="crs-auth-sub">O primeiro cadastro do sistema vira administrador automaticamente.</p>

        <form onSubmit={handleSubmit} className="crs-auth-form">
          <div className="crs-field">
            <label>Nome</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="crs-field">
            <label>E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div className="crs-field">
            <label>Senha</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          {err && <div className="crs-errbox">{err}</div>}
          <button className="crs-btn crs-btn-primary crs-btn-block" disabled={busy} type="submit">
            {busy ? <Loader2 size={16} className="spin" /> : <UserPlus size={16} />} Criar conta
          </button>
        </form>

        <button className="crs-auth-link" onClick={onGoLogin}>Já tenho conta — entrar</button>
      </div>
    </div>
  );
}
