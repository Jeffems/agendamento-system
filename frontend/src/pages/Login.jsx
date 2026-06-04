import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";


export default function Login() {
  const navigate = useNavigate();
  const [inviteToken, setInviteToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingManual, setLoadingManual] = useState(false);



  const handleManualLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Informe email e senha");
      return;
    }

    try {
      setLoadingManual(true);

      const { data } = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", data.token);

      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.error || "Erro ao fazer login";
      toast.error(message);
    } finally {
      setLoadingManual(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Entrar</h1>
        <p className="text-slate-600 mb-6">
          Acesse sua conta para gerenciar seus agendamentos
        </p>

        

        {/* Divisor */}


        {/* Manual */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
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
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loadingManual}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loadingManual ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-slate-600">
            Cadastro somente por convite.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cole o token do convite"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              onChange={(e) => setInviteToken(e.target.value)}
            />
            <button
              type="button"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg"
              onClick={() => {
                if (!inviteToken || inviteToken.length < 10) {
                  toast.error("Token de convite inválido");
                  return;
                }
              
                navigate(`/register?token=${inviteToken}`);
              }}
            >
              Usar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
