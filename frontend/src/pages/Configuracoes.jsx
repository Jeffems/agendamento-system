import { useEffect, useState } from "react";
import { BriefcaseBusiness, Building2, Check, Clock3, Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import AppShell from "../components/AppShell";
import { configuracoesAPI, servicosAPI } from "../services/api";

const dias = [
  ["segunda", "Segunda-feira"], ["terca", "Terça-feira"], ["quarta", "Quarta-feira"],
  ["quinta", "Quinta-feira"], ["sexta", "Sexta-feira"], ["sabado", "Sábado"], ["domingo", "Domingo"],
];
const horariosPadrao = Object.fromEntries(dias.map(([id], i) => [id, { ativo: i < 5, inicio: "08:00", fim: "18:00" }]));
const servicoInicial = { nome: "", descricao: "", preco: "", duracao_min: 60, cor: "#4f46e5", ativo: true };

export default function Configuracoes() {
  const [aba, setAba] = useState("negocio");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [config, setConfig] = useState({ nome_negocio: "", telefone_negocio: "", endereco_negocio: "", logo_url: "", timezone: "America/Cuiaba", horarios_funcionamento: horariosPadrao, lembrete_email_ativo: true, lembrete_whatsapp_ativo: true });
  const [servicos, setServicos] = useState([]);
  const [formServico, setFormServico] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  async function carregar() {
    try {
      setCarregando(true);
      const [c, s] = await Promise.all([configuracoesAPI.obter(), servicosAPI.listar()]);
      setConfig((atual) => ({ ...atual, ...c.data, horarios_funcionamento: { ...horariosPadrao, ...(c.data.horarios_funcionamento || {}) } }));
      setServicos(s.data);
    } catch (e) { toast.error(e.response?.data?.error || "Erro ao carregar configurações"); }
    finally { setCarregando(false); }
  }
  useEffect(() => { carregar(); }, []);

  async function salvarConfig(event) {
    event.preventDefault();
    try { setSalvando(true); await configuracoesAPI.atualizar({ ...config, onboarding_concluido: true }); toast.success("Configurações salvas"); }
    catch (e) { toast.error(e.response?.data?.error || "Erro ao salvar configurações"); }
    finally { setSalvando(false); }
  }

  function abrirServico(servico = null) {
    setEditandoId(servico?.id || null);
    setFormServico(servico ? { ...servico, preco: servico.preco ?? "" } : servicoInicial);
  }
  async function salvarServico(event) {
    event.preventDefault();
    try {
      setSalvando(true);
      const dados = { ...formServico, preco: formServico.preco === "" ? null : Number(formServico.preco), duracao_min: Number(formServico.duracao_min) };
      if (editandoId) await servicosAPI.atualizar(editandoId, dados); else await servicosAPI.criar(dados);
      toast.success(editandoId ? "Serviço atualizado" : "Serviço cadastrado"); setFormServico(null); setEditandoId(null); await carregar();
    } catch (e) { toast.error(e.response?.data?.error || "Erro ao salvar serviço"); }
    finally { setSalvando(false); }
  }
  async function excluir(servico) {
    if (!confirm(`Excluir o serviço ${servico.nome}?`)) return;
    try { await servicosAPI.deletar(servico.id); toast.success("Serviço excluído"); await carregar(); }
    catch (e) { toast.error(e.response?.data?.error || "Erro ao excluir serviço"); }
  }

  const campo = (nome, label, placeholder, type = "text") => <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input type={type} className="app-input" value={config[nome] || ""} placeholder={placeholder} onChange={(e) => setConfig({ ...config, [nome]: e.target.value })}/></label>;

  return <AppShell><main className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
    <header className="mb-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Personalização</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Configurações do negócio</h1><p className="mt-2 text-slate-500">Prepare sua conta para trabalhar com a identidade e a rotina da sua empresa.</p></header>
    <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5">
      {[["negocio", Building2, "Meu negócio"], ["servicos", BriefcaseBusiness, "Serviços"], ["horarios", Clock3, "Horários"]].map(([id, Icon, nome]) => <button key={id} onClick={() => setAba(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${aba === id ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}><Icon className="h-4 w-4"/>{nome}</button>)}
    </div>
    {carregando ? <div className="app-surface p-16 text-center text-slate-500">Carregando configurações...</div> : aba === "servicos" ? <section>
      <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold">Catálogo de serviços</h2><p className="text-sm text-slate-500">Preço e duração serão sugeridos no agendamento.</p></div><button onClick={() => abrirServico()} className="btn-primary"><Plus className="h-4 w-4"/>Novo serviço</button></div>
      {formServico && <form onSubmit={salvarServico} className="app-surface mb-6 p-6"><div className="mb-5 flex items-center justify-between"><h3 className="font-bold">{editandoId ? "Editar serviço" : "Novo serviço"}</h3><button type="button" onClick={() => setFormServico(null)}><X className="h-5 w-5"/></button></div><div className="grid gap-5 md:grid-cols-2"><label><span className="mb-2 block text-sm font-semibold">Nome</span><input required minLength={2} className="app-input" value={formServico.nome} onChange={(e) => setFormServico({ ...formServico, nome: e.target.value })}/></label><label><span className="mb-2 block text-sm font-semibold">Descrição</span><input className="app-input" value={formServico.descricao || ""} onChange={(e) => setFormServico({ ...formServico, descricao: e.target.value })}/></label><label><span className="mb-2 block text-sm font-semibold">Preço (R$)</span><input type="number" min="0" step="0.01" className="app-input" value={formServico.preco} onChange={(e) => setFormServico({ ...formServico, preco: e.target.value })}/></label><label><span className="mb-2 block text-sm font-semibold">Duração</span><select className="app-input" value={formServico.duracao_min} onChange={(e) => setFormServico({ ...formServico, duracao_min: e.target.value })}>{[15,30,45,60,90,120,180,240].map(v => <option key={v} value={v}>{v} minutos</option>)}</select></label></div><div className="mt-6 flex justify-end"><button disabled={salvando} className="btn-primary"><Save className="h-4 w-4"/>{salvando ? "Salvando..." : "Salvar serviço"}</button></div></form>}
      <div className="grid gap-4 md:grid-cols-2">{servicos.map((s) => <article key={s.id} className="app-surface p-5"><div className="flex items-start justify-between"><div className="flex gap-3"><span className="mt-1 h-3 w-3 rounded-full" style={{ background: s.cor }}/><div><h3 className="font-bold text-slate-900">{s.nome}</h3><p className="mt-1 text-sm text-slate-500">{s.descricao || "Sem descrição"}</p></div></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.ativo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{s.ativo ? "Ativo" : "Inativo"}</span></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><p className="text-sm"><b>{s.duracao_min} min</b>{s.preco != null && ` · R$ ${Number(s.preco).toFixed(2).replace(".", ",")}`}</p><div className="flex gap-1"><button onClick={() => abrirServico(s)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Edit3 className="h-4 w-4"/></button><button onClick={() => excluir(s)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4"/></button></div></div></article>)}{!servicos.length && <div className="app-surface col-span-full p-14 text-center text-slate-500">Cadastre seu primeiro serviço para agilizar novos agendamentos.</div>}</div>
    </section> : <form onSubmit={salvarConfig} className="app-surface p-6 sm:p-8">{aba === "negocio" ? <><div className="mb-6"><h2 className="text-xl font-bold">Identidade do negócio</h2><p className="text-sm text-slate-500">Essas informações identificam sua empresa dentro da plataforma.</p></div><div className="grid gap-5 md:grid-cols-2">{campo("nome_negocio", "Nome do negócio", "Ex.: Studio Mariana")}{campo("telefone_negocio", "Telefone comercial", "(66) 99999-9999")}{campo("endereco_negocio", "Endereço", "Rua, número, bairro e cidade")}{campo("logo_url", "URL do logotipo", "https://...")}</div><div className="mt-7 grid gap-4 md:grid-cols-2"><Toggle label="Lembretes por e-mail" ativo={config.lembrete_email_ativo} onChange={(v) => setConfig({ ...config, lembrete_email_ativo: v })}/><Toggle label="Lembretes por WhatsApp" ativo={config.lembrete_whatsapp_ativo} onChange={(v) => setConfig({ ...config, lembrete_whatsapp_ativo: v })}/></div></> : <><div className="mb-6"><h2 className="text-xl font-bold">Horários de funcionamento</h2><p className="text-sm text-slate-500">Defina os períodos em que sua empresa normalmente atende.</p></div><div className="divide-y divide-slate-100">{dias.map(([id, nome]) => { const h = config.horarios_funcionamento[id]; return <div key={id} className="grid gap-3 py-4 sm:grid-cols-[1fr_130px_130px] sm:items-center"><label className="flex items-center gap-3 font-semibold"><input type="checkbox" checked={h.ativo} onChange={(e) => setConfig({ ...config, horarios_funcionamento: { ...config.horarios_funcionamento, [id]: { ...h, ativo: e.target.checked } } })}/>{nome}</label><input type="time" disabled={!h.ativo} className="app-input" value={h.inicio} onChange={(e) => setConfig({ ...config, horarios_funcionamento: { ...config.horarios_funcionamento, [id]: { ...h, inicio: e.target.value } } })}/><input type="time" disabled={!h.ativo} className="app-input" value={h.fim} onChange={(e) => setConfig({ ...config, horarios_funcionamento: { ...config.horarios_funcionamento, [id]: { ...h, fim: e.target.value } } })}/></div>})}</div></>}<div className="mt-8 flex justify-end border-t border-slate-100 pt-6"><button disabled={salvando} className="btn-primary"><Save className="h-4 w-4"/>{salvando ? "Salvando..." : "Salvar configurações"}</button></div></form>}
  </main></AppShell>;
}

function Toggle({ label, ativo, onChange }) {
  return <button type="button" onClick={() => onChange(!ativo)} className={`flex items-center justify-between rounded-xl border p-4 text-left ${ativo ? "border-indigo-200 bg-indigo-50" : "border-slate-200"}`}><span className="font-semibold text-slate-700">{label}</span><span className={`grid h-6 w-6 place-items-center rounded-full ${ativo ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"}`}>{ativo && <Check className="h-4 w-4"/>}</span></button>;
}
