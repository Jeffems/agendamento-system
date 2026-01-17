import React from "react";
import { Search, Filter } from "lucide-react";

export default function FiltrosAgendamento({ filtros, onMudarFiltros }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou serviço..."
            value={filtros.busca || ""}
            onChange={(e) => onMudarFiltros({ ...filtros, busca: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
          />
        </div>

        <select
          value={filtros.status || "todos"}
          onChange={(e) => onMudarFiltros({ ...filtros, status: e.target.value })}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all w-full md:w-48"
        >
          <option value="todos">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <select
          value={filtros.periodo || "todos"}
          onChange={(e) => onMudarFiltros({ ...filtros, periodo: e.target.value })}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all w-full md:w-48"
        >
          <option value="todos">Todos os Períodos</option>
          <option value="hoje">Hoje</option>
          <option value="amanha">Amanhã</option>
          <option value="semana">Esta Semana</option>
          <option value="mes">Este Mês</option>
        </select>
      </div>
    </div>
  );
}