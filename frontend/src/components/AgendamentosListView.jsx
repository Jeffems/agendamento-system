import React from "react";
import { Mail, MoreVertical, MessageCircle } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "./StatusBadge";

export default function AgendamentosListView({
  items,
  onEditar,
  onExcluir,
  onMudarStatus,
  onEnviarLembrete,
  onWhatsApp
}) {
  const [menuId, setMenuId] = React.useState(null);
  const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatar = (dataString) => {
    try {
      const d = new Date(dataString);
      return {
        dia: formatInTimeZone(d, TIMEZONE, "dd/MM/yyyy", { locale: ptBR }),
        hora: formatInTimeZone(d, TIMEZONE, "HH:mm", { locale: ptBR })
      };
    } catch {
      return { dia: "-", hora: "-" };
    }
  };

  return (
    <div className="app-surface overflow-visible">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-600">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-14" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((a) => {
              const { dia, hora } = formatar(a.data_agendamento);
              const aberto = menuId === a.id;

              return (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {a.nome} {a.sobrenome}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-600">
                      {a.lembrete_email_enviado && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          E-mail enviado
                        </span>
                      )}
                      {a.lembrete_whatsapp_enviado && (
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp enviado
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700 font-semibold">{a.servico}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{dia}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{hora}</td>

                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>

                  <td className="px-4 py-3 text-right relative">
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-slate-100"
                      onClick={() => setMenuId(aberto ? null : a.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {aberto && (
                      <div className="menu-panel">
                        <button
                          type="button"
                          onClick={() => {
                            onEditar(a);
                            setMenuId(null);
                          }}
                          className="menu-item"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onMudarStatus(a, "confirmado");
                            setMenuId(null);
                          }}
                          className="menu-item"
                        >
                          Marcar como Confirmado
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onMudarStatus(a, "concluido");
                            setMenuId(null);
                          }}
                          className="menu-item"
                        >
                          Marcar como Concluído
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onEnviarLembrete(a);
                            setMenuId(null);
                          }}
                          className="menu-item"
                        >
                          Enviar Lembrete por Email
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onWhatsApp?.(a);
                            setMenuId(null);
                          }}
                          className="menu-item"
                        >
                          Lembrar via WhatsApp
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onExcluir(a);
                            setMenuId(null);
                          }}
                          className="menu-item text-red-600 hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
