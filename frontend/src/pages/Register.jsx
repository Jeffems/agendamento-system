import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import TermsModal from "./components/TermsModal";

export default function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nome || !email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setModalOpen(true); // abre modal antes de enviar
  };

  const finalizarCadastro = async ({ terms, privacy, marketing }) => {
    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        nome,
        email,
        password,
        accept: {
          terms,
          privacy,
          marketing,
        },
      });

      const { token } = response.data;

      localStorage.setItem("token", token);

      toast.success("Cadastro realizado com sucesso!");

      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.error || "Erro ao realizar cadastro";

      toast.error(message);
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Criar Conta
        </h1>
        <p className="text-slate-600 mb-6">
          Cadastre-se para começar a usar o sistema
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700">Nome</label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Senha</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="text-xs text-slate-500 mt-1">
              Mínimo 8 caracteres
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg transition-colors"
          >
            Cadastrar
          </button>
        </form>

        <p className="text-sm text-slate-600 mt-6 text-center">
          Já possui conta?{" "}
          <Link to="/login" className="text-slate-900 font-medium underline">
            Fazer login
          </Link>
        </p>
      </div>

      {/* Modal de termos */}
      <TermsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={finalizarCadastro}
        loading={loading}
      />
    </div>
  );
}