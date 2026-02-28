import { Link, Outlet, useLocation } from "react-router-dom";

export default function AppShell() {
  const location = useLocation();

  const links = [
    { label: "Atendimentos", to: "/" },
    { label: "WhatsApp", to: "/settings/whatsapp" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7f9" }}>
      {/* Topbar */}
      <header
        style={{
          height: 56,
          background: "#111",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: 800 }}>Seu SaaS</div>

        <nav style={{ display: "flex", gap: 10 }}>
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: active ? "#2b2b2b" : "transparent",
                  fontWeight: active ? 800 : 600,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo */}
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}