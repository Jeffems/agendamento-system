import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { clientesAPI } from "../services/api";

const FORM_INICIAL = {
  nome: "",
  sobrenome: "",
  email: "",
  contato: "",
  observacoes: "",
};

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setLoading(true);
      const response = await clientesAPI.listar();
      setClientes(response.data);
    } catch (error) {
      const mensagem =
        error?.response?.data?.error || "Erro ao carregar clientes";
      toast.error(mensagem);
    } finally {
      setLoading(false);
    }
  }

  function abrirNovoCliente() {
    setClienteEditando(null);
    setForm(FORM_INICIAL);
    setMostrarFormulario(true);
  }

  function abrirEdicao(cliente) {
    setClienteEditando(cliente);
    setForm({
      nome: cliente.nome || "",
      sobrenome: cliente.sobrenome || "",
      email: cliente.email || "",
      contato: cliente.contato || "",
      observacoes: cliente.observacoes || "",
    });
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    if (salvando) return;
    setMostrarFormulario(false);
    setClienteEditando(null);
    setForm(FORM_INICIAL);
  }

  function alterarCampo(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function salvarCliente(event) {
    event.preventDefault();

    if (form.nome.trim().length < 2) {
      toast.error("Informe um nome com pelo menos 2 caracteres");
      return;
    }

    try {
      setSalvando(true);

      const dados = {
        nome: form.nome.trim(),
        sobrenome: form.sobrenome.trim(),
        email: form.email.trim(),
        contato: form.contato.trim(),
        observacoes: form.observacoes.trim(),
      };

      if (clienteEditando) {
        await clientesAPI.atualizar(clienteEditando.id, dados);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await clientesAPI.criar(dados);
        toast.success("Cliente cadastrado com sucesso!");
      }

      setMostrarFormulario(false);
      setClienteEditando(null);
      setForm(FORM_INICIAL);
      await carregarClientes();
    } catch (error) {
      const mensagem =
        error?.response?.data?.error || "Erro ao salvar cliente";
      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCliente(cliente) {
    const nomeCompleto = `${cliente.nome} ${cliente.sobrenome || ""}`.trim();

    if (!window.confirm(`Deseja excluir o cliente ${nomeCompleto}?`)) {
      return;
    }

    try {
      await clientesAPI.deletar(cliente.id);
      toast.success("Cliente excluído com sucesso!");
      await carregarClientes();
    } catch (error) {
      const mensagem =
        error?.response?.data?.error ||
        "Não foi possível excluir o cliente";
      toast.error(mensagem);
    }
  }

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;

    return clientes.filter((cliente) => {
      const texto = [
        cliente.nome,
        cliente.sobrenome,
        cliente.email,
        cliente.contato,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [clientes, busca]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a agenda
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
                <p className="text-slate-600">
                  Cadastre e gerencie seus clientes
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirNovoCliente}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo cliente
          </button>
        </header>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome, telefone ou e-mail..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </section>

        {mostrarFormulario && (
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {clienteEditando ? "Editar cliente" : "Novo cliente"}
              </h2>
              <button
                type="button"
                onClick={fecharFormulario}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarCliente} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Campo
                  label="Nome"
                  obrigatorio
                  value={form.nome}
                  onChange={(valor) => alterarCampo("nome", valor)}
                  placeholder="Nome do cliente"
                />
                <Campo
                  label="Sobrenome"
                  value={form.sobrenome}
                  onChange={(valor) => alterarCampo("sobrenome", valor)}
                  placeholder="Sobrenome"
                />
                <Campo
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={(valor) => alterarCampo("email", valor)}
                  placeholder="cliente@exemplo.com"
                />
                <Campo
                  label="Contato / WhatsApp"
                  type="tel"
                  value={form.contato}
                  onChange={(valor) => alterarCampo("contato", valor)}
                  placeholder="(66) 99999-9999"
                />
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={form.observacoes}
                  onChange={(event) =>
                    alterarCampo("observacoes", event.target.value)
                  }
                  rows={4}
                  placeholder="Informações importantes sobre o cliente"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none resize-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={fecharFormulario}
                  disabled={salvando}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando..."
                    : clienteEditando
                      ? "Atualizar cliente"
                      : "Cadastrar cliente"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            {clientesFiltrados.length} cliente(s) encontrado(s)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent" />
            <p className="mt-4 text-slate-600">Carregando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl text-center py-16">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800">
              {busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </h2>
            <p className="text-slate-500 mt-1">
              {busca
                ? "Tente buscar por outro nome, telefone ou e-mail."
                : "Cadastre seu primeiro cliente para começar."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {clientesFiltrados.map((cliente) => (
              <article
                key={cliente.id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserRound className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900 truncate">
                        {cliente.nome} {cliente.sobrenome || ""}
                      </h2>
                      <p className="text-xs text-slate-500">Cliente cadastrado</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(cliente)}
                      title="Editar cliente"
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => excluirCliente(cliente)}
                      title="Excluir cliente"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {cliente.contato || "Contato não informado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {cliente.email || "E-mail não informado"}
                    </span>
                  </div>
                </div>

                {cliente.observacoes && (
                  <p className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 line-clamp-3">
                    {cliente.observacoes}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  obrigatorio = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={obrigatorio}
        className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
      />
    </div>
  );
}
