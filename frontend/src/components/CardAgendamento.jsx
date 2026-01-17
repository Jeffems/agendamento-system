import React from "react";
import {
  Calendar,
  Clock,
  Mail,
  Briefcase,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusConfig = {
  pendente: {
    label: "Pendente",
    color: "bg-slate-200 text-slate-700 border-slate-300",
    icon: AlertCircle,
    iconColor: "text-slate-600"
  },
  confirmado: {
    label: "Confirmado",
    color: "bg-slate-300 text-slate-900 border-slate-400",
    icon: CheckCircle2,
    iconColor: "text-slate-700"
  },
  concluido: {
    label: "Concluído",
    color: "bg-slate-800 text-white border-slate-900",
    icon: CheckCircle2,
    iconColor: "text-white"
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-slate-100 text-slate-500 border-slate-200",
    icon: XCircle,
    iconColor: "text-slate-400"
  }
};

export default function CardAgendamento({ agendamento, onEditar, onExcluir, onMudarStatus, onEnviarLembrete }) {
  const [menuAberto, setMenuAberto] = React.useState(false);
  const status = statusConfig[agendamento.status] || statusConfig.pendente;
  const StatusIcon = status.icon;

  const formatarData = (dataString) => {
    try {
      const data = parseISO(dataString);
      return {
        dia: format(data, "dd 'de' MMMM", { locale: ptBR }),
        hora: format(data, "HH:mm", { locale: ptBR }),
        diaSemana: format(data, "EEEE", { locale: ptBR })
      };
    } catch {
      return { dia: "Data inválida", hora: "", diaSemana: "" };
    }
  };

  const { dia, hora, diaSemana } = formatarData(agendamento.data_agendamento);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden"
    >
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-slate-900">
                {agendamento.nome} {agendamento.sobrenome}
              </h3>
              <span className={`${status.color} border px-2 py-1 rounded-md text-xs flex items-center gap-1`}>
                <StatusIcon className={`w-3 h-3 ${status.iconColor}`} />
                {status.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 capitalize">{diaSemana}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuAberto && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                <button
                  onClick={() => { onEditar(agendamento); setMenuAberto(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => { onMudarStatus(agendamento, "confirmado"); setMenuAberto(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                >
                  Marcar como Confirmado
                </button>
                <button
                  onClick={() => { onMudarStatus(agendamento, "concluido"); setMenuAberto(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                >
                  Marcar como Concluído
                </button>
                <button
                  onClick={() => { onEnviarLembrete(agendamento); setMenuAberto(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                >
                  Enviar Lembrete por Email
                </button>
                <button
                  onClick={() => { onExcluir(agendamento); setMenuAberto(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-red-600"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Data</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">{dia}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Horário</p>
                <p className="text-sm font-semibold text-slate-900">{hora}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">Email</p>
              <a 
                href__={`mailto:${agendamento.email}`}
                className="text-sm font-semibold text-slate-900 hover:text-slate-700 hover:underline break-all"
              >
                {agendamento.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-lg border border-slate-200">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium mb-1">Serviço</p>
              <p className="text-sm text-slate-900 font-medium">{agendamento.servico}</p>
            </div>
          </div>

          {agendamento.observacoes && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-1">Observações</p>
              <p className="text-sm text-slate-700">{agendamento.observacoes}</p>
            </div>
          )}

          {agendamento.lembrete_enviado && (
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
              <MessageCircle className="w-4 h-4" />
              <span>Lembrete enviado por email</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}