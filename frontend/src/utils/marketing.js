import api from "../services/api";

export function trackMarketing(evento, pagina = window.location.pathname) {
  const chave = `metric:${evento}:${pagina}`;
  if (sessionStorage.getItem(chave)) return;
  sessionStorage.setItem(chave, "1");
  api.post("/api/public/metrics", { evento, pagina }).catch(() => {});
}
