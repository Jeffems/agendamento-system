/*import axios from "axios";
const api = axios.create ({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export const agendamentosAPI = {
    listar: () => api.get('/agendamentos'),
    obter: (id) => api.get(`/agendamentos/${id}`),
    criar: (dados) => api.post('/agendamentos', dados),
    atualizar: (id, dados) => api.put(`/agendamentos/${id}`, dados),
    deletar: (id) => api.delete(`/agendamentos/${id}`),
  };
  
  export default api;
  */

  import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const agendamentosAPI = {
  listar: () => api.get("/api/agendamentos"),
  obter: (id) => api.get(`/api/agendamentos/${id}`),
  criar: (dados) => api.post("/api/agendamentos", dados),
  atualizar: (id, dados) => api.put(`/api/agendamentos/${id}`, dados),
  deletar: (id) => api.delete(`/api/agendamentos/${id}`),
};

export default api;