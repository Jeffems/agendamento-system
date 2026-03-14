import axios from "axios";

export async function sendText({ phoneNumberId, accessToken, to, text }) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const resp = await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  return resp.data;
}

export async function sendTemplate({
  phoneNumberId,
  accessToken,
  to,
  templateName,
  lang = "pt_BR",
  components = [],
}) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const resp = await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: lang },
        components,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  return resp.data;
}