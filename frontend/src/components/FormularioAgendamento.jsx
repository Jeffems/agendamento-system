import React, { useState } from "react";
import { Calendar, Clock, User, Mail, Briefcase, X } from "lucide-react";
import { motion } from "framer-motion";

export default function FormularioAgendamento({ agendamento, onSalvar, onCancelar, isProcessing }) {
  const [dados, setDados] = useState(agendamento || {
    nome: "",
    sobrenome: "",
    email: "",
    servico: "",
    data_agendamento: "",
    status: "pendente",
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(dados);
  };

  const handleChange = (field, value) => {
    setDados(prev => ({ ...prev, [field]: value }));
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <Mail className="w-4 h-4 text-slate-500" />
              Email
            </label>
            <input
              type="email"
              value={dados.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="cliente@exemplo.com"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                Data
              </label>
              <input
                type="date"
                value={dados.data_agendamento ? dados.data_agendamento.split('T')[0] : ''}
                onChange={(e) => {
                  const time = dados.data_agendamento ? dados.data_agendamento.split('T')[1] : '09:00:00';
                  handleChange("data_agendamento", `${e.target.value}T${time}`);
                }}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                Hora
              </label>
              <input
                type="time"
                value={dados.data_agendamento ? dados.data_agendamento.split('T')[1]?.substring(0, 5) : '09:00'}
                onChange={(e) => {
                  const date = dados.data_agendamento ? dados.data_agendamento.split('T')[0] : new Date().toISOString().split('T')[0];
                  handleChange("data_agendamento", `${date}T${e.target.value}:00`);
                }}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-700 font-medium text-sm">
              Observações
            </label>
            <textarea
              value={dados.observacoes || ""}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Informações adicionais (opcional)"
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all resize-none"
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