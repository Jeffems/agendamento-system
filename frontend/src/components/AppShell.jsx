import { CalendarDays, CreditCard, LogOut, Menu, MessageCircle, Settings2, Users, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { logout } from "./logout";

const links = [
  { to: "/", label: "Agenda", icon: CalendarDays, end: true },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/settings/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/configuracoes", label: "Configurações", icon: Settings2 },
  { to: "/assinatura", label: "Assinatura", icon: CreditCard },
];

export default function AppShell({ children }) {
  const [aberto, setAberto] = useState(false);
  const usuario = JSON.parse(localStorage.getItem("user") || "null");
  const nome = usuario?.nome || "Minha conta";
  const iniciais = nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f7fb] lg:flex">
      {aberto && <button aria-label="Fechar menu" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setAberto(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${aberto ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500"><CalendarDays className="h-5 w-5" /></span><div><p className="font-bold tracking-tight">AgendaPro</p><p className="text-xs text-slate-400">Gestão de horários</p></div></div>
          <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setAberto(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">Principal</p>
          {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setAberto(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/25" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon className="h-5 w-5" />{label}</NavLink>)}
        </nav>
        <div className="border-t border-white/10 p-4"><div className="mb-3 flex items-center gap-3 px-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xs font-bold">{iniciais || "MC"}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{nome}</p><p className="text-xs text-slate-400">Conta profissional</p></div></div><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-300"><LogOut className="h-4 w-4" />Sair da conta</button></div>
      </aside>
      <div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:hidden"><button onClick={() => setAberto(true)} className="rounded-xl border border-slate-200 p-2.5"><Menu className="h-5 w-5" /></button><span className="ml-3 font-bold">AgendaPro</span></header>{children}</div>
    </div>
  );
}
