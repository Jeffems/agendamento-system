import { useEffect, useState } from "react";
import api from "../services/api";

export default function WhatsappSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const [status, setStatus] = useState("unknown");
  const [displayPhone, setDisplayPhone] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateLanguage, setTemplateLanguage] = useState("pt_BR");
  const [lastError, setLastError] = useState("");
  const [connectedAt, setConnectedAt] = useState(null);

  const [showToken, setShowToken] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    setMsg(null);

    try {
      const { data } = await api.get("/whatsapp/me");
      const wa = data?.whatsapp || {};

      setStatus(wa?.wa_status || "not_connected");
      setDisplayPhone(wa?.wa_display_phone_number || "");
      setPhoneNumberId(wa?.wa_phone_number_id || "");
      setWabaId(wa?.wa_waba_id || "");
      setTemplateName(wa?.wa_template_name || "");
      setTemplateLanguage(wa?.wa_template_language || "pt_BR");
      setLastError(wa?.wa_last_error || "");
      setConnectedAt(wa?.wa_connected_at || null);

      // por segurança nunca repopular token vindo do backend
      setAccessToken("");
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.error || "Falha ao carregar status.",
      });
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
        templateName: templateName.trim(),
        templateLanguage: templateLanguage.trim() || "pt_BR",
      });

      setAccessToken("");
      setMsg({
        type: "success",
        text: "✅ WhatsApp salvo e conectado com sucesso!",
      });

      await load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.error || "Erro ao conectar WhatsApp.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    setSending(true);
    setMsg(null);

    try {
      await api.post("/whatsapp/send-test", {
        to: testTo.trim(),
      });

      setMsg({
        type: "success",
        text: "✅ Mensagem de teste enviada!",
      });

      await load();
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err?.response?.data?.error ||
          err?.response?.data?.details?.error?.message ||
          "Falha ao enviar teste.",
      });
    } finally {
      setSending(false);
    }
  }

  async function handleDisconnect() {
    const ok = window.confirm(
      "Deseja desconectar este WhatsApp? O sistema deixará de enviar lembretes automáticos por este número."
    );

    if (!ok) return;

    setDisconnecting(true);
    setMsg(null);

    try {
      await api.delete("/whatsapp/disconnect");
      setAccessToken("");
      setMsg({
        type: "success",
        text: "✅ WhatsApp desconectado com sucesso.",
      });
      await load();
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.error || "Erro ao desconectar WhatsApp.",
      });
    } finally {
      setDisconnecting(false);
    }
  }

  const badge =
    status === "connected"
      ? {
          text: "Conectado",
          cls: "bg-green-100 text-green-800 border-green-200",
        }
      : status === "not_connected" || status === "disconnected"
      ? {
          text: "Desconectado",
          cls: "bg-red-100 text-red-800 border-red-200",
        }
      : {
          text: "Carregando...",
          cls: "bg-gray-100 text-gray-800 border-gray-200",
        };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Configurações do WhatsApp
      </h1>

      <p style={{ color: "#666", marginBottom: 18 }}>
        Conecte seu número do WhatsApp Cloud API para enviar lembretes com o seu
        próprio número e com o seu próprio template aprovado na Meta.
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
        {displayPhone ? (
          <span style={{ fontSize: 12, opacity: 0.85 }}>({displayPhone})</span>
        ) : null}
      </div>

      {msg ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            marginBottom: 16,
            border: "1px solid #ddd",
            background:
              msg.type === "error"
                ? "#fff5f5"
                : msg.type === "success"
                ? "#f0fff4"
                : "#f7fafc",
          }}
        >
          <b>
            {msg.type === "error"
              ? "Erro:"
              : msg.type === "success"
              ? "Sucesso:"
              : "Info:"}
          </b>{" "}
          {msg.text}
        </div>
      ) : null}

      {lastError ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            marginBottom: 16,
            border: "1px solid #f5c2c7",
            background: "#fff5f5",
            color: "#842029",
          }}
        >
          <b>Último erro:</b> {lastError}
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
          Carregando…
        </div>
      ) : (
        <>
          <form
            onSubmit={handleConnect}
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
              Conectar número
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Phone Number ID *
                </span>
                <input
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="Ex: 123456789012345"
                  style={inputStyle}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Access Token *
                </span>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    type={showToken ? "text" : "password"}
                    placeholder="Cole aqui seu token"
                    style={{ ...inputStyle, flex: 1 }}
                    required={status !== "connected"}
                  />

                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    style={btnSecondary}
                  >
                    {showToken ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                <small style={{ color: "#666" }}>
                  Use um token de sistema permanente da sua conta Cloud API.
                </small>
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    WABA ID (opcional)
                  </span>
                  <input
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    placeholder="Ex: 987654321"
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    Número exibido (opcional)
                  </span>
                  <input
                    value={displayPhone}
                    onChange={(e) => setDisplayPhone(e.target.value)}
                    placeholder="Ex: +55 66 99999-9999"
                    style={inputStyle}
                  />
                </label>
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 12,
                  background: "#fafafa",
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  Template de lembrete
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 180px",
                    gap: 12,
                  }}
                >
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      Nome do template *
                    </span>
                    <input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Ex: lembrete_agendamento"
                      style={inputStyle}
                      required
                    />
                  </label>

                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      Idioma *
                    </span>
                    <input
                      value={templateLanguage}
                      onChange={(e) => setTemplateLanguage(e.target.value)}
                      placeholder="pt_BR"
                      style={inputStyle}
                      required
                    />
                  </label>
                </div>

                <small style={{ color: "#666", display: "block", marginTop: 8 }}>
                  Use exatamente o nome do template aprovado na Meta. Exemplo:
                  <b> lembrete_agendamento</b>
                </small>
              </div>

              {connectedAt ? (
                <div style={{ fontSize: 13, color: "#666" }}>
                  Última conexão salva em:{" "}
                  <b>{new Date(connectedAt).toLocaleString("pt-BR")}</b>
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={load}
                    style={btnSecondary}
                    disabled={saving || disconnecting}
                  >
                    Recarregar
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    style={btnDanger}
                    disabled={disconnecting || saving}
                  >
                    {disconnecting ? "Desconectando..." : "Desconectar"}
                  </button>
                </div>

                <button
                  type="submit"
                  style={btnPrimary}
                  disabled={saving || disconnecting}
                >
                  {saving ? "Salvando..." : "Salvar conexão"}
                </button>
              </div>
            </div>
          </form>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
              Enviar mensagem de teste
            </h2>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Enviar para (com DDI)
                </span>
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
                <button
                  onClick={handleSendTest}
                  style={btnPrimary}
                  disabled={
                    sending ||
                    !testTo.trim() ||
                    !templateName.trim() ||
                    !phoneNumberId.trim()
                  }
                >
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
  color: "#111",
  cursor: "pointer",
  fontWeight: 700,
};

const btnDanger = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #dc2626",
  background: "#fff",
  color: "#dc2626",
  cursor: "pointer",
  fontWeight: 700,
};