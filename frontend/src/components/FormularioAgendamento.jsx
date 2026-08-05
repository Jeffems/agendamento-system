import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Briefcase,
  X,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { clientesAPI } from "../services/api";

function isoToLocalString(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
}

export default function FormularioAgendamento({
  agendamento,
  onSalvar,
  onCancelar,
  isProcessing,
}) {
  const [dados, setDados] = useState(() => {
    if (!agendamento) {
      return {
        clienteId: null,
        nome: "",
        sobrenome: "",
        email: "",
        contato: "",
        servico: "",
        data_agendamento: "",
        duracao_min: 60,
        status: "pendente",
        observacoes: "",
      };
    }

    return {
      ...agendamento,
      clienteId: agendamento.clienteId || agendamento.cliente?.id || null,
      email: agendamento.email || "",
      contato: agendamento.contato || "",
      duracao_min: agendamento.duracao_min || 60,
      data_agendamento: isoToLocalString(agendamento.data_agendamento),
    };
  });

  const [clientes, setClientes] = useState([]);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [buscaCliente, setBuscaCliente] = useState(() => {
    if (!agendamento) return "";
    return [agendamento.nome, agendamento.sobrenome].filter(Boolean).join(" ");
  });
  const [autocompleteAberto, setAutocompleteAberto] = useState(false);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    async function carregarClientes() {
      try {
        setCarregandoClientes(true);
        const response = await clientesAPI.listar();
        setClientes(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast.error("Não foi possível carregar os clientes cadastrados.");
      } finally {
        setCarregandoClientes(false);
      }
    }

    carregarClientes();
  }, []);

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target)
      ) {
        setAutocompleteAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = buscaCliente.trim().toLowerCase();

    if (!termo) return clientes.slice(0, 8);

    return clientes
      .filter((cliente) => {
        const nomeCompleto = [cliente.nome, cliente.sobrenome]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const contato = String(cliente.contato || "").toLowerCase();
        const email = String(cliente.email || "").toLowerCase();

        return (
          nomeCompleto.includes(termo) ||
          contato.includes(termo) ||
          email.includes(termo)
        );
      })
      .slice(0, 8);
  }, [clientes, buscaCliente]);

  const handleChange = (field, value) => {
    setDados((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelecionarCliente = (cliente) => {
    if (!cliente) {
      setDados((prev) => ({
        ...prev,
        clienteId: null,
        nome: "",
        sobrenome: "",
        email: "",
        contato: "",
      }));
      setBuscaCliente("");
      setAutocompleteAberto(false);
      return;
    }

    setDados((prev) => ({
      ...prev,
      clienteId: cliente.id,
      nome: cliente.nome || "",
      sobrenome: cliente.sobrenome || "",
      email: cliente.email || "",
      contato: cliente.contato || "",
    }));

    setBuscaCliente(
      [cliente.nome, cliente.sobrenome].filter(Boolean).join(" ")
    );
    setAutocompleteAberto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dt = new Date(dados.data_agendamento);

    if (Number.isNaN(dt.getTime())) {
      toast.error("Data e hora inválidas");
      return;
    }

    try {
      await onSalvar({
        ...dados,
        clienteId: dados.clienteId || null,
        duracao_min: Number(dados.duracao_min),
        data_agendamento: dt.toISOString(),
      });
    } catch {
      // o tratamento já acontece na tela pai
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
    >
      <div className="bg-slate-900 px-8 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button
            onClick={onCancelar}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="space-y-6">
          <div className="space-y-2" ref={autocompleteRef}>
            <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <User className="w-4 h-4 text-slate-500" />
              Cliente cadastrado
            </label>

            <div className="relative">
              <input
                type="text"
                value={buscaCliente}
                onFocus={() => setAutocompleteAberto(true)}
                onChange={(e) => {
                  setBuscaCliente(e.target.value);
                  setAutocompleteAberto(true);

                  if (dados.clienteId) {
                    setDados((prev) => ({
                      ...prev,
                      clienteId: null,
                    }));
                  }
                }}
                placeholder={
                  carregandoClientes
                    ? "Carregando clientes..."
                    : "Buscar por nome, telefone ou e-mail..."
                }
                disabled={carregandoClientes}
                autoComplete="off"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all disabled:bg-slate-100"
              />

              {autocompleteAberto && !carregandoClientes && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <button
                    type="button"
                    onClick={() => handleSelecionarCliente(null)}
                    className="w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="font-medium text-slate-900">
                      Preencher os dados manualmente
                    </div>
                    <div className="text-xs text-slate-500">
                      Não vincular este agendamento a um cliente cadastrado
                    </div>
                  </button>

                  <div className="max-h-64 overflow-y-auto">
                    {clientesFiltrados.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-slate-500">
                        Nenhum cliente encontrado.
                      </div>
                    ) : (
                      clientesFiltrados.map((cliente) => {
                        const nomeCompleto = [
                          cliente.nome,
                          cliente.sobrenome,
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <button
                            key={cliente.id}
                            type="button"
                            onClick={() => handleSelecionarCliente(cliente)}
                            className={[
                              "w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50",
                              dados.clienteId === cliente.id
                                ? "bg-slate-100"
                                : "",
                            ].join(" ")}
                          >
                            <div className="font-medium text-slate-900">
                              {nomeCompleto}
                            </div>

                            {(cliente.contato || cliente.email) && (
                              <div className="mt-1 text-sm text-slate-500">
                                {[cliente.contato, cliente.email]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Digite parte do nome, telefone ou e-mail e selecione o cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <User className="w-4 h-4 text-slate-500" />
                Nome
              </label>
              <input
                type="text"
                value={dados.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Digite o nome"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <User className="w-4 h-4 text-slate-500" />
                Sobrenome
              </label>
              <input
                type="text"
                value={dados.sobrenome}
                onChange={(e) => handleChange("sobrenome", e.target.value)}
                placeholder="Digite o sobrenome"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <Mail className="w-4 h-4 text-slate-500" />
              Email (opcional)
            </label>
            <input
              type="email"
              value={dados.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="cliente@exemplo.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <Phone className="w-4 h-4 text-slate-500" />
              Contato (WhatsApp) (opcional)
            </label>
            <input
              type="tel"
              value={dados.contato}
              onChange={(e) => handleChange("contato", e.target.value)}
              placeholder="(66) 9xxxx-xxxx"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <Briefcase className="w-4 h-4 text-slate-500" />
              Serviço
            </label>
            <input
              type="text"
              value={dados.servico}
              onChange={(e) => handleChange("servico", e.target.value)}
              placeholder="Descreva o serviço"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                Data
              </label>
              <input
                type="date"
                value={dados.data_agendamento ? dados.data_agendamento.split("T")[0] : ""}
                onChange={(e) => {
                  const time = dados.data_agendamento
                    ? dados.data_agendamento.split("T")[1]
                    : "09:00:00";
                  handleChange("data_agendamento", `${e.target.value}T${time}`);
                }}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                Hora
              </label>
              <input
                type="time"
                value={
                  dados.data_agendamento
                    ? dados.data_agendamento.split("T")[1]?.substring(0, 5)
                    : "09:00"
                }
                onChange={(e) => {
                  const date = dados.data_agendamento
                    ? dados.data_agendamento.split("T")[0]
                    : new Date().toISOString().split("T")[0];

                  handleChange("data_agendamento", `${date}T${e.target.value}:00`);
                }}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                Duração (min)
              </label>
              <select
                value={dados.duracao_min}
                onChange={(e) => handleChange("duracao_min", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </div>
          </div>

          {agendamento && (
            <div className="space-y-2">
              <label className="text-slate-700 font-medium text-sm">Status</label>
              <select
                value={dados.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all"
              >
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-700 font-medium text-sm">Observações</label>
            <textarea
              value={dados.observacoes || ""}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Informações adicionais (opcional)"
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancelar}
            disabled={isProcessing}
            className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-8 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? "Salvando..." : agendamento ? "Atualizar" : "Agendar"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}