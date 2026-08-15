import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { erro: false };
  static getDerivedStateFromError() { return { erro: true }; }
  componentDidCatch(error, info) { console.error("Erro de interface:", error, info); }
  render() {
    if (!this.state.erro) return this.props.children;
    return <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-5"><div className="app-surface max-w-md p-8 text-center"><h1 className="text-2xl font-bold">Algo não saiu como esperado</h1><p className="mt-3 text-sm text-slate-500">Atualize a página. Se o problema continuar, entre em contato com o suporte.</p><button onClick={() => window.location.reload()} className="btn-primary mt-6">Recarregar página</button></div></div>;
  }
}
