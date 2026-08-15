import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Register from "./pages/Register";
import App from "./App";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import WhatsappSettings from "./pages/WhatsappSettings.jsx";
import Clientes from "./pages/Clientes.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import AgendamentoPublico from "./pages/AgendamentoPublico.jsx";
import Assinatura from "./pages/Assinatura.jsx";
import AdminAssinaturas from "./pages/AdminAssinaturas.jsx";
import Landing from "./pages/Landing.jsx";
import Termos from "./pages/Termos.jsx";
import Privacidade from "./pages/Privacidade.jsx";
import NotFound from "./pages/NotFound.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ConversasWhatsApp from "./pages/ConversasWhatsApp.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
    <Toaster position="top-right" richColors />
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/agendar/:slug" element={<AgendamentoPublico />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        {/* Rotas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/app" element={<App />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/settings/whatsapp" element={<WhatsappSettings />} />
          <Route path="/conversas" element={<ConversasWhatsApp />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/assinatura" element={<Assinatura />} />
          <Route path="/admin/assinaturas" element={<AdminAssinaturas />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
