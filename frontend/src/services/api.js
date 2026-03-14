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
};

export const whatsappAPI = {
  me: () => api.get("/whatsapp/me"),
  connect: (dados) => api.post("/whatsapp/connect", dados),
  sendTest: (dados) => api.post("/whatsapp/send-test", dados),
  disconnect: () => api.delete("/whatsapp/disconnect"),
};

export default api;