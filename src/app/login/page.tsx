"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, authBtn, authInput, Divider, GoogleButton, Notice } from "@/components/auth/AuthShell";
import { authError, safeNext } from "@/lib/authUtil";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("erro") ? "Não foi possível entrar. Tente novamente." : "");
  const info = params.get("msg") === "senha-atualizada" ? "Senha atualizada. Entre com a nova senha." : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error: err } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (err) { setError(authError(err.message)); setBusy(false); return; }
    router.replace(next);
    router.refresh();
  }

  async function google() {
    setBusy(true); setError("");
    const { error: err } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (err) { setError(authError(err.message)); setBusy(false); }
  }

  return (
    <AuthShell title="Acesse sua conta">
      <GoogleButton onClick={google} busy={busy} />
      <Divider />
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1.5">E-mail</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} placeholder="seu@email.com" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1.5">Senha</label>
          <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInput} placeholder="••••••••" />
        </div>
        <div className="flex justify-end">
          <Link href="/esqueci-senha" className="text-sm text-[#00A152] font-medium hover:underline">Esqueci minha senha</Link>
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        {info && <Notice kind="ok">{info}</Notice>}
        <button type="submit" disabled={busy} className={authBtn}>{busy ? "Entrando..." : "Entrar"}</button>
      </form>
      <div className="mt-8 text-center text-sm font-medium text-gray-500">
        Não tem uma conta? <Link href="/cadastro" className="text-[#00A152] hover:underline">Criar conta</Link>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
