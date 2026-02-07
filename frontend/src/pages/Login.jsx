{/*export default function Login() {
  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    window.location.assign(`${backendUrl}/auth/google`);
  };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center">
          <h1 className="text-2xl font-bold mb-6">Sistema de Agendamentos</h1>
  
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5 bg-white p-1 rounded"
            />
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }
  */}

  import React from "react";
import { Calendar, CheckCircle2, Users, Clock } from "lucide-react";

// Se você já tem uma função que faz o redirect pro backend (Google OAuth),
// pluga ela aqui:
function handleGoogleLogin() {
  const apiUrl = import.meta.env.VITE_API_URL; // ex: https://seu-backend.railway.app/api
  // ajuste a rota conforme seu backend (exemplos comuns):
  // window.location.href = `${apiUrl}/auth/google`;
  window.location.href = `${apiUrl}/auth/google`;
}

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Lado esquerdo (marketing) */}
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

            {/* “Cards” ilustrativos */}
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

      {/* Lado direito (login) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-lg">Agendify</p>
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
                alt="Google"
                className="h-5 w-5"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
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
            © {new Date().getFullYear()} Agenda
          </p>
        </div>
      </div>
    </div>
  );
}
