import React, { useEffect, useMemo, useRef, useState } from "react";
import { Mail, Phone, Plus, Search, User, X } from "lucide-react";
import { toast } from "sonner";
import { clientesAPI } from "../services/api";

const FORM_VAZIO = {
  nome: "",
  sobrenome: "",
  email: "",
  contato: "",
  observacoes: "",
};

export default function ClienteAutocomplete({
  value,
  onSelecionar,
  clienteAtual,
}) {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoCliente, setNovoCliente] = useState(FORM_VAZIO);

  const containerRef = useRef(null);

  async function carregarClientes() {
    try {
      setCarregando(true);
      const response = await clientesAPI.listar();
      setClientes(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Não foi possível carregar os clientes.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    if (clienteAtual) {
      const nomeCompleto = [clienteAtual.nome, clienteAtual.sobrenome]
        .filter(Boolean)
        .join(" ");
      setBusca(nomeCompleto);
    }
  }, [clienteAtual]);

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

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
  }, [clientes, busca]);

  function selecionar(cliente) {
    const nomeCompleto = [cliente.nome, cliente.sobrenome]
      .filter(Boolean)
      .join(" ");

    setBusca(nomeCompleto);
    setAberto(false);
    onSelecionar(cliente);
  }

  function usarPreenchimentoManual() {
    setBusca("");
    setAberto(false);
    onSelecionar(null);
  }

  function abrirCadastroRapido() {
    const partes = busca.trim().split(/\s+/).filter(Boolean);

    setNovoCliente({
      ...FORM_VAZIO,
      nome: partes[0] || "",
      sobrenome: partes.slice(1).join(" "),
    });

    setAberto(false);
    setMostrarCadastro(true);
  }

  function alterarNovoCliente(campo, valor) {
    setNovoCliente((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function salvarNovoCliente(event) {
    event.preventDefault();

    if (novoCliente.nome.trim().length < 2) {
      toast.error("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    try {
      setSalvando(true);

      const response = await clientesAPI.criar({
        nome: novoCliente.nome.trim(),
        sobrenome: novoCliente.sobrenome.trim() || null,
        email: novoCliente.email.trim() || null,
        contato: novoCliente.contato.trim() || null,
        observacoes: novoCliente.observacoes.trim() || null,
      });

      const clienteCriado = response.data;

      setClientes((anteriores) =>
        [...anteriores, clienteCriado].sort((a, b) =>
          String(a.nome).localeCompare(String(b.nome), "pt-BR")
        )
      );

      selecionar(clienteCriado);
      setMostrarCadastro(false);
      setNovoCliente(FORM_VAZIO);
      toast.success("Cliente cadastrado e selecionado.");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error(error?.response?.data?.error || "Erro ao cadastrar cliente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div className="space-y-2" ref={containerRef}>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <User className="h-4 w-4 text-slate-500" />
          Cliente
        </label>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={busca}
            onFocus={() => setAberto(true)}
            onChange={(event) => {
              setBusca(event.target.value);
              setAberto(true);

              if (value) {
                onSelecionar(null, { limparCampos: false });
              }
            }}
            placeholder={
              carregando
                ? "Carregando clientes..."
                : "Buscar por nome, telefone ou e-mail..."
            }
            disabled={carregando}
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-10 outline-none transition-all focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 disabled:bg-slate-100"
          />

          {busca && (
            <button
              type="button"
              onClick={usarPreenchimentoManual}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {aberto && !carregando && (
            <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="max-h-72 overflow-y-auto">
                {clientesFiltrados.map((cliente) => {
                  const nomeCompleto = [cliente.nome, cliente.sobrenome]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={cliente.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selecionar(cliente);
                      }}
                      className={[
                        "w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50",
                        value === cliente.id ? "bg-slate-100" : "",
                      ].join(" ")}
                    >
                      <div className="font-semibold text-slate-900">
                        {nomeCompleto}
                      </div>

                      {(cliente.contato || cliente.email) && (
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                          {cliente.contato && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {cliente.contato}
                            </span>
                          )}

                          {cliente.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {cliente.email}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}

                {clientesFiltrados.length === 0 && (
                  <div className="px-4 py-4 text-sm text-slate-500">
                    Nenhum cliente encontrado.
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-2">
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    abrirCadastroRapido();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-900 hover:bg-white"
                >
                  <Plus className="h-4 w-4" />
                  {busca.trim()
                    ? `Cadastrar "${busca.trim()}"`
                    : "Cadastrar novo cliente"}
                </button>

                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    usarPreenchimentoManual();
                  }}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-white"
                >
                  Preencher os dados manualmente
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Pesquise um cliente ou cadastre um novo sem sair do agendamento.
        </p>
      </div>

      {mostrarCadastro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-white">Novo cliente</h3>
                <p className="mt-1 text-sm text-slate-300">
                  O cliente será selecionado automaticamente após salvar.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarCadastro(false)}
                className="rounded-lg p-2 text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={salvarNovoCliente} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={novoCliente.nome}
                    onChange={(event) =>
                      alterarNovoCliente("nome", event.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    value={novoCliente.sobrenome}
                    onChange={(event) =>
                      alterarNovoCliente("sobrenome", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={novoCliente.contato}
                  onChange={(event) =>
                    alterarNovoCliente("contato", event.target.value)
                  }
                  placeholder="(66) 99999-9999"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  type="email"
                  value={novoCliente.email}
                  onChange={(event) =>
                    alterarNovoCliente("email", event.target.value)
                  }
                  placeholder="cliente@exemplo.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Observações
                </label>
                <textarea
                  value={novoCliente.observacoes}
                  onChange={(event) =>
                    alterarNovoCliente("observacoes", event.target.value)
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setMostrarCadastro(false)}
                  disabled={salvando}
                  className="rounded-lg border border-slate-200 px-5 py-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-lg bg-slate-900 px-6 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : "Salvar cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
