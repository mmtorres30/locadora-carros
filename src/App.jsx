import React, { useState } from "react";
import { Car, LogOut, ClipboardList, BarChart3, ShieldCheck, Crown, Users } from "lucide-react";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import LocacoesApp from "./LocacoesApp";
import ReportsPage from "./ReportsPage";
import UsersPage from "./UsersPage";
import ClientsPage from "./ClientsPage";
import VehiclesPage from "./VehiclesPage";
import ResetPasswordPage from "./ResetPasswordPage";

/* ============================================================
   VIP DESIGN TOKENS
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

*{ box-sizing:border-box; }
html,body,#root{ height:100%; margin:0; overscroll-behavior:none; }

.crs-app{
  height:100vh;
  height:100dvh;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  --noir:#16151A;
  --noir-2:#211F26;
  --paper:#FAF8F3;
  --paper-2:#F1ECE1;
  --gold:#C6A15B;
  --gold-soft:#E7D5AC;
  --cyan:#2FA99A;
  --cyan-soft:#E4F3F0;
  --ink:#211F1C;
  --muted:#857F70;
  --line:#E7DFCB;
  --ok:#2F6F5E;
  --ok-bg:#E5F1EC;
  --alert:#A6423A;
  --alert-bg:#F8E9E7;
  font-family:'Inter',sans-serif;
  color:var(--ink);
  background:var(--paper);
  width:100%;
}
.crs-display{ font-family:'Space Grotesk',sans-serif; letter-spacing:.01em; }
.crs-mono{ font-family:'JetBrains Mono',monospace; }

.crs-topbar{
  background:var(--noir); color:var(--paper); padding:14px 20px;
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  border-bottom:1px solid #2A2820; flex-shrink:0;
}
.crs-topbar-left{ display:flex; align-items:center; gap:10px; }
.crs-brand{ display:flex; align-items:center; gap:9px; }
.crs-brand-mark{
  width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  color:#241A05; background:linear-gradient(135deg, var(--gold), var(--gold-soft));
  box-shadow:0 0 14px rgba(198,161,91,.4);
}
.crs-brand-name{ font-family:'Space Grotesk',sans-serif; font-size:15.5px; font-weight:600; letter-spacing:.02em; }
.crs-nav{ display:flex; gap:4px; }
.crs-nav button{
  background:transparent; border:1px solid transparent; color:#C9C4B6; font-size:12.5px; font-weight:600;
  padding:8px 14px; border-radius:999px; cursor:pointer; display:flex; align-items:center; gap:6px;
  letter-spacing:.02em; transition:all .15s ease;
}
.crs-nav button.active{ background:rgba(198,161,91,.16); color:var(--gold-soft); border-color:rgba(198,161,91,.4); }
.crs-nav button:hover{ color:#fff; }
.crs-userchip{ display:flex; align-items:center; gap:10px; font-size:11.5px; color:#B8B2A2; }
.crs-userchip b{ color:var(--gold-soft); font-weight:600; }
.crs-logout{ background:transparent; border:1px solid #35332B; color:#C9C4B6; border-radius:999px; padding:7px 9px; cursor:pointer; transition:all .15s ease; }
.crs-logout:hover{ color:#fff; border-color:var(--gold); }

.crs-scroll-area{
  flex:1; min-height:0; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain;
}

.crs-steps{ display:flex; gap:6px; padding:10px 20px; background:var(--paper-2); border-bottom:1px solid var(--line); overflow-x:auto; flex-shrink:0; }
.crs-step{ font-size:11px; padding:5px 12px; border-radius:999px; white-space:nowrap; background:#fff; border:1px solid var(--line); color:var(--muted); font-weight:600; }
.crs-step.active{ background:var(--noir); color:var(--gold-soft); border-color:var(--noir); }
.crs-step.done{ background:var(--ok); color:#fff; border-color:var(--ok); }

.crs-main{ padding:22px 20px; max-width:780px; margin:0 auto; padding-bottom:112px; }

.crs-section{ background:#fff; border:1px solid var(--line); border-radius:16px; margin-bottom:18px; overflow:hidden; box-shadow:0 2px 10px rgba(30,25,10,.05); }
.crs-section-head{ background:var(--noir); color:var(--gold-soft); padding:13px 18px; display:flex; align-items:center; gap:9px; font-size:12px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }
.crs-section-body{ padding:20px; display:grid; gap:16px; }

.crs-field label{ display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--muted); }
.crs-field label .req{ color:var(--gold); margin-left:2px; }
.crs-field input[type=text], .crs-field input[type=email], .crs-field input[type=tel],
.crs-field input[type=date], .crs-field input[type=time], .crs-field input[type=password]{
  width:100%; border:1.5px solid var(--line); border-radius:10px;
  padding:11px 13px; font-size:14px; font-family:inherit; background:var(--paper);
}
.crs-field input:focus{ outline:none; border-color:var(--gold); box-shadow:0 0 0 3px rgba(198,161,91,.15); }
.crs-field input.err{ border-color:var(--alert); background:var(--alert-bg); }

.crs-role-select{
  border:1.5px solid var(--line); border-radius:8px; padding:7px 10px; font-size:12.5px; font-weight:600;
  font-family:inherit; background:var(--paper); color:var(--ink); cursor:pointer;
}
.crs-role-select:disabled{ opacity:.6; cursor:not-allowed; }
.crs-role-select:focus{ outline:none; border-color:var(--gold); }

.crs-pw-wrap{ position:relative; }
.crs-pw-wrap input{ padding-right:42px; }
.crs-pw-toggle{ position:absolute; top:50%; right:10px; transform:translateY(-50%); background:none; border:none; color:var(--muted); cursor:pointer; padding:4px; display:flex; }
.crs-pw-toggle:hover{ color:var(--gold); }

.crs-search-results{
  position:absolute; top:100%; left:0; right:0; margin-top:6px; background:#fff;
  border:1px solid var(--line); border-radius:12px; overflow:hidden; z-index:15;
  box-shadow:0 12px 30px rgba(30,25,10,.15);
}
.crs-search-item{
  display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:11px 14px;
  background:transparent; border:none; border-bottom:1px solid var(--line); color:var(--ink); cursor:pointer;
}
.crs-search-item:last-child{ border-bottom:none; }
.crs-search-item:hover{ background:var(--cyan-soft); color:var(--cyan); }

.crs-camera-overlay{
  position:fixed; inset:0; background:rgba(10,9,7,.92); z-index:100;
  display:flex; align-items:center; justify-content:center; padding:20px;
}
.crs-camera-box{ width:100%; max-width:480px; display:flex; flex-direction:column; gap:14px; }
.crs-camera-video{ width:100%; border-radius:14px; background:#000; max-height:65vh; object-fit:cover; transform:scaleX(-1); }
.crs-camera-actions{ display:flex; gap:10px; justify-content:center; }

.crs-vehicle-thumb{ width:56px; height:56px; object-fit:cover; border-radius:10px; border:1px solid var(--line); flex-shrink:0; }
.crs-client-tag{
  display:flex; align-items:center; gap:8px; font-size:12px; color:var(--cyan); background:var(--cyan-soft);
  border:1px solid rgba(47,169,154,.25); border-radius:9px; padding:9px 12px;
}

.crs-photo-btn{
  display:flex; align-items:center; justify-content:center; gap:8px;
  border:1.5px dashed var(--line); border-radius:10px; padding:15px; cursor:pointer;
  font-size:13px; font-weight:600; color:var(--muted); background:var(--paper); transition:all .15s ease;
}
.crs-photo-btn.err{ border-color:var(--alert); background:var(--alert-bg); color:var(--alert); }
.crs-photo-btn:hover{ background:var(--paper-2); border-color:var(--gold); }
.crs-thumb-wrap{ position:relative; display:inline-block; }
.crs-thumb{ width:100%; max-width:260px; border-radius:10px; border:1.5px solid var(--line); display:block; }
.crs-thumb-x{ position:absolute; top:-8px; right:-8px; background:var(--alert); color:#fff; border-radius:999px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; }

.crs-avarias-grid{ display:flex; gap:10px; flex-wrap:wrap; }
.crs-avarias-grid .crs-thumb{ width:100px; height:100px; object-fit:cover; max-width:none; }

.crs-sig-box{ border:1.5px dashed var(--line); border-radius:10px; background:var(--paper); overflow:hidden; }
.crs-sig-box canvas{ display:block; width:100%; touch-action:none; background:#fff; }
.crs-sig-tools{ display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--paper-2); font-size:11px; color:var(--muted); }

.crs-btn{ border:none; border-radius:10px; padding:12px 18px; font-size:13px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:8px; font-family:'Inter',sans-serif; letter-spacing:.01em; transition:all .15s ease; }
.crs-btn-primary{ background:linear-gradient(135deg, var(--gold), var(--gold-soft)); color:#241A05; box-shadow:0 4px 16px rgba(198,161,91,.35); }
.crs-btn-primary:hover{ box-shadow:0 6px 20px rgba(198,161,91,.5); transform:translateY(-1px); }
.crs-btn-dark{ background:var(--noir); color:#fff; }
.crs-btn-dark:hover{ background:var(--noir-2); }
.crs-btn-outline{ background:transparent; border:1.5px solid var(--line); color:var(--ink); }
.crs-btn-outline:hover{ border-color:var(--gold); color:#8A6A1F; }
.crs-btn-danger{ background:var(--alert-bg); color:var(--alert); }
.crs-btn-ok{ background:var(--ok-bg); color:var(--ok); }
.crs-btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; }
.crs-btn-block{ width:100%; justify-content:center; }

.crs-footerbar{ position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1px solid var(--line); padding:14px 20px; display:flex; gap:10px; z-index:30; max-width:780px; margin:0 auto; }

.crs-errbox{ background:var(--alert-bg); border:1.5px solid var(--alert); color:var(--alert); border-radius:10px; padding:12px 14px; font-size:12.5px; margin-bottom:16px; cursor:pointer; }
.crs-errbox b{ display:block; margin-bottom:4px; }

.crs-empty{ text-align:center; padding:60px 20px; color:var(--muted); }

.crs-ticket{ background:#fff; border:1px solid var(--line); border-radius:16px; margin-bottom:14px; border-left:4px solid var(--gold); overflow:hidden; box-shadow:0 2px 10px rgba(30,25,10,.05); transition:border-color .15s ease; }
.crs-ticket:hover{ border-left-color:var(--cyan); }
.crs-ticket-top{ padding:16px 18px 8px; }
.crs-ticket-row{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px;}
.crs-badge{ font-size:10px; font-weight:700; padding:4px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:.05em; display:inline-block; }
.crs-badge.aberta{ background:#FBF0DC; color:#8A6A1F; }
.crs-badge.fechada{ background:var(--ok-bg); color:var(--ok); }
.crs-badge.bloqueado{ background:var(--alert-bg); color:var(--alert); }
.crs-ticket-name{ font-size:16px; font-weight:700; font-family:'Space Grotesk',sans-serif; }
.crs-ticket-meta{ font-size:11.5px; color:var(--muted); margin-top:2px; }
.crs-ticket-actions{ display:flex; gap:8px; padding:12px 18px 16px; border-top:1px dashed var(--line); margin-top:6px; flex-wrap:wrap; }

.crs-fab{ position:fixed; bottom:22px; right:22px; background:linear-gradient(135deg, var(--gold), var(--gold-soft)); color:#241A05; border:none; width:58px; height:58px; border-radius:999px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 22px rgba(198,161,91,.4); cursor:pointer; z-index:30; transition:transform .15s ease; }
.crs-fab:hover{ transform:scale(1.06); }

.crs-contract{ background:#fff; padding:6px; }
.crs-contract h2{ font-family:'Space Grotesk',sans-serif; font-size:17px; border-bottom:2px solid var(--noir); padding-bottom:6px; margin-top:26px; }
.crs-contract .grid2{ display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12.5px; margin-top:10px;}
.crs-contract .kv b{ display:block; font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em;}
.crs-contract .photos{ display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;}
.crs-contract .photos img{ width:120px; height:90px; object-fit:cover; border:1px solid var(--line); border-radius:6px;}
.crs-contract .sig-img{ height:70px; border:1px solid var(--line); border-radius:6px; background:#fff; }

.crs-table{ width:100%; border-collapse:collapse; font-size:12.5px; }
.crs-table th{ text-align:left; padding:11px 16px; background:var(--paper-2); color:var(--muted); font-size:10.5px; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid var(--line); }
.crs-table td{ padding:11px 16px; border-bottom:1px solid var(--line); }
.crs-table tr:last-child td{ border-bottom:none; }

.crs-auth-wrap{ min-height:100vh; min-height:100dvh; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at top, #211F26, var(--noir) 65%); padding:24px; overflow-y:auto; overscroll-behavior:contain; }
.crs-auth-card{ background:#fff; border-radius:20px; padding:38px 32px; width:100%; max-width:400px; box-shadow:0 24px 60px rgba(0,0,0,.4); }
.crs-auth-brand{ display:flex; align-items:center; gap:8px; color:var(--gold); font-size:12px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; margin-bottom:18px; }
.crs-auth-title{ font-size:26px; margin:0 0 6px; }
.crs-auth-sub{ font-size:13px; color:var(--muted); margin:0 0 22px; line-height:1.5; }
.crs-auth-form{ display:grid; gap:16px; }
.crs-auth-link{ display:block; width:100%; text-align:center; background:none; border:none; color:#8A6A1F; font-size:12.5px; font-weight:600; margin-top:18px; cursor:pointer; }

.spin{ animation:crs-spin 1s linear infinite; }
@keyframes crs-spin{ from{ transform:rotate(0deg);} to{ transform:rotate(360deg);} }

@media print{ .no-print{ display:none !important; } body{ background:#fff; } }
@media (max-width: 640px){ .crs-nav{ display:none; } }
`;

function Shell() {
  const { session, perfil, loading, recovery, signOut } = useAuth();
  const [authView, setAuthView] = useState("login");
  const [page, setPage] = useState("locacoes");

  if (loading) {
    return (
      <div className="crs-app">
        <style>{CSS}</style>
        <div className="crs-empty" style={{ paddingTop: 120 }}>Carregando…</div>
      </div>
    );
  }

  if (session && recovery) {
    return (
      <div className="crs-app">
        <style>{CSS}</style>
        <ResetPasswordPage />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="crs-app">
        <style>{CSS}</style>
        {authView === "login" ? <LoginPage onGoSignup={() => setAuthView("signup")} /> : <SignupPage onGoLogin={() => setAuthView("login")} />}
      </div>
    );
  }

  if (!perfil || perfil.status !== "ativo") {
    return (
      <div className="crs-app">
        <style>{CSS}</style>
        <div className="crs-auth-wrap">
          <div className="crs-auth-card">
            <div className="crs-auth-brand"><Car size={18} /> Locação de Carros</div>
            <h1 className="crs-display crs-auth-title">Aguardando aprovação</h1>
            <p className="crs-auth-sub">Sua conta ainda não foi liberada por um administrador. Tente novamente mais tarde.</p>
            <button className="crs-btn crs-btn-outline crs-btn-block" onClick={signOut}>Sair</button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = perfil.role === "admin";

  return (
    <div className="crs-app">
      <style>{CSS}</style>
      <div className="crs-topbar no-print">
        <div className="crs-topbar-left">
          <div className="crs-brand">
            <div className="crs-brand-mark"><Car size={16} /></div>
            <span className="crs-brand-name">Locação de Carros</span>
          </div>
          <nav className="crs-nav">
            <button className={page === "locacoes" ? "active" : ""} onClick={() => setPage("locacoes")}><ClipboardList size={14} /> Locações</button>
            <button className={page === "clientes" ? "active" : ""} onClick={() => setPage("clientes")}><Users size={14} /> Clientes</button>
            <button className={page === "veiculos" ? "active" : ""} onClick={() => setPage("veiculos")}><Car size={14} /> Veículos</button>
            {isAdmin && <button className={page === "relatorios" ? "active" : ""} onClick={() => setPage("relatorios")}><BarChart3 size={14} /> Relatórios</button>}
            {isAdmin && <button className={page === "usuarios" ? "active" : ""} onClick={() => setPage("usuarios")}><ShieldCheck size={14} /> Usuários</button>}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="crs-userchip">
            {isAdmin && <Crown size={13} color="var(--gold)" />}
            <b>{perfil.nome || perfil.email}</b> · {isAdmin ? "Administrador" : "Operador"}
          </div>
          <button className="crs-logout" onClick={signOut} title="Sair"><LogOut size={15} /></button>
        </div>
      </div>

      <div className="no-print" style={{ display: "flex", gap: 6, padding: "10px 14px", overflowX: "auto", background: "#1B1A1E", flexShrink: 0 }}>
        <button style={navMobileStyle(page === "locacoes")} onClick={() => setPage("locacoes")}>Locações</button>
        <button style={navMobileStyle(page === "clientes")} onClick={() => setPage("clientes")}>Clientes</button>
        <button style={navMobileStyle(page === "veiculos")} onClick={() => setPage("veiculos")}>Veículos</button>
        {isAdmin && <button style={navMobileStyle(page === "relatorios")} onClick={() => setPage("relatorios")}>Relatórios</button>}
        {isAdmin && <button style={navMobileStyle(page === "usuarios")} onClick={() => setPage("usuarios")}>Usuários</button>}
      </div>

      <div className="crs-scroll-area">
        {page === "locacoes" && <LocacoesApp />}
        {page === "clientes" && <ClientsPage />}
        {page === "veiculos" && <VehiclesPage />}
        {page === "relatorios" && isAdmin && <ReportsPage />}
        {page === "usuarios" && isAdmin && <UsersPage />}
      </div>
    </div>
  );
}

function navMobileStyle(active) {
  return {
    background: active ? "rgba(198,161,91,.16)" : "transparent",
    color: active ? "#E7D5AC" : "#C9C4B6",
    border: active ? "1px solid rgba(198,161,91,.4)" : "1px solid #2A2820",
    borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
  };
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
