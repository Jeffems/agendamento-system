import React from "react";
import { addDays, startOfWeek, format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { StatusBadge } from "./StatusBadge";

// Calendário semanal simples (sem libs externas): 7 colunas, itens por dia.

export default function AgendamentosCalendarView({ items, onSelect, weekStartsOn = 0 }) {
  const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [anchor, setAnchor] = React.useState(new Date());

  const start = startOfWeek(anchor, { weekStartsOn });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  const formatHora = (iso) => {
    try {
      return formatInTimeZone(new Date(iso), TIMEZONE, "HH:mm", { locale: ptBR });
    } catch {
      return "--:--";
    }
  };

  const itemsByDay = React.useMemo(() => {
    const map = new Map(days.map((d) => [d.toDateString(), []]));

    for (const a of items) {
      try {
        const d = parseISO(a.data_agendamento);
        const target = days.find((day) => isSameDay(day, d));
        if (target) map.get(target.toDateString()).push(a);
      } catch {}
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((x, y) => new Date(x.data_agendamento).getTime() - new Date(y.data_agendamento).getTime());
      map.set(k, arr);
    }

    return map;
  }, [items, days]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="text-sm font-extrabold text-slate-900">
          Semana de {format(start, "dd 'de' MMMM", { locale: ptBR })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnchor(addDays(anchor, -7))}
            className="p-2 rounded-lg hover:bg-slate-100"
            title="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setAnchor(new Date())}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={() => setAnchor(addDays(anchor, 7))}
            className="p-2 rounded-lg hover:bg-slate-100"
            title="Próxima semana"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7">
        {days.map((d) => {
          const key = d.toDateString();
          const list = itemsByDay.get(key) || [];

          return (
            <div key={key} className="min-h-[180px] border-r border-slate-200 last:border-r-0">
              <div className="px-3 py-2 border-b border-slate-200">
                <div className="text-xs font-extrabold text-slate-900 capitalize">
                  {format(d, "EEEE", { locale: ptBR })}
                </div>
                <div className="text-[11px] text-slate-600">{format(d, "dd/MM", { locale: ptBR })}</div>
              </div>

              <div className="p-2 space-y-2">
                {list.length === 0 ? (
                  <div className="text-[11px] text-slate-400 px-2 py-2">Sem agendamentos</div>
                ) : (
                  list.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onSelect?.(a)}
                      className="w-full text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-extrabold text-slate-900 truncate">
                          {a.nome} {a.sobrenome}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">
                          {formatHora(a.data_agendamento)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-600 truncate font-semibold">{a.servico}</div>
                        <StatusBadge status={a.status} compact />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
