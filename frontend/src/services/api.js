import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    if (error?.response?.status === 402 && window.location.pathname !== "/assinatura") {
      window.location.href = "/assinatura";
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  me: () => api.get("/auth/me"),
  login: (dados) => api.post("/auth/login", dados),
  register: (dados) => api.post("/auth/register", dados),
  acceptTerms: (dados) => api.post("/auth/accept-terms", dados),
};

export const agendamentosAPI = {
  listar: () => api.get("/api/agendamentos"),
  obter: (id) => api.get(`/api/agendamentos/${id}`),
  criar: (dados) => api.post("/api/agendamentos", dados),
  atualizar: (id, dados) => api.put(`/api/agendamentos/${id}`, dados),
  deletar: (id) => api.delete(`/api/agendamentos/${id}`),
  enviarLembreteEmail: (id) =>
    api.post(`/api/agendamentos/${id}/lembretes/email`),
};

export const whatsappAPI = {
  me: () => api.get("/whatsapp/me"),
  connect: (dados) => api.post("/whatsapp/connect", dados),
  sendTest: (dados) => api.post("/whatsapp/send-test", dados),
  disconnect: () => api.delete("/whatsapp/disconnect"),
};

export default api;
export const clientesAPI = {
  listar: () => api.get("/api/clientes"),
  obter: (id) => api.get(`/api/clientes/${id}`),
  criar: (dados) => api.post("/api/clientes", dados),
  atualizar: (id, dados) => api.put(`/api/clientes/${id}`, dados),
  deletar: (id) => api.delete(`/api/clientes/${id}`),
};

export const whatsappInboxAPI = {
  listarConversas: (busca = "") => api.get("/api/whatsapp-inbox/conversas", { params: busca ? { busca } : {} }),
  listarMensagens: (conversaId, cursor) => api.get(`/api/whatsapp-inbox/conversas/${conversaId}/mensagens`, { params: cursor ? { cursor } : {} }),
  responder: (conversaId, texto) => api.post(`/api/whatsapp-inbox/conversas/${conversaId}/mensagens`, { texto }),
  marcarLida: (conversaId) => api.post(`/api/whatsapp-inbox/conversas/${conversaId}/lida`),
};

export const configuracoesAPI = {
  obter: () => api.get("/api/configuracoes"),
  atualizar: (dados) => api.put("/api/configuracoes", dados),
};

export const servicosAPI = {
  listar: () => api.get("/api/servicos"),
  criar: (dados) => api.post("/api/servicos", dados),
  atualizar: (id, dados) => api.put(`/api/servicos/${id}`, dados),
  deletar: (id) => api.delete(`/api/servicos/${id}`),
};

export const agendaPublicaAPI = {
  obter: (slug) => api.get(`/api/public/agenda/${slug}`),
  horarios: (slug, data, servicoId) => api.get(`/api/public/agenda/${slug}/horarios`, { params: { data, servicoId } }),
  agendar: (slug, dados) => api.post(`/api/public/agenda/${slug}/agendamentos`, dados),
};

export const billingAPI = {
  planos: () => api.get("/api/billing/planos"),
  assinatura: () => api.get("/api/billing/assinatura"),
  checkout: (plano) => api.post("/api/billing/checkout", { plano }),
  portal: () => api.post("/api/billing/portal"),
  adminAssinaturas: () => api.get("/api/billing/admin/assinaturas"),
};
