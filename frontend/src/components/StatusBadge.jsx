import React from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

// Badge de status mais "vivo" e fácil de escanear.
// Reutilizável em Card / Lista / Calendário.

export const statusConfig = {
  pendente: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-900 border-amber-200",
    icon: AlertCircle,
    iconClassName: "text-amber-700"
  },
  confirmado: {
    label: "Confirmado",
    className: "bg-emerald-100 text-emerald-900 border-emerald-200",
    icon: CheckCircle2,
    iconClassName: "text-emerald-700"
  },
  concluido: {
    label: "Concluído",
    className: "bg-slate-900 text-white border-slate-900",
    icon: CheckCircle2,
    iconClassName: "text-white"
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-rose-100 text-rose-900 border-rose-200",
    icon: XCircle,
    iconClassName: "text-rose-700"
  }
};

export function StatusBadge({ status = "pendente", compact = false }) {
  const cfg = statusConfig[status] || statusConfig.pendente;
  const Icon = cfg.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 border rounded-full",
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        cfg.className
      ].join(" ")}
      title={cfg.label}
    >
      <Icon className={[compact ? "w-3 h-3" : "w-3.5 h-3.5", cfg.iconClassName].join(" ")} />
      <span className="font-semibold leading-none">{cfg.label}</span>
    </span>
  );
}
