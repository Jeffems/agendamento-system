{/*import React from "react";
import { Toaster } from "sonner";
import { Navigate } from "react-router-dom";
import Agendamentos from "./pages/Agendamentos";

function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Agendamentos />
    </>
  );
}

export default App;
*/}

import { Toaster } from "sonner";
import Agendamentos from "./pages/Agendamentos";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Agendamentos />
    </>
  );
}

export default App;

