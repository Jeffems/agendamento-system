  {/*
  import React from "react";
  import { Calendar, CheckCircle2, Users, Clock } from "lucide-react";
  
  export default function Login() {
    const handleGoogleLogin = () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      window.location.assign(`${backendUrl}/auth/google`);
    };
  
    return (
      <div className="min-h-screen bg-slate-50 flex">
        {/* Lado esquerdo (marketing) 
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_30%,white,transparent_35%),radial-gradient(circle_at_60%_80%,white,transparent_35%)]" />
  
          <div className="relative z-10 w-full p-12 flex flex-col justify-center">
            <div className="max-w-lg">
              <h1 className="text-4xl font-extrabold text-white leading-tight">
                Simplifique seus agendamentos
              </h1>
              <p className="text-white/80 mt-4 text-lg">
                Gerencie clientes, horários e compromissos em um só lugar com
                eficiência e elegância.
              </p>
  
              <div className="mt-10 space-y-4">
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Próximo agendamento</p>
                        <p className="text-white/70 text-sm">Hoje, 14:30 — Maria Silva</p>
                      </div>
                    </div>
                    <span className="text-emerald-200 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold">
                      Confirmado
                    </span>
                  </div>
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-white/80 text-sm">Clientes</p>
                    </div>
                    <p className="text-white text-3xl font-bold mt-3">248</p>
                    <p className="text-emerald-200 text-xs mt-1">↑ 12% este mês</p>
                  </div>
  
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-white/80 text-sm">Hoje</p>
                    </div>
                    <p className="text-white text-3xl font-bold mt-3">12</p>
                    <p className="text-white/70 text-xs mt-1">agendamentos</p>
                  </div>
                </div>
  
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur">
                  <p className="text-white/80 text-sm font-medium mb-3">Próximos horários</p>
                  <div className="space-y-2">
                    {[
                      { nome: "João Pedro", hora: "09:00" },
                      { nome: "Ana Costa", hora: "10:30" },
                      { nome: "Carlos Lima", hora: "14:30" },
                    ].map((i) => (
                      <div key={i.nome} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-300" />
                          <span className="text-white/90 text-sm">{i.nome}</span>
                        </div>
                        <span className="text-white/70 text-sm">{i.hora}</span>
                      </div>
                    ))}
                  </div>
                </div>
  
                <div className="pt-4 flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Lembretes automáticos 
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Lado direito (login) *
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-lg">Evemark</p>
                  <p className="text-slate-500 text-sm">Sistema de agendamentos</p>
                </div>
              </div>
  
              <h2 className="mt-8 text-2xl font-extrabold text-slate-900">
                Bem-vindo de volta
              </h2>
              <p className="mt-1 text-slate-500">
                Acesse sua conta para gerenciar seus agendamentos
              </p>
  
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-6 w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 hover:bg-slate-50 transition"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="h-5 w-5"
                />
                <span className="font-semibold text-slate-800">
                  Continuar com Google
                </span>
              </button>
  
              <p className="mt-6 text-xs text-slate-500 text-center">
                Seus dados são protegidos e nunca compartilhados.
              </p>
            </div>
  
            <p className="text-center text-xs text-slate-400 mt-4">
              © {new Date().getFullYear()} Evemark
            </p>
          </div>
        </div>
      </div>
    );
  }
  */}
  import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingManual, setLoadingManual] = useState(false);

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    window.location.assign(`${backendUrl}/auth/google`);
  };

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
      const message =
        error.response?.data?.error || "Erro ao fazer login";
      toast.error(message);
    } finally {
      setLoadingManual(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Entrar
        </h1>
        <p className="text-slate-600 mb-6">
          Acesse sua conta para gerenciar seus agendamentos
        </p>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {/* Se você tiver um ícone/imagem do Google, pode colocar aqui */}
          Entrar com Google
        </button>

        {/* Divisor */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs text-slate-500">ou</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

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

        <p className="text-sm text-slate-600 mt-6 text-center">
          Não tem conta?{" "}
          <Link to="/register" className="text-slate-900 font-medium underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}