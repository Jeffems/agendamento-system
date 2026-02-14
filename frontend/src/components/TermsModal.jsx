import { X } from "lucide-react";
import { useState } from "react";

export default function TermsModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}) {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);

  if (!open) return null;

  const canConfirm = terms && privacy && !loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Termos e Privacidade
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-slate-700">
          <p className="text-sm">
            Para continuar, confirme que você leu e aceitou os documentos abaixo.
          </p>

          <label className="flex gap-3 items-start">
            <input type="checkbox" className="mt-1" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span className="text-sm">
              Li e aceito os <a className="underline" href="/termos" target="_blank" rel="noreferrer">Termos de Uso</a> (obrigatório)
            </span>
          </label>

          <label className="flex gap-3 items-start">
            <input type="checkbox" className="mt-1" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
            <span className="text-sm">
              Li e aceito a <a className="underline" href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a> (obrigatório)
            </span>
          </label>

          <label className="flex gap-3 items-start">
            <input type="checkbox" className="mt-1" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            <span className="text-sm">
              Aceito receber novidades e comunicações (opcional)
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t p-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-slate-100">
            Cancelar
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => onConfirm({ terms, privacy, marketing })}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Aceitar e continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}