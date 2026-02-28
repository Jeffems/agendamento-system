import { useEffect, useState } from "react";
import api from "../services/api";

export default function WhatsappSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const [status, setStatus] = useState("unknown");
  const [displayPhone, setDisplayPhone] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const [testTo, setTestTo] = useState("");
  const [msg, setMsg] = useState(null); // { type: "success"|"error"|"info", text }

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.get("/whatsapp/me");

      const wa = data?.whatsapp;
      setStatus(wa?.wa_status || "disconnected");
      setDisplayPhone(wa?.wa_display_phone_number || "");
      setPhoneNumberId(wa?.wa_phone_number_id || "");
      setWabaId(wa?.wa_waba_id || "");
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error || "Falha ao carregar status." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConnect(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      await api.post("/whatsapp/connect", {
        phoneNumberId: phoneNumberId.trim(),
        accessToken: accessToken.trim(),
        wabaId: wabaId.trim() || undefined,
        displayPhoneNumber: displayPhone.trim() || undefined,
      });

      setAccessToken(""); // não manter token na tela
      setMsg({ type: "success", text: "✅ WhatsApp conectado com sucesso!" });
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error || "Erro ao conectar WhatsApp." });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    setSending(true);
    setMsg(null);
    try {
      await api.post("/whatsapp/send-test", { to: testTo.trim() });
      setMsg({ type: "success", text: "✅ Mensagem de teste enviada!" });
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error || "Falha ao enviar teste." });
    } finally {
      setSending(false);
    }
  }

  const badge =
    status === "connected"
      ? { text: "Conectado", cls: "bg-green-100 text-green-800 border-green-200" }
      : status === "disconnected"
      ? { text: "Desconectado", cls: "bg-red-100 text-red-800 border-red-200" }
      : { text: "Carregando...", cls: "bg-gray-100 text-gray-800 border-gray-200" };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Configurações do WhatsApp</h1>
      <p style={{ color: "#666", marginBottom: 18 }}>
        Conecte seu número do WhatsApp Cloud API para enviar lembretes com o seu próprio número.
      </p>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid",
          marginBottom: 18,
        }}
        className={badge.cls}
      >
        <span style={{ fontSize: 12, fontWeight: 700 }}>{badge.text}</span>
        {displayPhone ? <span style={{ fontSize: 12, opacity: 0.85 }}>({displayPhone})</span> : null}
      </div>

      {msg ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            marginBottom: 16,
            border: "1px solid #ddd",
            background: msg.type === "error" ? "#fff5f5" : msg.type === "success" ? "#f0fff4" : "#f7fafc",
          }}
        >
          <b>{msg.type === "error" ? "Erro:" : msg.type === "success" ? "Sucesso:" : "Info:"}</b> {msg.text}
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>Carregando…</div>
      ) : (
        <>
          {/* Conectar */}
          <form onSubmit={handleConnect} style={{ border: "1px solid #eee", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Conectar número</h2>

            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Phone Number ID *</span>
                <input
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="Ex: 123456789012345"
                  style={inputStyle}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Access Token *</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    type={showToken ? "text" : "password"}
                    placeholder="Cole aqui seu token"
                    style={{ ...inputStyle, flex: 1 }}
                    required
                  />
                  <button type="button" onClick={() => setShowToken((v) => !v)} style={btnSecondary}>
                    {showToken ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <small style={{ color: "#666" }}>
                  Dica: use um token de sistema (permanente) do Cloud API. Não compartilhe seu token.
                </small>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>WABA ID (opcional)</span>
                  <input value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="Ex: 987654321" style={inputStyle} />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Número exibido (opcional)</span>
                  <input
                    value={displayPhone}
                    onChange={(e) => setDisplayPhone(e.target.value)}
                    placeholder="Ex: +55 66 99999-9999"
                    style={inputStyle}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={load} style={btnSecondary} disabled={saving}>
                  Recarregar
                </button>
                <button type="submit" style={btnPrimary} disabled={saving}>
                  {saving ? "Conectando..." : "Conectar"}
                </button>
              </div>
            </div>
          </form>

          {/* Enviar teste */}
          <div style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Enviar mensagem de teste</h2>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Enviar para (com DDI)</span>
                <input
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="Ex: 5566999999999"
                  style={inputStyle}
                />
                <small style={{ color: "#666" }}>
                  Use formato E.164 sem símbolos. Ex: <b>55</b> + DDD + número.
                </small>
              </label>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={handleSendTest} style={btnPrimary} disabled={sending || !testTo.trim()}>
                  {sending ? "Enviando..." : "Enviar teste"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  height: 42,
  borderRadius: 12,
  border: "1px solid #ddd",
  padding: "0 12px",
  outline: "none",
};

const btnPrimary = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const btnSecondary = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};