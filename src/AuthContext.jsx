import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadPerfil(userId) {
    const { data } = await supabase.from("perfis").select("*").eq("id", userId).single();
    setPerfil(data || null);
    return data;
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await loadPerfil(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s) await loadPerfil(s.user.id);
      else setPerfil(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function lockMessage(reason, locked_until) {
    if (reason === "bloqueado_admin") return "Sua conta está bloqueada pelo administrador.";
    if (reason === "muitas_tentativas") {
      const mins = Math.max(1, Math.ceil((new Date(locked_until) - new Date()) / 60000));
      return `Muitas tentativas erradas. Tente novamente em ${mins} minuto(s).`;
    }
    return "Não foi possível entrar.";
  }

  async function signIn(email, password) {
    const { data: check } = await supabase.rpc("check_can_login", { p_email: email });
    if (check && check.allowed === false) {
      return { error: lockMessage(check.reason, check.locked_until) };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      await supabase.rpc("record_failed_login", { p_email: email });
      return { error: "E-mail ou senha incorretos." };
    }
    await supabase.rpc("record_successful_login", { p_email: email });
    const p = await loadPerfil(data.user.id);
    if (!p || p.status !== "ativo") {
      await supabase.auth.signOut();
      return { error: "Sua conta está bloqueada. Fale com o administrador." };
    }
    return { error: null };
  }

  async function signUp(email, password, nome) {
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { nome } },
    });
    if (error) return { error: error.message, firstAdmin: false };
    const { count } = await supabase.from("perfis").select("*", { count: "exact", head: true });
    return { error: null, firstAdmin: count === 1 };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setPerfil(null);
  }

  return (
    <AuthCtx.Provider value={{ session, perfil, loading, signIn, signUp, signOut, reloadPerfil: () => session && loadPerfil(session.user.id) }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
