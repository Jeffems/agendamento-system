import React, { useState } from "react";
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
      email: agendamento.email || "",
      contato: agendamento.contato || "",
      duracao_min: agendamento.duracao_min || 60,
      data_agendamento: isoToLocalString(agendamento.data_agendamento),
    };
  });

  const handleChange = (field, value) => {
    setDados((prev) => ({ ...prev, [field]: value }));
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