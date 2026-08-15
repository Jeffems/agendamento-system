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

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster position="top-right" richColors />
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/agendar/:slug" element={<AgendamentoPublico />} />
        {/* Rotas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<App />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/settings/whatsapp" element={<WhatsappSettings />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
