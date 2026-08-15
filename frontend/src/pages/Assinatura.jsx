import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AppShell from "../components/AppShell";
import { billingAPI } from "../services/api";

const statusLabel = { trialing: "Período de teste", active: "Ativa", past_due: "Pagamento pendente", canceled: "Cancelada", unpaid: "Não paga", incomplete: "Incompleta" };

export default function Assinatura() {
  const [params] = useSearchParams();
  const [planos, setPlanos] = useState([]);
  const [assinatura, setAssinatura] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState("");

  async function carregar() {
    try { const [p, a] = await Promise.all([billingAPI.planos(), billingAPI.assinatura()]); setPlanos(p.data); setAssinatura(a.data); }
    catch (e) { toast.error(e.response?.data?.error || "Erro ao carregar assinatura"); }
    finally { setCarregando(false); }
  }
  useEffect(() => { if (params.get("checkout") === "sucesso") toast.success("Pagamento recebido. Sua assinatura será atualizada em instantes."); if (params.get("checkout") === "cancelado") toast.info("Checkout cancelado"); carregar(); }, []);

  async function assinar(plano) {
    if (assinatura?.tem_assinatura) return portal();
    try { setProcessando(plano); const { data } = await billingAPI.checkout(plano); window.location.href = data.url; }
    catch (e) { toast.error(e.response?.data?.error || "Não foi possível iniciar o pagamento"); setProcessando(""); }
  }
  async function portal() {
    try { setProcessando("portal"); const { data } = await billingAPI.portal(); window.location.href = data.url; }
    catch (e) { toast.error(e.response?.data?.error || "Não foi possível abrir o portal"); setProcessando(""); }
  }

  const formatarData = (valor) => valor ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(valor)) : "—";
  const diasTeste = assinatura?.trial_ends_at ? Math.max(0, Math.ceil((new Date(assinatura.trial_ends_at) - new Date()) / 86400000)) : 0;

  return <AppShell><main className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
    <header className="mb-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Conta e cobrança</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Planos e assinatura</h1><p className="mt-2 text-slate-500">Escolha o plano ideal e gerencie sua cobrança com segurança.</p></header>
    {carregando ? <div className="app-surface p-16 text-center text-slate-500">Carregando assinatura...</div> : <>
      <section className="app-surface mb-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className={`grid h-12 w-12 place-items-center rounded-xl ${assinatura?.acesso_ativo ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}><CreditCard className="h-6 w-6"/></span><div><p className="text-sm text-slate-500">Situação atual</p><h2 className="text-lg font-bold text-slate-950">{statusLabel[assinatura?.status] || assinatura?.status} · {assinatura?.plano === "teste" ? "Teste grátis" : assinatura?.plano === "basico" ? "Básico" : "Profissional"}</h2><p className="mt-1 text-sm text-slate-500">{assinatura?.status === "trialing" ? `${diasTeste} dia(s) restantes · termina em ${formatarData(assinatura.trial_ends_at)}` : assinatura?.periodo_fim ? `Período atual até ${formatarData(assinatura.periodo_fim)}` : "Escolha um plano para continuar"}{assinatura?.cancelar_no_fim && " · cancelamento agendado"}</p></div></div><div className="flex flex-wrap gap-2">{assinatura?.is_admin && <a href="/admin/assinaturas" className="btn-secondary">Painel administrativo</a>}{assinatura?.tem_assinatura && <button onClick={portal} disabled={processando === "portal"} className="btn-secondary"><ExternalLink className="h-4 w-4"/>{processando === "portal" ? "Abrindo..." : "Gerenciar cobrança"}</button>}</div></section>
      {!assinatura?.acesso_ativo && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><b>Seu acesso está pausado.</b> Escolha um plano para voltar a usar a agenda. Seus dados permanecem preservados.</div>}
      <div className="grid gap-6 lg:grid-cols-2">{planos.map((p) => { const destaque = p.id === "profissional"; const atual = assinatura?.plano === p.id && assinatura?.status === "active"; return <article key={p.id} className={`relative overflow-hidden rounded-2xl border bg-white p-7 shadow-sm ${destaque ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-slate-200"}`}>{destaque && <span className="absolute right-5 top-5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">MAIS COMPLETO</span>}<div className={`grid h-11 w-11 place-items-center rounded-xl ${destaque ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>{destaque ? <ShieldCheck className="h-5 w-5"/> : <CreditCard className="h-5 w-5"/>}</div><h2 className="mt-5 text-2xl font-bold">{p.nome}</h2><p className="mt-3"><span className="text-4xl font-bold tracking-tight">R$ {(p.valor_centavos / 100).toFixed(2).replace(".", ",")}</span><span className="text-slate-500">/mês</span></p><ul className="mt-7 space-y-3">{p.recursos.map((r) => <li key={r} className="flex items-center gap-3 text-sm text-slate-600"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500"/>{r}</li>)}</ul><button disabled={Boolean(processando) || atual} onClick={() => assinar(p.id)} className={`${destaque ? "btn-primary" : "btn-secondary"} mt-8 w-full`}>{atual ? "Plano atual" : assinatura?.tem_assinatura ? "Alterar pelo portal" : processando === p.id ? "Abrindo checkout..." : `Assinar ${p.nome}`}</button></article>; })}</div>
      <div className="mt-8 flex items-start gap-3 rounded-xl bg-slate-100 p-4 text-sm text-slate-600"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-500"/><p>O pagamento é processado pelo Stripe. Os dados do cartão não passam pelos servidores da AgendaPro. Alterações e cancelamentos são feitos no Portal do Cliente.</p></div>
    </>}
  </main></AppShell>;
}
