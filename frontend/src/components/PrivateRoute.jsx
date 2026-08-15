import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authAPI } from "../services/api";

export default function PrivateRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    let mounted = true;

    authAPI
      .me()
      .then(() => {
        if (mounted) setStatus("authenticated");
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (mounted) setStatus("unauthenticated");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-500">Preparando sua agenda...</p>
        </div>
      </div>
    );
  }

  return status === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
