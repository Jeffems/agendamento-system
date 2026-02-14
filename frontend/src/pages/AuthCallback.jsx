import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import TermsModal from "../components/termsModal";

function getTokenFromUrl() {
  // 1) Suporta callback atual: /auth/callback?token=...
  const params = new URLSearchParams(window.location.search);
  const tokenQuery = params.get("token");
  if (tokenQuery) return tokenQuery;

  // 2) Suporta versão mais segura: /auth/callback#token=...
  const hash = window.location.hash?.replace("#", "") || "";
  const hashParams = new URLSearchParams(hash);
  const tokenHash = hashParams.get("token");
  if (tokenHash) return tokenHash;

  return null;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      const token = getTokenFromUrl();

      if (!token) {
        toast.error("Token não encontrado. Tente novamente.");
        navigate("/login");
        return;
      }

      // salva token e já deixa o axios interceptor usar
      localStorage.setItem("token", token);

      try {
        // verifica se precisa aceitar termos
        const { data } = await api.get("/auth/me");

        if (data?.needsTerms) {
          setModalOpen(true);
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/");
        }
      } catch (error) {
        const message = error.response?.data?.error || "Erro ao validar login";
        toast.error(message);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [navigate]);

  const onConfirmTerms = async ({ terms, privacy, marketing }) => {
    try {
      setLoadingAccept(true);

      await api.post("/auth/accept-terms", {
        terms,
        privacy,
        marketing,
      });

      toast.success("Termos aceitos. Bem-vindo!");
      setModalOpen(false);
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.error || "Erro ao salvar aceites";
      toast.error(message);
    } finally {
      setLoadingAccept(false);
    }
  };

  // tela simples enquanto valida o token / checa o /me
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-xl font-bold text-slate-900">
          Finalizando login...
        </h1>
        <p className="text-slate-600 mt-2">
          {checking ? "Aguarde um instante" : "Quase lá"}
        </p>
      </div>

      <TermsModal
        open={modalOpen}
        onClose={() => {
          // se ele fechar sem aceitar, você decide o comportamento:
          // aqui vou deslogar e mandar pro login
          localStorage.removeItem("token");
          setModalOpen(false);
          navigate("/login");
        }}
        onConfirm={onConfirmTerms}
        loading={loadingAccept}
      />
    </div>
  );
}