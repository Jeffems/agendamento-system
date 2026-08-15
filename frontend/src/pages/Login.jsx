import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { brand } from "../config/brand";

export default function Login() {
  const navigate = useNavigate();
  const [inviteToken, setInviteToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const entrar = async (event) => {
    event.preventDefault();
    if (!email || !password) return toast.error("Informe e-mail e senha");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Bem-vindo de volta!");
      navigate("/app");
    } catch (error) {
      toast.error(error.response?.data?.error || "Não foi possível entrar");
    } finally { setLoading(false); }
  };

  const usarConvite = () => {
    if (inviteToken.trim().length < 10) return toast.error("Token de convite inválido");
    navigate(`/register?token=${inviteToken.trim()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,.35),transparent_36%),radial-gradient(circle_at_80%_85%,rgba(14,165,233,.18),transparent_32%)]" />
        <div className="relative flex items-center gap-3 text-white"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500"><CalendarCheck2 className="h-6 w-6" /></span><div><p className="text-lg font-bold">{brand.name}</p><p className="text-xs text-slate-400">Gestão de horários</p></div></div>
        <div className="relative max-w-xl"><span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200"><ShieldCheck className="h-4 w-4" />Seu negócio organizado</span><h1 className="text-5xl font-bold leading-tight tracking-tight text-white">Mais tempo para atender.<br/><span className="text-indigo-400">Menos tempo organizando.</span></h1><p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">Centralize sua agenda, acompanhe clientes e envie lembretes em uma experiência simples e profissional.</p></div>
        <p className="relative text-xs text-slate-500">{brand.name} · Plataforma segura de agendamentos</p>
      </section>
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white"><CalendarCheck2 className="h-6 w-6" /></span><span className="text-xl font-bold">{brand.name}</span></div>
          <div className="app-surface p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Área do cliente</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Acesse sua conta</h2><p className="mt-2 text-sm text-slate-500">Entre para gerenciar sua rotina de atendimentos.</p>
            <form onSubmit={entrar} className="mt-8 space-y-5">
              <div><label className="mb-2 block text-sm font-semibold text-slate-700">E-mail</label><div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input type="email" className="app-input pl-11" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" autoComplete="email" required /></div></div>
              <div><label className="mb-2 block text-sm font-semibold text-slate-700">Senha</label><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input type={mostrarSenha ? "text" : "password"} className="app-input pl-11 pr-11" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" autoComplete="current-password" required/><button type="button" onClick={() => setMostrarSenha((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100">{mostrarSenha ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></div></div>
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Entrando..." : "Entrar na plataforma"}</button>
            </form>
            <div className="my-7 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200"/><span className="text-xs font-medium text-slate-400">PRIMEIRO ACESSO</span><span className="h-px flex-1 bg-slate-200"/></div>
            <p className="mb-3 text-sm text-slate-500">Recebeu um convite? Cole o código abaixo.</p><div className="flex gap-2"><input className="app-input min-w-0" value={inviteToken} onChange={(e) => setInviteToken(e.target.value)} placeholder="Token do convite"/><button type="button" onClick={usarConvite} className="btn-secondary px-4">Continuar</button></div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.</p>
        </div>
      </main>
    </div>
  );
}
