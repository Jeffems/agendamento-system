import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, MessageCircle, RefreshCw, Search, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import AppShell from "../components/AppShell";
import { whatsappInboxAPI } from "../services/api";

function telefoneFormatado(valor) {
  const numero = String(valor || "");
  if (numero.startsWith("55") && numero.length >= 12) {
    const ddd = numero.slice(2, 4);
    const local = numero.slice(4);
    return `+55 (${ddd}) ${local.length === 9 ? `${local.slice(0, 5)}-${local.slice(5)}` : `${local.slice(0, 4)}-${local.slice(4)}`}`;
  }
  return numero ? `+${numero}` : "Contato sem número";
}

function hora(valor) {
  if (!valor) return "";
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(valor));
}

function dataLista(valor) {
  if (!valor) return "";
  const data = new Date(valor);
  const hoje = new Date();
  if (data.toDateString() === hoje.toDateString()) return hora(valor);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(data);
}

function statusMensagem(mensagem) {
  const rotulos = { accepted: "Enviada", sent: "Enviada", delivered: "Entregue", read: "Lida", failed: "Falhou" };
  return rotulos[mensagem.status] || mensagem.status;
}

export default function ConversasWhatsApp() {
  const [conversas, setConversas] = useState([]);
  const [ativa, setAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef(null);

  const carregarConversas = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setCarregando(true);
      const { data } = await whatsappInboxAPI.listarConversas(busca.trim());
      setConversas(data);
      setAtiva((atual) => atual ? data.find((item) => item.id === atual.id) || atual : atual);
    } catch (erro) {
      if (!silencioso) toast.error(erro?.response?.data?.error || "Não foi possível carregar as conversas");
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, [busca]);

  const carregarMensagens = useCallback(async (conversaId, silencioso = false) => {
    if (!conversaId) return;
    try {
      if (!silencioso) setCarregandoMensagens(true);
      const { data } = await whatsappInboxAPI.listarMensagens(conversaId);
      setMensagens(data.mensagens);
      if (!silencioso) setTimeout(() => fimRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (erro) {
      if (!silencioso) toast.error(erro?.response?.data?.error || "Não foi possível carregar as mensagens");
    } finally {
      if (!silencioso) setCarregandoMensagens(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => carregarConversas(), 250);
    return () => clearTimeout(timer);
  }, [carregarConversas]);

  useEffect(() => {
    const timer = setInterval(() => {
      carregarConversas(true);
      if (ativa?.id) carregarMensagens(ativa.id, true);
    }, 10000);
    return () => clearInterval(timer);
  }, [ativa?.id, carregarConversas, carregarMensagens]);

  async function abrirConversa(conversa) {
    setAtiva(conversa);
    setMensagens([]);
    await Promise.all([
      carregarMensagens(conversa.id),
      conversa.nao_lidas ? whatsappInboxAPI.marcarLida(conversa.id).catch(() => null) : Promise.resolve(),
    ]);
    setConversas((lista) => lista.map((item) => item.id === conversa.id ? { ...item, nao_lidas: 0 } : item));
  }

  async function enviar(event) {
    event.preventDefault();
    const mensagem = texto.trim();
    if (!ativa || !mensagem || enviando) return;
    try {
      setEnviando(true);
      const { data } = await whatsappInboxAPI.responder(ativa.id, mensagem);
      setTexto("");
      setMensagens((lista) => [...lista, data]);
      await carregarConversas(true);
      setTimeout(() => fimRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (erro) {
      toast.error(erro?.response?.data?.error || "Não foi possível enviar a mensagem");
    } finally {
      setEnviando(false);
    }
  }

  const janelaAberta = ativa?.janela_atendimento_ate && new Date(ativa.janela_atendimento_ate) > new Date();

  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-3 py-4 sm:px-6 lg:px-10 lg:py-8">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">WhatsApp Business</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Caixa de conversas</h1>
          </div>
          <button type="button" onClick={() => { carregarConversas(); if (ativa) carregarMensagens(ativa.id); }} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50" aria-label="Atualizar">
            <RefreshCw className="h-5 w-5" />
          </button>
        </header>

        <section className="flex h-[calc(100vh-10.5rem)] min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <aside className={`${ativa ? "hidden md:flex" : "flex"} w-full flex-col border-r border-slate-200 md:w-[350px] lg:w-[390px]`}>
            <div className="border-b border-slate-200 p-4">
              <label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-slate-500">
                <Search className="h-4 w-4" />
                <input value={busca} onChange={(e) => setBusca(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none" placeholder="Buscar nome ou telefone" />
              </label>
            </div>
            <div className="flex-1 overflow-y-auto">
              {carregando ? <div className="grid h-40 place-items-center text-sm text-slate-500">Carregando conversas...</div> : conversas.length === 0 ? (
                <div className="px-6 py-16 text-center"><MessageCircle className="mx-auto mb-3 h-9 w-9 text-slate-300" /><p className="font-semibold text-slate-700">Nenhuma conversa ainda</p><p className="mt-1 text-sm text-slate-500">As mensagens recebidas e os lembretes automáticos aparecerão aqui.</p></div>
              ) : conversas.map((conversa) => (
                <button key={conversa.id} type="button" onClick={() => abrirConversa(conversa)} className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${ativa?.id === conversa.id ? "bg-indigo-50/70" : ""}`}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><UserRound className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm text-slate-900">{conversa.nome || telefoneFormatado(conversa.contato)}</strong><small className="shrink-0 text-slate-400">{dataLista(conversa.ultima_mensagem_em)}</small></span><span className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-sm text-slate-500">{conversa.ultima_mensagem || "Nova conversa"}</span>{conversa.nao_lidas > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[11px] font-bold text-white">{conversa.nao_lidas > 99 ? "99+" : conversa.nao_lidas}</span>}</span></span>
                </button>
              ))}
            </div>
          </aside>

          <div className={`${ativa ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col bg-slate-50`}>
            {!ativa ? <div className="grid h-full place-items-center px-6 text-center"><div><span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-100 text-indigo-600"><MessageCircle className="h-8 w-8" /></span><h2 className="text-xl font-bold text-slate-900">Selecione uma conversa</h2><p className="mt-2 max-w-sm text-sm text-slate-500">Responda seus clientes e acompanhe a entrega dos lembretes em um único lugar.</p></div></div> : <>
              <header className="flex h-[73px] items-center gap-3 border-b border-slate-200 bg-white px-3 sm:px-5">
                <button type="button" onClick={() => setAtiva(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"><ArrowLeft className="h-5 w-5" /></button>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><UserRound className="h-5 w-5" /></span>
                <div className="min-w-0"><h2 className="truncate font-bold text-slate-900">{ativa.nome || telefoneFormatado(ativa.contato)}</h2><p className="truncate text-xs text-slate-500">{telefoneFormatado(ativa.contato)}</p></div>
              </header>

              <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
                {carregandoMensagens ? <div className="grid h-full place-items-center text-sm text-slate-500">Carregando mensagens...</div> : mensagens.map((mensagem) => {
                  const enviada = mensagem.direcao === "outbound";
                  return <div key={mensagem.id} className={`mb-3 flex ${enviada ? "justify-end" : "justify-start"}`}><div className={`max-w-[86%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[72%] ${enviada ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-white text-slate-800"}`}><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{mensagem.conteudo || "[Mensagem]"}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${enviada ? "text-indigo-100" : "text-slate-400"}`}><span>{hora(mensagem.mensagem_em)}</span>{enviada && <><CheckCircle2 className="h-3 w-3" /><span>{statusMensagem(mensagem)}</span></>}</div>{mensagem.status === "failed" && mensagem.erro_mensagem && <p className="mt-1 text-xs text-rose-200">{mensagem.erro_mensagem}</p>}</div></div>;
                })}
                <div ref={fimRef} />
              </div>

              <footer className="border-t border-slate-200 bg-white p-3 sm:p-4">
                {janelaAberta ? <p className="mb-2 flex items-center gap-1.5 text-xs text-emerald-700"><Clock className="h-3.5 w-3.5" />Janela de atendimento aberta até {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(ativa.janela_atendimento_ate))}</p> : <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">A janela de 24 horas expirou. O cliente precisa enviar uma nova mensagem ou você deve iniciar com um template aprovado.</p>}
                <form onSubmit={enviar} className="flex items-end gap-2">
                  <textarea value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(e); } }} disabled={!janelaAberta || enviando} maxLength={4000} rows={1} placeholder={janelaAberta ? "Digite uma mensagem..." : "Resposta indisponível"} className="max-h-32 min-h-[44px] flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100" />
                  <button disabled={!janelaAberta || !texto.trim() || enviando} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Enviar mensagem"><Send className="h-5 w-5" /></button>
                </form>
              </footer>
            </>}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
