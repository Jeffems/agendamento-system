import React from "react";
import { MoreVertical, MessageCircle } from "lucide-react";
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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

                    {a.lembrete_enviado && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-600">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Lembrete enviado
                      </div>
                    )}
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
                      <div className="absolute right-4 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                        <button
                          type="button"
                          onClick={() => {
                            onEditar(a);
                            setMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onMudarStatus(a, "confirmado");
                            setMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                        >
                          Marcar como Confirmado
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onMudarStatus(a, "concluido");
                            setMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                        >
                          Marcar como Concluído
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onEnviarLembrete(a);
                            setMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                        >
                          Enviar Lembrete por Email
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onWhatsApp?.(a);
                            setMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                        >
                          Lembrar via WhatsApp
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onExcluir(a);
                            setMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-red-600"
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
