{/*import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { parseISO, isToday, isTomorrow, isThisWeek, isThisMonth } from "date-fns";
import { Plus, CalendarDays, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { agendamentosAPI } from "../services/api";
import { logout } from "../components/logout";

import FormularioAgendamento from "../components/FormularioAgendamento";
import CardAgendamento from "../components/CardAgendamento";
import FiltrosAgendamento from "../components/FiltrosAgendamento";


export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [filtros, setFiltros] = useState({ busca: "", status: "todos", periodo: "todos" });
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      const response = await agendamentosAPI.listar();
      setAgendamentos(response.data);
    } catch (error) {
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (dados) => {
    try {
      setProcessando(true);
      if (agendamentoEditando) {
        await agendamentosAPI.atualizar(agendamentoEditando.id, dados);
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        await agendamentosAPI.criar(dados);
        toast.success("Agendamento criado com sucesso!");
      }
      await carregarAgendamentos();
      setMostrarFormulario(false);
      setAgendamentoEditando(null);
    } catch (error) {
      toast.error("Erro ao salvar agendamento");
    } finally {
      setProcessando(false);
    }
  };

  const handleEditar = (agendamento) => {
    setAgendamentoEditando(agendamento);
    setMostrarFormulario(true);
  };

  const handleExcluir = async (agendamento) => {
    if (confirm(`Deseja realmente excluir o agendamento de ${agendamento.nome} ${agendamento.sobrenome}?`)) {
      try {
        await agendamentosAPI.deletar(agendamento.id);
        toast.success("Agendamento excluído com sucesso!");
        await carregarAgendamentos();
      } catch (error) {
        toast.error("Erro ao excluir agendamento");
      }
    }
  };

  const handleMudarStatus = async (agendamento, novoStatus) => {
    try {
      await agendamentosAPI.atualizar(agendamento.id, { ...agendamento, status: novoStatus });
      toast.success("Status atualizado!");
      await carregarAgendamentos();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleEnviarLembrete = async (agendamento) => {
    try {
      const mensagem = `Olá ${agendamento.nome}, seu agendamento é amanhã. Serviço: ${agendamento.servico}`;
      console.log("Enviando lembrete:", mensagem);
      
      await agendamentosAPI.atualizar(agendamento.id, { ...agendamento, lembrete_enviado: true });
      toast.success("Lembrete enviado com sucesso!");
      await carregarAgendamentos();
    } catch (error) {
      toast.error("Erro ao enviar lembrete");
    }
  };

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter(agendamento => {
      const buscaMatch = !filtros.busca || 
        agendamento.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        agendamento.sobrenome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        agendamento.servico.toLowerCase().includes(filtros.busca.toLowerCase());

      const statusMatch = filtros.status === "todos" || agendamento.status === filtros.status;

      let periodoMatch = true;
      if (filtros.periodo !== "todos") {
        try {
          const data = parseISO(agendamento.data_agendamento);
          switch (filtros.periodo) {
            case "hoje":
              periodoMatch = isToday(data);
              break;
            case "amanha":
              periodoMatch = isTomorrow(data);
              break;
            case "semana":
              periodoMatch = isThisWeek(data, { weekStartsOn: 0 });
              break;
            case "mes":
              periodoMatch = isThisMonth(data);
              break;
          }
        } catch {
          periodoMatch = false;
        }
      }

      return buscaMatch && statusMatch && periodoMatch;
    });
  }, [agendamentos, filtros]);

  const estatisticas = useMemo(() => {
    const hoje = agendamentosFiltrados.filter(a => {
      try {
        return isToday(parseISO(a.data_agendamento));
      } catch {
        return false;
      }
    }).length;

    const pendentes = agendamentos.filter(a => a.status === "pendente").length;
    const concluidos = agendamentos.filter(a => a.status === "concluido").length;

    return { hoje, pendentes, concluidos, total: agendamentos.length };
  }, [agendamentos, agendamentosFiltrados]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
{/* Header *
<div className="mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">
        Sistema de Agendamentos
      </h1>
      <p className="text-slate-600">
        Gerencie seus agendamentos de forma profissional
      </p>
    </div>

    {/* AÇÕES (canto direito) *
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
      <button
        onClick={logout}
        className="bg-red-500 text-white flex items-center hover:bg-red-600 px-6 py-3 rounded-lg transition-colors"
      >
        Sair
      </button>

      <button
        onClick={() => {
          setAgendamentoEditando(null);
          setMostrarFormulario(true);
        }}
        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Novo Agendamento
      </button>
    </div>
  </div>
</div>

        {/* Estatísticas *
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-slate-900">{estatisticas.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-slate-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Hoje</p>
                <p className="text-3xl font-bold text-slate-900">{estatisticas.hoje}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-300 flex items-center justify-center">
                <Clock className="w-6 h-6 text-slate-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pendentes</p>
                <p className="text-3xl font-bold text-slate-900">{estatisticas.pendentes}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Concluídos</p>
                <p className="text-3xl font-bold text-slate-900">{estatisticas.concluidos}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulário *
        <AnimatePresence>
          {mostrarFormulario && (
            <div className="mb-8">
              <FormularioAgendamento
                agendamento={agendamentoEditando}
                onSalvar={handleSalvar}
                onCancelar={() => {
                  setMostrarFormulario(false);
                  setAgendamentoEditando(null);
                }}
                isProcessing={processando}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Filtros *
        <div className="mb-6">
          <FiltrosAgendamento filtros={filtros} onMudarFiltros={setFiltros} />
        </div>

        {/* Lista de Agendamentos *
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
                <p className="mt-4 text-slate-600">Carregando agendamentos...</p>
              </div>
            ) : agendamentosFiltrados.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">
                  {filtros.busca || filtros.status !== "todos" || filtros.periodo !== "todos"
                    ? "Nenhum agendamento encontrado com os filtros aplicados"
                    : "Nenhum agendamento cadastrado ainda"}
                </p>
              </div>
            ) : (
              agendamentosFiltrados.map((agendamento) => (
                <CardAgendamento
                  key={agendamento.id}
                  agendamento={agendamento}
                  onEditar={handleEditar}
                  onExcluir={handleExcluir}
                  onMudarStatus={handleMudarStatus}
                  onEnviarLembrete={handleEnviarLembrete}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
*/}

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { parseISO, isToday, isTomorrow, isThisWeek, isThisMonth } from "date-fns";
import {
  Plus,
  CalendarDays,
  TrendingUp,
  Clock,
  CheckCircle2,
  LayoutGrid,
  List,
  Calendar
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { agendamentosAPI } from "../services/api";
import { logout } from "../components/logout";

import FormularioAgendamento from "../components/FormularioAgendamento";
import CardAgendamento from "../components/CardAgendamento";
import FiltrosAgendamento from "../components/FiltrosAgendamento";

// NOVOS (crie estes componentes conforme enviei)
import AgendamentosListView from "../components/AgendamentosListView";
import AgendamentosCalendarView from "../components/AgendamentosCalendarView";

// WhatsApp utils (já existe no seu projeto)
import { buildWhatsAppReminderLink, openWhatsApp } from "../utils/whatsapp";

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  const [filtros, setFiltros] = useState({ busca: "", status: "todos", periodo: "todos" });
  const [processando, setProcessando] = useState(false);

  // NOVO: alternar visualização
  const [visualizacao, setVisualizacao] = useState("cards"); // cards | lista | calendario

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      const response = await agendamentosAPI.listar();
      setAgendamentos(response.data);
    } catch (error) {
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (dados) => {
    try {
      setProcessando(true);
      if (agendamentoEditando) {
        await agendamentosAPI.atualizar(agendamentoEditando.id, dados);
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        await agendamentosAPI.criar(dados);
        toast.success("Agendamento criado com sucesso!");
      }
      await carregarAgendamentos();
      setMostrarFormulario(false);
      setAgendamentoEditando(null);
    } catch (error) {
      toast.error("Erro ao salvar agendamento");
    } finally {
      setProcessando(false);
    }
  };

  const handleEditar = (agendamento) => {
    setAgendamentoEditando(agendamento);
    setMostrarFormulario(true);
  };

  const handleExcluir = async (agendamento) => {
    if (confirm(`Deseja realmente excluir o agendamento de ${agendamento.nome} ${agendamento.sobrenome}?`)) {
      try {
        await agendamentosAPI.deletar(agendamento.id);
        toast.success("Agendamento excluído com sucesso!");
        await carregarAgendamentos();
      } catch (error) {
        toast.error("Erro ao excluir agendamento");
      }
    }
  };

  const handleMudarStatus = async (agendamento, novoStatus) => {
    try {
      await agendamentosAPI.atualizar(agendamento.id, { ...agendamento, status: novoStatus });
      toast.success("Status atualizado!");
      await carregarAgendamentos();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleEnviarLembrete = async (agendamento) => {
    try {
      const mensagem = `Olá ${agendamento.nome}, seu agendamento é amanhã. Serviço: ${agendamento.servico}`;
      console.log("Enviando lembrete:", mensagem);

      await agendamentosAPI.atualizar(agendamento.id, { ...agendamento, lembrete_enviado: true });
      toast.success("Lembrete enviado com sucesso!");
      await carregarAgendamentos();
    } catch (error) {
      toast.error("Erro ao enviar lembrete");
    }
  };

  // NOVO: WhatsApp (abre link)
  const handleWhatsApp = (agendamento) => {
    try {
      const url = buildWhatsAppReminderLink({ agendamento });
      openWhatsApp(url);
    } catch (e) {
      toast.error("Não foi possível abrir o WhatsApp");
    }
  };

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((agendamento) => {
      const buscaMatch =
        !filtros.busca ||
        agendamento.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        agendamento.sobrenome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        agendamento.servico.toLowerCase().includes(filtros.busca.toLowerCase());

      const statusMatch = filtros.status === "todos" || agendamento.status === filtros.status;

      let periodoMatch = true;
      if (filtros.periodo !== "todos") {
        try {
          const data = parseISO(agendamento.data_agendamento);
          switch (filtros.periodo) {
            case "hoje":
              periodoMatch = isToday(data);
              break;
            case "amanha":
              periodoMatch = isTomorrow(data);
              break;
            case "semana":
              periodoMatch = isThisWeek(data, { weekStartsOn: 0 });
              break;
            case "mes":
              periodoMatch = isThisMonth(data);
              break;
            default:
              periodoMatch = true;
          }
        } catch {
          periodoMatch = false;
        }
      }

      return buscaMatch && statusMatch && periodoMatch;
    });
  }, [agendamentos, filtros]);

  const estatisticas = useMemo(() => {
    const hoje = agendamentosFiltrados.filter((a) => {
      try {
        return isToday(parseISO(a.data_agendamento));
      } catch {
        return false;
      }
    }).length;

    const pendentes = agendamentos.filter((a) => a.status === "pendente").length;
    const concluidos = agendamentos.filter((a) => a.status === "concluido").length;

    return { hoje, pendentes, concluidos, total: agendamentos.length };
  }, [agendamentos, agendamentosFiltrados]);

  const renderConteudo = () => {
    if (loading) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Carregando agendamentos...</p>
        </div>
      );
    }

    if (agendamentosFiltrados.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">
            {filtros.busca || filtros.status !== "todos" || filtros.periodo !== "todos"
              ? "Nenhum agendamento encontrado com os filtros aplicados"
              : "Nenhum agendamento cadastrado ainda"}
          </p>
        </div>
      );
    }

    if (visualizacao === "lista") {
      return (
        <AgendamentosListView
          items={agendamentosFiltrados}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          onMudarStatus={handleMudarStatus}
          onEnviarLembrete={handleEnviarLembrete}
          onWhatsApp={handleWhatsApp}
        />
      );
    }

    if (visualizacao === "calendario") {
      return (
        <AgendamentosCalendarView
          items={agendamentosFiltrados}
          onSelect={(a) => handleEditar(a)} // clicou no item -> editar
          weekStartsOn={0}
        />
      );
    }

    // cards
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {agendamentosFiltrados.map((agendamento) => (
            <CardAgendamento
              key={agendamento.id}
              agendamento={agendamento}
              onEditar={handleEditar}
              onExcluir={handleExcluir}
              onMudarStatus={handleMudarStatus}
              onEnviarLembrete={handleEnviarLembrete}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Sistema de Agendamentos</h1>
              <p className="text-slate-600">Gerencie seus agendamentos de forma profissional</p>
            </div>

            {/* AÇÕES */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
              <button
                onClick={logout}
                className="bg-red-500 text-white flex items-center hover:bg-red-600 px-6 py-3 rounded-lg transition-colors"
              >
                Sair
              </button>

              <button
                onClick={() => {
                  setAgendamentoEditando(null);
                  setMostrarFormulario(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Agendamento
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-slate-900">{estatisticas.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-slate-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Hoje</p>
                <p className="text-3xl font-bold text-slate-900">{estatisticas.hoje}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-300 flex items-center justify-center">
                <Clock className="w-6 h-6 text-slate-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pendentes</p>
                <p className="text-3xl font-bold text-slate-900">{estatisticas.pendentes}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Concluídos</p>
                <p className="text-3xl font-bold text-slate-900">{estatisticas.concluidos}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <AnimatePresence>
          {mostrarFormulario && (
            <div className="mb-8">
              <FormularioAgendamento
                agendamento={agendamentoEditando}
                onSalvar={handleSalvar}
                onCancelar={() => {
                  setMostrarFormulario(false);
                  setAgendamentoEditando(null);
                }}
                isProcessing={processando}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Filtros + Alternador de Visual */}
        <div className="mb-6 space-y-4">
          <FiltrosAgendamento filtros={filtros} onMudarFiltros={setFiltros} />

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Exibindo <span className="font-semibold">{agendamentosFiltrados.length}</span> resultado(s)
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setVisualizacao("cards")}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                  visualizacao === "cards" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                ].join(" ")}
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </button>

              <button
                type="button"
                onClick={() => setVisualizacao("lista")}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                  visualizacao === "lista" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                ].join(" ")}
              >
                <List className="w-4 h-4" />
                Lista
              </button>

              <button
                type="button"
                onClick={() => setVisualizacao("calendario")}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                  visualizacao === "calendario" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                ].join(" ")}
              >
                <Calendar className="w-4 h-4" />
                Calendário
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div>
          {/* Para loading/empty, mantemos a centralização; para lista/calendário, renderiza direto */}
          {visualizacao === "cards" ? (
            <AnimatePresence>{renderConteudo()}</AnimatePresence>
          ) : (
            <div className="min-h-[120px]">{renderConteudo()}</div>
          )}
        </div>
      </div>
    </div>
  );
}
