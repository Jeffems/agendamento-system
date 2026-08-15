import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Briefcase, CalendarDays, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { agendaPublicaAPI } from "../services/api";

const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

export default function AgendamentoPublico() {
  const { slug } = useParams();
  const [agenda, setAgenda] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [horario, setHorario] = useState("");
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [confirmacao, setConfirmacao] = useState(null);
  const [form, setForm] = useState({ nome: "", sobrenome: "", contato: "", email: "", observacoes: "" });

  useEffect(() => { agendaPublicaAPI.obter(slug).then(({ data }) => setAgenda(data)).catch((e) => setErro(e.response?.data?.error || "Agenda indisponível")).finally(() => setCarregando(false)); }, [slug]);
  useEffect(() => {
    setHorario(""); setHorarios([]);
    if (!servicoId || !data) return;
    setBuscandoHorarios(true);
    agendaPublicaAPI.horarios(slug, data, servicoId).then(({ data }) => setHorarios(data.horarios || [])).catch((e) => setErro(e.response?.data?.error || "Erro ao buscar horários")).finally(() => setBuscandoHorarios(false));
  }, [slug, servicoId, data]);

  const servico = agenda?.servicos.find((s) => s.id === servicoId);
  const dataMaxima = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + (agenda?.limite_agendamento_dias || 60)); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }, [agenda]);
  const formatarHora = (iso) => new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: agenda?.timezone || "America/Cuiaba" }).format(new Date(iso));
  const formatarData = (iso) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: agenda?.timezone || "America/Cuiaba" }).format(new Date(iso));

  async function confirmar(event) {
    event.preventDefault(); setErro("");
    if (!servicoId || !horario) return setErro("Escolha o serviço, a data e o horário");
    try { setEnviando(true); const { data: criado } = await agendaPublicaAPI.agendar(slug, { ...form, servicoId, data_agendamento: horario }); setConfirmacao(criado); }
    catch (e) { setErro(e.response?.data?.error || "Não foi possível concluir o agendamento"); if (e.response?.status === 409) { setHorario(""); agendaPublicaAPI.horarios(slug, data, servicoId).then(({ data }) => setHorarios(data.horarios || [])); } }
    finally { setEnviando(false); }
  }

  if (carregando) return <TelaCentro><div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"/><p className="mt-4 text-sm text-slate-500">Carregando agenda...</p></TelaCentro>;
  if (erro && !agenda) return <TelaCentro><CalendarDays className="mx-auto h-12 w-12 text-slate-300"/><h1 className="mt-4 text-xl font-bold">Agenda indisponível</h1><p className="mt-2 text-slate-500">{erro}</p></TelaCentro>;
  if (confirmacao) return <TelaCentro><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-9 w-9"/></div><h1 className="mt-6 text-2xl font-bold">Agendamento confirmado!</h1><p className="mt-2 text-slate-500">Obrigado, {confirmacao.nome}. Seu horário foi reservado.</p><div className="mt-6 rounded-xl bg-slate-50 p-5 text-left"><p className="font-bold">{confirmacao.servico}</p><p className="mt-2 text-sm capitalize text-slate-600">{formatarData(confirmacao.data_agendamento)} às {formatarHora(confirmacao.data_agendamento)}</p></div></TelaCentro>;

  return <div className="min-h-screen bg-[#f6f7fb]"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-5 sm:px-6"><div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-indigo-600 text-white">{agenda.logo_url ? <img src={agenda.logo_url} alt="" className="h-full w-full object-cover"/> : <CalendarDays className="h-6 w-6"/>}</div><div><h1 className="text-lg font-bold text-slate-950">{agenda.nome_negocio || agenda.nome || "Agendamento online"}</h1><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">{agenda.endereco_negocio && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{agenda.endereco_negocio}</span>}{agenda.telefone_negocio && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5"/>{agenda.telefone_negocio}</span>}</div></div></div></header>
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Agendamento online</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Escolha o melhor horário</h2><p className="mt-2 text-slate-500">Preencha os dados abaixo. Leva menos de dois minutos.</p></div>
      <form onSubmit={confirmar} className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><div className="space-y-6"><section className="app-surface p-6"><Titulo numero="1" titulo="Escolha o serviço"/><div className="mt-5 grid gap-3">{agenda.servicos.map((s) => <button type="button" key={s.id} onClick={() => setServicoId(s.id)} className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${servicoId === s.id ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10" : "border-slate-200 hover:border-indigo-200"}`}><span className="h-10 w-1 rounded-full" style={{ background: s.cor }}/><Briefcase className="h-5 w-5 text-slate-400"/><span className="min-w-0 flex-1"><b className="block text-slate-900">{s.nome}</b><small className="text-slate-500">{s.descricao || `${s.duracao_min} minutos`}</small></span><span className="text-right text-sm font-semibold">{s.preco != null ? `R$ ${Number(s.preco).toFixed(2).replace(".", ",")}` : ""}<small className="block font-normal text-slate-500">{s.duracao_min} min</small></span></button>)}</div></section>
        <section className="app-surface p-6"><Titulo numero="2" titulo="Escolha a data e o horário"/><label className="mt-5 block"><span className="mb-2 block text-sm font-semibold">Data</span><input type="date" min={hoje()} max={dataMaxima} value={data} onChange={(e) => setData(e.target.value)} disabled={!servicoId} className="app-input"/></label>{data && <div className="mt-5"><span className="mb-3 block text-sm font-semibold">Horários disponíveis</span>{buscandoHorarios ? <p className="text-sm text-slate-500">Buscando horários...</p> : horarios.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{horarios.map((h) => <button type="button" key={h} onClick={() => setHorario(h)} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${horario === h ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white hover:border-indigo-300"}`}>{formatarHora(h)}</button>)}</div> : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Não há horários disponíveis nessa data.</p>}</div>}</section></div>
        <section className="app-surface h-fit p-6 lg:sticky lg:top-6"><Titulo numero="3" titulo="Seus dados"/><div className="mt-5 space-y-4"><Campo icon={User} label="Nome" required value={form.nome} onChange={(v) => setForm({ ...form, nome: v })}/><Campo icon={User} label="Sobrenome" value={form.sobrenome} onChange={(v) => setForm({ ...form, sobrenome: v })}/><Campo icon={MessageCircle} label="WhatsApp" type="tel" required value={form.contato} onChange={(v) => setForm({ ...form, contato: v })}/><Campo icon={Mail} label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })}/><label><span className="mb-2 block text-sm font-semibold">Observações</span><textarea rows="3" className="app-input resize-none" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })}/></label></div>{servico && horario && <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm"><p className="font-bold">Resumo</p><p className="mt-2 text-slate-600">{servico.nome} · {servico.duracao_min} min</p><p className="mt-1 capitalize text-slate-600">{formatarData(horario)} às {formatarHora(horario)}</p></div>}{erro && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{erro}</p>}<button disabled={enviando || !servicoId || !horario} className="btn-primary mt-6 w-full">{enviando ? "Confirmando..." : "Confirmar agendamento"}</button><p className="mt-4 text-center text-xs text-slate-400">Seus dados serão usados somente para este atendimento.</p></section></form>
    </main></div>;
}

function Titulo({ numero, titulo }) { return <div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{numero}</span><h3 className="font-bold text-slate-900">{titulo}</h3></div>; }
function Campo({ icon: Icon, label, value, onChange, type="text", required=false }) { return <label><span className="mb-2 block text-sm font-semibold">{label}{required && " *"}</span><div className="relative"><Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="app-input pl-11"/></div></label>; }
function TelaCentro({ children }) { return <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-5"><div className="app-surface w-full max-w-md p-8 text-center">{children}</div></div>; }
